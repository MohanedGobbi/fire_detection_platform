import { useCallback, useEffect, useState } from "react";
import { DETECTION_SERVER } from "@/lib/config";
import type { FireReport, ReportStatus } from "@/types/report";

const POLL_MS = 15_000;

interface RawReport extends Omit<FireReport, "createdAt" | "updatedAt"> {
  createdAt: number; // seconds, from the Python server
  updatedAt: number;
}

function fromRaw(r: RawReport): FireReport {
  return { ...r, createdAt: r.createdAt * 1000, updatedAt: r.updatedAt * 1000 };
}

export interface NewReportInput {
  lat: number;
  lng: number;
  description: string;
  contact?: string;
  photoBase64?: string;
}

export function reportPhotoUrl(report: FireReport): string | null {
  return report.photoFilename
    ? `${DETECTION_SERVER}/uploads/reports/${report.photoFilename}`
    : null;
}

export function useReports() {
  const [reports, setReports] = useState<FireReport[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`${DETECTION_SERVER}/reports`);
      if (!res.ok) return;
      const data: { reports: RawReport[] } = await res.json();
      setReports(data.reports.map(fromRaw));
    } catch {
      /* server unreachable — keep last known list */
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, POLL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  const submitReport = useCallback(async (input: NewReportInput) => {
    const res = await fetch(`${DETECTION_SERVER}/reports`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lat: input.lat,
        lng: input.lng,
        description: input.description,
        contact: input.contact,
        photo_base64: input.photoBase64,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "submit failed" }));
      throw new Error(err.error ?? "submit failed");
    }
    const created: RawReport = await res.json();
    const report = fromRaw(created);
    setReports((prev) => [report, ...prev]);
    return report;
  }, []);

  const setStatus = useCallback(async (id: string, status: ReportStatus) => {
    const res = await fetch(`${DETECTION_SERVER}/reports/${id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) return;
    const updated: RawReport = await res.json();
    const report = fromRaw(updated);
    setReports((prev) => prev.map((r) => (r.id === id ? report : r)));
  }, []);

  return { reports, loaded, refresh, submitReport, setStatus };
}
