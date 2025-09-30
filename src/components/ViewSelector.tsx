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
    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-px transition-colors duration-200">
        {views.map((view, index) => {
            const isActive = currentView === view.value;
            const isFirst = index === 0;
            const isLast = index === views.length - 1;

            return (
                <React.Fragment key={view.value}>
                    <button
                        onClick={() => onViewChange(view.value)}
                        className={`
                        group relative flex items-center px-3 py-1.5 text-sm font-medium transition-all duration-200 hover:shadow-sm active:scale-95
                        ${isFirst ? 'rounded-l-md' : ''} 
                        ${isLast ? 'rounded-r-md' : ''}
                        ${isActive 
                            ? 'bg-white/50 dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm font-semibold' 
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }
                        `}
                        aria-label={`Switch to ${view.label} view`}
                        aria-pressed={isActive}
                    >
                        <div className={`transition-all duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                        </div>
                        <span className="hidden sm:inline transition-colors duration-200">
                        {view.shortLabel}
                        </span>
                        <span className="sm:hidden transition-colors duration-200">
                        {view.shortLabel}
                        </span>
                    </button>

                    {!isLast && <div className="inset-0 min-h-[1em] w-px self-stretch bg-gradient-to-tr from-transparent via-neutral-500 to-transparent opacity-25 dark:via-neutral-400"></div>}
                </React.Fragment>
            );
        })}
    </div>
);
}