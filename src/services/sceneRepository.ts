import type { Scene } from "../types/screening";
import { validateSceneGraph } from "../utils/graphValidator";
import fallbackSceneData from "../data/sceneGraph.json";

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

    // 1. Try fetching from backend API if configured
    try {
      const endpoint = `${API_BASE_URL.replace(/\/$/, "")}/scene-graph`;
      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        const scenes = (data.scenes || []) as Scene[];
        if (scenes.length > 0) {
          validateSceneGraph(scenes);
          this.scenesCache = scenes;
          return scenes;
        }
      }
    } catch (err) {
      console.warn("Backend API unreachable. Falling back to embedded scene graph:", err);
    }

    // 2. Fallback to embedded static scene graph for Vercel / GitHub Pages static deployments
    const fallbackScenes = (fallbackSceneData.scenes || []) as Scene[];
    validateSceneGraph(fallbackScenes);
    this.scenesCache = fallbackScenes;
    return fallbackScenes;
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
