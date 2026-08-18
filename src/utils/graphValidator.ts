import type { Scene } from "../types/screening";

export interface GraphValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  totalScenes: number;
}

/**
 * Storyline Graph Validator for 2-Type Scene Engine:
 * A scene has EITHER a "choices" array OR an "autoNext" field.
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

  scenes.forEach((scene) => {
    // 1. Check autoNext connectivity
    if (scene.autoNext !== undefined && scene.autoNext !== null) {
      if (!sceneIdSet.has(scene.autoNext)) {
        const errorMsg = `[SceneGraph Error] Scene "${scene.sceneId}" autoNext references missing sceneId "${scene.autoNext}".`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    // 2. Check choices nextSceneId connectivity
    if (scene.choices && Array.isArray(scene.choices)) {
      scene.choices.forEach((choice) => {
        if (choice.nextSceneId !== null && !sceneIdSet.has(choice.nextSceneId)) {
          const errorMsg = `[SceneGraph Error] Scene "${scene.sceneId}" choice "${choice.choiceId}" references missing nextSceneId "${choice.nextSceneId}".`;
          errors.push(errorMsg);
          console.error(errorMsg);
        }
      });
    }
  });

  const isValid = errors.length === 0;

  if (isValid) {
    console.log(`[SceneGraph Validation Passed] ${scenes.length} scenes validated cleanly.`);
  }

  return {
    isValid,
    errors,
    warnings,
    totalScenes: scenes.length,
  };
}
