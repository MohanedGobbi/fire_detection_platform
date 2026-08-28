import type { ReportStatus } from "@/types/report";

/**
 * The one status-color law used everywhere FireDetect shows state — on the
 * map, in the dashboard, and on the landing page. Colors are the National
 * Fire Danger Rating System's own five-level scale (src/index.css
 * --danger-*), reserved strictly for this use, never decoration.
 */
export interface StatusEntry {
  color: string;
  label: string;
  shape: "circle" | "diamond";
}

export const CAMERA_STATUS_LAW: StatusEntry[] = [
  { color: "var(--ember)", label: "Active fire alarm", shape: "circle" },
  { color: "var(--amber)", label: "Recently alarmed", shape: "circle" },
  { color: "var(--indigo)", label: "Clear", shape: "circle" },
];

/** The canonical report-status → color mapping — reused by the map markers
 * (FireMap) and the admin reports list so the two never drift apart. */
export const REPORT_STATUS_COLOR: Record<ReportStatus, string> = {
  new: "var(--ember)",
  acknowledged: "var(--phosphor)",
  false_alarm: "var(--ash)",
};

export const REPORT_STATUS_LAW: StatusEntry[] = [
  { color: REPORT_STATUS_COLOR.new, label: "Unverified report", shape: "diamond" },
  { color: REPORT_STATUS_COLOR.acknowledged, label: "Acknowledged", shape: "diamond" },
  { color: REPORT_STATUS_COLOR.false_alarm, label: "False alarm", shape: "diamond" },
];
