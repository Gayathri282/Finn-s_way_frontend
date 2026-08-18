import { useRef, useState, useEffect, useCallback } from "react";
import type { Scene } from "../types/screening";
import { resolveSceneVideoUrl, getDeviceCategory } from "../utils/videoResolver";
import type { VideoDeviceCategory } from "../utils/videoResolver";

interface UseVideoPlayerOptions {
  currentScene: Scene | null;
  onVideoEnd: () => void;
}

export function useVideoPlayer({ currentScene, onVideoEnd }: UseVideoPlayerOptions) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [activeVariant, setActiveVariant] = useState<string | null>(null);
  const [videoError, setVideoError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPausedByChild, setIsPausedByChild] = useState(false);
  const [isCheckingVideo, setIsCheckingVideo] = useState(true);

  // Saved playback position for breakpoint src switching
  const pendingSeekRef = useRef<number | null>(null);
  const pendingResumeRef = useRef<boolean>(true);

  // Viewport width for 768px breakpoint detection
  const [viewportWidth, setViewportWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );

  // 1. Resolve video URL for current scene and viewport width
  const checkAndResolveVideo = useCallback(
    async (sceneId: string, baseVideoUrl: string, width: number, preservePosition: boolean = false) => {
      setIsCheckingVideo(true);

      // Capture position if preserving across resize
      if (preservePosition && videoRef.current) {
        const currentTime = videoRef.current.currentTime;
        const duration = videoRef.current.duration;
        const wasPlaying = !videoRef.current.paused && !videoRef.current.ended;

        if (duration > 0 && duration - currentTime < 0.5) {
          // Near end of video: don't seek past end, just trigger end
          setIsCheckingVideo(false);
          onVideoEnd();
          return;
        }

        pendingSeekRef.current = currentTime;
        pendingResumeRef.current = wasPlaying;
      } else {
        pendingSeekRef.current = null;
        pendingResumeRef.current = true;
      }

      const resolved = await resolveSceneVideoUrl(sceneId, baseVideoUrl, width);

      if (resolved) {
        if (resolved.url !== activeVideoUrl) {
          setActiveVideoUrl(resolved.url);
          setActiveVariant(resolved.variant);
        }
        setVideoError(false);
      } else {
        setActiveVideoUrl(null);
        setActiveVariant(null);
        setVideoError(true);
      }

      setIsCheckingVideo(false);
    },
    [activeVideoUrl, onVideoEnd]
  );

  // 2. Initial resolution when currentScene changes
  useEffect(() => {
    if (!currentScene) return;
    setIsPlaying(false);
    setIsPausedByChild(false);
    pendingSeekRef.current = null;
    pendingResumeRef.current = true;
    checkAndResolveVideo(currentScene.sceneId, currentScene.videoUrl, viewportWidth, false);
  }, [currentScene?.sceneId, currentScene?.videoUrl]);

  // 3. Debounced 200ms resize listener across 768px breakpoint boundary
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const handleResize = () => {
      if (timeoutId) clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        const newWidth = window.innerWidth;
        const oldBreakpoint = viewportWidth >= 768;
        const newBreakpoint = newWidth >= 768;

        setViewportWidth(newWidth);

        // Only switch video source if viewport crosses the 768px breakpoint
        if (oldBreakpoint !== newBreakpoint && currentScene) {
          console.log(`Viewport crossed 768px boundary (${newWidth}px). Switching video variant with time preservation.`);
          checkAndResolveVideo(currentScene.sceneId, currentScene.videoUrl, newWidth, true);
        }
      }, 200);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [viewportWidth, currentScene, checkAndResolveVideo]);

  // 4. Restore currentTime on loadedmetadata event when src changes
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      if (pendingSeekRef.current !== null && pendingSeekRef.current > 0) {
        const seekTarget = pendingSeekRef.current;
        videoRef.current.currentTime = seekTarget;
        pendingSeekRef.current = null;
      }

      if (pendingResumeRef.current && !isPausedByChild) {
        videoRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            setIsPausedByChild(false);
          })
          .catch((err) => {
            console.log("Autoplay policy or interaction needed:", err);
          });
      }
    }
  };

  // 5. Unobtrusive pause/play control for child
  const togglePlayPause = () => {
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsPausedByChild(false);
        })
        .catch((err) => console.log("Play failed:", err));
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      setIsPausedByChild(true);
    }
  };

  const handleNativeEnded = () => {
    setIsPlaying(false);
    setIsPausedByChild(false);
    onVideoEnd();
  };

  const handleNativeError = () => {
    console.warn(`Video playback error for ${activeVideoUrl}. Falling back to visual canvas.`);
    setVideoError(true);
  };

  const currentCategory: VideoDeviceCategory = getDeviceCategory(viewportWidth);

  return {
    videoRef,
    activeVideoUrl,
    activeVariant,
    videoError,
    isPlaying,
    isPausedByChild,
    isCheckingVideo,
    currentCategory,
    handleLoadedMetadata,
    handleNativeEnded,
    handleNativeError,
    togglePlayPause,
  };
}
