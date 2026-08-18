import React, { useState } from "react";
import { useStoryStore } from "../../state/useStoryStore";
import { Lock, KeyRound, ArrowRight, ShieldCheck, UserCheck, Settings } from "lucide-react";

interface ParentAuthGateProps {
  onSuccess?: () => void;
}

export const ParentAuthGate: React.FC<ParentAuthGateProps> = ({ onSuccess }) => {
  const { authenticateUser } = useStoryStore();
  const [pin, setPin] = useState("1234");
  const [error, setError] = useState(false);

  const handleLoginWithPin = (targetPin: string) => {
    const result = authenticateUser(targetPin);
    if (result.success) {
      setError(false);
      if (onSuccess) onSuccess();
    } else {
      setError(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLoginWithPin(pin);
  };

  return (
    <div className="w-full max-w-lg mx-auto my-8 p-8 bg-slate-900/95 backdrop-blur-xl rounded-3xl border-2 border-emerald-500/30 shadow-2xl text-white select-none">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg border-2 border-emerald-300">
          <Lock className="w-8 h-8 text-slate-950" />
        </div>

        <div>
          <span className="bg-emerald-500/20 text-emerald-300 font-bold text-xs px-3 py-1 rounded-full border border-emerald-400/30 uppercase tracking-widest">
            Portal Access Gate
          </span>
          <h2 className="text-2xl font-black text-white mt-2">Enter Portal Credentials</h2>
          <p className="text-sm text-slate-300 font-medium mt-1">
            Access child screening observations, 3-band domain scores, and path history.
          </p>
        </div>

        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 my-2 text-left">
          <button
            type="button"
            onClick={() => handleLoginWithPin("1234")}
            className="p-4 rounded-2xl bg-slate-950 border-2 border-emerald-500/40 hover:border-emerald-400 transition cursor-pointer flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-emerald-300 text-sm flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-400" /> Parent / Clinician
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-xs text-slate-400 mt-2">Passcode: <strong className="text-white font-mono">1234</strong></p>
            <span className="text-[10px] text-emerald-400/80 font-semibold mt-1">Click to Log In</span>
          </button>

          <button
            type="button"
            onClick={() => handleLoginWithPin("admin9999")}
            className="p-4 rounded-2xl bg-slate-950 border-2 border-indigo-500/40 hover:border-indigo-400 transition cursor-pointer flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-indigo-300 text-sm flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-indigo-400" /> System Admin
              </span>
              <ShieldCheck className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-xs text-slate-400 mt-2">Passcode: <strong className="text-white font-mono">admin9999</strong></p>
            <span className="text-[10px] text-indigo-400/80 font-semibold mt-1">Click to Log In</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="w-full mt-2 flex flex-col gap-4">
          <div className="relative">
            <input
              type="password"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError(false);
              }}
              placeholder="Enter PIN or Passcode"
              className="w-full bg-slate-950 border-2 border-slate-700 focus:border-emerald-400 rounded-2xl py-3.5 px-4 text-center text-xl font-black tracking-wider text-emerald-300 placeholder:text-slate-600 outline-none transition"
              autoFocus
            />
            <KeyRound className="absolute right-4 top-4 w-5 h-5 text-slate-500 pointer-events-none" />
          </div>

          {error && (
            <p className="text-xs font-bold text-rose-400 bg-rose-500/10 py-2.5 px-3 rounded-xl border border-rose-500/30">
              Invalid credentials. Use Parent PIN <strong className="text-white font-mono">1234</strong> or Admin PIN <strong className="text-white font-mono">admin9999</strong>.
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-lg py-3.5 px-6 rounded-2xl shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Authenticate & Unlock</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <div className="w-full mt-4 pt-4 border-t border-slate-800 text-xs text-left bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          <h4 className="font-bold text-amber-300 mb-2">Available Credentials Summary</h4>
          <div className="flex flex-col gap-1.5 font-mono text-[11px] text-slate-300">
            <div className="flex justify-between border-b border-slate-800/80 pb-1">
              <span>Parent / Clinician PIN:</span>
              <strong className="text-emerald-400">1234</strong>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-1">
              <span>System Admin PIN:</span>
              <strong className="text-indigo-400">admin9999</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
