import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useStoryStore } from "./state/useStoryStore";
import { StoryPlayer } from "./components/child/StoryPlayer";
import { SessionCompleteScreen } from "./components/child/SessionCompleteScreen";
import { ClinicianDashboard } from "./components/dashboard/ClinicianDashboard";
import { DisclaimerBanner } from "./components/ui/DisclaimerBanner";

export const App: React.FC = () => {
  const { initStory, playerState } = useStoryStore();

  useEffect(() => {
    initStory();
  }, [initStory]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      <Routes>
        {/* Child Interactive Story Player Route */}
        <Route
          path="/"
          element={
            <div className="w-full flex-1 flex flex-col justify-between p-4 sm:p-6 max-w-7xl mx-auto">
              <main className="flex-1 flex items-center justify-center py-2">
                {playerState === "loading" ? (
                  <div className="flex flex-col items-center justify-center gap-4 text-amber-300 animate-fade-in">
                    <img src="/favicon.svg" alt="Finn's Way Logo" className="w-20 h-20 rounded-2xl shadow-2xl border-2 border-amber-400/40 animate-pulse" />
                    <span className="text-sm font-extrabold tracking-widest uppercase text-emerald-300">Finn's Way Story World</span>
                  </div>
                ) : playerState === "completed" ? (
                  <SessionCompleteScreen />
                ) : (
                  <StoryPlayer />
                )}
              </main>

              {/* CLINICAL DISCLAIMER BANNER */}
              <footer className="mt-4">
                <DisclaimerBanner />
              </footer>
            </div>
          }
        />

        {/* Parent / Clinician Dashboard Portal Route */}
        <Route path="/dashboard" element={<ClinicianDashboard />} />
      </Routes>
    </div>
  );
};

export default App;
