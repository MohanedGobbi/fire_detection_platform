import type { CameraConfig, PlatformEvent, StreamInfo } from "@/types/camera";
import { useLanguage } from "@/hooks/useLanguage";
import { localizeEventData } from "@/lib/demoCameras";
import { CircleAlert, Info, TriangleAlert } from "lucide-react";

const LEVEL_STYLE = {
  info: { color: "var(--ash)", Icon: Info },
  warn: { color: "var(--amber)", Icon: CircleAlert },
  error: { color: "var(--ember)", Icon: TriangleAlert },
} as const;

/* ---------------------------------------------------------------- */

export function EventLog({ events }: { events: PlatformEvent[] }) {
  const { t, lang } = useLanguage();
  return (
    <section className="flex min-h-0 flex-1 flex-col border-t hairline">
      <div className="flex items-center justify-between border-b hairline px-4 py-3">
        <span className="micro-label">{t.statusPanels.eventLog}</span>
        <span className="text-[10px] tabular-nums text-ash">{events.length}</span>
      </div>
      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto">
        {events.length === 0 && (
          <p className="px-3 py-4 text-[10px] leading-relaxed text-ash">
            {t.statusPanels.eventsEmpty}
          </p>
        )}
        {events.map((e) => {
          const { color, Icon } = LEVEL_STYLE[e.level];
          return (
            <div key={e.id} className="anim-alert-in flex gap-2.5 border-b hairline px-4 py-2.5">
              <Icon className="mt-0.5 h-3 w-3 shrink-0" style={{ color }} strokeWidth={1.75} />
              <div className="min-w-0">
                <div className="text-[10px] tabular-nums text-ash">
                  {e.time.toISOString().slice(11, 19)}Z
                </div>
                <div
                  className="mt-0.5 text-[11px] leading-snug"
                  style={{
                    color: e.level === "info" ? "var(--bone)" : color,
                    opacity: e.level === "info" ? 0.75 : 1,
                  }}
                >
                  {t.formatEvent(localizeEventData(e.data, e.cameraId, lang))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */

interface DetailProps {
  camera?: CameraConfig;
  stream?: StreamInfo;
}

export function CameraDetailPanel({ camera, stream }: DetailProps) {
  const { t } = useLanguage();
  if (!camera) {
    return (
      <section className="border-b hairline px-4 py-4">
        <span className="micro-label">{t.statusPanels.streamDetail}</span>
        <p className="mt-3 text-[10px] leading-relaxed text-ash">
          {t.statusPanels.selectCamera}
        </p>
      </section>
    );
  }
  const status = stream?.status ?? "idle";
  const alarm = stream?.alarm ?? false;
  const color = alarm
    ? "var(--ember)"
    : status === "live"
      ? "var(--phosphor)"
      : status === "connecting"
        ? "var(--amber)"
        : status === "idle"
          ? "var(--ash)"
          : "var(--ember)";
  return (
    <section className="border-b hairline px-4 py-4">
      <div className="flex items-center justify-between">
        <span className="micro-label">{t.statusPanels.streamDetail}</span>
        <span className="text-[10px] font-bold tracking-[0.16em]" style={{ color }}>
          {alarm ? t.statusPanels.fireAlarmTag : status.toUpperCase()}
        </span>
      </div>
      {alarm && (
        <p className="mt-2 rounded-sm bg-red-50 px-2 py-1.5 text-[11px] font-medium leading-snug text-red-700">
          {t.statusPanels.fireAlarmBody}
        </p>
      )}
      <div className="mt-2 truncate font-display text-base font-black uppercase tracking-[0.06em] text-bone">
        {camera.name}
      </div>
      <dl className="mt-3 grid gap-y-1.5 text-[10px]">
        <Row k={t.statusPanels.idLabel} v={camera.id} />
        <Row k={t.statusPanels.sourceLabel} v={t.common.sourceLabel[camera.type]} />
        {camera.url && <Row k={t.statusPanels.urlLabel} v={camera.url} />}
        {stream?.detail && <Row k={t.statusPanels.signalLabel} v={stream.detail} />}
        {camera.location && <Row k={t.statusPanels.locationLabel} v={camera.location} />}
        <Row
          k={t.statusPanels.addedLabel}
          v={new Date(camera.createdAt).toISOString().slice(0, 10)}
        />
      </dl>
    </section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="shrink-0 text-ash">{k}</dt>
      <dd className="truncate text-right text-bone/85" title={v}>
        {v}
      </dd>
    </div>
  );
}
