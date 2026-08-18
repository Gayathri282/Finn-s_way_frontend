import { useRef, useState, useEffect, useCallback } from "react";
import type { Scene } from "../types/screening";
import { getVideoUrlForScene, getDeviceCategory } from "../utils/videoResolver";
import type { VideoDeviceCategory } from "../utils/videoResolver";

interface UseVideoPlayerOptions {
  currentScene: Scene | null;
  onVideoEnd: () => void;
}

export function useVideoPlayer({ currentScene, onVideoEnd }: UseVideoPlayerOptions) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPausedByChild, setIsPausedByChild] = useState(false);
  const [isReadyToPlay, setIsReadyToPlay] = useState(false);

  // Saved playback position for breakpoint src switching
  const pendingSeekRef = useRef<number | null>(null);
  const pendingResumeRef = useRef<boolean>(true);

  // Viewport width for 768px breakpoint detection
  const [viewportWidth, setViewportWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );

  // 1. Resolve active video URL for current scene and viewport width
  const updateVideoUrl = useCallback(
    (scene: Scene, width: number, preservePosition: boolean = false) => {
      if (preservePosition && videoRef.current) {
        const currentTime = videoRef.current.currentTime;
        const duration = videoRef.current.duration;
        const wasPlaying = !videoRef.current.paused && !videoRef.current.ended;

        if (duration > 0 && duration - currentTime < 0.5) {
          onVideoEnd();
          return;
        }

        pendingSeekRef.current = currentTime;
        pendingResumeRef.current = wasPlaying;
      } else {
        pendingSeekRef.current = null;
        pendingResumeRef.current = true;
      }

      const newUrl = getVideoUrlForScene(scene, width);
      setIsReadyToPlay(false);
      setActiveVideoUrl(newUrl);
    },
    [onVideoEnd]
  );

  // 2. Initial resolution when currentScene changes
  useEffect(() => {
    if (!currentScene) return;
    setIsPlaying(false);
    setIsPausedByChild(false);
    setIsReadyToPlay(false);
    pendingSeekRef.current = null;
    pendingResumeRef.current = true;
    updateVideoUrl(currentScene, viewportWidth, false);
  }, [currentScene?.sceneId, updateVideoUrl]);

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

        if (oldBreakpoint !== newBreakpoint && currentScene) {
          updateVideoUrl(currentScene, newWidth, true);
        }
      }, 200);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [viewportWidth, currentScene, updateVideoUrl]);

  // 4. Video ready event handler (onCanPlay / onCanPlayThrough / onLoadedData)
  const handleCanPlay = () => {
    if (videoRef.current) {
      if (pendingSeekRef.current !== null && pendingSeekRef.current > 0) {
        videoRef.current.currentTime = pendingSeekRef.current;
        pendingSeekRef.current = null;
      }

      setIsReadyToPlay(true);

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

  const currentCategory: VideoDeviceCategory = getDeviceCategory(viewportWidth);

  return {
    videoRef,
    activeVideoUrl,
    isPlaying,
    isPausedByChild,
    isReadyToPlay,
    currentCategory,
    handleCanPlay,
    handleNativeEnded,
    togglePlayPause,
  };
}
