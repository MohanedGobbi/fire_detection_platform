import type { CameraConfig, PlatformEvent, StreamInfo } from "@/types/camera";
import { SOURCE_LABEL } from "@/types/camera";
import { CircleAlert, Info, TriangleAlert } from "lucide-react";

const LEVEL_STYLE = {
  info: { color: "var(--ash)", Icon: Info },
  warn: { color: "var(--amber)", Icon: CircleAlert },
  error: { color: "var(--ember)", Icon: TriangleAlert },
} as const;

/* ---------------------------------------------------------------- */

export function EventLog({ events }: { events: PlatformEvent[] }) {
  return (
    <section className="flex min-h-0 flex-1 flex-col border-t hairline">
      <div className="flex items-center justify-between border-b hairline px-4 py-3">
        <span className="micro-label">Event Log</span>
        <span className="text-[10px] tabular-nums text-ash">{events.length}</span>
      </div>
      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto">
        {events.length === 0 && (
          <p className="px-3 py-4 text-[10px] leading-relaxed text-ash">
            Platform events will appear here — cameras added, streams
            connected, errors.
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
                  {e.message}
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
  if (!camera) {
    return (
      <section className="border-b hairline px-4 py-4">
        <span className="micro-label">Stream Detail</span>
        <p className="mt-3 text-[10px] leading-relaxed text-ash">
          Select a camera to inspect its connection.
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
        <span className="micro-label">Stream Detail</span>
        <span className="text-[10px] font-bold tracking-[0.16em]" style={{ color }}>
          {alarm ? "FIRE ALARM" : status.toUpperCase()}
        </span>
      </div>
      {alarm && (
        <p className="mt-2 rounded-sm bg-red-50 px-2 py-1.5 text-[11px] font-medium leading-snug text-red-700">
          The detection server confirmed a fire signature on this feed across
          consecutive frames.
        </p>
      )}
      <div className="mt-2 truncate font-display text-base font-black uppercase tracking-[0.06em] text-bone">
        {camera.name}
      </div>
      <dl className="mt-3 grid gap-y-1.5 text-[10px]">
        <Row k="ID" v={camera.id} />
        <Row k="SOURCE" v={SOURCE_LABEL[camera.type]} />
        {camera.url && <Row k="URL" v={camera.url} />}
        {stream?.detail && <Row k="SIGNAL" v={stream.detail} />}
        {camera.location && <Row k="LOCATION" v={camera.location} />}
        <Row
          k="ADDED"
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
