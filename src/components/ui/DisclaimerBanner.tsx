import React from "react";
import { AlertTriangle } from "lucide-react";

export const DisclaimerBanner: React.FC = () => {
  return (
    <div className="w-full bg-amber-500/15 border-2 border-amber-500/40 rounded-2xl p-4 sm:p-5 shadow-sm text-slate-900 dark:text-amber-100 flex items-start gap-4 my-4">
      <div className="p-2 bg-amber-500 text-slate-950 rounded-xl shrink-0 mt-0.5 shadow-md">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-extrabold text-lg text-amber-900 dark:text-amber-200">
            Important Clinical Note
          </h4>
          <span className="bg-amber-500/20 text-amber-900 dark:text-amber-300 font-bold text-xs px-2.5 py-0.5 rounded-full border border-amber-500/30">
            Informational Only
          </span>
        </div>
        <p className="mt-1 text-base font-semibold leading-relaxed text-amber-950 dark:text-amber-100">
          "This is not a diagnosis. It's a conversation starter."
        </p>
        <p className="mt-1 text-xs text-amber-800 dark:text-amber-300 font-medium">
          Finn's Way provides preliminary behavioural observations based on child choices during interactive storytelling. Results should be reviewed alongside clinical evaluation by a licensed pediatric health professional.
        </p>
      </div>
    </div>
  );
};
