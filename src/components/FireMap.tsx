import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAPBOX_TOKEN } from "@/lib/config";
import type { LastAlarm } from "@/hooks/useCameras";
import type { CameraConfig } from "@/types/camera";
import type { FireReport, ReportStatus } from "@/types/report";
import { reportPhotoUrl } from "@/hooks/useReports";
import { REPORT_STATUS_COLOR } from "@/lib/statusLaw";
import { useLanguage } from "@/hooks/useLanguage";
import type { Lang } from "@/lib/languageData";

mapboxgl.accessToken = MAPBOX_TOKEN;

const RECENT_ALARM_MS = 10 * 60 * 1000; // show "recently alarmed" amber for 10min after clearing

/** Re-labels every symbol layer on the loaded style that renders a
 * place-name field, so switching UI language also switches the basemap's
 * own city/region/country labels (Mapbox Streets tiles carry name_ar
 * alongside name/name_en for exactly this). Falls back to the layer's own
 * default expression for anything without an Arabic name. */
function applyMapLanguage(map: mapboxgl.Map, lang: Lang) {
  const style = map.getStyle();
  if (!style?.layers) return;
  for (const layer of style.layers) {
    if (layer.type !== "symbol") continue;
    const textField = map.getLayoutProperty(layer.id, "text-field");
    if (textField === undefined) continue;
    const usesName =
      typeof textField === "string"
        ? textField.includes("name")
        : JSON.stringify(textField).includes("name");
    if (!usesName) continue;
    map.setLayoutProperty(
      layer.id,
      "text-field",
      lang === "ar"
        ? ["coalesce", ["get", "name_ar"], ["get", "name_en"], ["get", "name"]]
        : ["coalesce", ["get", "name_en"], ["get", "name"]]
    );
  }
}

interface Props {
  cameras: CameraConfig[];
  cameraAlarms?: Record<string, LastAlarm>;
  reports?: FireReport[];
  onSetReportStatus?: (id: string, status: ReportStatus) => void;
  /** click-to-pick mode, e.g. the public report form */
  interactivePick?: boolean;
  pickedLocation?: { lat: number; lng: number } | null;
  onPick?: (lat: number, lng: number) => void;
  center?: [number, number];
  zoom?: number;
  className?: string;
}

// mapbox-gl writes its own positioning `transform` onto the element it's
// given, which would clobber a CSS hover/rotate transform on the same node.
// So the outer element is left for mapbox to position, and all visual
// styling — including hover scale and rotation — lives on an inner child.
function wrapMarker(inner: HTMLDivElement) {
  const outer = document.createElement("div");
  outer.style.cursor = "pointer";
  outer.appendChild(inner);
  return outer;
}

function cameraMarkerEl(alarmState?: LastAlarm) {
  const inner = document.createElement("div");
  const recentlyAlarmed =
    alarmState && !alarmState.active && Date.now() - alarmState.at < RECENT_ALARM_MS;
  const color = alarmState?.active
    ? "var(--ember)"
    : recentlyAlarmed
      ? "var(--amber)"
      : "var(--indigo)";
  inner.className = "pyro-marker" + (alarmState?.active ? " pyro-marker-alarm" : "");
  inner.style.cssText = `
    width: 16px; height: 16px; border-radius: 50%;
    background: ${color}; border: 2px solid #fff;
    box-shadow: 0 0 0 1px var(--hairline), 0 1px 4px rgba(0,0,0,0.35);
  `;
  return wrapMarker(inner);
}

function reportMarkerEl(status: ReportStatus) {
  const inner = document.createElement("div");
  inner.className = "pyro-marker pyro-report-marker";
  inner.style.cssText = `
    width: 14px; height: 14px; border-radius: 3px;
    background: ${REPORT_STATUS_COLOR[status]}; border: 2px solid #fff;
    box-shadow: 0 0 0 1px var(--hairline), 0 1px 4px rgba(0,0,0,0.35);
  `;
  return wrapMarker(inner);
}

