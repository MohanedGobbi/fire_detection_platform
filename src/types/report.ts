export type ReportStatus = "new" | "acknowledged" | "false_alarm";

/** A fire report submitted by the public, stored server-side. */
export interface FireReport {
  id: string;
  lat: number;
  lng: number;
  description: string;
  contact?: string | null;
  photoFilename?: string | null;
  status: ReportStatus;
  createdAt: number;
  updatedAt: number;
}

export const REPORT_STATUS_LABEL: Record<ReportStatus, string> = {
  new: "Unverified",
  acknowledged: "Acknowledged",
  false_alarm: "False Alarm",
};
