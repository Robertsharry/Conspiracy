# 3. `@xyflow/react` for the evidence board

- **Status:** Accepted
- **Date:** 2026-06-04
- **Author:** Kairos

## Context
The product's core is a pannable/zoomable board of pins connected by red string —
custom node renderers, custom edges, minimap, drag, multi-select. Options
considered: React Flow (`@xyflow/react`), Cytoscape.js, vis-network, Sigma.js,
react-force-graph, raw D3.

## Decision
Use **`@xyflow/react` v12**. It's React-native (custom nodes/edges are React
components), MIT-licensed, battle-tested, has the interactions we need out of the
box, and v12 supports SSR/SSG. Performance sweet spot (hundreds–few thousand
nodes) matches a board. Sigma/Cytoscape win only at 10k+ nodes or heavy graph
algorithms we don't need.

## Consequences
- The board is **client-only**: imported with `dynamic(…, { ssr:false })` behind a
  `"use client"` boundary, with a themed placeholder and persisted node `w/h` to
  avoid layout jump. The dossier header around it still SSRs for SEO.
- Custom `RedStringEdge` (SVG) gives us the yarn look; custom nodes per pin type.
- If we ever need 10k+ node boards or graph analytics, revisit (Sigma/Cytoscape).
