import type { Scene } from "../types/screening";

export const videoFileMap: Record<string, { lg: string; sm: string }> = {
  dep_01_wake: {
    lg: "/videos/first_scene_laptop.mp4",
    sm: "/videos/first_scene_mobile.mp4",
  },
  dep_02_meadow: {
    lg: "/videos/sunny_medow_result_laptop.mp4",
    sm: "/videos/sunny_medow_result_mobile.mp4",
  },
  dep_02_rain: {
    lg: "/videos/Fox_walking_in_rainy_forest_laptop.mp4",
    sm: "/videos/Fox_walking_in_rainy_forest_mobile.mp4",
  },
  anx_01_invite: {
    lg: "/videos/game_invite_laptop.mp4",
    sm: "/videos/game_invite_mobile.mp4",
  },
  anx_02_join: {
    lg: "/videos/game_invite_accept_laptop.mp4",
    sm: "/videos/game_invite_accept_mobile.mp4",
  },
  anx_02_stay: {
    lg: "/videos/game_invite_decline_laptop.mp4",
    sm: "/videos/game_invite_decline_mobile.mp4",
  },
};

export type VideoDeviceCategory = "laptop" | "mobile";

export function getDeviceCategory(width: number = typeof window !== "undefined" ? window.innerWidth : 1024): VideoDeviceCategory {
  return width >= 768 ? "laptop" : "mobile";
}

/**
 * Gets the video URL for a scene based on viewport width.
 * Prioritizes the scene object's videoUrl property if available.
 */
export function getVideoUrlForScene(
  scene: Scene,
  viewportWidth: number = typeof window !== "undefined" ? window.innerWidth : 1024
): string {
  const isDesktop = viewportWidth >= 768;

  if (typeof scene.videoUrl === "object" && scene.videoUrl !== null) {
    return isDesktop ? scene.videoUrl.lg : scene.videoUrl.sm;
  }

  const mapEntry = videoFileMap[scene.sceneId];
  if (mapEntry) {
    return isDesktop ? mapEntry.lg : mapEntry.sm;
  }

  return typeof scene.videoUrl === "string" ? scene.videoUrl : "";
}
