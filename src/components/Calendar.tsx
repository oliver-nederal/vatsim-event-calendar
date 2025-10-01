'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ProcessedEvent } from '@/types/vatsim';
import { ViewSelector, ViewType } from '@/components/ViewSelector';
import { Region, REGION_OPTIONS } from '@/components/RegionSelector';
import { 
  getTimeAsPercentage, 
  getHourlySlots, 
  getEventPositionPercentage, 
  isEventOnDay, 
  calculateEventLayout,
  getViewDays,
  formatViewRange,
  navigateView,
  formatTime,
  isSameDay,
  getDayAbbreviation,
} from '@/utils/dateUtils';

interface CalendarProps {
  events: ProcessedEvent[];
  region?: string;
  selectedRegion: Region;
  onRegionChange: (region: Region) => void;
  view: ViewType;
  onViewChange: (view: ViewType) => void;
}

interface EventCardProps {
  event: ProcessedEvent;
  onClick: () => void;
  style?: React.CSSProperties;
  isAllDay?: boolean;
  view?: ViewType;
}

function ResponsiveEventCard({ event, onClick, style, isAllDay, view }: EventCardProps) {
  const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Calculate if event is squished based on screen width, event width, and view type
  const eventWidth = style?.width ? parseFloat(style.width.toString().replace('%', '')) : 100;
  
  // Calculate actual pixel width of the event
  const actualEventWidth = (eventWidth / 100) * (screenWidth * 0.8); // Approximate calendar width
  
  // Adjust thresholds based on view type
  const getThresholds = () => {
    switch(view) {
      case 'day':
        return {
          pixelWidth: 200, // More space in day view, need smaller threshold
          screenWidth: 640, // Less aggressive on mobile for day view
          percentWidth: 20 // Much more lenient in day view
        };
      case '3day':
        return {
          pixelWidth: 120, // Medium threshold for 3-day view
          screenWidth: 768,
          percentWidth: 10
        };
      case 'week':
      default:
        return {
          pixelWidth: 100, // Most aggressive in week view
          screenWidth: 900, // More aggressive screen threshold for week
          percentWidth: 13
        };
    }
  };
  
  const thresholds = getThresholds();
  
  // Event is squished based on view-specific thresholds
  const isSquished = !isAllDay && (
    actualEventWidth < thresholds.pixelWidth || 
    screenWidth < thresholds.screenWidth || 
    eventWidth < thresholds.percentWidth
  );
  
  return (
    <div 
      className={`absolute overflow-hidden transition-all duration-300 cursor-pointer group animate-in fade-in slide-in-from-bottom-2 ${
        isAllDay 
          ? 'bg-blue-400 dark:bg-blue-700 text-white rounded-md shadow-md hover:shadow-lg border-l-4 border-blue-700 dark:border-blue-300 hover:border-blue-300 dark:hover:border-blue-200 hover:scale-[1.02] active:scale-[0.98]'
          : 'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-lg hover:scale-[1.02] hover:border-blue-200 dark:hover:border-blue-500 active:scale-[0.98]'
      }`}
      onClick={onClick}
      style={style}
    >
      {/* All-day event layout */}
      {isAllDay ? (
        <div className="px-2 py-1 h-full flex items-center">
          <div className="flex-1">
            <div className="text-xs font-bold text-white leading-tight line-clamp-1 mb-0.5">
              🌟 {event.title}
            </div>
            <div className="text-[10px] text-white/90 font-medium">
              Event longer than 24h
            </div>
          </div>
          {event.banner && (
            <div className="w-6 h-6 rounded-full overflow-hidden ml-2 border-2 border-white/30">
              <Image 
                src={event.banner} 
                alt={event.title}
                width={24}
                height={24}
                className="object-cover w-full h-full"
                sizes="24px"
              />
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Full-width image header for timed events */}
          {event.banner && !isSquished && (
            <div className="w-full h-6 relative overflow-hidden">
              <Image 
                src={event.banner} 
                alt={event.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
                sizes="200px"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent" />
            </div>
          )}
          
          {/* Compact content for timed events */}
          <div className={`${isSquished ? 'flex items-center justify-center h-full border border-neutral-50' : 'px-1.5 py-1'}`}>
            {isSquished ? (
              /* Vertical text layout with background image for squished events */
              <div className="text-center w-full h-full flex items-center justify-center relative group overflow-hidden rounded-md">
                {/* Background image with gradient overlay */}
                {event.banner && (
                  <>
                    <Image 
                      src={event.banner} 
                      alt={event.title}
                      fill
                      className="object-cover absolute inset-0 z-0"
                      sizes="100px"
                    />
                    {/* Dark gradient overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70 z-10"></div>
                  </>
                )}
                
                <div 
                  className={`font-bold text-white leading-none tracking-wider select-none relative z-20 drop-shadow-sm ${
                    screenWidth < 640 ? 'text-[7px]' : 'text-[8px]'
                  }`}
                  style={{
                    writingMode: 'vertical-rl',
                    textOrientation: 'mixed',
                    transform: 'rotate(180deg)',
                    maxHeight: '90%',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                  }}
                  title={`${event.title} - ${formatTime(event.startTime)}`} // Enhanced tooltip
                >
                  {/* Show more characters on larger screens, fewer on mobile */}
                  {screenWidth < 640 
                    ? event.title.split('').slice(0, 8).join('') + (event.title.length > 8 ? '…' : '')
                    : event.title.split('').slice(0, 14).join('') + (event.title.length > 14 ? '…' : '')
                  }
                </div>
                
                {/* Responsive indicator - more subtle on image background */}
                <div className={`absolute top-0.5 right-0.5 bg-white/60 rounded-full z-20 ${
                  screenWidth < 640 ? 'w-0.5 h-0.5' : 'w-1 h-1'
                }`}></div>
              </div>
            ) : (
              /* Normal horizontal layout */
              <>
                <div className="text-[9px] font-semibold text-gray-900 dark:text-gray-100 leading-tight line-clamp-1 mb-0.5">
                  {event.title}
                </div>
                
                <div className="text-[9px] text-gray-600 dark:text-gray-400 font-medium mb-0.5">
                  {formatTime(event.startTime)}
                </div>
                
                {event.airports.length > 0 && (
                  <div className="text-[8px] text-gray-500 dark:text-gray-500 truncate">
                    {event.airports.slice(0, 2).join(', ')}
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

interface EventModalProps {
  event: ProcessedEvent | null;
  onClose: () => void;
}

function EventModal({ event, onClose }: EventModalProps) {
  if (!event) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-none transform transition-all duration-500 animate-in zoom-in-95 slide-in-from-bottom-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header with Banner */}
        <div className="relative aspect-video bg-gray-600 dark:bg-blue-700 overflow-hidden rounded-t-2xl">
          {event.banner && (
            <Image 
              src={event.banner} 
              alt={event.title}
              fill
              className="object-cover"
              sizes="100vw"
            />
          )}
          <div className="absolute inset-0 bg-black/20" />
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white p-2.5 rounded-xl hover:bg-white/30 transition-all duration-200 hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{event.title}</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Event Details</h3>
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p><strong>Start:</strong> {event.startTime.toLocaleString()}</p>
                <p><strong>End:</strong> {event.endTime.toLocaleString()}</p>
                <p><strong>Duration:</strong> {Math.round((event.endTime.getTime() - event.startTime.getTime()) / (1000 * 60 * 60))} hours</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Location & Organization</h3>
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p><strong>Airports:</strong> {event.airports.join(', ')}</p>
                <p><strong>Organizers:</strong> {event.organisers.join(', ')}</p>
              </div>
            </div>
          </div>
          
          {event.routes.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-2">Routes</h3>
              <div className="space-y-1 text-sm">
                {event.routes.slice(0, 3).map((route, index) => (
                  <p key={index}>{route.departure} → {route.arrival}</p>
                ))}
                {event.routes.length > 3 && (
                  <p className="text-gray-500">...and {event.routes.length - 3} more routes</p>
                )}
              </div>
            </div>
          )}
          
          {event.description && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <div className="text-sm text-gray-700 prose prose-sm max-w-none">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Custom styling for markdown elements
                    h1: ({children}) => <h1 className="text-lg font-bold text-gray-900 mt-4 mb-2">{children}</h1>,
                    h2: ({children}) => <h2 className="text-base font-semibold text-gray-900 mt-3 mb-2">{children}</h2>,
                    h3: ({children}) => <h3 className="text-sm font-semibold text-gray-900 mt-2 mb-1">{children}</h3>,
                    p: ({children}) => <p className="mb-2 leading-relaxed">{children}</p>,
                    ul: ({children}) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                    ol: ({children}) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                    li: ({children}) => <li className="text-gray-700">{children}</li>,
                    strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>,
                    em: ({children}) => <em className="italic text-gray-800">{children}</em>,
                    code: ({children}) => <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono text-gray-800">{children}</code>,
                    pre: ({children}) => <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto scrollbar-none text-xs font-mono mb-2">{children}</pre>,
                    blockquote: ({children}) => <blockquote className="border-l-4 border-blue-200 pl-4 py-2 bg-blue-50 rounded-r-md mb-2 italic text-gray-700">{children}</blockquote>,
                    a: ({href, children}) => <a href={href} className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                    table: ({children}) => <div className="overflow-x-auto scrollbar-none mb-2"><table className="min-w-full border border-gray-200 rounded-md">{children}</table></div>,
                    thead: ({children}) => <thead className="bg-gray-50">{children}</thead>,
                    th: ({children}) => <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 border-b">{children}</th>,
                    td: ({children}) => <td className="px-3 py-2 text-xs text-gray-700 border-b">{children}</td>,
                  }}
                >
                  {event.description}
                </ReactMarkdown>
              </div>
            </div>
          )}
          
          {event.link && (
            <div className="mt-6 pt-4 border-t">
              <a 
                href={event.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View Event Details
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Calendar({ events, region, selectedRegion, onRegionChange, view, onViewChange }: CalendarProps) {
  const [isRegionSelectorOpen, setIsRegionSelectorOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<ProcessedEvent | null>(null);
  const [containerHeight, setContainerHeight] = useState(600);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'next' | 'prev' | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Update container height on resize
  useEffect(() => {
    const updateHeight = () => {
      if (timelineRef.current) {
        const rect = timelineRef.current.getBoundingClientRect();
        const availableHeight = window.innerHeight - rect.top - 100;
        setContainerHeight(Math.max(400, Math.min(800, availableHeight)));
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const viewDays = getViewDays(currentDate, view);


  const handleNavigation = (direction: 'prev' | 'next') => {
    if (isTransitioning) return; // Prevent multiple rapid clicks
    
    setIsTransitioning(true);
    setTransitionDirection(direction);
    
    // Apply new date after a brief delay to allow animation to start
    setTimeout(() => {
      setCurrentDate(navigateView(currentDate, direction, view));
    }, 50);
    
    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
      setTransitionDirection(null);
    }, 400);
  };
  
  const goToPrevious = () => handleNavigation('prev');
  const goToNext = () => handleNavigation('next');
  const goToToday = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentDate(new Date());
      setIsTransitioning(false);
    }, 200);
  };

  const getEventsForDay = (date: Date) => {
    return events.filter(event => isEventOnDay(event, date));
  };

  const hourlySlots = getHourlySlots();
  const currentTimePercentage = getTimeAsPercentage(new Date());

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Calendar Navigation Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-300">
        <div className="flex items-center space-x-2">
          <button
            onClick={goToPrevious}
            disabled={isTransitioning}
            className={`group p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all duration-200 hover:shadow-md active:scale-90 ${
              isTransitioning ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            aria-label={`Previous ${view}`}
          >
            <svg className={`w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-all duration-200 ${
              isTransitioning && transitionDirection === 'prev' 
                ? 'animate-pulse -translate-x-1' 
                : 'group-hover:-translate-x-0.5'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={goToNext}
            disabled={isTransitioning}
            className={`group p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all duration-200 hover:shadow-md active:scale-90 ${
              isTransitioning ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            aria-label={`Next ${view}`}
          >
            <svg className={`w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-all duration-200 ${
              isTransitioning && transitionDirection === 'next' 
                ? 'animate-pulse translate-x-1' 
                : 'group-hover:translate-x-0.5'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          <div className="ml-3">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 transition-all duration-300 hover:text-blue-600 dark:hover:text-blue-400">
              {formatViewRange(viewDays, view)}
            </h2>
            {region && (
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-0.5 animate-in fade-in duration-500 relative">
                <button
                  onClick={() => setIsRegionSelectorOpen(!isRegionSelectorOpen)}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 mr-2 hover:animate-none hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-200 cursor-pointer group"
                >
                  {region}
                  <svg className={`w-3 h-3 ml-1 transition-transform duration-200 ${isRegionSelectorOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <span className="transition-all duration-300 hover:text-gray-700 dark:hover:text-gray-300 hover:font-medium">{events.length} events</span>
                
                {/* Region Dropdown */}
                {isRegionSelectorOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsRegionSelectorOpen(false)} />
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-50 animate-in slide-in-from-top-2 duration-200">
                      <div className="py-2">
                        {Object.entries(REGION_OPTIONS).map(([regionKey, regionName]) => (
                          <button
                            key={regionKey}
                            onClick={() => {
                              onRegionChange(regionKey as Region);
                              setIsRegionSelectorOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 flex items-center justify-between ${
                              selectedRegion === regionKey
                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                                : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                            }`}
                          >
                            {regionName}
                            {selectedRegion === regionKey && (
                              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <ViewSelector 
            currentView={view}
            onViewChange={onViewChange}
          />
          <button
            onClick={goToToday}
            disabled={isTransitioning}
            className={`group px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-all duration-200 hover:shadow-sm active:scale-95 ${
              isTransitioning ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <span className={isTransitioning ? 'animate-pulse' : ''}>
              Go to Today
            </span>
          </button>
        </div>
      </div>

      {/* Timeline Container */}
      <div className="flex-1 flex overflow-hidden" ref={timelineRef}>
        {/* Time Axis */}
        <div className="w-14 flex-shrink-0 bg-gray-100 dark:bg-gray-800 border-r border-gray-300 dark:border-gray-600 relative transition-colors duration-300">
          <div className="h-12 border-b border-gray-300 dark:border-gray-600 bg-gray-200 dark:bg-gray-700 flex items-center justify-center transition-colors duration-300">
            <div className="text-[8px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">UTC</div>
          </div>
          <div 
            className="relative" 
            style={{ height: `${containerHeight}px` }}
          >
            {hourlySlots.map((slot) => (
              <div 
                key={slot.hour}
                  className="absolute left-0 right-0 text-[10px] text-gray-700 dark:text-gray-300 font-semibold px-1 text-center"
                style={{ 
                  top: `${slot.percentage}%`,
                  transform: 'translateY(-50%)'
                }}
              >
                {slot.display}
              </div>
            ))}
          </div>
        </div>

        {/* Days Grid */}
        <div className="flex-1 overflow-auto scrollbar-none">
          <div className={`grid min-w-full transition-all duration-300 ${
            view === 'day' ? 'grid-cols-1' : 
            view === '3day' ? 'grid-cols-3' : 
            'grid-cols-7'
          } ${
            isTransitioning ? (
              transitionDirection === 'next' 
                ? 'transform translate-x-2' 
                : 'transform -translate-x-2'
            ) : 'transform translate-x-0'
          }`}>
              {viewDays.map((day, dayIndex) => {
                const dayEvents = getEventsForDay(day);
                const isToday = isSameDay(day, new Date());
                const dayOfWeek = day.getDay();
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                
                // Color coding for different days
                const dayColors = {
                  background: isToday ? 'bg-blue-50 dark:bg-blue-900/20' : isWeekend ? 'bg-gray-100 dark:bg-gray-800' : 'bg-gray-50/30 dark:bg-gray-900/30',
                  header: isToday ? 'bg-blue-100 dark:bg-blue-900/30' : isWeekend ? 'bg-gray-100 dark:bg-gray-800' : 'bg-white dark:bg-gray-800',
                  border: isToday ? 'border-blue-200 dark:border-blue-700' : isWeekend ? 'border-gray-300 dark:border-gray-600' : 'border-gray-200 dark:border-gray-700',
                  text: isToday ? 'text-blue-600 dark:text-blue-400' : isWeekend ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-gray-100',
                  dayText: isWeekend ? 'text-gray-600 dark:text-gray-400' : 'text-gray-500 dark:text-gray-400'
                };

                return (
                  <div 
                    key={`${day.toDateString()}-${dayIndex}`} 
                    className={`border-r ${dayColors.border} last:border-r-0 ${view === 'day' ? 'min-w-full' : ''} transition-all duration-300 ${
                      isTransitioning 
                        ? 'transform scale-95 opacity-60' 
                        : 'transform scale-100 opacity-100'
                    }`}
                    style={{ 
                      transitionDelay: `${dayIndex * 30}ms`,
                      animationDelay: `${dayIndex * 50}ms`
                    }}
                  >
                    {/* Day Header - Sticky */}
                    <div 
                      className={`h-12 text-center sticky top-0 ${dayColors.header} z-20 border-b ${dayColors.border} flex flex-col justify-center shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md group ${
                        isTransitioning ? 'blur-[1px]' : 'blur-0'
                      }`}
                      style={{ 
                        animationDelay: `${dayIndex * 50}ms`,
                        transitionDelay: `${dayIndex * 20}ms`
                      }}
                    >
                      <div className={`text-[10px] font-semibold ${dayColors.dayText} uppercase tracking-wider transition-all duration-200`}>
                        {getDayAbbreviation(day.getDay())}
                      </div>
                      <div className={`text-lg font-bold ${dayColors.text} transition-all duration-300 ${isToday ? 'font-bold' : ''}`}>
                        {day.getDate()}
                      </div>
                    </div>

                    {/* Timeline */}
                    <div 
                      className={`relative ${dayColors.background}`} 
                      style={{ height: `${containerHeight}px` }}
                    >
                      {/* Hour grid lines */}
                      {hourlySlots.map((slot) => (
                        <div 
                          key={slot.hour}
                          className={`absolute left-0 right-0 border-t ${
                            slot.hour % 6 === 0 
                              ? 'border-gray-300 dark:border-gray-600' 
                              : 'border-gray-100 dark:border-gray-700'
                          }`}
                          style={{ top: `${slot.percentage}%` }}
                        />
                      ))}
                      
                      {/* Current time indicator */}
                      {isToday && (
                        <div 
                          className="group absolute left-0 right-0 border-t-2 border-red-500 z-30 shadow-sm animate-in slide-in-from-left duration-1000"
                          style={{ top: `${currentTimePercentage}%` }}
                        >
                          <div className="absolute -left-1 w-2 h-2 bg-red-500 rounded-full shadow-md transition-transform" style={{ top: '50%', transform: 'translateY(-50%)' }}></div>
                          <div className="absolute right-2 -top-3 text-[8px] font-semibold text-red-600 bg-red-100 px-1 py-0.5 rounded cursor-default">
                            NOW
                          </div>
                        </div>
                      )}

                      {/* Events */}
                      {(() => {
                        // Separate all-day events from timed events
                        const allDayEvents = dayEvents.filter(event => {
                          const durationHours = (event.endTime.getTime() - event.startTime.getTime()) / (1000 * 60 * 60);
                          return durationHours >= 23;
                        });
                        
                        const timedEvents = dayEvents.filter(event => {
                          const durationHours = (event.endTime.getTime() - event.startTime.getTime()) / (1000 * 60 * 60);
                          return durationHours < 23;
                        });
                        
                        const timedEventLayouts = calculateEventLayout(timedEvents);
                        
                        return [
                          // Render all-day events first (at the top)
                          ...allDayEvents.map((event, index) => {
                            const { height } = getEventPositionPercentage(event.startTime, event.endTime);
                            
                            return (
                              <ResponsiveEventCard
                                key={`allday-${event.id}`}
                                event={event}
                                onClick={() => setSelectedEvent(event)}
                                isAllDay={true}
                                view={view}
                                style={{
                                  top: `${index * 9}%`, // Stack all-day events
                                  height: `${height}%`,
                                  left: '1%',
                                  width: '98%',
                                  zIndex: 50 + index // Higher z-index for all-day events
                                }}
                              />
                            );
                          }),
                          
                          // Render timed events
                          ...timedEvents.map((event) => {
                            const { top, height } = getEventPositionPercentage(event.startTime, event.endTime);
                            const layout = timedEventLayouts.find(l => l.id === event.id);
                            
                            return (
                              <ResponsiveEventCard
                                key={event.id}
                                event={event}
                                onClick={() => setSelectedEvent(event)}
                                isAllDay={false}
                                view={view}
                                style={{
                                  top: `${Math.max(top, allDayEvents.length * 9)}%`, // Adjust for all-day events space
                                  height: `${height}%`,
                                  left: layout ? `${layout.left}%` : '1%',
                                  width: layout ? `${layout.width}%` : '98%',
                                  zIndex: 10 + (layout?.column || 0)
                                }}
                              />
                            );
                          })
                        ];
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Event Modal */}
      <EventModal 
        event={selectedEvent} 
        onClose={() => setSelectedEvent(null)} 
      />
    </div>
  );
}