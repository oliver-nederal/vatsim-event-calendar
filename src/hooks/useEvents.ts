import { useState, useEffect, useCallback } from 'react';
import { ProcessedEvent } from '@/types/vatsim';

// Interface for events as they come from the API (with string dates)
interface SerializedEvent extends Omit<ProcessedEvent, 'startTime' | 'endTime'> {
  startTime: string;
  endTime: string;
}

interface UseEventsReturn {
  events: ProcessedEvent[];
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
  cached: boolean;
  refetch: () => Promise<void>;
}

export function useEvents(region: string = 'EMEA'): UseEventsReturn {
  const [events, setEvents] = useState<ProcessedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [cached, setCached] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const url = `/api/events${region !== 'EMEA' ? `?region=${region}` : ''}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        // Convert date strings back to Date objects
        const processedEvents = data.data.map((event: SerializedEvent): ProcessedEvent => ({
          ...event,
          startTime: new Date(event.startTime),
          endTime: new Date(event.endTime),
        }));
        
        setEvents(processedEvents);
        setLastUpdated(data.lastUpdated);
        setCached(data.cached || false);
        
        if (data.error) {
          setError(data.error);
        }
      } else {
        setError(data.error || 'Failed to fetch events');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }, [region]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    loading,
    error,
    lastUpdated,
    cached,
    refetch: fetchEvents,
  };
}