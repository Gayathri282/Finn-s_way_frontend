import { create } from "zustand";
import type { Choice, ChoiceLog, Scene, SessionRecord, UserRole } from "../types/screening";
import { sceneRepository } from "../services/sceneRepository";
import { sessionStorageService } from "../services/sessionStorage";

export type PlayerState = "loading" | "playing" | "choice_pending" | "completed" | "error";

interface StoryStoreState {
  // Story Graph & Navigation
  scenes: Scene[];
  currentScene: Scene | null;
  playerState: PlayerState;
  errorMessage: string | null;
  choicePath: ChoiceLog[];
  preloadedUrls: string[];
  sessionId: string | null;
  childId: string | null;
  completedSession: SessionRecord | null;

  // Audio / Sound toggle
  isMuted: boolean;

  // Parent & Admin Dashboard Auth
  isParentAuthenticated: boolean;
  userRole: UserRole;

  // Actions
  initStory: () => Promise<void>;
  onVideoEnd: () => void;
  makeChoice: (choice: Choice) => Promise<void>;
  restartStory: () => Promise<void>;
  toggleMute: () => void;
  authenticateParent: (passcode: string) => boolean;
  authenticateUser: (passcode: string) => { success: boolean; role: UserRole };
  logoutParent: () => void;
}

/**
 * Helper to compute upcoming scene video URLs for preloading.
 */
function getUpcomingVideoUrls(currentScene: Scene, allScenes: Scene[]): string[] {
  const directNextIds = currentScene.choices
    .map((c) => c.nextSceneId)
    .filter((id): id is string => Boolean(id));

  const secondTierIds = allScenes
    .filter((s) => directNextIds.includes(s.sceneId))
    .flatMap((s) => s.choices.map((c) => c.nextSceneId))
    .filter((id): id is string => Boolean(id));

  const allUpcomingIds = Array.from(new Set([...directNextIds, ...secondTierIds]));

  return allUpcomingIds
    .map((id) => allScenes.find((s) => s.sceneId === id)?.videoUrl)
    .filter((url): url is string => Boolean(url));
}

export const useStoryStore = create<StoryStoreState>((set, get) => ({
  scenes: [],
  currentScene: null,
  playerState: "loading",
  errorMessage: null,
  choicePath: [],
  preloadedUrls: [],
  sessionId: null,
  childId: null,
  completedSession: null,
  isMuted: false,
  isParentAuthenticated: false,
  userRole: null,

  initStory: async () => {
    set({ playerState: "loading", errorMessage: null, choicePath: [], completedSession: null });

    // 1. Create REST session on backend API
    const sessionMeta = await sessionStorageService.createSession();

    // 2. Fetch scene graph from backend API
    const allScenes = await sceneRepository.getAllScenes();
    const initialScene = await sceneRepository.getInitialScene();

    const initialPreloads = initialScene ? getUpcomingVideoUrls(initialScene, allScenes) : [];

    set({
      scenes: allScenes,
      currentScene: initialScene,
      playerState: "playing",
      preloadedUrls: initialPreloads,
      sessionId: sessionMeta.sessionId,
      childId: sessionMeta.childId,
    });
  },

  onVideoEnd: () => {
    const { currentScene, playerState } = get();
    if (!currentScene) return;

    // Handle end of scene logic
    if (playerState === "playing") {
      // If scene has NO choices (e.g. finale_dusk_home), auto-transition to complete screen
      if (currentScene.choices.length === 0 || currentScene.sceneId === "finale_dusk_home") {
        const { sessionId } = get();
        if (sessionId) {
          sessionStorageService.getSessionResults(sessionId).then((record) => {
            set({ playerState: "completed", completedSession: record });
          });
        } else {
          set({ playerState: "completed" });
        }
      } else {
        // Show choice buttons on video end
        set({ playerState: "choice_pending" });
      }
    }
  },

  makeChoice: async (choice: Choice) => {
    const { currentScene, choicePath, scenes, sessionId } = get();
    if (!currentScene) return;

    // 1. Record choice payload
    const choiceLog: ChoiceLog = {
      sceneId: currentScene.sceneId,
      choiceId: choice.choiceId,
      choiceLabel: choice.label,
      domain: choice.domain,
      scoreWeight: choice.scoreWeight,
      timestamp: new Date().toISOString(),
    };

    const newPath = [...choicePath, choiceLog];

    // POST choice to backend API
    if (sessionId) {
      sessionStorageService.logChoice(sessionId, choiceLog);
    }

    // 2. Look up ONLY that choice's nextSceneId in scene graph
    if (choice.nextSceneId) {
      const nextScene = scenes.find((s) => s.sceneId === choice.nextSceneId);

      if (!nextScene) {
        // STRICT STORYLINE ENFORCEMENT: Stop playback and log clear console error!
        const errText = `[Story Engine Error] Missing scene ID "${choice.nextSceneId}" referenced by choice "${choice.choiceId}" (${choice.label}) in scene "${currentScene.sceneId}". Story playback halted.`;
        console.error(errText);

        set({
          choicePath: newPath,
          playerState: "error",
          errorMessage: errText,
        });
        return;
      }

      // Transition strictly to nextScene
      const nextPreloads = getUpcomingVideoUrls(nextScene, scenes);

      set({
        currentScene: nextScene,
        choicePath: newPath,
        playerState: "playing",
        preloadedUrls: Array.from(new Set([...get().preloadedUrls, ...nextPreloads])),
        errorMessage: null,
      });
    } else {
      // 3. nextSceneId is null -> transition to session complete screen
      let record: SessionRecord | null = null;
      if (sessionId) {
        record = await sessionStorageService.getSessionResults(sessionId);
      }
      set({
        choicePath: newPath,
        playerState: "completed",
        completedSession: record,
        errorMessage: null,
      });
    }
  },

  restartStory: async () => {
    await get().initStory();
  },

  toggleMute: () => {
    set((state) => ({ isMuted: !state.isMuted }));
  },

  authenticateParent: (passcode: string) => {
    const result = get().authenticateUser(passcode);
    return result.success;
  },

  authenticateUser: (passcode: string) => {
    const cleanPin = passcode.trim().toLowerCase();

    // Admin Credentials
    if (cleanPin === "admin9999" || cleanPin === "admin123" || cleanPin === "admin" || cleanPin === "9999") {
      set({ isParentAuthenticated: true, userRole: "admin" });
      return { success: true, role: "admin" };
    }

    // Parent / Clinician Credentials
    if (cleanPin === "1234" || cleanPin === "parent123" || cleanPin === "parent" || cleanPin.length >= 4) {
      set({ isParentAuthenticated: true, userRole: "parent" });
      return { success: true, role: "parent" };
    }

    return { success: false, role: null };
  },

  logoutParent: () => {
    set({ isParentAuthenticated: false, userRole: null });
  },
}));
