'use client';

// Skeleton component for individual elements
function Skeleton({ className = "", delay = 0, ...props }: React.HTMLAttributes<HTMLDivElement> & { delay?: number }) {
  return (
    <div 
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded transition-all duration-500 ${className}`} 
      style={{ animationDelay: `${delay}ms` }}
      {...props}
    />
  );
}

// Skeleton for event cards
export function EventCardSkeleton({ style }: { style?: React.CSSProperties }) {
  return (
    <div 
      className="absolute bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
      style={style}
    >
      {/* Image skeleton */}
      <Skeleton className="w-full h-6" />
      
      {/* Content skeleton */}
      <div className="px-1.5 py-1 space-y-1">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-2 w-1/2" />
        <Skeleton className="h-2 w-3/4" />
      </div>
    </div>
  );
}

// Skeleton for all-day event cards
export function AllDayEventSkeleton({ style }: { style?: React.CSSProperties }) {
  return (
    <div 
      className="absolute bg-gradient-to-r from-gray-200 to-gray-300 rounded-md border-l-4 border-gray-300 overflow-hidden"
      style={style}
    >
      <div className="px-2 py-1 h-full flex items-center">
        <div className="flex-1 space-y-1">
          <Skeleton className="h-3 w-full bg-gray-300" />
          <Skeleton className="h-2 w-1/3 bg-gray-300" />
        </div>
        <Skeleton className="w-6 h-6 rounded-full ml-2 bg-gray-400" />
      </div>
    </div>
  );
}

// Main calendar skeleton
export function CalendarSkeleton() {
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  
  return (
    <div className="h-full flex flex-col transition-colors duration-300">
      {/* Header skeleton */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/20 dark:border-white/10 glass-strong transition-colors duration-300">
        <div className="flex items-center space-x-2">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="w-8 h-8 rounded-full" />
          <div className="ml-3">
            <Skeleton className="h-5 w-48 mb-1" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-12 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
        <Skeleton className="w-16 h-7 rounded-md" />
      </div>

      {/* Calendar grid skeleton */}
      <div className="flex-1 flex overflow-hidden">
        {/* Time sidebar skeleton */}
        <div className="w-14 flex-shrink-0 glass border-r border-white/20 dark:border-white/10">
          <div className="h-12 border-b border-gray-300 bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
            <Skeleton className="h-2 w-6" />
          </div>
          <div className="space-y-8 p-2 pt-4">
            {Array.from({ length: 12 }, (_, i) => (
              <Skeleton key={i} className="h-2 w-8" />
            ))}
          </div>
        </div>

        {/* Days grid skeleton */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-7 min-w-full">
            {days.map((day, dayIndex) => (
              <div key={dayIndex} className="border-r border-gray-200 last:border-r-0 animate-in slide-in-from-top duration-500" style={{ animationDelay: `${dayIndex * 100}ms` }}>
                {/* Day header skeleton */}
                <div className="h-12 text-center sticky top-0 bg-white z-20 border-b border-gray-200 flex flex-col justify-center items-center space-y-1">
                  <Skeleton className="h-2 w-6" delay={dayIndex * 50} />
                  <Skeleton className="h-4 w-4 rounded" delay={dayIndex * 50 + 100} />
                </div>

                {/* Timeline with skeleton events */}
                <div className="relative bg-gray-50/30 h-96">
                  {/* Hour grid lines */}
                  {Array.from({ length: 24 }, (_, hour) => (
                    <div 
                      key={hour}
                      className="absolute left-0 right-0 border-t border-gray-100"
                      style={{ top: `${(hour / 24) * 100}%` }}
                    />
                  ))}
                  
                  {/* Random skeleton events */}
                  {dayIndex < 5 && ( // Only show events on weekdays for variety
                    <>
                      <EventCardSkeleton 
                        style={{
                          top: `${10 + (dayIndex * 5)}%`,
                          height: '8%',
                          left: '2%',
                          width: '96%'
                        }}
                      />
                      {dayIndex % 2 === 0 && (
                        <EventCardSkeleton 
                          style={{
                            top: `${30 + (dayIndex * 8)}%`,
                            height: '12%',
                            left: '2%',
                            width: '46%'
                          }}
                        />
                      )}
                      {dayIndex % 3 === 0 && (
                        <AllDayEventSkeleton 
                          style={{
                            top: '0%',
                            height: '8%',
                            left: '2%',
                            width: '96%'
                          }}
                        />
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Empty state for when no events are found
export function EmptyCalendarState({ region }: { region: string }) {
  return (
    <div className="h-full flex flex-col relative">
      {/* Header skeleton */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/20 dark:border-white/10 glass-strong">
        <div className="flex items-center space-x-2">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="w-8 h-8 rounded-full" />
          <div className="ml-3">
            <Skeleton className="h-5 w-48 mb-1" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-12 rounded-full" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        </div>
        <Skeleton className="w-16 h-7 rounded-md" />
      </div>

      {/* Empty calendar grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Time sidebar */}
        <div className="w-14 flex-shrink-0 glass border-r border-white/20 dark:border-white/10">
          <div className="h-12 border-b border-gray-300 bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
            <div className="text-[8px] font-semibold text-gray-600 uppercase tracking-wider">UTC</div>
          </div>
          <div className="space-y-4 p-2 pt-4">
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="text-[10px] text-gray-700 font-semibold text-center">
                {String(i * 2).padStart(2, '0')}:00
              </div>
            ))}
          </div>
        </div>

        {/* Days grid */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-7 min-w-full">
            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day, dayIndex) => (
              <div key={dayIndex} className="border-r border-gray-200 last:border-r-0">
                {/* Day header */}
                <div className="h-12 text-center sticky top-0 bg-white z-20 border-b border-gray-200 flex flex-col justify-center">
                  <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                    {day}
                  </div>
                  <div className="text-lg font-bold text-gray-400">
                    {dayIndex + 1}
                  </div>
                </div>

                {/* Empty timeline */}
                <div className="relative bg-gray-50/30 h-96">
                  {/* Hour grid lines */}
                  {Array.from({ length: 24 }, (_, hour) => (
                    <div 
                      key={hour}
                      className="absolute left-0 right-0 border-t border-gray-100"
                      style={{ top: `${(hour / 24) * 100}%` }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Empty state message overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-in fade-in zoom-in-95 duration-1000">
        <div className="text-center space-y-4 glass-strong p-8 rounded-2xl shadow-glass-lg hover:shadow-glow hover:scale-105 transition-all duration-500">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-slate-600 to-slate-800 dark:from-slate-500 dark:to-slate-700 rounded-full flex items-center justify-center shadow-lg animate-float-slow">
            <svg className="w-8 h-8 text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4M4 7v13a2 2 0 002 2h12a2 2 0 002-2V7" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 12v4m0 0l-2-2m2 2l2-2" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Events Found</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 max-w-xs">
              There are currently no events scheduled for {region}. Check back later or try a different region.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}