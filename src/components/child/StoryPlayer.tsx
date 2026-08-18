import React from "react";
import { useStoryStore } from "../../state/useStoryStore";
import { useVideoPlayer } from "../../hooks/useVideoPlayer";
import { ChoiceOverlay } from "./ChoiceOverlay";
import { PauseButton } from "./PauseButton";
import { AlertOctagon, RefreshCw } from "lucide-react";

export const StoryPlayer: React.FC = () => {
  const {
    currentScene,
    playerState,
    errorMessage,
    onVideoEnd,
    makeChoice,
    restartStory,
  } = useStoryStore();

  const {
    videoRef,
    activeVideoUrl,
    isPlaying,
    isReadyToPlay,
    handleCanPlay,
    handleNativeEnded,
    togglePlayPause,
  } = useVideoPlayer({
    currentScene,
    onVideoEnd,
  });

  // Render error screen if missing scene ID encountered
  if (playerState === "error") {
    return (
      <div className="relative w-full h-[calc(100vh-80px)] min-h-[580px] max-w-7xl mx-auto rounded-3xl overflow-hidden bg-slate-950 p-8 flex flex-col items-center justify-center text-center text-white border-4 border-rose-500/50 shadow-2xl select-none">
        <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-3xl mb-4 border border-rose-500/40">
          <AlertOctagon className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-rose-300">Storyline Playback Halted</h2>
        <p className="mt-3 text-sm text-slate-300 max-w-xl font-mono bg-black/60 p-4 rounded-xl border border-rose-500/30 leading-relaxed text-left">
          {errorMessage || "Target scene ID missing in sceneGraph.json."}
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

  const showChoices = playerState === "choice_pending" && Boolean(currentScene.choices && currentScene.choices.length > 0);

  return (
    <div className="relative w-full h-[calc(100vh-80px)] min-h-[580px] max-w-7xl mx-auto rounded-3xl overflow-hidden bg-slate-950 shadow-2xl border-4 border-amber-300/40 flex flex-col justify-center select-none">
      {/* 1. Branded Loading Screen (Shown while video buffers; NO text description or JSON ever rendered) */}
      {!isReadyToPlay && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950 text-amber-300 gap-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center shadow-2xl text-4xl animate-bounce-subtle border-2 border-amber-200">
            🦊
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full border-3 border-amber-400 border-t-transparent animate-spin" />
            <span className="text-sm font-black tracking-widest uppercase text-amber-200">Loading Scene...</span>
          </div>
        </div>
      )}

      {/* 2. Real Video Player Element */}
      {activeVideoUrl && (
        <div className="relative w-full h-full flex items-center justify-center bg-black">
          <video
            key={`${currentScene.sceneId}_${activeVideoUrl}`}
            ref={videoRef}
            src={activeVideoUrl}
            autoPlay
            playsInline
            onCanPlay={handleCanPlay}
            onCanPlayThrough={handleCanPlay}
            onLoadedData={handleCanPlay}
            onEnded={handleNativeEnded}
            className={`w-full h-full object-cover bg-black transition-opacity duration-300 ${
              isReadyToPlay ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Unobtrusive Pause/Play Overlay visible during video playback only */}
          <PauseButton
            isPlaying={isPlaying}
            onToggle={togglePlayPause}
            isVisible={isReadyToPlay && !showChoices}
          />
        </div>
      )}

      {/* 3. Choice Overlay (anchored Left / Right fading in on video end if choices present) */}
      {currentScene.choices && currentScene.choices.length > 0 && (
        <ChoiceOverlay
          choices={currentScene.choices}
          onSelectChoice={makeChoice}
          isVisible={showChoices && isReadyToPlay}
        />
      )}
    </div>
  );
};
