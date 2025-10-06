"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

const Calendar = dynamic(() => import("@/components/Calendar"), {
  ssr: false,
  loading: () => (
    <div className="h-full">
      <CalendarSkeleton />
    </div>
  ),
});
import { ErrorMessage, StatusBar } from "@/components/UI";
import {
  CalendarSkeleton,
  EmptyCalendarState,
} from "@/components/SkeletonLoader";
import { useEvents } from "@/hooks/useEvents";
import { Region, REGION_OPTIONS } from "@/components/RegionSelector";
import { ViewType } from "@/components/ViewSelector";

export default function Home() {
  // Load saved region from localStorage or default to EMEA
  const [selectedRegion, setSelectedRegion] = useState<Region>("EMEA");
  // Load saved view from localStorage or default to week
  const [selectedView, setSelectedView] = useState<ViewType>("week");

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedRegion = localStorage.getItem("vatsim-region") as Region;
    if (savedRegion && ["EMEA", "AMAS", "APAC", "all"].includes(savedRegion)) {
      setSelectedRegion(savedRegion);
    }

    const savedView = localStorage.getItem("vatsim-view") as ViewType;
    if (savedView && ["week", "3day", "day"].includes(savedView)) {
      setSelectedView(savedView);
    }
  }, []);

  // Save preferences to localStorage
  const handleRegionChange = (region: Region) => {
    setSelectedRegion(region);
    localStorage.setItem("vatsim-region", region);
  };

  const handleViewChange = (view: ViewType) => {
    setSelectedView(view);
    localStorage.setItem("vatsim-view", view);
  };

  const { events, loading, error, lastUpdated, cached, refetch } =
    useEvents(selectedRegion);

  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      {/* Subtle floating orbs for depth */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-200/20 dark:bg-blue-500/10 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl opacity-50 animate-float-slow" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-slate-200/20 dark:bg-slate-500/10 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl opacity-50 animate-float-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-gray-200/20 dark:bg-gray-500/10 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl opacity-50 animate-float-slow" style={{ animationDelay: '4s' }} />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden animate-in fade-in duration-700 relative z-10 sm:m-2">
        {loading && (
          <div className="glass rounded-2xl h-full shadow-glass-lg">
            <CalendarSkeleton />
          </div>
        )}

        {error && !loading && (
          <div className="h-full flex items-center justify-center p-4">
            <div className="glass rounded-2xl p-8 max-w-md shadow-glass-lg">
              <ErrorMessage message={error} onRetry={refetch} />
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="h-full flex flex-col glass rounded-2xl overflow-hidden shadow-glass-lg">
            <div className="flex-1 overflow-hidden">
              {events.length > 0 ? (
                <Calendar
                  events={events}
                  region={REGION_OPTIONS[selectedRegion]}
                  selectedRegion={selectedRegion}
                  onRegionChange={handleRegionChange}
                  view={selectedView}
                  onViewChange={handleViewChange}
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <EmptyCalendarState region={REGION_OPTIONS[selectedRegion]} />
                </div>
              )}
            </div>

            <div className="flex-shrink-0">
              <StatusBar lastUpdated={lastUpdated} cached={cached} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
