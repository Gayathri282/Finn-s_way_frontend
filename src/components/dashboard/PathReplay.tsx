import React from "react";
import { DOMAIN_DEFINITIONS } from "../../types/screening";
import type { ChoiceLog } from "../../types/screening";
import { GitBranch, Clock, Film, Award } from "lucide-react";

interface PathReplayProps {
  path: ChoiceLog[];
}

export const PathReplay: React.FC<PathReplayProps> = ({ path }) => {
  if (!path || path.length === 0) {
    return (
      <div className="w-full p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center text-slate-400 font-medium">
        No choice history recorded for this session yet.
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl text-white select-none">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div>
          <span className="text-xs uppercase tracking-widest font-black text-emerald-400 flex items-center gap-1.5">
            <GitBranch className="w-4 h-4" /> Story Trajectory Audit
          </span>
          <h3 className="text-xl font-black text-white mt-1">Decision Path Replay</h3>
        </div>
        <span className="bg-emerald-500/20 text-emerald-300 font-extrabold text-xs px-3 py-1 rounded-full border border-emerald-500/30">
          {path.length} Decision Nodes
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {path.map((log, index) => {
          const domainMeta = DOMAIN_DEFINITIONS[log.domain];
          const formattedTime = new Date(log.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });

          return (
            <div
              key={`${log.sceneId}_${index}`}
              className="group relative bg-slate-950/80 hover:bg-slate-950 border-2 border-slate-800 hover:border-emerald-500/50 p-5 rounded-2xl transition-all shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 font-black text-lg flex items-center justify-center shadow-lg shrink-0">
                  #{index + 1}
                </div>

                <div className="w-14 h-14 rounded-xl bg-slate-800 border border-slate-700 flex flex-col items-center justify-center shrink-0 text-slate-400">
                  <Film className="w-6 h-6 text-amber-300 mb-0.5" />
                  <span className="text-[9px] font-mono uppercase text-slate-400">Node</span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-amber-300 font-bold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                      {log.sceneId}
                    </span>
                    <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formattedTime}
                    </span>
                  </div>

                  <h4 className="text-lg font-extrabold text-white mt-1 group-hover:text-emerald-300 transition-colors">
                    "{log.choiceLabel}"
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm border border-white/10"
                  style={{ backgroundColor: domainMeta?.color || "#6366f1" }}
                >
                  {domainMeta?.label || log.domain}
                </span>

                <div className="bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>Weight: +{log.scoreWeight}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
