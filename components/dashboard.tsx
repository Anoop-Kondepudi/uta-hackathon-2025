'use client';
import { useState } from "react";
import { Scan, Calendar } from "lucide-react";
import DetectorPage from "./detector";
import Planner from "./planner";

type ActiveTab = "detector" | "planner";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("detector");

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 pb-24">
      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Conditionally render based on active tab */}
        {activeTab === "detector" && <DetectorPage />}
        {activeTab === "planner" && <Planner />}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-5 left-0 right-0 flex items-center justify-center z-50">
        <div className="max-w-sm w-auto mx-4 px-3 py-2 bg-background/80 backdrop-blur-lg border border-border shadow-lg rounded-full">
          <div className="flex items-center justify-center gap-3">
            {/* Mango Disease Detector Button */}
            <button
              onClick={() => setActiveTab("detector")}
              className={`cursor-pointer flex flex-col items-center gap-1 px-8 py-2 rounded-full transition-all duration-300 ${
                activeTab === "detector"
                  ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              <Scan className="w-5 h-5" />
              <span className="text-xs font-medium">Detector</span>
            </button>

            {/* Planner Button */}
            <button
              onClick={() => setActiveTab("planner")}
              className={`cursor-pointer flex flex-col items-center gap-1 px-8 py-2 rounded-full transition-all duration-300 ${
                activeTab === "planner"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span className="text-xs font-medium">Planner</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
