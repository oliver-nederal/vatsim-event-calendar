export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(date);
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(date);
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month];
}

export function getDayAbbreviation(day: number): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[day];
}

export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  
  // Calculate days to subtract to get to Monday
  // Sunday = 0, Monday = 1, Tuesday = 2, etc.
  // For Monday-Sunday week: Sunday should go back 6 days, Monday = 0, Tuesday = 1, etc.
  const daysToSubtract = day === 0 ? 6 : day - 1;
  
  const result = new Date(d);
  result.setDate(d.getDate() - daysToSubtract);
  result.setHours(0, 0, 0, 0); // Reset to start of day
  
  return result;
}

export function getWeekEnd(date: Date): Date {
  const weekStart = getWeekStart(date);
  return new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
}

export function getWeekDays(date: Date): Date[] {
  const weekStart = getWeekStart(date);
  const days = [];
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    day.setHours(0, 0, 0, 0); // Ensure consistent time
    days.push(day);
  }
  
  return days;
}

export function addWeeks(date: Date, weeks: number): Date {
  const result = new Date(date);
  result.setDate(date.getDate() + (weeks * 7));
  return result;
}

export function formatWeekRange(startDate: Date, endDate: Date): string {
  const start = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const end = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${start} - ${end}`;
}

export interface TimeSlot {
  hour: number;
  display: string;
  percentage: number;
}

export function getHourlySlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];
  for (let hour = 0; hour < 24; hour++) {
    slots.push({
      hour,
      display: `${hour.toString().padStart(2, '0')}:00`,
      percentage: (hour / 24) * 100
    });
  }
  return slots;
}

export function getTimeAsPercentage(date: Date): number {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const totalMinutes = hours * 60 + minutes + seconds / 60;
  return (totalMinutes / (24 * 60)) * 100;
}

export function getEventPositionPercentage(startTime: Date, endTime: Date): { 
  top: number; 
  height: number; 
  startPercentage: number; 
  endPercentage: number;
  isAllDay: boolean;
} {
  // Calculate event duration in milliseconds
  const durationMs = endTime.getTime() - startTime.getTime();
  const durationHours = durationMs / (1000 * 60 * 60);
  
  // Check if this is a 24-hour or all-day event (23+ hours)
  const isAllDay = durationHours >= 23;
  
  if (isAllDay) {
    // For all-day events, position at the top with a specific height
    return {
      top: 0,
      height: 8, // 8% height for all-day events (more prominent)
      startPercentage: 0,
      endPercentage: 100,
      isAllDay: true
    };
  }
  
  // Calculate start and end as percentage of the day for timed events
  const startPercentage = getTimeAsPercentage(startTime);
  const endPercentage = getTimeAsPercentage(endTime);
  
  // Handle events that span multiple days
  let adjustedEndPercentage = endPercentage;
  if (endPercentage < startPercentage) {
    adjustedEndPercentage = 100; // End at end of day for multi-day events
  }
  
  const duration = adjustedEndPercentage - startPercentage;
  const minHeight = 2; // Minimum 2% height (about 30 minutes)
  
  return {
    top: startPercentage,
    height: Math.max(duration, minHeight),
    startPercentage,
    endPercentage: adjustedEndPercentage,
    isAllDay: false
  };
}

export function isEventOnDay(event: { startTime: Date; endTime: Date }, day: Date): boolean {
  const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
  const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59);
  
  return (event.startTime <= dayEnd && event.endTime >= dayStart);
}

export function doEventsOverlap(event1: { startTime: Date; endTime: Date }, event2: { startTime: Date; endTime: Date }): boolean {
  return event1.startTime < event2.endTime && event2.startTime < event1.endTime;
}

export function calculateEventLayout(events: Array<{ startTime: Date; endTime: Date; id: number }>) {
  const eventLayout: Array<{ 
    id: number; 
    left: number; 
    width: number; 
    column: number;
    totalColumns: number;
  }> = [];

  if (events.length === 0) return eventLayout;

  // Sort events by start time
  const sortedEvents = [...events].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  
  // Group overlapping events together
  const groups: Array<Array<typeof sortedEvents[0]>> = [];
  
  sortedEvents.forEach(event => {
    // Find a group where this event overlaps with at least one event
    let foundGroup = false;
    
    for (const group of groups) {
      if (group.some(groupEvent => doEventsOverlap(event, groupEvent))) {
        group.push(event);
        foundGroup = true;
        break;
      }
    }
    
    // If no overlapping group found, create a new group
    if (!foundGroup) {
      groups.push([event]);
    }
  });
  
  // Layout each group
  groups.forEach(group => {
    const sortedGroup = group.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    const totalColumns = sortedGroup.length;
    const columnWidth = Math.floor(96 / totalColumns); // 96% to leave margin
    
    sortedGroup.forEach((event, index) => {
      eventLayout.push({
        id: event.id,
        left: 2 + (index * columnWidth), // 2% left margin
        width: columnWidth - 1, // Subtract 1% for spacing between columns
        column: index,
        totalColumns: totalColumns
      });
    });
  });

  return eventLayout;
}

// View-specific date utilities
export type ViewType = 'week' | '3day' | 'day';

export function getViewDays(date: Date, viewType: ViewType): Date[] {
  switch (viewType) {
    case 'day':
      return [new Date(date)];
    case '3day':
      const threeDayStart = getWeekStart(date);
      // Find the day within the week and show 3 days starting from it
      const dayOfWeek = date.getDay();
      const mondayStart = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert Sunday=0 to Monday=0 system
      const startIndex = Math.max(0, Math.min(mondayStart, 4)); // Ensure we don't go past Friday for 3-day view
      
      const days = [];
      for (let i = 0; i < 3; i++) {
        const day = new Date(threeDayStart);
        day.setDate(threeDayStart.getDate() + startIndex + i);
        days.push(day);
      }
      return days;
    case 'week':
    default:
      return getWeekDays(date);
  }
}

export function formatViewRange(days: Date[], viewType: ViewType): string {
  if (days.length === 0) return '';
  
  const start = days[0];
  const end = days[days.length - 1];
  
  switch (viewType) {
    case 'day':
      return start.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric',
        year: 'numeric'
      });
    case '3day':
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    case 'week':
    default:
      return formatWeekRange(start, end);
  }
}

export function navigateView(currentDate: Date, direction: 'prev' | 'next', viewType: ViewType): Date {
  const newDate = new Date(currentDate);
  
  switch (viewType) {
    case 'day':
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
      break;
    case '3day':
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 3 : -3));
      break;
    case 'week':
    default:
      return addWeeks(currentDate, direction === 'next' ? 1 : -1);
  }
  
  return newDate;
}