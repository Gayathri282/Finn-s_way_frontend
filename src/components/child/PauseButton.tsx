import React from "react";
import { Play, Pause } from "lucide-react";

interface PauseButtonProps {
  isPlaying: boolean;
  onToggle: () => void;
  isVisible: boolean;
}

export const PauseButton: React.FC<PauseButtonProps> = ({ isPlaying, onToggle, isVisible }) => {
  if (!isVisible) return null;

  return (
    <button
      onClick={onToggle}
      className="absolute bottom-6 right-6 z-40 p-4 rounded-2xl bg-black/50 hover:bg-black/70 backdrop-blur-md text-amber-300 border border-white/20 shadow-2xl transition-all transform hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2 select-none"
      title={isPlaying ? "Pause Story Video" : "Resume Story Video"}
      aria-label={isPlaying ? "Pause Video" : "Play Video"}
    >
      {isPlaying ? (
        <>
          <Pause className="w-6 h-6 fill-amber-300 text-amber-300" />
          <span className="text-xs font-black uppercase tracking-wider hidden sm:inline">Pause</span>
        </>
      ) : (
        <>
          <Play className="w-6 h-6 fill-amber-300 text-amber-300 ml-0.5" />
          <span className="text-xs font-black uppercase tracking-wider hidden sm:inline">Resume</span>
        </>
      )}
    </button>
  );
};
