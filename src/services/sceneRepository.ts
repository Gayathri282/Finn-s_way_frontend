import type { Scene } from "../types/screening";
import { validateSceneGraph } from "../utils/graphValidator";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export interface ISceneRepository {
  getAllScenes(): Promise<Scene[]>;
  getSceneById(sceneId: string): Promise<Scene | null>;
  getInitialScene(): Promise<Scene | null>;
}

class ApiSceneRepository implements ISceneRepository {
  private scenesCache: Scene[] | null = null;

  async getAllScenes(): Promise<Scene[]> {
    if (this.scenesCache) {
      return this.scenesCache;
    }

    try {
      const endpoint = `${API_BASE_URL.replace(/\/$/, "")}/scene-graph`;
      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        const scenes = data.scenes || [];
        validateSceneGraph(scenes);
        this.scenesCache = scenes;
        return scenes;
      }
    } catch (err) {
      console.warn("Failed to fetch scene graph from backend API:", err);
    }

    return [];
  }

  async getSceneById(sceneId: string): Promise<Scene | null> {
    const scenes = await this.getAllScenes();
    return scenes.find((s) => s.sceneId === sceneId) || null;
  }

  async getInitialScene(): Promise<Scene | null> {
    const scenes = await this.getAllScenes();
    return scenes.find((s) => s.sceneId === "dep_01_wake") || scenes[0] || null;
  }
}

export const sceneRepository: ISceneRepository = new ApiSceneRepository();
