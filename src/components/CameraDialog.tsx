import { useEffect, useState } from "react";
import type { CameraConfig, CameraSourceType } from "@/types/camera";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Camera, Globe, Video } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** when set, dialog edits this camera instead of adding */
  editing?: CameraConfig | null;
  onSubmit: (cfg: Omit<CameraConfig, "id" | "createdAt">) => void;
}

interface VideoDevice {
  deviceId: string;
  label: string;
}

const TYPE_HINTS: Record<CameraSourceType, string> = {
  webcam: "Use a camera attached to this PC — good for testing.",
  hls: "HTTP Live Streaming URL (.m3u8). Most IP cameras/NVRs can publish HLS.",
  mjpeg: "Motion-JPEG over HTTP, e.g. http://192.168.1.50:8080/video",
};

export function CameraDialog({ open, onOpenChange, editing, onSubmit }: Props) {
  const [name, setName] = useState("");
  const [type, setType] = useState<CameraSourceType>("webcam");
  const [url, setUrl] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [location, setLocation] = useState("");
  const [devices, setDevices] = useState<VideoDevice[]>([]);
  const [deviceError, setDeviceError] = useState<string>();

  /* prefill when editing */
  useEffect(() => {
    if (open) {
      setName(editing?.name ?? "");
      setType(editing?.type ?? "webcam");
      setUrl(editing?.url ?? "");
      setDeviceId(editing?.deviceId ?? "");
      setLocation(editing?.location ?? "");
      setDeviceError(undefined);
    }
  }, [open, editing]);

  /* enumerate webcams — needs a one-time permission grant to get labels */
  useEffect(() => {
    if (!open || type !== "webcam") return;
    let stream: MediaStream | null = null;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const all = await navigator.mediaDevices.enumerateDevices();
        const cams = all
          .filter((d) => d.kind === "videoinput")
          .map((d, i) => ({
            deviceId: d.deviceId,
            label: d.label || `Camera ${i + 1}`,
          }));
        setDevices(cams);
        if (cams.length && !deviceId) setDeviceId(cams[0].deviceId);
      } catch (e) {
        setDeviceError(
          e instanceof DOMException && e.name === "NotAllowedError"
            ? "Camera permission denied — allow access to pick a device."
            : "Could not list camera devices."
        );
      } finally {
        stream?.getTracks().forEach((t) => t.stop());
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, type]);

  const valid =
    name.trim().length > 0 &&
    (type === "webcam" ? true : url.trim().length > 0);

  const submit = () => {
    if (!valid) return;
    onSubmit({
      name: name.trim(),
      type,
      url: type === "webcam" ? undefined : url.trim(),
      deviceId: type === "webcam" ? deviceId || undefined : undefined,
      location: location.trim() || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[var(--hairline)] bg-coal text-bone sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-black uppercase tracking-[0.08em]">
            {editing ? "Configure Camera" : "Add Camera"}
          </DialogTitle>
          <DialogDescription className="text-xs text-ash">
            {TYPE_HINTS[type]}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label className="micro-label">Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tower 12 — North Ridge"
              className="border-[var(--hairline)] bg-soot text-bone placeholder:text-ash/50"
            />
          </div>

          <div className="grid gap-1.5">
            <Label className="micro-label">Source Type</Label>
            <div className="grid grid-cols-3 gap-1">
              {(
                [
                  { v: "webcam", label: "Webcam", Icon: Camera },
                  { v: "hls", label: "HLS", Icon: Globe },
                  { v: "mjpeg", label: "MJPEG", Icon: Video },
                ] as const
              ).map(({ v, label, Icon }) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setType(v)}
                  className={`flex items-center justify-center gap-1.5 rounded-sm border px-2 py-2 text-[10px] font-semibold tracking-[0.12em] transition-colors ${
                    type === v
                      ? "border-[var(--indigo)] bg-[var(--indigo)]/5 text-bone"
                      : "hairline border text-ash hover:text-bone"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {type === "webcam" ? (
            <div className="grid gap-1.5">
              <Label className="micro-label">Device</Label>
              {deviceError ? (
                <p className="text-[10px] leading-relaxed text-ember">{deviceError}</p>
              ) : devices.length === 0 ? (
                <p className="text-[10px] text-ash">Detecting camera devices…</p>
              ) : (
                <Select value={deviceId} onValueChange={setDeviceId}>
                  <SelectTrigger className="border-[var(--hairline)] bg-white text-bone">
                    <SelectValue placeholder="Select device" />
                  </SelectTrigger>
                  <SelectContent className="border-[var(--hairline)] bg-white text-bone">
                    {devices.map((d) => (
                      <SelectItem key={d.deviceId} value={d.deviceId}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ) : (
            <div className="grid gap-1.5">
              <Label className="micro-label">Stream URL</Label>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={
                  type === "hls"
                    ? "https://cam.example.com/live/stream.m3u8"
                    : "http://192.168.1.50:8080/video"
                }
                className="border-[var(--hairline)] bg-soot font-mono text-xs text-bone placeholder:text-ash/50"
              />
            </div>
          )}

          <div className="grid gap-1.5">
            <Label className="micro-label">Location (optional)</Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. 45.9231°N 121.4822°W · Sector A-1"
              className="border-[var(--hairline)] bg-soot text-bone placeholder:text-ash/50"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="hairline border bg-transparent text-ash hover:text-bone"
          >
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={!valid}
            className="bg-primary font-semibold text-white hover:opacity-85"
          >
            {editing ? "Save Changes" : "Add Camera"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
