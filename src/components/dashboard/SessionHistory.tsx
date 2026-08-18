import React from "react";
import type { SessionRecord } from "../../types/screening";
import { History, Calendar, Trash2, CheckCircle2, User } from "lucide-react";
import { sessionStorageService } from "../../services/sessionStorage";

interface SessionHistoryProps {
  sessions: SessionRecord[];
  selectedSessionId: string | null;
  onSelectSession: (session: SessionRecord) => void;
  onRefreshHistory: () => void;
}

export const SessionHistory: React.FC<SessionHistoryProps> = ({
  sessions,
  selectedSessionId,
  onSelectSession,
  onRefreshHistory,
}) => {
  const handleClearHistory = async () => {
    if (window.confirm("Are you sure you want to clear stored screening session records?")) {
      await sessionStorageService.clearSessions();
      onRefreshHistory();
    }
  };

  if (sessions.length === 0) {
    return (
      <div className="w-full bg-slate-900/80 border border-slate-800 rounded-3xl p-6 text-center text-slate-400">
        <p className="text-sm font-semibold">No recorded sessions found in database.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl text-white select-none">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-black text-white">Screening Session History</h3>
        </div>

        <button
          onClick={handleClearHistory}
          className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-bold bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 rounded-xl border border-rose-500/30 transition cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Storage</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {sessions.map((session) => {
          const isSelected = session.sessionId === selectedSessionId;
          const formattedDate = session.completedAt
            ? new Date(session.completedAt).toLocaleString([], {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "In Progress";

          return (
            <button
              key={session.sessionId}
              onClick={() => onSelectSession(session)}
              className={`p-4 rounded-2xl border-2 transition text-left cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "bg-emerald-950/60 border-emerald-400 shadow-lg"
                  : "bg-slate-950 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-white text-sm flex items-center gap-1.5">
                    <User className="w-4 h-4 text-emerald-400" />
                    {session.childId}
                  </span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </div>

                <p className="text-xs text-slate-400 font-mono flex items-center gap-1 mt-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {formattedDate}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 flex justify-between items-center text-xs">
                <span className="text-slate-400">{session.totalChoicesMade} Choices</span>
                <span className="font-mono text-emerald-400 font-bold">API Sync</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
