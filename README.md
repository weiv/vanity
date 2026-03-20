# Bathroom Vanity Planner

A browser-based tool for planning bathroom vanity layouts. Drag-and-drop cabinets onto two walls, see a live floor plan, 2D elevation drawings, and an interactive 3D view.

## Features

- **Catalog** — sink, drawer, base, linen, medicine, mirror, and hanging filler cabinets
- **Two walls** — W1 (East, 72" limit) and W2 (West, 48" limit)
- **Floor plan** — overhead SVG showing room footprint and cabinet depth
- **Elevation** — per-wall 2D front-view drawings with toe kicks, countertops, door/drawer panels, pulls, and sink basins
- **3D view** — interactive Three.js render with per-type face geometry; orbit/zoom with mouse

## Usage

Open `index.html` directly in a browser — no build step or server required.

1. Pick a cabinet from the catalog and click **+ W1** / **+ W2**, or drag it onto the wall strip
2. For sink cabinets, choose basin position (L / C / R) before adding
3. Orbit the 3D view with left-drag; zoom with scroll; pan with right-drag
4. Click any placed cabinet in the wall strip to remove it

## Cabinet Types

| Type | IDs | Mounted |
|------|-----|---------|
| Sink | FA3021, FA3621, SVA2421, FSVA24, …DL/DR variants | Floor |
| Drawer base | SVA09D – SVA24D | Floor |
| Base cabinet | SVA09B – SVA24P | Floor |
| Linen / tall | SVA188124P (81"), DV1245 (45.5") | Floor |
| Medicine cabinet | WV12336 | Wall (38" AFF) |
| Mirror | SVAM2427, SVAM3027 | Wall (38" AFF) |
| Hanging filler | SVAF1218 (18"), SVAF1227 (27") | Wall (38" AFF) |

## Tech

- Vanilla JS, no framework or bundler
- [Three.js r128](https://threejs.org/) + OrbitControls for 3D rendering
- All dimensions in inches
