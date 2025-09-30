'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

const Calendar = dynamic(() => import('@/components/Calendar'), { 
  ssr: false,
  loading: () => <div className="h-full"><CalendarSkeleton /></div>
});
import { ErrorMessage, StatusBar } from '@/components/UI';
import { CalendarSkeleton, EmptyCalendarState } from '@/components/SkeletonLoader';
import { useEvents } from '@/hooks/useEvents';
import { RegionSelector, Region, REGION_OPTIONS } from '@/components/RegionSelector';
import { ThemeSelector } from '@/components/ThemeSelector';
import { ViewType } from '@/components/ViewSelector';


export default function Home() {
  // Load saved region from localStorage or default to EMEA
  const [selectedRegion, setSelectedRegion] = useState<Region>('EMEA');
  // Load saved view from localStorage or default to week
  const [selectedView, setSelectedView] = useState<ViewType>('week');
  
  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedRegion = localStorage.getItem('vatsim-region') as Region;
    if (savedRegion && ['EMEA', 'AMAS', 'APAC', 'all'].includes(savedRegion)) {
      setSelectedRegion(savedRegion);
    }
    
    const savedView = localStorage.getItem('vatsim-view') as ViewType;
    if (savedView && ['week', '3day', 'day'].includes(savedView)) {
      setSelectedView(savedView);
    }
  }, []);

  // Save preferences to localStorage
  const handleRegionChange = (region: Region) => {
    setSelectedRegion(region);
    localStorage.setItem('vatsim-region', region);
  };

  const handleViewChange = (view: ViewType) => {
    setSelectedView(view);
    localStorage.setItem('vatsim-view', view);
  };

  const { events, loading, error, lastUpdated, cached, refetch } = useEvents(selectedRegion);

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden transition-colors duration-300">
      {/* Enhanced Header */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-2 w-full flex">
          <div className="w-full flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              VATSIM Events Calendar
            </h1>
            <div className="flex items-center space-x-4">
              <ThemeSelector />
              <RegionSelector 
                selectedRegion={selectedRegion}
                onRegionChange={handleRegionChange}
              />
            </div>
          </div>
        </header>
        
        {/* Main Content */}
      <main className="flex-1 overflow-hidden animate-in fade-in duration-700">
        {loading && (
          <CalendarSkeleton />
        )}
        
        {error && !loading && (
          <div className="h-full flex items-center justify-center p-4">
            <ErrorMessage 
              message={error} 
              onRetry={refetch}
            />
          </div>
        )}
        
        {!loading && !error && (
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-hidden">
              {events.length > 0 ? (
                <Calendar 
                  events={events} 
                  region={REGION_OPTIONS[selectedRegion]} 
                  view={selectedView}
                  onViewChange={handleViewChange}
                />
              ) : (
                <EmptyCalendarState region={REGION_OPTIONS[selectedRegion]} />
              )}
            </div>
            
            <div className="flex-shrink-0">
              <StatusBar 
                lastUpdated={lastUpdated}
                cached={cached}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
