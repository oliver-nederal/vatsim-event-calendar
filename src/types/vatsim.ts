export interface VatsimEvent {
  id: number;
  type: string;
  name: string;
  link: string;
  organisers: Array<{
    region: string;
    division: string;
    organised_by_vatsim: boolean;
  }>;
  airports: Array<{
    icao: string;
  }>;
  routes: Array<{
    departure: string;
    arrival: string;
    route: string;
  }>;
  start_time: string;
  end_time: string;
  short_description: string;
  description: string;
  banner: string;
}

export interface VatsimEventsResponse {
  data: VatsimEvent[];
}

export interface ProcessedEvent {
  id: number;
  title: string;
  description: string;
  shortDescription: string;
  startTime: Date;
  endTime: Date;
  link: string;
  banner: string;
  airports: string[];
  routes: Array<{
    departure: string;
    arrival: string;
    route: string;
  }>;
  organisers: string[];
}

export interface CachedEventsData {
  events: ProcessedEvent[];
  lastUpdated: number;
  cacheExpiry: number;
}