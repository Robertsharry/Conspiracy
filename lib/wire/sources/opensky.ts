import { z } from "zod";
import type { WireFeed, WireItem } from "../types";

/**
 * OpenSky flights. Moved to OAuth2 client-credentials on 2026-03-18; we cache the
 * bearer token in-memory and query a continental-US bbox (cached 30s). Without
 * credentials the feed degrades gracefully rather than hammering the anon cap.
 */
const TOKEN_URL =
  "https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token";
const STATES_URL = "https://opensky-network.org/api/states/all";
const BBOX = { lamin: 24.5, lomin: -125, lamax: 49.5, lomax: -66.9 };

let tokenCache: { token: string; exp: number } | null = null;

async function getToken(): Promise<string | null> {
  const id = process.env.OPENSKY_CLIENT_ID;
  const secret = process.env.OPENSKY_CLIENT_SECRET;
  if (!id || !secret) return null;

  const now = Date.now();
  if (tokenCache && tokenCache.exp > now + 10_000) return tokenCache.token;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: id,
      client_secret: secret,
    }),
    cache: "no-store",
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!json.access_token) return null;
  tokenCache = { token: json.access_token, exp: now + (json.expires_in ?? 1800) * 1000 };
  return json.access_token;
}

const StatesSchema = z.object({ states: z.array(z.array(z.unknown())).nullable() });

export async function fetchFlights(limit = 18): Promise<WireFeed> {
  try {
    const token = await getToken();
    const qs = new URLSearchParams({
      lamin: String(BBOX.lamin),
      lomin: String(BBOX.lomin),
      lamax: String(BBOX.lamax),
      lomax: String(BBOX.lomax),
    });
    const res = await fetch(`${STATES_URL}?${qs}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      next: { revalidate: 30 },
    });
    if (!res.ok) {
      return {
        items: [],
        ok: false,
        note: token ? `OpenSky ${res.status}` : "OpenSky needs credentials",
      };
    }
    const parsed = StatesSchema.safeParse(await res.json());
    if (!parsed.success) return { items: [], ok: false, note: "OpenSky shape changed" };

    const num = (v: unknown): number | null => (typeof v === "number" ? v : null);
    const items: WireItem[] = (parsed.data.states ?? [])
      .filter((s) => num(s[5]) !== null && num(s[6]) !== null)
      .slice(0, limit)
      .map((s) => {
        const icao = String(s[0] ?? "");
        const callsign =
          (typeof s[1] === "string" ? s[1].trim() : "") || icao || "unknown";
        return {
          source: "opensky" as const,
          externalId: icao || callsign,
          kind: "flight",
          title: callsign,
          body: typeof s[2] === "string" ? `origin: ${s[2]}` : null,
          url: icao
            ? `https://opensky-network.org/aircraft-profile?icao24=${icao}`
            : null,
          lat: num(s[6]),
          lon: num(s[5]),
          magnitude: null,
          occurredAt: num(s[4]) ? new Date((s[4] as number) * 1000).toISOString() : null,
          metadata: {
            country: s[2] ?? null,
            velocityMs: num(s[9]),
            altitudeM: num(s[7]),
            onGround: typeof s[8] === "boolean" ? s[8] : null,
          },
        };
      });
    return { items, ok: true };
  } catch {
    return { items: [], ok: false, note: "OpenSky unreachable" };
  }
}
