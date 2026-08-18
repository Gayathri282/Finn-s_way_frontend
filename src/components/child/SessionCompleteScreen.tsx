import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { useStoryStore } from "../../state/useStoryStore";
import { Sparkles, RefreshCw, FileDown, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export const SessionCompleteScreen: React.FC = () => {
  const { restartStory, sessionId, childId } = useStoryStore();

  useEffect(() => {
    const end = Date.now() + 2 * 1000;
    const colors = ["#fbbf24", "#34d399", "#60a5fa", "#f472b6", "#a78bfa"];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  const handleDownloadPdf = () => {
    if (!sessionId) return;
    const pdfUrl = `${API_BASE_URL.replace(/\/$/, "")}/sessions/${sessionId}/report.pdf`;
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.setAttribute("download", `${childId || "Finn-Explorer"}_screening_summary.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="relative w-full min-h-[580px] max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-700 to-indigo-900 p-8 sm:p-12 text-white shadow-2xl border-4 border-amber-300/60 flex flex-col items-center justify-center text-center select-none overflow-hidden animate-fade-in">
      <div className="absolute top-10 left-10 text-4xl animate-bounce-slow opacity-80">🦊</div>
      <div className="absolute top-12 right-12 text-4xl animate-pulse opacity-80">🌟</div>
      <div className="absolute bottom-10 left-16 text-3xl animate-bounce opacity-70">🌸</div>
      <div className="absolute bottom-12 right-16 text-3xl animate-pulse opacity-70">✨</div>

      <div className="relative z-10 max-w-xl mx-auto bg-black/35 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-white/20 shadow-2xl flex flex-col items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-300 to-amber-500 flex items-center justify-center shadow-xl border-4 border-white text-5xl transform hover:rotate-12 transition-transform">
          🦊
        </div>

        <div>
          <span className="inline-flex items-center gap-2 bg-amber-400/30 text-amber-200 font-extrabold text-sm px-4 py-1.5 rounded-full border border-amber-300/40 uppercase tracking-widest mb-3">
            <Sparkles className="w-4 h-4 text-amber-300" /> Story Complete!
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight drop-shadow-md">
            Great job! Finn thanks you for exploring!
          </h1>
          <p className="mt-3 text-lg text-emerald-100 font-medium leading-relaxed">
            You made wonderful choices together in the Whispering Woods today. Finn is happy and resting safely under the big oak tree!
          </p>
        </div>

        {/* Action Buttons: Download PDF Report & Play Again */}
        <div className="w-full flex flex-col sm:flex-row gap-4 mt-2">
          {sessionId && (
            <button
              onClick={handleDownloadPdf}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-black text-lg py-4 px-6 rounded-2xl shadow-xl transition-all transform hover:-translate-y-1 active:scale-95 cursor-pointer"
            >
              <FileDown className="w-6 h-6 text-slate-950" />
              <span>Download PDF Report</span>
            </button>
          )}

          <button
            onClick={restartStory}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-lg py-4 px-6 rounded-2xl shadow-xl transition-all transform hover:-translate-y-1 active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Play Again</span>
          </button>
        </div>

        <Link
          to="/dashboard"
          className="text-xs font-bold text-amber-200 hover:text-white flex items-center gap-1.5 transition underline decoration-amber-400/50"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-300" />
          <span>View Session Insights & PDF in Clinician Portal</span>
        </Link>
      </div>
    </div>
  );
};
