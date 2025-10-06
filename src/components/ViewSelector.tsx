'use client';

import React from "react";

export type ViewType = 'week' | '3day' | 'day';

interface ViewSelectorProps {
    currentView: ViewType;
    onViewChange: (view: ViewType) => void;
}

export function ViewSelector({ currentView, onViewChange }: ViewSelectorProps) {
    const views = [
        {
            value: 'week' as const,
            label: 'Week',
            shortLabel: 'Week',
        },
        {
            value: '3day' as const,
            label: '3 Days',
            shortLabel: '3 Day',
        },
        {
            value: 'day' as const,
            label: '1 Day',
            shortLabel: 'Day',
        }
    ];

return (
    <div className="flex glass rounded-xl p-1 shadow-lg">
        {views.map((view, index) => {
            const isActive = currentView === view.value;
            const isFirst = index === 0;
            const isLast = index === views.length - 1;

            return (
                <React.Fragment key={view.value}>
                    <button
                        onClick={() => onViewChange(view.value)}
                        className={`
                        group relative flex items-center px-2 py-1 text-sm font-medium transition-all duration-300 hover:shadow-lg active:scale-95
                        ${isFirst ? 'rounded-l-lg' : ''} 
                        ${isLast ? 'rounded-r-lg' : ''}
                        ${isActive 
                            ? 'glass-strong shadow-lg bg-slate-100/80 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 font-semibold scale-105' 
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:glass-strong'
                        }
                        `}
                        aria-label={`Switch to ${view.label} view`}
                        aria-pressed={isActive}
                    >
                        <span className="relative transition-colors duration-200">
                        {view.shortLabel}
                        </span>
                    </button>

                    {!isLast && <div className="inset-0 min-h-[1em] w-px self-stretch bg-gradient-to-b from-transparent via-white/30 dark:via-white/20 to-transparent"></div>}
                </React.Fragment>
            );
        })}
    </div>
);
}