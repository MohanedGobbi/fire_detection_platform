// Configurable so a hosted deploy (e.g. Vercel) can point at a real detection
// server; defaults to the local dev server when unset. A visitor's browser
// simply can't reach 127.0.0.1:8700, so the app degrades gracefully (no demo
// cameras ever call this — they're excluded from the detection loop — real
// added cameras just show "Unreachable"/never alarm).
export const DETECTION_SERVER = import.meta.env.VITE_DETECTION_SERVER ?? "http://127.0.0.1:8700";

export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN ?? "";

/** Default map view when nothing is located yet — northern Algeria's Tell
 * Atlas/Kabylie forest belt, the country's most wildfire-exposed region. */
export const DEFAULT_MAP_CENTER: [number, number] = [4.05, 36.35]; // [lng, lat]
export const DEFAULT_MAP_ZOOM = 6.3;
