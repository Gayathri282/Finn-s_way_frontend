import { useState, useEffect } from "react";
import type { Scene } from "../types/screening";
import { sceneRepository } from "../services/sceneRepository";

export function useSceneGraph() {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [initialScene, setInitialScene] = useState<Scene | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadGraph() {
      setIsLoading(true);
      setError(null);
      try {
        const allScenes = await sceneRepository.getAllScenes();
        const first = await sceneRepository.getInitialScene();

        if (isMounted) {
          setScenes(allScenes);
          setInitialScene(first);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError("Failed to load story scene graph.");
          setIsLoading(false);
        }
      }
    }

    loadGraph();

    return () => {
      isMounted = false;
    };
  }, []);

  return { scenes, initialScene, isLoading, error };
}
