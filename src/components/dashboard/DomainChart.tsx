import React, { useState } from "react";
import {
  DOMAIN_DEFINITIONS,
  getBandDetails,
} from "../../types/screening";
import type {
  DomainKey,
  DomainScoreResult,
} from "../../types/screening";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { ChevronDown, ChevronUp, Eye, Sparkles, Activity } from "lucide-react";

interface DomainChartProps {
  domainScores: Record<DomainKey, DomainScoreResult>;
}

export const DomainChart: React.FC<DomainChartProps> = ({ domainScores }) => {
  const [showClinicianDetails, setShowClinicianDetails] = useState(false);

  const chartData = (Object.keys(DOMAIN_DEFINITIONS) as DomainKey[]).map((key) => {
    const meta = DOMAIN_DEFINITIONS[key];
    const scoreObj = domainScores[key] || {
      rawScore: 0,
      maxScore: 6,
      normalizedPercentage: 0,
      band: "typical",
      bandLabel: "Typical",
      recommendation: "",
    };

    return {
      domainKey: key,
      name: meta.label,
      percentage: scoreObj.normalizedPercentage,
      band: scoreObj.band,
      bandLabel: scoreObj.bandLabel,
      rawScore: scoreObj.rawScore,
      maxScore: scoreObj.maxScore,
      color: meta.color,
    };
  });

  return (
    <div className="w-full flex flex-col gap-6 select-none">
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-lg text-white">
        <h3 className="text-xl font-black text-amber-300 flex items-center gap-2 mb-4">
          <Activity className="w-6 h-6 text-emerald-400" />
          <span>Screening Band Overview</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-emerald-500/10 border-2 border-emerald-500/30 p-4 rounded-2xl flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-emerald-300">Typical</span>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                0 – 39%
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium leading-normal mt-1">
              Behaviors aligned with expected developmental milestones for ages 7–12.
            </p>
          </div>

          <div className="bg-amber-500/10 border-2 border-amber-500/30 p-4 rounded-2xl flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-amber-300">Worth Watching</span>
              <span className="text-xs bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full">
                40 – 69%
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium leading-normal mt-1">
              Mild behavioral indicators noticed. Recommended for soft observation and check-ins.
            </p>
          </div>

          <div className="bg-rose-500/10 border-2 border-rose-500/30 p-4 rounded-2xl flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-rose-300">Talk to a Professional</span>
              <span className="text-xs bg-rose-500/20 text-rose-300 font-bold px-2 py-0.5 rounded-full">
                70 – 100%
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium leading-normal mt-1">
              Elevated indicators observed. Recommended to consult a pediatrician or counselor.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl text-white">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-6">
          <div>
            <h4 className="text-lg font-black text-white">Psychological Screening Domains</h4>
            <p className="text-xs text-slate-400">
              Categorized by qualitative observation bands (Primary Parent Display)
            </p>
          </div>

          <button
            onClick={() => setShowClinicianDetails(!showClinicianDetails)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-extrabold py-2 px-4 rounded-xl border border-slate-700 transition cursor-pointer self-start sm:self-auto"
          >
            <Eye className="w-4 h-4" />
            <span>{showClinicianDetails ? "Hide Raw Data" : "Clinician Raw Details"}</span>
            {showClinicianDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 45 }}>
              <XAxis
                dataKey="name"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                domain={[0, 100]}
                ticks={[0, 40, 70, 100]}
                tickFormatter={(val) => {
                  if (val === 40) return "Watching";
                  if (val === 70) return "Consult";
                  if (val === 0) return "Typical";
                  return `${val}%`;
                }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const bandInfo = getBandDetails(data.band);
                    return (
                      <div className="bg-slate-950 border-2 border-amber-400 p-4 rounded-2xl shadow-2xl text-white max-w-xs">
                        <p className="font-black text-amber-300 text-sm">{data.name}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${bandInfo.badgeColor}`}>
                            {bandInfo.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-2">{bandInfo.description}</p>

                        {showClinicianDetails && (
                          <div className="mt-3 pt-2 border-t border-slate-800 text-xs font-mono text-emerald-400">
                            Raw Score: {data.rawScore} / {data.maxScore} ({data.percentage}%)
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={40} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "Worth Watching", fill: "#f59e0b", fontSize: 10, position: "insideTopRight" }} />
              <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "Talk to Professional", fill: "#ef4444", fontSize: 10, position: "insideTopRight" }} />

              <Bar dataKey="percentage" radius={[8, 8, 0, 0]}>
                {chartData.map((entry) => {
                  const color = entry.band === "talk_to_professional" ? "#f43f5e" : entry.band === "worth_watching" ? "#f59e0b" : "#10b981";
                  return <Cell key={entry.domainKey} fill={color} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {showClinicianDetails && (
          <div className="mt-6 p-5 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-mono text-slate-300 animate-fade-in">
            <h5 className="font-sans font-bold text-amber-300 mb-2 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Clinician Diagnostic Weight Breakdown
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-3">
              {chartData.map((d) => (
                <div key={d.domainKey} className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white block">{d.name}</span>
                    <span className="text-slate-500 uppercase text-[10px]">{d.domainKey}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-400 text-sm">{d.rawScore} / {d.maxScore}</span>
                    <span className="block text-slate-400 text-[10px]">{d.percentage}% Total</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {(Object.keys(DOMAIN_DEFINITIONS) as DomainKey[]).map((key) => {
          const meta = DOMAIN_DEFINITIONS[key];
          const scoreObj = domainScores[key] || {
            rawScore: 0,
            maxScore: 6,
            normalizedPercentage: 0,
            band: "typical",
            bandLabel: "Typical",
            recommendation: "",
          };
          const bandDetails = getBandDetails(scoreObj.band);

          return (
            <div
              key={key}
              className={`rounded-3xl p-5 border-2 shadow-lg flex flex-col justify-between transition-all hover:scale-[1.01] ${bandDetails.bgColor} border-slate-800/20`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="font-extrabold text-base text-slate-900 dark:text-white">
                    {meta.label}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-black border ${bandDetails.badgeColor}`}>
                    {bandDetails.label}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mb-3">
                  {meta.shortDescription}
                </p>

                <p className="text-xs text-slate-800 dark:text-slate-200 font-semibold bg-white/60 dark:bg-black/30 p-3 rounded-xl border border-black/5 leading-relaxed">
                  💡 {scoreObj.recommendation}
                </p>
              </div>

              {showClinicianDetails && (
                <div className="mt-4 pt-3 border-t border-black/10 dark:border-white/10 flex justify-between items-center text-xs font-mono text-slate-600 dark:text-slate-400">
                  <span>Raw Weight Accumulation:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{scoreObj.rawScore} points</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
