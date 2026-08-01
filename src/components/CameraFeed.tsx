import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import type {
  CameraConfig,
  Detection,
  DetectionSettings,
  StreamInfo,
} from "@/types/camera";
import { SOURCE_LABEL } from "@/types/camera";

interface Props {
  camera: CameraConfig;
  detection: DetectionSettings;
  large?: boolean;
  onStream: (id: string, info: StreamInfo) => void;
}

const STATUS_COLOR: Record<string, string> = {
  idle: "#6E6E67",
  connecting: "#D97706",
  live: "#16A34A",
  error: "#DC2626",
  denied: "#DC2626",
};

const DETECT_INTERVAL_MS = 800;
const DETECT_W = 256;

function useUtcClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now.toISOString().slice(11, 19) + "Z";
}

/** Real decoded FPS via requestVideoFrameCallback when available. */
function useFps(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  live: boolean
) {
  const [fps, setFps] = useState<number | null>(null);
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !live) return;
    const anyVideo = video as HTMLVideoElement & {
      requestVideoFrameCallback?: (cb: () => void) => number;
    };
    if (!anyVideo.requestVideoFrameCallback) return;
    let frames = 0;
    let cancelled = false;
    const start = performance.now();
    const tick = () => {
      if (cancelled) return;
      frames++;
      const elapsed = performance.now() - start;
      if (elapsed >= 1000) {
        setFps(Math.round((frames * 1000) / elapsed));
        return;
      }
      anyVideo.requestVideoFrameCallback!(tick);
    };
    anyVideo.requestVideoFrameCallback(tick);
    return () => {
      cancelled = true;
    };
  }, [videoRef, live]);
  return fps;
}

