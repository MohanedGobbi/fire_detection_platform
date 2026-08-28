import type { CameraConfig, PlatformEventData } from "@/types/camera";
import type { Lang } from "@/lib/languageData";

/**
 * Showcase cameras — generated placeholder feeds (see DemoFeed in
 * CameraFeed.tsx), not real streams. Positioned across northern Algeria's
 * Tell Atlas / Kabylie forest belt, the country's most wildfire-exposed
 * region (the August 2021 Kabylie fires burned across several of these
 * areas), so the dashboard and map both show something real-feeling out
 * of the box.
 */
/** Real photos of each location (CC BY-SA, Wikimedia Commons — see
 * public/demo-cameras/CREDITS.md), used as the still backdrop each demo
 * tile animates over. Keyed by camera id. */
export const DEMO_PHOTOS: Record<string, string> = {
  "DEMO-djurdjura": "/demo-cameras/djurdjura.jpg",
  "DEMO-chrea": "/demo-cameras/chrea.jpg",
  "DEMO-elkala": "/demo-cameras/elkala.jpg",
  "DEMO-bejaia": "/demo-cameras/bejaia.jpg",
  "DEMO-theniet": "/demo-cameras/theniet.jpg",
};

export const DEMO_CAMERA_SEEDS: Omit<CameraConfig, "createdAt">[] = [
  {
    id: "DEMO-djurdjura",
    name: "Djurdjura Ridge",
    type: "demo",
    location: "Tizi Ouzou, Kabylie",
    lat: 36.4667,
    lng: 4.1667,
  },
  {
    id: "DEMO-chrea",
    name: "Chréa Cedar Forest",
    type: "demo",
    location: "Blida, Atlas Mountains",
    lat: 36.4167,
    lng: 2.8667,
  },
  {
    id: "DEMO-elkala",
    name: "El Kala Cork Oak",
    type: "demo",
    location: "El Tarf, northeast coast",
    lat: 36.9022,
    lng: 8.4373,
  },
  {
    id: "DEMO-bejaia",
    name: "Béjaïa Coastal Watch",
    type: "demo",
    location: "Béjaïa, Kabylie coast",
    lat: 36.6,
    lng: 4.95,
  },
  {
    id: "DEMO-theniet",
    name: "Theniet El Had",
    type: "demo",
    location: "Tissemsilt, western cedar forest",
    lat: 35.8833,
    lng: 1.8167,
  },
];

/** Arabic name/location for each seeded demo camera — the only camera data
 * that ships in-repo, so the only camera names/places we can safely
 * auto-translate (a real operator's own camera names are free text and stay
 * as typed regardless of language). */
export const DEMO_CAMERA_AR: Record<string, { name: string; location: string }> = {
  "DEMO-djurdjura": { name: "قمة جرجرة", location: "تيزي وزو، القبائل" },
  "DEMO-chrea": { name: "غابة الأرز — شريعة", location: "البليدة، جبال الأطلس" },
  "DEMO-elkala": { name: "غابة الفلين — القالة", location: "الطارف، الساحل الشمالي الشرقي" },
  "DEMO-bejaia": { name: "مرصد الساحل — بجاية", location: "بجاية، ساحل القبائل" },
  "DEMO-theniet": { name: "الثنية الحد", location: "تيسمسيلت، غابة الأرز الغربية" },
};

/** Returns a demo camera's display copy translated for the given language;
 * user-configured (non-demo) cameras are returned unchanged. */
export function localizeCamera<T extends Pick<CameraConfig, "id" | "type" | "name" | "location">>(
  cam: T,
  lang: Lang
): T {
  if (cam.type !== "demo" || lang !== "ar") return cam;
  const tr = DEMO_CAMERA_AR[cam.id];
  if (!tr) return cam;
  return { ...cam, name: tr.name, location: tr.location };
}

/** Platform-event log entries are logged (and stored) with whatever camera
 * name was current at that moment — for a seeded demo camera that's always
 * its English seed name. Re-localize just that name for display, the same
 * way localizeCamera does for the live roster. */
export function localizeEventData(
  data: PlatformEventData,
  cameraId: string | undefined,
  lang: Lang
): PlatformEventData {
  if (lang !== "ar" || !cameraId || !("name" in data)) return data;
  const tr = DEMO_CAMERA_AR[cameraId];
  if (!tr) return data;
  return { ...data, name: tr.name };
}
