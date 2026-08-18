import React from "react";
import { useStoryStore } from "../../state/useStoryStore";
import { useVideoPlayer } from "../../hooks/useVideoPlayer";
import { ChoiceOverlay } from "./ChoiceOverlay";
import { PauseButton } from "./PauseButton";
import { VideoCanvasFallback } from "./VideoCanvasFallback";
import { AlertOctagon, RefreshCw } from "lucide-react";

export const StoryPlayer: React.FC = () => {
  const {
    currentScene,
    playerState,
    errorMessage,
    onVideoEnd,
    makeChoice,
    preloadedUrls,
    isMuted,
    restartStory,
  } = useStoryStore();

  const {
    videoRef,
    activeVideoUrl,
    videoError,
    isPlaying,
    isCheckingVideo,
    handleLoadedMetadata,
    handleNativeEnded,
    handleNativeError,
    togglePlayPause,
  } = useVideoPlayer({
    currentScene,
    onVideoEnd,
  });

  // Render error screen if missing nextSceneId encountered
  if (playerState === "error") {
    return (
      <div className="relative w-full h-[calc(100vh-80px)] min-h-[580px] max-w-7xl mx-auto rounded-3xl overflow-hidden bg-slate-950 p-8 flex flex-col items-center justify-center text-center text-white border-4 border-rose-500/50 shadow-2xl select-none">
        <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-3xl mb-4 border border-rose-500/40">
          <AlertOctagon className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-rose-300">Storyline Playback Halted</h2>
        <p className="mt-3 text-sm text-slate-300 max-w-xl font-mono bg-black/60 p-4 rounded-xl border border-rose-500/30 leading-relaxed text-left">
          {errorMessage || "Target nextSceneId missing in sceneGraph.json."}
        </p>
        <button
          onClick={restartStory}
          className="mt-6 flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-sm px-6 py-3.5 rounded-xl shadow-lg hover:scale-105 transition cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Restart Story from Beginning</span>
        </button>
      </div>
    );
  }

  if (!currentScene) return null;

  const showChoices = playerState === "choice_pending";
  const hasRealVideo = !videoError && !isCheckingVideo && Boolean(activeVideoUrl);

  return (
    <div className="relative w-full h-[calc(100vh-80px)] min-h-[580px] max-w-7xl mx-auto rounded-3xl overflow-hidden bg-slate-950 shadow-2xl border-4 border-amber-300/40 flex flex-col justify-center select-none">
      {hasRealVideo ? (
        /* Real Video Element Player */
        <div className="relative w-full h-full flex items-center justify-center bg-black">
          <video
            key={`${currentScene.sceneId}_${activeVideoUrl}`}
            ref={videoRef}
            src={activeVideoUrl!}
            autoPlay
            muted={isMuted}
            playsInline
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleNativeEnded}
            onError={handleNativeError}
            className="w-full h-full object-cover bg-black"
          />

          {/* Simple, Unobtrusive Pause/Play Control Overlay (Bottom-Right) visible during video playback only */}
          <PauseButton
            isPlaying={isPlaying}
            onToggle={togglePlayPause}
            isVisible={!showChoices}
          />
        </div>
      ) : (
        /* Visual Canvas Fallback for Missing Video Assets */
        <VideoCanvasFallback
          scene={currentScene}
          onVideoEnd={onVideoEnd}
          isPlaying={isPlaying}
        />
      )}

      {/* Choice Overlay (anchored Left, Center, Right fading in ONLY on video end) */}
      <ChoiceOverlay
        choices={currentScene.choices}
        onSelectChoice={makeChoice}
        isVisible={showChoices}
      />

      {/* Hidden preloader for upcoming likely video scenes */}
      <div className="hidden" aria-hidden="true">
        {preloadedUrls.map((url) => (
          <React.Fragment key={url}>
            <video src={url} preload="auto" />
            <video src={url.replace(/\.mp4$/, `_laptop.mp4`)} preload="auto" />
            <video src={url.replace(/\.mp4$/, `_mobile.mp4`)} preload="auto" />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
