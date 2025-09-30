import { NextResponse } from 'next/server';
import { VatsimEvent, VatsimEventsResponse, CachedEventsData, ProcessedEvent } from '@/types/vatsim';

// Cache duration: 1 hour (in milliseconds)
const CACHE_DURATION = 60 * 60 * 1000;

// Available VATSIM regions
export const VATSIM_REGIONS = {
  'all': 'https://my.vatsim.net/api/v2/events/latest',
  'EMEA': 'https://my.vatsim.net/api/v2/events/view/region/EMEA',
} as const;

type VatsimRegion = keyof typeof VATSIM_REGIONS;

// Default region (hardcoded to EMEA for now)
const DEFAULT_REGION: VatsimRegion = 'EMEA';

// In-memory cache (in production, consider using Redis or a database)
// Cache by region to support different regions
const eventsCache: Record<string, CachedEventsData> = {};

function processVatsimEvent(event: VatsimEvent): ProcessedEvent {
  return {
    id: event.id,
    title: event.name,
    description: event.description,
    shortDescription: event.short_description,
    startTime: new Date(event.start_time),
    endTime: new Date(event.end_time),
    link: event.link,
    banner: event.banner,
    airports: event.airports.map(airport => airport.icao),
    routes: event.routes,
    organisers: event.organisers.map(org => `${org.division} (${org.region})`),
  };
}

async function fetchVatsimEvents(region: VatsimRegion = DEFAULT_REGION): Promise<ProcessedEvent[]> {
  try {
    const apiUrl = VATSIM_REGIONS[region];
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'VATAdria Event Platform',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: VatsimEventsResponse = await response.json();
    const rawEvents = data.data || [];
    return rawEvents.map(processVatsimEvent);
  } catch (error) {
    console.error(`Error fetching VATSIM events for region ${region}:`, error);
    throw new Error(`Failed to fetch events from VATSIM API for region ${region}`);
  }
}

function isCacheValid(region: VatsimRegion): boolean {
  const cache = eventsCache[region];
  if (!cache) return false;
  return Date.now() < cache.cacheExpiry;
}

export async function GET(request: Request) {
  try {
    // Get region from query parameters, default to EMEA
    const { searchParams } = new URL(request.url);
    const regionParam = searchParams.get('region') as VatsimRegion | null;
    const region: VatsimRegion = (regionParam && regionParam in VATSIM_REGIONS) ? regionParam : DEFAULT_REGION;

    // Return cached data if still valid
    if (isCacheValid(region)) {
      const cache = eventsCache[region];
      return NextResponse.json({
        success: true,
        data: cache.events,
        cached: true,
        region,
        lastUpdated: cache.lastUpdated,
      });
    }

    // Fetch fresh data from VATSIM API
    const events = await fetchVatsimEvents(region);
    
    // Update cache
    eventsCache[region] = {
      events,
      lastUpdated: Date.now(),
      cacheExpiry: Date.now() + CACHE_DURATION,
    };

    return NextResponse.json({
      success: true,
      data: events,
      cached: false,
      region,
      lastUpdated: eventsCache[region].lastUpdated,
    });
  } catch (error) {
    console.error('API error:', error);
    
    // Get region from query parameters for error handling
    const { searchParams } = new URL(request.url);
    const regionParam = searchParams.get('region') as VatsimRegion | null;
    const region: VatsimRegion = (regionParam && regionParam in VATSIM_REGIONS) ? regionParam : DEFAULT_REGION;
    
    // If we have cached data, return it even if expired
    const cache = eventsCache[region];
    if (cache) {
      return NextResponse.json({
        success: true,
        data: cache.events,
        cached: true,
        stale: true,
        region,
        lastUpdated: cache.lastUpdated,
        error: 'API unavailable, serving cached data',
      });
    }

    return NextResponse.json({
      success: false,
      region,
      error: 'Failed to fetch events and no cached data available',
    }, { status: 500 });
  }
}