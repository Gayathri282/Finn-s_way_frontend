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

export interface ResolvedVideoAsset {
  url: string;
  variant: "lg" | "sm" | "fallback";
  sceneId: string;
}

/**
 * Strict Video Resolver:
 * 1. Checks videoFileMap[sceneId] for an explicit entry.
 * 2. If present, selects lg (>=768px) or sm (<768px) variant based on viewport width.
 * 3. Probes file via HEAD fetch. If file exists, returns resolved asset.
 * 4. If no entry in videoFileMap exists for sceneId, returns null (triggering placeholder div).
 * 5. Does NOT guess or substitute arbitrary filename patterns.
 */
export async function resolveSceneVideoUrl(
  sceneId: string,
  _baseVideoUrl?: string,
  viewportWidth: number = typeof window !== "undefined" ? window.innerWidth : 1024
): Promise<ResolvedVideoAsset | null> {
  const mapEntry = videoFileMap[sceneId];
  if (!mapEntry) {
    // Any sceneId not explicitly listed in videoFileMap has no real video yet -> fall back to placeholder
    return null;
  }

  const isDesktop = viewportWidth >= 768;
  const preferredUrl = isDesktop ? mapEntry.lg : mapEntry.sm;
  const alternateUrl = isDesktop ? mapEntry.sm : mapEntry.lg;

  // 1. Check preferred variant (lg for desktop/tablet, sm for mobile)
  try {
    const resPref = await fetch(preferredUrl, { method: "HEAD" });
    if (resPref.ok) {
      return {
        url: preferredUrl,
        variant: isDesktop ? "lg" : "sm",
        sceneId,
      };
    }
  } catch {
    // Ignore fetch error
  }

  // 2. Fall back to alternate variant if preferred file is missing
  try {
    const resAlt = await fetch(alternateUrl, { method: "HEAD" });
    if (resAlt.ok) {
      return {
        url: alternateUrl,
        variant: isDesktop ? "sm" : "lg",
        sceneId,
      };
    }
  } catch {
    // Ignore fetch error
  }

  // Neither variant exists on disk -> return null for placeholder div
  return null;
}