export function FireMap({
  cameras,
  cameraAlarms = {},
  reports = [],
  onSetReportStatus,
  interactivePick = false,
  pickedLocation = null,
  onPick,
  center = [0, 20],
  zoom = 2,
  className,
}: Props) {
  const { t, lang } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const cameraMarkersRef = useRef<Map<string, { marker: mapboxgl.Marker; sig: string }>>(
    new Map()
  );
  const reportMarkersRef = useRef<Map<string, { marker: mapboxgl.Marker; sig: string }>>(
    new Map()
  );
  const pickMarkerRef = useRef<mapboxgl.Marker | null>(null);
  // base-map place-name language — read inside the style.load handler below
  // so a later mount doesn't need to re-run this effect.
  const langRef = useRef(lang);
  langRef.current = lang;

  // init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current || !MAPBOX_TOKEN) return;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center,
      zoom,
    });
    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.on("style.load", () => applyMapLanguage(map, langRef.current));
    mapRef.current = map;
    const cameraMarkers = cameraMarkersRef.current;
    const reportMarkers = reportMarkersRef.current;
    return () => {
      map.remove();
      mapRef.current = null;
      // marker caches are keyed against this map instance — a torn-down map
      // invalidates them, otherwise a signature-match on the next mount would
      // skip re-creating markers on the new instance.
      cameraMarkers.clear();
      reportMarkers.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // the Mapbox Streets tileset carries name/name_en/name_ar fields on every
  // label layer, so switching the text-field expression re-labels the whole
  // basemap without a style swap — re-applied whenever the language changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (map.isStyleLoaded()) applyMapLanguage(map, lang);
  }, [lang]);

  // click-to-pick handler
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !interactivePick || !onPick) return;
    const handler = (e: mapboxgl.MapMouseEvent) => onPick(e.lngLat.lat, e.lngLat.lng);
    map.on("click", handler);
    return () => {
      map.off("click", handler);
    };
  }, [interactivePick, onPick]);

  // picked-location marker (report form)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    pickMarkerRef.current?.remove();
    pickMarkerRef.current = null;
    if (pickedLocation) {
      const el = document.createElement("div");
      el.style.cssText = `
        width: 20px; height: 20px; border-radius: 50% 50% 50% 0;
        background: var(--ember); border: 2px solid #fff;
        box-shadow: 0 1px 4px rgba(0,0,0,0.45);
        transform: rotate(-45deg);
      `;
      pickMarkerRef.current = new mapboxgl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([pickedLocation.lng, pickedLocation.lat])
        .addTo(map);
    }
  }, [pickedLocation]);

  // camera markers — keyed + diffed by signature so an unrelated poll tick
  // (new array/object references, same data) doesn't tear down a marker whose
  // popup the operator currently has open.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const byId = cameraMarkersRef.current;
    const seen = new Set<string>();

    const located = cameras.filter(
      (c) => typeof c.lat === "number" && typeof c.lng === "number"
    );
    for (const cam of located) {
      const alarm = cameraAlarms[cam.id];
      const recentBucket = alarm ? Math.floor((Date.now() - alarm.at) / 60_000) : -1;
      const sig = `${cam.lat},${cam.lng},${cam.name},${cam.location ?? ""},${alarm?.active ?? false},${recentBucket},${lang}`;
      seen.add(cam.id);
      const existing = byId.get(cam.id);
      if (existing && existing.sig === sig) continue;
      existing?.marker.remove();

      const popup = new mapboxgl.Popup({ offset: 12 }).setHTML(
        `<div style="font:600 12px system-ui;color:var(--bone)">${escapeHtml(cam.name)}</div>
         <div style="font:11px system-ui;color:var(--ash);margin-top:2px">${escapeHtml(cam.location ?? t.common.camera)}</div>`
      );
      const marker = new mapboxgl.Marker({ element: cameraMarkerEl(alarm) })
        .setLngLat([cam.lng!, cam.lat!])
        .setPopup(popup)
        .addTo(map);
      byId.set(cam.id, { marker, sig });
    }

    for (const [id, entry] of byId) {
      if (!seen.has(id)) {
        entry.marker.remove();
        byId.delete(id);
      }
    }
  }, [cameras, cameraAlarms, t, lang]);

  // report markers — same keyed-diff approach; a status change (from the
  // popup buttons) legitimately rebuilds that one marker's popup.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const byId = reportMarkersRef.current;
    const seen = new Set<string>();

    for (const report of reports) {
      const sig = `${report.lat},${report.lng},${report.status},${report.description},${report.contact ?? ""},${report.photoFilename ?? ""},${lang}`;
      seen.add(report.id);
      const existing = byId.get(report.id);
      if (existing && existing.sig === sig) continue;
      existing?.marker.remove();

      const photo = reportPhotoUrl(report);
      const popupEl = document.createElement("div");
      popupEl.style.cssText = "font-family: system-ui; min-width: 180px;";
      popupEl.innerHTML = `
        <div style="font:600 12px system-ui;color:var(--bone)">${escapeHtml(t.common.reportStatusLabel[report.status])}</div>
        <div style="font:12px system-ui;color:var(--bone);margin-top:4px;white-space:pre-wrap">${escapeHtml(report.description)}</div>
        ${report.contact ? `<div style="font:11px system-ui;color:var(--ash);margin-top:4px">${escapeHtml(t.common.contact)}: ${escapeHtml(report.contact)}</div>` : ""}
        ${photo ? `<img src="${photo}" style="margin-top:6px;width:100%;border-radius:4px;display:block" />` : ""}
        <div style="font:10px system-ui;color:var(--ash);margin-top:6px">${new Date(report.createdAt).toLocaleString(lang === "ar" ? "ar" : "en")}</div>
      `;
      if (onSetReportStatus) {
        const actions = document.createElement("div");
        actions.style.cssText = "display:flex;gap:4px;margin-top:8px";
        (
          [
            ["acknowledged", t.common.acknowledge],
            ["false_alarm", t.common.falseAlarm],
            ["new", t.common.reset],
          ] as const
        ).forEach(([status, label]) => {
          const btn = document.createElement("button");
          btn.textContent = label;
          btn.style.cssText = `
            flex:1; font-size:10px; font-weight:600; letter-spacing:0.04em;
            padding:4px 6px; border-radius:3px; border:1px solid var(--hairline);
            background:${status === report.status ? "var(--soot)" : "#fff"};
            color:var(--bone); cursor:pointer;
          `;
          btn.disabled = status === report.status;
          btn.onclick = () => onSetReportStatus(report.id, status);
          actions.appendChild(btn);
        });
        popupEl.appendChild(actions);
      }
      const popup = new mapboxgl.Popup({ offset: 12, maxWidth: "260px" }).setDOMContent(
        popupEl
      );
      const marker = new mapboxgl.Marker({ element: reportMarkerEl(report.status) })
        .setLngLat([report.lng, report.lat])
        .setPopup(popup)
        .addTo(map);
      byId.set(report.id, { marker, sig });
    }

    for (const [id, entry] of byId) {
      if (!seen.has(id)) {
        entry.marker.remove();
        byId.delete(id);
      }
    }
  }, [reports, onSetReportStatus, t, lang]);

  if (!MAPBOX_TOKEN) {
    return (
      <div
        className={`flex items-center justify-center bg-soot text-center text-sm text-ash ${className ?? ""}`}
      >
        <p className="max-w-xs px-4">{t.common.mapUnavailable}</p>
      </div>
    );
  }

  return <div ref={containerRef} className={className} />;
}

function escapeHtml(s: string) {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}
