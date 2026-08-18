import React, { useState, useEffect } from "react";
import { useStoryStore } from "../../state/useStoryStore";
import { ParentAuthGate } from "./ParentAuthGate";
import { DisclaimerBanner } from "../ui/DisclaimerBanner";
import { DomainChart } from "./DomainChart";
import { PathReplay } from "./PathReplay";
import { SessionHistory } from "./SessionHistory";
import { sessionStorageService } from "../../services/sessionStorage";
import type { SessionRecord } from "../../types/screening";
import { ArrowLeft, ShieldCheck, FileDown, Settings, Database } from "lucide-react";
import { Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export const ClinicianDashboard: React.FC = () => {
  const { isParentAuthenticated, userRole, logoutParent } = useStoryStore();
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionRecord | null>(null);

  const loadSessions = async () => {
    const list = await sessionStorageService.getSessions();
    setSessions(list);
    if (list.length > 0) {
      setSelectedSession(list[0]);
    } else {
      setSelectedSession(null);
    }
  };

  useEffect(() => {
    if (isParentAuthenticated) {
      loadSessions();
    }
  }, [isParentAuthenticated]);

  if (!isParentAuthenticated) {
    return (
      <div className="w-full min-h-screen bg-slate-950 p-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl mb-6">
          <DisclaimerBanner />
        </div>
        <ParentAuthGate onSuccess={loadSessions} />
      </div>
    );
  }

  const handleDownloadPdf = () => {
    if (!selectedSession) return;
    const pdfUrl = `${API_BASE_URL.replace(/\/$/, "")}/sessions/${selectedSession.sessionId}/report.pdf`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", pdfUrl);
    downloadAnchor.setAttribute(
      "download",
      `${selectedSession.childId}_screening_summary.pdf`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const isAdmin = userRole === "admin";

  return (
    <div className="w-full min-h-screen bg-slate-950 text-white p-4 sm:p-8 flex flex-col gap-6">
      <header className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-2xl text-emerald-400 transition cursor-pointer flex items-center gap-2 text-sm font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Story</span>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white flex items-center gap-2">
                <ShieldCheck className="w-7 h-7 text-emerald-400" />
                <span>{isAdmin ? "System Admin Console" : "Parent & Clinician Dashboard"}</span>
              </h1>
              <span className={`px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider border ${
                isAdmin
                  ? "bg-indigo-500/20 text-indigo-300 border-indigo-400/40"
                  : "bg-emerald-500/20 text-emerald-300 border-emerald-400/40"
              }`}>
                {isAdmin ? "Admin Role" : "Parent Role"}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Finn's Way Psychological Screening Insights (Ages 7–12)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {selectedSession && (
            <button
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition shadow-lg cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              <span>Download PDF Report</span>
            </button>
          )}

          <button
            onClick={logoutParent}
            className="flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-bold text-xs px-4 py-2.5 rounded-xl border border-rose-500/30 transition cursor-pointer"
          >
            <span>Lock Portal</span>
          </button>
        </div>
      </header>

      <main className="w-full max-w-7xl mx-auto flex flex-col gap-6">
        <DisclaimerBanner />

        {isAdmin && (
          <div className="bg-indigo-950/40 border-2 border-indigo-500/40 rounded-3xl p-6 shadow-xl text-white">
            <div className="flex items-center gap-2 mb-3">
              <Settings className="w-5 h-5 text-indigo-400 animate-spin-slow" />
              <h3 className="text-lg font-black text-indigo-200">System Admin Control Center</h3>
            </div>
            <p className="text-xs text-indigo-200/80 font-medium mb-4">
              You are logged in with Administrator credentials (<strong className="text-white">admin9999</strong>). PDF reports are generated on demand from in-memory session records.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="bg-slate-950 p-3 rounded-2xl border border-indigo-500/30 flex items-center justify-between">
                <span>PDF Endpoint:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <FileDown className="w-3.5 h-3.5" /> GET /report.pdf
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-2xl border border-indigo-500/30 flex items-center justify-between">
                <span>Active Sessions:</span>
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <Database className="w-3.5 h-3.5" /> {sessions.length} In-Memory
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-2xl border border-indigo-500/30 flex items-center justify-between">
                <span>Threshold Banding:</span>
                <span className="text-indigo-300 font-bold">0-33 / 34-66 / 67-100</span>
              </div>
            </div>
          </div>
        )}

        <SessionHistory
          sessions={sessions}
          selectedSessionId={selectedSession?.sessionId || null}
          onSelectSession={setSelectedSession}
          onRefreshHistory={loadSessions}
        />

        {selectedSession ? (
          <>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-300">
              <div className="flex items-center gap-4">
                <span>
                  Child Anonymized ID: <strong className="text-emerald-400">{selectedSession.childId}</strong>
                </span>
                <span>
                  Completed: <strong className="text-amber-300">{selectedSession.completedAt ? new Date(selectedSession.completedAt).toLocaleString() : "In Progress"}</strong>
                </span>
              </div>
              <div>
                Total Decisions Recorded: <strong className="text-white">{selectedSession.totalChoicesMade}</strong>
              </div>
            </div>

            {selectedSession.domainScores && (
              <DomainChart domainScores={selectedSession.domainScores} />
            )}

            <PathReplay path={selectedSession.path} />
          </>
        ) : (
          <div className="w-full p-12 bg-slate-900/60 border border-slate-800 rounded-3xl text-center flex flex-col items-center justify-center gap-4">
            <div className="text-4xl">🦊</div>
            <h3 className="text-xl font-bold text-white">No Active Session Records</h3>
            <p className="text-sm text-slate-400 max-w-md">
              Ask your child to play through Finn's Way story experience. Once finished, screening domain results will populate here and you can download the PDF summary.
            </p>
            <Link
              to="/"
              className="mt-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-sm px-6 py-3 rounded-xl shadow-lg transition"
            >
              Start Child Story Experience
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};
