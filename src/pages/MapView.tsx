import { useEffect, useState } from "react";
import { Link } from "react-router";
import { TopBar } from "@/components/TopBar";
import { FireMap } from "@/components/FireMap";
import { StatusSwatch } from "@/components/StatusSwatch";
import { useCameras, loadLastAlarms, type LastAlarm } from "@/hooks/useCameras";
import { useReports } from "@/hooks/useReports";
import { useLanguage } from "@/hooks/useLanguage";
import { localizeCamera } from "@/lib/demoCameras";
import { CAMERA_STATUS_LAW, REPORT_STATUS_LAW } from "@/lib/statusLaw";
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from "@/lib/config";
import { MapPin } from "lucide-react";

export default function MapView() {
  const { t, lang } = useLanguage();
  const { cameras: rawCameras, streams } = useCameras();
  const cameras = rawCameras.map((c) => localizeCamera(c, lang));
  const { reports, loaded, setStatus } = useReports();
  const [lastAlarms, setLastAlarms] = useState<Record<string, LastAlarm>>(loadLastAlarms);

  useEffect(() => {
    const id = setInterval(() => setLastAlarms(loadLastAlarms()), 5000);
    return () => clearInterval(id);
  }, []);

  const located = cameras.filter((c) => typeof c.lat === "number" && typeof c.lng === "number");
  const openReports = reports.filter((r) => r.status === "new").length;
  const empty = loaded && located.length === 0 && reports.length === 0;

  // one camera: zoom in close. several, possibly spread across a region:
  // center on their average position and stay wide enough to see them all.
  const mapCenter: [number, number] =
    located.length === 1
      ? [located[0].lng!, located[0].lat!]
      : located.length > 1
        ? [
            located.reduce((s, c) => s + c.lng!, 0) / located.length,
            located.reduce((s, c) => s + c.lat!, 0) / located.length,
          ]
        : DEFAULT_MAP_CENTER;
  const mapZoom = located.length === 1 ? 9 : DEFAULT_MAP_ZOOM;

  return (
    <div className="flex h-full flex-col bg-soot text-bone">
      <TopBar cameras={cameras} streams={streams} />

      <div className="relative min-h-0 flex-1">
        {empty ? (
          <div className="flex h-full items-center justify-center">
            <div className="max-w-sm text-center">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-md border hairline bg-coal">
                <MapPin className="h-5 w-5 text-bone" />
              </div>
              <h2 className="font-display text-2xl font-extrabold tracking-tight text-bone">
                {t.mapView.emptyTitle}
              </h2>
              <p className="mx-auto mt-3 text-sm leading-relaxed text-ash">
                {t.mapView.emptyBody}
              </p>
              <Link to="/dashboard" className="btn-plate mt-6 inline-flex bg-primary text-white hover:opacity-90">
                {t.mapView.goToDashboard}
              </Link>
            </div>
          </div>
        ) : !loaded ? (
          <div className="flex h-full items-center justify-center">
            <span className="micro-label">{t.mapView.loadingMap}</span>
          </div>
        ) : (
          <>
            <FireMap
              cameras={located}
              cameraAlarms={lastAlarms}
              reports={reports}
              onSetReportStatus={setStatus}
              center={mapCenter}
              zoom={mapZoom}
              className="h-full w-full"
            />
            <div className="pointer-events-none absolute left-3 top-3 z-10 w-52 rounded-sm border hairline bg-coal p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="micro-label">{t.mapView.legend}</span>
                <span className="text-[10px] tabular-nums text-ash">
                  {located.length} {t.mapView.camAbbrev} · {openReports} {t.mapView.openAbbrev}
                </span>
              </div>
              <div className="mt-2.5 grid gap-1.5">
                {CAMERA_STATUS_LAW.map((entry, i) => (
                  <StatusSwatch
                    key={entry.label}
                    {...entry}
                    label={[t.status.cameraAlarm, t.status.cameraRecent, t.status.cameraClear][i]}
                    pulse={i === 0}
                  />
                ))}
                <div className="my-1 h-px bg-[var(--hairline)]" />
                {REPORT_STATUS_LAW.map((entry, i) => (
                  <StatusSwatch
                    key={entry.label}
                    {...entry}
                    label={[t.status.reportNew, t.status.reportAck, t.status.reportFalse][i]}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
