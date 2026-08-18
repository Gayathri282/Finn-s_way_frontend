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
  sessionId: string | null;
  childId: string | null;
  completedSession: SessionRecord | null;
  buttonsPromptedAt: string | null;

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

export const useStoryStore = create<StoryStoreState>((set, get) => ({
  scenes: [],
  currentScene: null,
  playerState: "loading",
  errorMessage: null,
  choicePath: [],
  sessionId: null,
  childId: null,
  completedSession: null,
  buttonsPromptedAt: null,
  isMuted: false,
  isParentAuthenticated: false,
  userRole: null,

  initStory: async () => {
    set({
      playerState: "loading",
      errorMessage: null,
      choicePath: [],
      completedSession: null,
      buttonsPromptedAt: null,
    });

    // 1. Create session on backend API
    const sessionMeta = await sessionStorageService.createSession();

    // 2. Fetch scene graph
    const allScenes = await sceneRepository.getAllScenes();
    const initialScene = await sceneRepository.getInitialScene();

    set({
      scenes: allScenes,
      currentScene: initialScene,
      playerState: "playing",
      sessionId: sessionMeta.sessionId,
      childId: sessionMeta.childId,
    });
  },

  onVideoEnd: () => {
    const { currentScene, playerState, scenes, sessionId } = get();
    if (!currentScene) return;

    if (playerState === "playing") {
      // 1. Check if scene has autoNext field
      if (currentScene.autoNext !== undefined) {
        if (currentScene.autoNext !== null) {
          // autoNext is present and not null -> transition IMMEDIATELY & automatically!
          const nextScene = scenes.find((s) => s.sceneId === currentScene.autoNext);
          if (nextScene) {
            set({
              currentScene: nextScene,
              playerState: "playing",
              errorMessage: null,
              buttonsPromptedAt: null,
            });
          } else {
            const errText = `[Story Engine Error] Missing autoNext scene ID "${currentScene.autoNext}" in scene "${currentScene.sceneId}".`;
            console.error(errText);
            set({ playerState: "error", errorMessage: errText });
          }
        } else {
          // autoNext is null -> end of content reached ("more story coming soon")
          if (sessionId) {
            sessionStorageService.getSessionResults(sessionId).then((record) => {
              set({ playerState: "completed", completedSession: record });
            });
          } else {
            set({ playerState: "completed" });
          }
        }
      } else if (currentScene.choices && currentScene.choices.length > 0) {
        // 2. choices array is present -> show choice buttons and record promptedAt timestamp!
        const nowIso = new Date().toISOString();
        set({
          playerState: "choice_pending",
          buttonsPromptedAt: nowIso,
        });
      } else {
        // 3. Fallback end of content
        set({ playerState: "completed" });
      }
    }
  },

  makeChoice: async (choice: Choice) => {
    const { currentScene, choicePath, scenes, sessionId, buttonsPromptedAt } = get();
    if (!currentScene) return;

    const decidedAt = new Date().toISOString();
    const promptedAt = buttonsPromptedAt || decidedAt;
    const decisionTimeMs = Math.max(0, new Date(decidedAt).getTime() - new Date(promptedAt).getTime());
    const decisionTimeSec = (decisionTimeMs / 1000).toFixed(1);

    const choiceLog: ChoiceLog = {
      sceneId: currentScene.sceneId,
      choiceId: choice.choiceId,
      choiceLabel: choice.label,
      domain: choice.domain,
      scoreWeight: choice.scoreWeight,
      timestamp: decidedAt,
      promptedAt,
      decidedAt,
      decisionTimeMs,
      decisionTimeSec,
    };

    const newPath = [...choicePath, choiceLog];

    if (sessionId) {
      sessionStorageService.logChoice(sessionId, choiceLog);
    }

    if (choice.nextSceneId) {
      const nextScene = scenes.find((s) => s.sceneId === choice.nextSceneId);

      if (!nextScene) {
        const errText = `[Story Engine Error] Missing scene ID "${choice.nextSceneId}" referenced by choice "${choice.choiceId}" (${choice.label}) in scene "${currentScene.sceneId}".`;
        console.error(errText);
        set({ choicePath: newPath, playerState: "error", errorMessage: errText });
        return;
      }

      set({
        currentScene: nextScene,
        choicePath: newPath,
        playerState: "playing",
        errorMessage: null,
        buttonsPromptedAt: null,
      });
    } else {
      let record: SessionRecord | null = null;
      if (sessionId) {
        record = await sessionStorageService.getSessionResults(sessionId);
      }
      set({
        choicePath: newPath,
        playerState: "completed",
        completedSession: record,
        errorMessage: null,
        buttonsPromptedAt: null,
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