export function CameraFeed({ camera, detection, large, onStream }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [status, setStatus] = useState<StreamInfo["status"]>("connecting");
  const [error, setError] = useState<string>();
  const [resolution, setResolution] = useState<string>();
  const [detections, setDetections] = useState<Detection[]>([]);
  const [alarm, setAlarm] = useState(false);
  const [detOffline, setDetOffline] = useState<string>();
  const clock = useUtcClock();
  const fps = useFps(videoRef, status === "live" && camera.type !== "mjpeg");

  const alarmRef = useRef(false);
  const detailRef = useRef<string | undefined>(undefined);

  const report = (info: StreamInfo) => {
    setStatus(info.status);
    setError(
      info.status === "error" || info.status === "denied" ? info.detail : undefined
    );
    if (info.detail) detailRef.current = info.detail;
    onStream(camera.id, { ...info, alarm: alarmRef.current });
  };

  const setAlarmState = (a: boolean) => {
    if (alarmRef.current === a) return;
    alarmRef.current = a;
    setAlarm(a);
    onStream(camera.id, {
      status: "live",
      detail: detailRef.current,
      alarm: a,
    });
  };

  /* ---------------- stream connection ---------------- */
  useEffect(() => {
    let cancelled = false;
    let stream: MediaStream | null = null;
    let hls: Hls | null = null;
    const video = videoRef.current;

    report({ status: "connecting" });

    if (camera.type === "webcam") {
      if (!navigator.mediaDevices?.getUserMedia) {
        report({ status: "error", detail: "getUserMedia not supported in this browser" });
        return;
      }
      navigator.mediaDevices
        .getUserMedia({
          video: camera.deviceId ? { deviceId: { exact: camera.deviceId } } : true,
          audio: false,
        })
        .then((s) => {
          if (cancelled) {
            s.getTracks().forEach((t) => t.stop());
            return;
          }
          stream = s;
          if (video) {
            video.srcObject = s;
            video.play().catch(() => {});
          }
          const track = s.getVideoTracks()[0];
          const settings = track?.getSettings();
          if (settings?.width && settings?.height) {
            setResolution(`${settings.width}×${settings.height}`);
            report({
              status: "live",
              detail: `${settings.width}×${settings.height}${
                settings.frameRate ? ` @ ${Math.round(settings.frameRate)}fps` : ""
              }`,
            });
          } else {
            report({ status: "live" });
          }
        })
        .catch((err: DOMException) => {
          if (cancelled) return;
          if (err.name === "NotAllowedError")
            report({ status: "denied", detail: "permission denied" });
          else if (err.name === "NotFoundError")
            report({ status: "error", detail: "no camera device found" });
          else report({ status: "error", detail: err.message });
        });
    } else if (camera.type === "hls") {
      if (!video || !camera.url) {
        report({ status: "error", detail: "missing stream URL" });
        return;
      }
      if (Hls.isSupported()) {
        hls = new Hls({ enableWorker: true });
        hls.loadSource(camera.url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
        });
        hls.on(Hls.Events.ERROR, (_e, data) => {
          if (cancelled) return;
          if (data.fatal)
            report({ status: "error", detail: `${data.type}: ${data.details}` });
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = camera.url;
        video.play().catch(() => {});
      } else {
        report({ status: "error", detail: "HLS not supported in this browser" });
      }
    }
    /* mjpeg handled by <img> below */

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
      hls?.destroy();
      if (video) video.srcObject = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera.id, camera.url, camera.deviceId, camera.type]);

  /* ---------------- server-side detection loop ---------------- */
  useEffect(() => {
    if (!detection.enabled || status !== "live") {
      setDetections([]);
      setAlarmState(false);
      setDetOffline(undefined);
      return;
    }
    let stopped = false;
    let failures = 0;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    const tick = async () => {
      if (stopped) return;
      const media: HTMLVideoElement | HTMLImageElement | null =
        camera.type === "mjpeg" ? imgRef.current : videoRef.current;
      if (!media || !ctx) return;
      const mw =
        media instanceof HTMLVideoElement ? media.videoWidth : media.naturalWidth;
      const mh =
        media instanceof HTMLVideoElement
          ? media.videoHeight
          : media.naturalHeight;
      if (!mw || !mh) return;

      canvas.width = DETECT_W;
      canvas.height = Math.max(1, Math.round((mh / mw) * DETECT_W));
      try {
        ctx.drawImage(media, 0, 0, canvas.width, canvas.height);
      } catch {
        setDetOffline("frame blocked by CORS");
        return;
      }

      const blob = await new Promise<Blob | null>((res) =>
        canvas.toBlob((b) => res(b), "image/jpeg", 0.6)
      ).catch(() => null);
      if (!blob || stopped) return;

      try {
        const ctrl = new AbortController();
        const timeout = setTimeout(() => ctrl.abort(), 4000);
        const res = await fetch(
          `${detection.serverUrl}/detect?camera_id=${encodeURIComponent(camera.id)}`,
          { method: "POST", body: blob, signal: ctrl.signal }
        );
        clearTimeout(timeout);
        if (!res.ok) throw new Error(`server ${res.status}`);
        const data = (await res.json()) as {
          detections: Detection[];
          alarm: boolean;
        };
        if (stopped) return;
        failures = 0;
        setDetOffline(undefined);
        setDetections(data.detections);
        setAlarmState(data.alarm);
      } catch {
        if (stopped) return;
        failures++;
        if (failures >= 3) {
          setDetOffline("detection server unreachable");
          setDetections([]);
        }
      }
    };

    const id = setInterval(tick, DETECT_INTERVAL_MS);
    return () => {
      stopped = true;
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detection.enabled, detection.serverUrl, status, camera.id]);

  const color = STATUS_COLOR[status];

  return (
    <div className="relative overflow-hidden bg-neutral-900" style={{ aspectRatio: "16 / 9" }}>
      {/* real video surface */}
      {camera.type === "mjpeg" ? (
        <img
          ref={imgRef}
          src={camera.url}
          alt={camera.name}
          crossOrigin="anonymous"
          className="h-full w-full object-cover"
          onLoad={() => report({ status: "live" })}
          onError={() =>
            report({ status: "error", detail: `cannot reach ${camera.url}` })
          }
        />
      ) : (
        <video
          ref={videoRef}
          muted
          playsInline
          autoPlay
          className="h-full w-full object-cover"
          onPlaying={() => {
            const v = videoRef.current;
            if (v?.videoWidth) {
              setResolution(`${v.videoWidth}×${v.videoHeight}`);
              report({ status: "live", detail: `${v.videoWidth}×${v.videoHeight}` });
            } else {
              report({ status: "live" });
            }
          }}
          onError={() => report({ status: "error", detail: "stream unavailable" })}
        />
      )}

      {/* offline / error cover */}
      {status !== "live" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-neutral-100">
          {status === "connecting" ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border border-amber-600 border-t-transparent" />
              <span className="micro-label">Connecting</span>
            </>
          ) : (
            <>
              <span className="text-[10px] font-semibold tracking-[0.18em] text-red-600">
                {status === "denied" ? "PERMISSION DENIED" : "STREAM OFFLINE"}
              </span>
              <span className="max-w-[80%] text-center text-[9px] leading-relaxed text-neutral-500">
                {error}
              </span>
            </>
          )}
        </div>
      )}

      {/* server-returned detection boxes */}
      {detections.map((d, i) => {
        const c = d.label === "fire" ? "#DC2626" : "#D97706";
        return (
          <div
            key={i}
            className="absolute border-2"
            style={{
              left: `${d.x * 100}%`,
              top: `${d.y * 100}%`,
              width: `${d.w * 100}%`,
              height: `${d.h * 100}%`,
              borderColor: c,
            }}
          >
            <span
              className="absolute -top-[18px] left-0 whitespace-nowrap px-1 py-px text-[9px] font-semibold text-white"
              style={{ background: c }}
            >
              {d.label.toUpperCase()} {(d.confidence * 100).toFixed(0)}%
            </span>
          </div>
        );
      })}

      {/* alarm banner — the detection server's verdict */}
      {alarm && (
        <div className="absolute inset-x-0 top-0 flex items-center justify-center gap-2 bg-red-600/95 py-1">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
          <span className={`${large ? "text-[11px]" : "text-[9px]"} font-bold tracking-[0.2em] text-white`}>
            FIRE ALARM — SERVER CONFIRMED
          </span>
        </div>
      )}

      {/* HUD — white on video */}
      <div className="absolute left-3 top-2.5 flex items-center gap-2" style={{ top: alarm ? 30 : undefined }}>
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: 9999,
            background: alarm ? "#DC2626" : color,
            display: "inline-block",
          }}
        />
        <span
          className={`${large ? "text-xs" : "text-[10px]"} font-medium tracking-[0.14em] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]`}
        >
          {camera.id} · {camera.name}
        </span>
      </div>

      <div
        className={`absolute right-3 ${large ? "text-xs" : "text-[10px]"} tabular-nums text-white/85 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]`}
        style={{ top: alarm ? 30 : 10 }}
      >
        {clock}
      </div>

      <div
        className={`absolute bottom-2 left-3 ${large ? "text-[11px]" : "text-[9px]"} leading-relaxed text-white/75 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]`}
      >
        <div>{SOURCE_LABEL[camera.type]}</div>
        {camera.location && <div>{camera.location}</div>}
      </div>

      <div
        className={`absolute bottom-2 right-3 ${large ? "text-[11px]" : "text-[9px]"} font-semibold tracking-[0.16em] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]`}
        style={{ color: alarm ? "#FCA5A5" : color }}
      >
        {alarm
          ? "ALARM"
          : status === "live"
            ? `LIVE${resolution ? ` · ${resolution}` : ""}${fps ? ` · ${fps}FPS` : ""}`
            : status.toUpperCase()}
      </div>

      {/* detection pipeline status tag */}
      {detection.enabled && status === "live" && (
        <div
          className={`absolute bottom-2 left-1/2 -translate-x-1/2 ${large ? "text-[9px]" : "text-[8px]"} tracking-[0.14em] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] ${
            detOffline ? "text-amber-400" : "text-white/50"
          }`}
        >
          {detOffline ? `AI: ${detOffline.toUpperCase()}` : "AI: SERVER ANALYZING"}
        </div>
      )}
    </div>
  );
}
