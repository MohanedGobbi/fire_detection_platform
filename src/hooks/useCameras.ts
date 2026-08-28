import { useCallback, useEffect, useRef, useState } from "react";
import type {
  CameraConfig,
  EventLevel,
  PlatformEvent,
  PlatformEventData,
  StreamInfo,
  StreamStatus,
} from "@/types/camera";
import { DEMO_CAMERA_SEEDS } from "@/lib/demoCameras";

const STORAGE_KEY = "firedetect.cameras.v1";
const LAST_ALARM_KEY = "firedetect.lastAlarm.v1";

let eventSeq = 1;

export interface LastAlarm {
  active: boolean;
  at: number; // ms epoch of the last alarm transition
}

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

export function loadLastAlarms(): Record<string, LastAlarm> {
  try {
    const raw = localStorage.getItem(LAST_ALARM_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
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
    (level: EventLevel, data: PlatformEventData, cameraId?: string) => {
      setEvents((e) =>
        [
          { id: eventSeq++, time: new Date(), level, cameraId, data },
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
      log("info", { kind: "cameraAdded", name: cam.name, type: cam.type }, cam.id);
      return cam;
    },
    [log]
  );

  const updateCamera = useCallback(
    (id: string, patch: Partial<CameraConfig>) => {
      persist(camsRef.current.map((c) => (c.id === id ? { ...c, ...patch } : c)));
      log("info", { kind: "cameraUpdated", name: patch.name ?? id }, id);
    },
    [log]
  );

  const loadDemoCameras = useCallback(() => {
    const existingIds = new Set(camsRef.current.map((c) => c.id));
    const toAdd = DEMO_CAMERA_SEEDS.filter((c) => !existingIds.has(c.id)).map((c) => ({
      ...c,
      createdAt: Date.now(),
    }));
    if (toAdd.length === 0) return;
    persist([...camsRef.current, ...toAdd]);
    log("info", { kind: "demoCamerasLoaded", count: toAdd.length });
  }, [log]);

  /* first-ever visit (localStorage key never set) — seed the wall with
     showcase cameras once so it doesn't start empty; a user who later
     clears their list has written the key and won't be re-seeded */
  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === null) loadDemoCameras();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      log("warn", { kind: "cameraRemoved", name: cam?.name ?? id }, id);
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
          log("info", { kind: "streamLive", name, detail: info.detail }, id);
        else if (info.status === "error")
          log("error", { kind: "streamError", name, detail: info.detail }, id);
        else if (info.status === "denied")
          log("error", { kind: "webcamDenied", name }, id);
      }

      // server-driven alarm transitions
      const prevAlarm = lastAlarmRef.current[id] ?? false;
      const nowAlarm = info.alarm ?? false;
      if (nowAlarm !== prevAlarm) {
        lastAlarmRef.current[id] = nowAlarm;
        try {
          const stored = loadLastAlarms();
          stored[id] = { active: nowAlarm, at: Date.now() };
          localStorage.setItem(LAST_ALARM_KEY, JSON.stringify(stored));
        } catch {
          /* storage full / private mode — non-fatal */
        }
        if (nowAlarm) log("error", { kind: "fireAlarm", name }, id);
        else log("info", { kind: "alarmCleared", name }, id);
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
    loadDemoCameras,
    reportStream,
    log,
  };
}
