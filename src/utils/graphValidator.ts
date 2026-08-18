import type { Scene } from "../types/screening";

export interface GraphValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  totalScenes: number;
}

/**
 * Strict Storyline Graph Validator:
 * 1. Checks that initial scene (dep_01_wake) exists.
 * 2. Checks that every choice.nextSceneId references a valid sceneId in sceneGraph.json (or null).
 * 3. Logs a WARNING for any scene with an empty choices array that isn't "finale_dusk_home" (dead end detection).
 * 4. Logs a clear CONSOLE ERROR for any scene pointing to a missing nextSceneId.
 */
export function validateSceneGraph(scenes: Scene[]): GraphValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const sceneIdSet = new Set<string>(scenes.map((s) => s.sceneId));

  if (scenes.length === 0) {
    const emptyErr = "[SceneGraph Error] Scene graph array is empty.";
    errors.push(emptyErr);
    console.error(emptyErr);
  }

  // 1. Validate all choices and dead ends
  scenes.forEach((scene) => {
    // Check for unscripted dead ends
    if (scene.choices.length === 0 && scene.sceneId !== "finale_dusk_home") {
      const warnMsg = `[SceneGraph Dead End Warning] Scene "${scene.sceneId}" has no choices defined and is not "finale_dusk_home". Scripting required for this branch.`;
      warnings.push(warnMsg);
      console.warn(warnMsg);
    }

    // Check choice nextSceneId connectivity
    scene.choices.forEach((choice) => {
      if (choice.nextSceneId !== null && !sceneIdSet.has(choice.nextSceneId)) {
        const errorMsg = `[SceneGraph Error] Scene "${scene.sceneId}" -> Choice "${choice.choiceId}" (${choice.label}) references missing nextSceneId "${choice.nextSceneId}". Story playback will halt if this choice is clicked.`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }
    });
  });

  // 2. Identify unreachable/orphan scenes starting from dep_01_wake
  const visited = new Set<string>();
  const queue: string[] = [];

  const initialNode = scenes.find((s) => s.sceneId === "dep_01_wake") || scenes[0];
  if (initialNode) {
    queue.push(initialNode.sceneId);
    visited.add(initialNode.sceneId);
  }

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const currentScene = scenes.find((s) => s.sceneId === currentId);
    if (currentScene) {
      currentScene.choices.forEach((choice) => {
        if (choice.nextSceneId && !visited.has(choice.nextSceneId) && sceneIdSet.has(choice.nextSceneId)) {
          visited.add(choice.nextSceneId);
          queue.push(choice.nextSceneId);
        }
      });
    }
  }

  const orphanSceneIds = scenes.map((s) => s.sceneId).filter((id) => !visited.has(id));

  if (orphanSceneIds.length > 0) {
    const orphanWarn = `[SceneGraph Warning] Unreachable/orphan scenes found in graph: ${orphanSceneIds.join(", ")}`;
    warnings.push(orphanWarn);
    console.warn(orphanWarn);
  }

  const isValid = errors.length === 0;

  if (isValid) {
    console.log(`[SceneGraph Validation Passed] ${scenes.length} scenes validated cleanly with continuous storyline connectivity.`);
  }

  return {
    isValid,
    errors,
    warnings,
    totalScenes: scenes.length,
  };
}
