'use client';

import { useState } from 'react';

// Available VATSIM regions with display names
export const REGION_OPTIONS = {
  'EMEA': 'Europe, Middle East & Africa',
  'all': 'All Regions'
} as const;

export type Region = keyof typeof REGION_OPTIONS;

interface RegionSelectorProps {
  selectedRegion: Region;
  onRegionChange: (region: Region) => void;
  className?: string;
}

export function RegionSelector({ selectedRegion, onRegionChange, className = '' }: RegionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`z-40 relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all duration-200 hover:shadow-sm active:scale-95"
      >
        <span className="transition-colors duration-200">{REGION_OPTIONS[selectedRegion]}</span>
        <svg 
          className={`w-4 h-4 transition-all duration-300 group-hover:text-blue-600 ${isOpen ? 'rotate-180 scale-110' : 'group-hover:scale-110'}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20 animate-in slide-in-from-top-2 duration-200">
            <div className="py-2">
              {Object.entries(REGION_OPTIONS).map(([region, displayName]) => (
                <button
                  key={region}
                  onClick={() => {
                    onRegionChange(region as Region);
                    setIsOpen(false);
                  }}
                  className={`group w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-all duration-200 hover:translate-x-1 ${
                    selectedRegion === region 
                      ? 'bg-blue-50 text-blue-600 font-medium border-r-2 border-blue-400' 
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{displayName}</span>
                    {selectedRegion === region && (
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  {region !== 'all' && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      {region}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}