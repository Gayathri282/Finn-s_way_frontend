import React from "react";
import type { Choice } from "../../types/screening";
import { ArrowLeft, ArrowRight, Compass } from "lucide-react";

interface ChoiceOverlayProps {
  choices: Choice[];
  onSelectChoice: (choice: Choice) => void;
  isVisible: boolean;
}

export const ChoiceOverlay: React.FC<ChoiceOverlayProps> = ({ choices, onSelectChoice, isVisible }) => {
  // Only render if visible AND choices array is non-empty
  if (!isVisible || !choices || choices.length === 0) return null;

  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-end p-6 sm:p-10 bg-gradient-to-t from-black/85 via-black/40 to-transparent transition-opacity duration-700 ease-out animate-fade-in pointer-events-auto">
      {/* Prompt Banner for Child */}
      <div className="w-full max-w-xl mx-auto mb-6 sm:mb-8 text-center bg-amber-400/90 text-slate-950 py-3.5 px-6 rounded-2xl shadow-xl backdrop-blur-md border-2 border-amber-300 transform animate-bounce-subtle">
        <h3 className="text-xl sm:text-2xl font-black tracking-wide flex items-center justify-center gap-2">
          <Compass className="w-7 h-7 text-emerald-950 animate-spin-slow" />
          <span>What should Finn do next?</span>
        </h3>
      </div>

      {/* Choice Buttons Grid (Anchored Left / Center / Right) */}
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 items-end">
        {choices.map((choice, index) => {
          const position = choice.position || (index === 0 ? "left" : index === choices.length - 1 ? "right" : "center");

          const positionClasses = {
            left: "lg:col-start-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 border-emerald-300/60",
            center: "lg:col-start-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 border-indigo-300/60",
            right: "lg:col-start-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 border-amber-300/60",
          }[position];

          const IconComponent = position === "left" ? ArrowLeft : position === "right" ? ArrowRight : Compass;

          return (
            <div key={choice.choiceId} className={`w-full flex ${position === "left" ? "justify-start" : position === "right" ? "justify-end" : "justify-center"}`}>
              <button
                onClick={() => onSelectChoice(choice)}
                className={`group relative w-full min-h-[96px] sm:min-h-[110px] p-5 sm:p-6 rounded-3xl text-white font-extrabold shadow-2xl border-4 transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.03] active:scale-95 focus:outline-none focus:ring-4 focus:ring-amber-300 flex flex-col justify-between cursor-pointer ${positionClasses}`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-amber-100 flex items-center gap-1.5 backdrop-blur-sm">
                    <IconComponent className="w-4 h-4" /> Path {index + 1}
                  </span>
                  <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-amber-300 group-hover:text-slate-900 transition-colors">
                    ✨
                  </span>
                </div>

                <span className="text-xl sm:text-2xl font-black text-left leading-tight drop-shadow-md group-hover:text-amber-100 transition-colors">
                  {choice.label}
                </span>

                {choice.detailText && (
                  <span className="text-xs sm:text-sm font-semibold text-white/80 text-left mt-2 line-clamp-1 italic">
                    {choice.detailText}
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
