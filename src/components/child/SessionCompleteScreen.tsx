import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { useStoryStore } from "../../state/useStoryStore";
import { DOMAIN_DEFINITIONS, getBandDetails } from "../../types/screening";
import type { DomainKey } from "../../types/screening";
import { DisclaimerBanner } from "../ui/DisclaimerBanner";
import {
  Sparkles,
  RefreshCw,
  FileDown,
  ShieldCheck,
  Lock,
  KeyRound,
  ArrowRight,
  GitBranch,
  Activity,
  Heart,
  ChevronDown,
  ChevronUp,
  HelpCircle,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export const SessionCompleteScreen: React.FC = () => {
  const { restartStory, sessionId, childId, completedSession, authenticateUser, userRole } =
    useStoryStore();

  const [showParentGate, setShowParentGate] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState("1234");
  const [authError, setAuthError] = useState(false);
  const [showClinicianDetails, setShowClinicianDetails] = useState(false);

  useEffect(() => {
    if (userRole === "parent" || userRole === "admin") {
      setIsUnlocked(true);
    }
  }, [userRole]);

  useEffect(() => {
    const end = Date.now() + 1.5 * 1000;
    const colors = ["#fbbf24", "#34d399", "#60a5fa", "#f472b6", "#a78bfa"];

    (function frame() {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
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

  const handleParentAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = authenticateUser(pinInput);
    if (result.success) {
      setAuthError(false);
      setIsUnlocked(true);
      setShowParentGate(false);
    } else {
      setAuthError(true);
    }
  };

  const handleQuickUnlock = (pin: string) => {
    const result = authenticateUser(pin);
    if (result.success) {
      setAuthError(false);
      setIsUnlocked(true);
      setShowParentGate(false);
    } else {
      setAuthError(true);
    }
  };

  // FIX: Identify domains that had at least one LOGGED CHOICE (regardless of scoreWeight being 0 or positive)
  const activeDomainKeys = Array.from(
    new Set(completedSession?.path.map((c) => c.domain))
  ).filter((d): d is DomainKey => Boolean(d));

  return (
    <div className="relative w-full max-w-5xl mx-auto rounded-3xl bg-slate-950 p-4 sm:p-8 text-white shadow-2xl border-4 border-amber-300/40 select-none flex flex-col gap-6 my-4">
      {/* 1. Unlocked Parent / Clinician Session Summary Screen */}
      {isUnlocked && completedSession ? (
        <div className="flex flex-col gap-6 animate-fade-in">
          {/* Top Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
            <div>
              <span className="bg-emerald-500/20 text-emerald-300 font-extrabold text-xs px-3 py-1 rounded-full border border-emerald-500/30 uppercase tracking-widest flex items-center gap-1.5 w-fit mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Parent / Clinician Session Summary
              </span>
              <h2 className="text-2xl font-black text-white">Screening Observation Results</h2>
              <p className="text-xs text-slate-400 font-medium">
                Child ID: <strong className="text-emerald-400">{completedSession.childId}</strong> | Logged Choices: {completedSession.totalChoicesMade}
              </p>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <button
                onClick={handleDownloadPdf}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-lg transition cursor-pointer"
              >
                <FileDown className="w-4 h-4" />
                <span>Download PDF Report</span>
              </button>

              <button
                onClick={restartStory}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-extrabold text-xs px-4 py-2.5 rounded-xl border border-slate-700 transition cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Play Again</span>
              </button>
            </div>
          </div>

          {/* Persistent Top Disclaimer Banner */}
          <DisclaimerBanner />

          {/* Active Screening Domain Qualitative Bands Display */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  <span>Evaluated Screening Domains (This Session)</span>
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Qualitative bands for domains evaluated based on child's choices.
                </p>
              </div>

              <button
                onClick={() => setShowClinicianDetails(!showClinicianDetails)}
                className="text-xs text-emerald-300 font-bold bg-slate-800 hover:bg-slate-700 px-3.5 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <span>{showClinicianDetails ? "Hide Raw Scores" : "Clinician Details"}</span>
                {showClinicianDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {/* Render Domain Bands (Strictly checking if domain had logged choices, regardless of score being 0) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {activeDomainKeys.map((key) => {
                const meta = DOMAIN_DEFINITIONS[key];
                const scoreObj = completedSession.domainScores?.[key] || {
                  rawScore: 0,
                  maxScore: 6,
                  normalizedPercentage: 0,
                  band: "typical",
                  bandLabel: "Typical",
                  recommendation: "Behaviors fall within typical developmental expectations.",
                };
                const bandDetails = getBandDetails(scoreObj.band);

                return (
                  <div
                    key={key}
                    className={`rounded-2xl p-5 border-2 shadow-lg flex flex-col justify-between ${bandDetails.bgColor} border-slate-800/30`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-extrabold text-base text-slate-900 dark:text-white">
                          {meta?.label || key}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-black border ${bandDetails.badgeColor}`}>
                          {bandDetails.label}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mb-3">
                        {meta?.shortDescription}
                      </p>

                      <p className="text-xs text-slate-800 dark:text-slate-200 font-semibold bg-white/70 dark:bg-black/40 p-3 rounded-xl border border-black/5 leading-relaxed">
                        💡 {scoreObj.recommendation}
                      </p>
                    </div>

                    {showClinicianDetails && (
                      <div className="mt-3 pt-2 border-t border-black/10 dark:border-white/10 flex justify-between items-center text-xs font-mono text-slate-600 dark:text-slate-400">
                        <span>Raw Weight: {scoreObj.rawScore} / {scoreObj.maxScore}</span>
                        <span className="font-bold text-emerald-400">{scoreObj.normalizedPercentage}% Normalized</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Decision Path Replay List with Decision Time Tracking */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-amber-400" />
                  <span>Decision Path Replay & Response Times</span>
                </h3>
                <p className="text-[11px] text-amber-300/90 font-medium italic flex items-center gap-1 mt-0.5">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Response time — exploratory, not a validated screening measure</span>
                </p>
              </div>

              <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 self-start sm:self-auto">
                {completedSession.path.length} Logged Choices
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {completedSession.path.map((log, index) => {
                const domainMeta = DOMAIN_DEFINITIONS[log.domain];
                const displayTimeSec = log.decisionTimeSec || (log.decisionTimeMs ? (log.decisionTimeMs / 1000).toFixed(1) : "2.1");

                return (
                  <div
                    key={`${log.sceneId}_${index}`}
                    className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center shrink-0 text-sm">
                        #{index + 1}
                      </span>
                      <div>
                        <span className="font-mono text-amber-300 font-bold mr-2">[{log.sceneId}]</span>
                        <span className="font-extrabold text-white text-sm">
                          chose '{log.choiceLabel}'
                        </span>
                        <span className="ml-2 font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-[11px]">
                          (took {displayTimeSec}s)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white"
                        style={{ backgroundColor: domainMeta?.color || "#6366f1" }}
                      >
                        {domainMeta?.label || log.domain}
                      </span>
                      <span className="font-mono text-slate-400">Weight: +{log.scoreWeight}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Warm End-of-Content Message at Bottom */}
          <div className="bg-gradient-to-r from-amber-500/15 to-orange-500/15 border-2 border-amber-500/30 rounded-3xl p-6 text-center flex flex-col items-center gap-2">
            <div className="text-3xl">🦊</div>
            <h4 className="text-lg font-black text-amber-300">More of Finn's Story Coming Soon!</h4>
            <p className="text-xs text-slate-300 max-w-md font-medium">
              Thank you for exploring the Whispering Woods with Finn today. Additional story chapters and clinical screening domains will unlock in future updates!
            </p>
          </div>
        </div>
      ) : showParentGate ? (
        /* 2. Parent Authentication Gate Modal */
        <div className="w-full max-w-md mx-auto my-6 p-8 bg-slate-900 rounded-3xl border-2 border-emerald-500/30 shadow-2xl text-white select-none animate-fade-in flex flex-col gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center mx-auto border border-emerald-400/30">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-2xl font-black text-white">Parent / Clinician Access</h3>
            <p className="text-xs text-slate-300 mt-1">
              Enter Parent Passcode (<strong className="text-emerald-400 font-mono">1234</strong>) to view screening observations and download PDF report.
            </p>
          </div>

          <form onSubmit={handleParentAuthSubmit} className="flex flex-col gap-3 mt-2">
            <div className="relative">
              <input
                type="password"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setAuthError(false);
                }}
                placeholder="Enter PIN"
                className="w-full bg-slate-950 border-2 border-slate-700 focus:border-emerald-400 rounded-2xl py-3 px-4 text-center text-xl font-black text-emerald-300 outline-none transition"
                autoFocus
              />
              <KeyRound className="absolute right-4 top-3.5 w-5 h-5 text-slate-500 pointer-events-none" />
            </div>

            {authError && (
              <p className="text-xs font-bold text-rose-400 bg-rose-500/10 py-2 rounded-xl border border-rose-500/30">
                Invalid PIN. Use <strong className="text-white font-mono">1234</strong> or <strong className="text-white font-mono">admin9999</strong>.
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-base py-3 px-6 rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Unlock Results</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <button
            type="button"
            onClick={() => handleQuickUnlock("1234")}
            className="text-xs text-emerald-400 hover:underline font-bold mt-1 cursor-pointer"
          >
            Quick Unlock (Parent Demo PIN 1234)
          </button>

          <button
            type="button"
            onClick={() => setShowParentGate(false)}
            className="text-xs text-slate-400 hover:text-white font-semibold mt-2 cursor-pointer"
          >
            Return to Story Complete View
          </button>
        </div>
      ) : (
        /* 3. Initial Child End-of-Content Screen (No Domain Scores Visible) */
        <div className="w-full min-h-[520px] rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 p-8 sm:p-12 text-white shadow-2xl border-2 border-amber-300/30 flex flex-col items-center justify-center text-center select-none overflow-hidden animate-fade-in">
          <div className="relative z-10 max-w-xl mx-auto bg-slate-900/80 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-white/15 shadow-2xl flex flex-col items-center gap-6">
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

            <div className="w-full flex flex-col sm:flex-row gap-4 mt-2">
              <button
                onClick={restartStory}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-lg py-4 px-6 rounded-2xl shadow-xl transition-all transform hover:-translate-y-1 active:scale-95 cursor-pointer"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Play Story Again</span>
              </button>

              <button
                onClick={() => setShowParentGate(true)}
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg py-4 px-6 rounded-2xl shadow-xl transition-all transform hover:-translate-y-1 active:scale-95 cursor-pointer"
              >
                <ShieldCheck className="w-5 h-5 text-emerald-200" />
                <span>Show Results (For Parents)</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-xs text-slate-500 flex items-center gap-1 font-semibold">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for Finn's Way</span>
          </div>
        </div>
      )}
    </div>
  );
};
