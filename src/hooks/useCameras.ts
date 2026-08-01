import { useCallback, useRef, useState } from "react";
import type {
  CameraConfig,
  EventLevel,
  PlatformEvent,
  StreamInfo,
  StreamStatus,
} from "@/types/camera";

const STORAGE_KEY = "pyrophyte.cameras.v1";

let eventSeq = 1;

function loadCameras(): CameraConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useCameras() {
  const [cameras, setCameras] = useState<CameraConfig[]>(loadCameras);
  const [streams, setStreams] = useState<Record<string, StreamInfo>>({});
  const [events, setEvents] = useState<PlatformEvent[]>([]);
  const camsRef = useRef(cameras);
  camsRef.current = cameras;
  const lastStatusRef = useRef<Record<string, StreamStatus>>({});
  const lastAlarmRef = useRef<Record<string, boolean>>({});

  const persist = (next: CameraConfig[]) => {
    camsRef.current = next;
    setCameras(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage full / private mode — non-fatal */
    }
  };

  const log = useCallback(
    (level: EventLevel, message: string, cameraId?: string) => {
      setEvents((e) =>
        [
          { id: eventSeq++, time: new Date(), level, cameraId, message },
          ...e,
        ].slice(0, 100)
      );
    },
    []
  );

  const addCamera = useCallback(
    (cfg: Omit<CameraConfig, "id" | "createdAt">) => {
      const cam: CameraConfig = {
        ...cfg,
        id: `CAM-${String(Date.now()).slice(-6)}`,
        createdAt: Date.now(),
      };
      persist([...camsRef.current, cam]);
      log("info", `Camera added — ${cam.name} (${cam.type.toUpperCase()})`, cam.id);
      return cam;
    },
    [log]
  );

  const updateCamera = useCallback(
    (id: string, patch: Partial<CameraConfig>) => {
      persist(camsRef.current.map((c) => (c.id === id ? { ...c, ...patch } : c)));
      log("info", `Camera updated — ${patch.name ?? id}`, id);
    },
    [log]
  );

  const removeCamera = useCallback(
    (id: string) => {
      const cam = camsRef.current.find((c) => c.id === id);
      persist(camsRef.current.filter((c) => c.id !== id));
      setStreams((s) => {
        const next = { ...s };
        delete next[id];
        return next;
      });
      delete lastStatusRef.current[id];
      delete lastAlarmRef.current[id];
      log("warn", `Camera removed — ${cam?.name ?? id}`, id);
    },
    [log]
  );

  /** Called by CameraFeed with real connection state; logs status transitions. */
  const reportStream = useCallback(
    (id: string, info: StreamInfo) => {
      setStreams((s) => {
        const prev = s[id];
        if (
          prev?.status === info.status &&
          prev?.detail === info.detail &&
          prev?.alarm === info.alarm
        )
          return s;
        return { ...s, [id]: info };
      });
      const name = camsRef.current.find((c) => c.id === id)?.name ?? id;

      const last = lastStatusRef.current[id];
      if (last !== info.status) {
        lastStatusRef.current[id] = info.status;
        if (info.status === "live")
          log(
            "info",
            `Stream live — ${name}${info.detail ? ` · ${info.detail}` : ""}`,
            id
          );
        else if (info.status === "error")
          log("error", `Stream error — ${name}: ${info.detail ?? "unknown"}`, id);
        else if (info.status === "denied")
          log("error", `Webcam permission denied — ${name}`, id);
      }

      // server-driven alarm transitions
      const prevAlarm = lastAlarmRef.current[id] ?? false;
      const nowAlarm = info.alarm ?? false;
      if (nowAlarm !== prevAlarm) {
        lastAlarmRef.current[id] = nowAlarm;
        if (nowAlarm)
          log(
            "error",
            `FIRE ALARM — ${name} · confirmed by detection server`,
            id
          );
        else log("info", `Alarm cleared — ${name}`, id);
      }
    },
    [log]
  );

  return {
    cameras,
    streams,
    events,
    addCamera,
    updateCamera,
    removeCamera,
    reportStream,
    log,
  };
}
