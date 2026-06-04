# 4. MapLibre GL JS over Leaflet for geo

- **Status:** Accepted
- **Date:** 2026-06-04
- **Author:** Kairos

## Context
The Wire plots geo signals — earthquakes (USGS GeoJSON), flights (OpenSky), GDELT
events — potentially thousands of points, and we want the map themed to the
case-file aesthetic. Candidates: MapLibre GL JS vs Leaflet.

## Decision
Use **MapLibre GL JS**. WebGL vector rendering handles thousands of points where
Leaflet's DOM markers choke; GeoJSON sources drop our feeds straight in; the style
JSON is fully ours to theme (desaturated/sepia, scanline-friendly); MIT-licensed
and renders without an API key.

## Consequences
- We must supply a tile source. Use a genuinely free one (MapLibre demo vector
  tiles, or a no-token raster like Carto/Stadia free tier within terms), keep the
  style JSON in-repo, and document attribution + swap path here and in
  `API_INTEGRATIONS.md`.
- The map is a client island (`ssr:false`).
- Leaflet remains the documented fallback if WebGL support becomes a problem.
