export type CameraSourceType = "webcam" | "hls" | "mjpeg" | "demo";

export interface CameraConfig {
  id: string;
  name: string;
  type: CameraSourceType;
  /** hls: .m3u8 URL · mjpeg: http(s) image stream URL */
  url?: string;
  /** webcam: MediaDeviceInfo.deviceId */
  deviceId?: string;
  location?: string; // free text, e.g. "45.9231°N 121.4822°W · Ridge A-1"
  lat?: number;
  lng?: number;
  notes?: string;
  createdAt: number;
}

export type StreamStatus =
  | "idle" // configured, not started yet
  | "connecting"
  | "live"
  | "error"
  | "denied"; // webcam permission refused

export interface StreamInfo {
  status: StreamStatus;
  detail?: string; // error message or resolution e.g. "1280×720 @ 30fps"
  alarm?: boolean; // set by the detection server — server is the alarm authority
}

/** One detection returned by the server, normalized to [0,1] frame coords. */
export interface Detection {
  x: number;
  y: number;
  w: number;
  h: number;
  confidence: number;
  label: "fire" | "smoke";
}

export interface DetectionSettings {
  enabled: boolean;
  serverUrl: string;
}

export type EventLevel = "info" | "warn" | "error";

/** Structured event payloads — kept language-neutral so the UI can render
 * each one in whichever language is active, instead of baking English text
 * in at the point the event happens. */
export type PlatformEventData =
  | { kind: "cameraAdded"; name: string; type: CameraSourceType }
  | { kind: "cameraUpdated"; name: string }
  | { kind: "cameraRemoved"; name: string }
  | { kind: "demoCamerasLoaded"; count: number }
  | { kind: "streamLive"; name: string; detail?: string }
  | { kind: "streamError"; name: string; detail?: string }
  | { kind: "webcamDenied"; name: string }
  | { kind: "fireAlarm"; name: string }
  | { kind: "alarmCleared"; name: string };

export interface PlatformEvent {
  id: number;
  time: Date;
  level: EventLevel;
  cameraId?: string;
  data: PlatformEventData;
}

export const SOURCE_LABEL: Record<CameraSourceType, string> = {
  webcam: "LOCAL WEBCAM",
  hls: "HLS STREAM",
  mjpeg: "MJPEG STREAM",
  demo: "DEMO FEED",
};
