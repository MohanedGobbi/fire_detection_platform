export const DETECTION_SERVER = "http://127.0.0.1:8700";

export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN ?? "";

/** Default map view when nothing is located yet — northern Algeria's Tell
 * Atlas/Kabylie forest belt, the country's most wildfire-exposed region. */
export const DEFAULT_MAP_CENTER: [number, number] = [4.05, 36.35]; // [lng, lat]
export const DEFAULT_MAP_ZOOM = 6.3;
