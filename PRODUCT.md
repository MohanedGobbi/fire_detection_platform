# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: wildfire and land-management watch teams — park services, forestry agencies, utilities with remote line-of-sight, and municipalities monitoring large outdoor areas that can't be watched by staff around the clock. They place cameras (fixed towers, existing infrastructure, or a laptop webcam for testing) at a site and need continuous, unattended smoke/fire detection with an early alert.

Secondary: anyone nearby who spots smoke or flame in person and wants to report it directly onto the same live map the watch team is looking at, without needing an account.

## Product Purpose

FireDetect is an early wildfire/fire detection platform: cameras stream frames to a detection server running a YOLOv8 fire/smoke model, which raises alarms on confirmed detections; a live map plots camera locations and their alarm state alongside public fire reports; a public reporting form lets anyone flag a fire by dropping a pin (or using their location) with a description and optional photo. Success is a real fire or smoke event being surfaced — via AI detection or a human report — before it spreads, with the location immediately visible to whoever is watching.

## Positioning

Most fire-camera products are enterprise security-camera platforms with fire detection bolted on as one alert type among many, gated behind sales calls and per-camera licensing. FireDetect is built around the opposite assumption: detection is the entire point, any camera source works (a $0 webcam for testing, HLS, or MJPEG), the AI alarm and the public "someone saw smoke" report live on the same map as first-class equals, and the whole thing runs from an open two-process stack (a Python detection server + a static frontend) rather than a hosted SaaS you must be sold into.

## Operating Context

- A watch/operator side: add cameras (webcam for testing, or HLS/MJPEG stream URLs), set each camera's map position, and monitor a live grid with an event log; the detection server is the sole alarm authority (temporal persistence across frames, not single-frame triggers).
- A public side: no login, no account — a passerby or ranger in the field opens `/report`, pins a location (click the map or use device GPS), describes what they see, optionally attaches a photo, and submits.
- A map side: everyone with the link sees camera locations (colored by alarm state) and fire reports (colored by review status: unverified / acknowledged / false alarm) together; report status can be updated right from the map popup.
- Today this is presented/demoed rather than operated at a real site — the current deployment is local dev (Vite dev server + a local Python HTTP server), not a hosted production service.

## Capabilities and Constraints

- Detector: YOLOv8 fire/smoke model when `server/models/best.pt` is present; falls back to a classical HSV heuristic detector otherwise. Alarm requires ≥2 fire-positive frames within an 8s window per camera (smoke alone never alarms).
- No authentication anywhere in the product yet — this is a known, current constraint, not a gap to silently fix.
- Reports persist server-side (SQLite); cameras and their map positions persist client-side (browser localStorage) — there is no multi-operator shared camera roster yet.
- Map tiles/interaction are Mapbox GL JS (public token, client-side).
- Undecided: whether/when this moves to a hosted, multi-user, authenticated deployment.

## Brand Commitments

Renaming from the placeholder "Pyrophyte" to **FireDetect** — a deliberately plain, literal name (the user's explicit direction, not a fallback). This is a clean-slate visual rebrand: no element of the previous look (mark, palette, type) is binding on the new design.

## Evidence on Hand

No real customer names, testimonials, deployment case studies, press mentions, or usage metrics exist yet — none should be fabricated. The one real, demonstrable asset is the product itself: the live camera dashboard, the map, and the reporting flow, all functional today. The landing page's job is to introduce the platform and teach a first-time visitor how to use it (an explanatory/tutorial framing), not to sell against competitors or quote pricing — there is no pricing or sales motion.

## Product Principles

1. Detection is the whole product, not a bolted-on alert type — every surface should read as built around fire/smoke detection specifically, not generic camera security.
2. AI detection and human reports are peers on the same map, not a primary feature and an afterthought.
3. No account, no gate — the public reporting path must stay as frictionless as "see smoke, drop a pin."
4. Never invent commercial signals (pricing, customer logos, testimonials, "book a demo") — this is presented as a real, working platform, introduced honestly, not sold.
5. The outdoor/wide-area wildfire-watch scenario is the primary mental model for imagery, copy, and example content — not an indoor office security aesthetic.

## Accessibility & Inclusion

No product-specific accessibility requirement has been established beyond ordinary web standards; treat standard WCAG AA practice as the floor.
