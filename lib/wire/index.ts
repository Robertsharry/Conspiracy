import { fetchEarthquakes } from "./sources/usgs";
import { fetchFlights } from "./sources/opensky";
import { fetchEvents } from "./sources/gdelt";
import { fetchApod } from "./sources/nasa";
import type { WireFeed } from "./types";

export type { WireFeed, WireItem, WireSource } from "./types";

export interface WireFeeds {
  quakes: WireFeed;
  flights: WireFeed;
  events: WireFeed;
  apod: WireFeed;
}

/**
 * Pull every Wire channel in parallel. Each source catches its own failure and
 * returns a degraded feed, so this never rejects — one dead channel can't take
 * the dashboard down.
 */
export async function getWireFeeds(): Promise<WireFeeds> {
  const [quakes, flights, events, apod] = await Promise.all([
    fetchEarthquakes(),
    fetchFlights(),
    fetchEvents(),
    fetchApod(),
  ]);
  return { quakes, flights, events, apod };
}
