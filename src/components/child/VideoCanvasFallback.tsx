import React, { useEffect, useRef, useState } from "react";
import type { CharacterMood, Scene } from "../../types/screening";
import { Sparkles, FastForward } from "lucide-react";

interface VideoCanvasFallbackProps {
  scene: Scene;
  onVideoEnd: () => void;
  isPlaying: boolean;
}

const MOOD_COLORS: Record<CharacterMood, { bg: string; accent: string; emoji: string; text: string }> = {
  curious: { bg: "from-amber-700 via-orange-600 to-amber-900", accent: "#fbbf24", emoji: "🦊✨", text: "Finn is curious..." },
  happy: { bg: "from-emerald-700 via-teal-600 to-green-900", accent: "#34d399", emoji: "🦊🌾", text: "Finn is cheerful!" },
  anxious: { bg: "from-slate-800 via-indigo-950 to-slate-900", accent: "#a78bfa", emoji: "🦊🌊", text: "Finn feels uncertain..." },
  sad: { bg: "from-blue-900 via-slate-800 to-indigo-950", accent: "#60a5fa", emoji: "🦊🌧️", text: "Finn is feeling low..." },
  angry: { bg: "from-rose-900 via-red-800 to-orange-950", accent: "#f87171", emoji: "🦊⚡", text: "Finn is feeling frustrated!" },
  determined: { bg: "from-amber-800 via-yellow-700 to-emerald-900", accent: "#f59e0b", emoji: "🦊🌲", text: "Finn is determined!" },
  excited: { bg: "from-purple-800 via-pink-700 to-indigo-900", accent: "#f472b6", emoji: "🦊🌟", text: "Finn is super excited!" },
};

export const VideoCanvasFallback: React.FC<VideoCanvasFallbackProps> = ({ scene, onVideoEnd, isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [hasEnded, setHasEnded] = useState(false);
  const duration = 6000;

  const moodTheme = MOOD_COLORS[scene.characterMood] || MOOD_COLORS.curious;

  useEffect(() => {
    setProgress(0);
    setHasEnded(false);

    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const currentProgress = Math.min(1, elapsed / duration);
      setProgress(currentProgress);

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          for (let i = 0; i < 25; i++) {
            const seed = i * 47;
            const x = ((seed * 13 + elapsed * 0.05) % canvas.width);
            const y = ((seed * 29 + Math.sin(elapsed * 0.002 + i) * 30) % canvas.height);
            const radius = 2 + Math.sin(elapsed * 0.005 + i) * 1.5;

            ctx.fillStyle = moodTheme.accent;
            ctx.globalAlpha = 0.4 + Math.sin(elapsed * 0.003 + i) * 0.3;
            ctx.beginPath();
            ctx.arc(x, y, Math.max(0.5, radius), 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1.0;
        }
      }

      if (currentProgress < 1 && isPlaying) {
        animationFrameId = requestAnimationFrame(animate);
      } else if (currentProgress >= 1 && !hasEnded) {
        setHasEnded(true);
        onVideoEnd();
      }
    };

    if (isPlaying) {
      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [scene.sceneId, isPlaying, onVideoEnd]);

  const handleSkipToEnd = () => {
    setProgress(1);
    setHasEnded(true);
    onVideoEnd();
  };

  return (
    <div className={`relative w-full h-full min-h-[480px] bg-gradient-to-br ${moodTheme.bg} rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between p-6 text-white border-4 border-amber-300/30 select-none`}>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-60"
      />

      <div className="relative z-10 flex justify-between items-center bg-black/40 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{moodTheme.emoji}</span>
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-amber-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Story Scene
            </span>
            <h2 className="text-xl font-extrabold text-white leading-tight">{scene.title}</h2>
          </div>
        </div>

        {!hasEnded && (
          <button
            onClick={handleSkipToEnd}
            className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-sm px-4 py-2 rounded-xl transition shadow-md active:scale-95 cursor-pointer"
          >
            <FastForward className="w-4 h-4" />
            <span>Ready to Choose</span>
          </button>
        )}
      </div>

      <div className="relative z-10 max-w-2xl mx-auto text-center my-auto px-6 py-8 bg-black/50 backdrop-blur-md rounded-3xl border border-white/15 shadow-2xl">
        <p className="text-2xl sm:text-3xl font-semibold leading-relaxed text-amber-50 drop-shadow-md">
          "{scene.description}"
        </p>
        <p className="mt-4 text-lg font-medium text-amber-200/90 italic flex items-center justify-center gap-2">
          <span>{moodTheme.text}</span>
        </p>
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto bg-black/40 backdrop-blur-sm p-3 rounded-2xl border border-white/10 flex flex-col gap-2">
        <div className="w-full bg-white/20 h-3 rounded-full overflow-hidden">
          <div
            className="bg-amber-400 h-full transition-all duration-100 ease-linear rounded-full"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-xs text-amber-200/80 font-medium px-1">
          <span>Watching Finn...</span>
          <span>{hasEnded ? "Choice Time!" : `${Math.round(progress * 100)}%`}</span>
        </div>
      </div>
    </div>
  );
};
