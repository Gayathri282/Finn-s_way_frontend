import React from "react";
import { useStoryStore } from "../../state/useStoryStore";
import { RefreshCw, ShieldCheck, Sparkles, Heart } from "lucide-react";
import { Link } from "react-router-dom";

export const SessionCompleteScreen: React.FC = () => {
  const { restartStory } = useStoryStore();

  return (
    <div className="relative w-full min-h-[580px] max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 p-8 sm:p-12 text-white shadow-2xl border-4 border-amber-300/40 flex flex-col items-center justify-center text-center select-none overflow-hidden animate-fade-in">
      {/* Decorative Ambient Background Elements */}
      <div className="absolute top-10 left-10 text-4xl animate-bounce-slow opacity-60">🦊</div>
      <div className="absolute top-12 right-12 text-4xl animate-pulse opacity-60">🌟</div>
      <div className="absolute bottom-10 left-16 text-3xl opacity-50">🌲</div>
      <div className="absolute bottom-12 right-16 text-3xl opacity-50">✨</div>

      <div className="relative z-10 max-w-xl mx-auto bg-slate-900/80 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-white/15 shadow-2xl flex flex-col items-center gap-6">
        {/* Animated Finn Avatar */}
        <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-amber-400 via-orange-500 to-amber-300 flex items-center justify-center shadow-2xl border-4 border-amber-200/80 text-6xl transform hover:scale-105 transition-transform">
          🦊
        </div>

        <div>
          <span className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 font-extrabold text-xs px-4 py-1.5 rounded-full border border-amber-300/30 uppercase tracking-widest mb-3">
            <Sparkles className="w-4 h-4 text-amber-300" /> Story Chapter Complete
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight drop-shadow-md mt-1">
            Finn can't wait to see what happens next!
          </h1>
          <p className="mt-3 text-lg text-emerald-200/90 font-medium leading-relaxed">
            More of Finn's journey in the Whispering Woods is coming soon. Thank you for exploring together today!
          </p>
        </div>

        {/* Play Again Button */}
        <div className="w-full flex flex-col gap-4 mt-2">
          <button
            onClick={restartStory}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xl py-4 px-8 rounded-2xl shadow-xl transition-all transform hover:-translate-y-1 active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-6 h-6" />
            <span>Play Story Again</span>
          </button>
        </div>

        {/* Discrete Parent/Clinician Portal Link */}
        <Link
          to="/dashboard"
          className="mt-2 text-xs font-bold text-slate-400 hover:text-emerald-300 flex items-center gap-1.5 transition underline decoration-slate-600"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Parent & Clinician Portal</span>
        </Link>
      </div>

      <div className="mt-6 text-xs text-slate-500 flex items-center gap-1 font-semibold">
        <span>Made with</span>
        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
        <span>for Finn's Way</span>
      </div>
    </div>
  );
};
