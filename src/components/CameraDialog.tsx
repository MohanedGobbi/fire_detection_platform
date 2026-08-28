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
import { useLanguage } from "@/hooks/useLanguage";
import { Camera, Globe, LocateFixed, Video } from "lucide-react";

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

export function CameraDialog({ open, onOpenChange, editing, onSubmit }: Props) {
  const { t } = useLanguage();
  const TYPE_HINTS: Record<CameraSourceType, string> = {
    webcam: t.cameraDialog.hintWebcam,
    hls: t.cameraDialog.hintHls,
    mjpeg: t.cameraDialog.hintMjpeg,
    demo: t.cameraDialog.hintDemo,
  };
  const [name, setName] = useState("");
  const [type, setType] = useState<CameraSourceType>("webcam");
  const [url, setUrl] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [location, setLocation] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [locating, setLocating] = useState(false);
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
      setLat(editing?.lat != null ? String(editing.lat) : "");
      setLng(editing?.lng != null ? String(editing.lng) : "");
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
            ? t.cameraDialog.permErrorDenied
            : t.cameraDialog.permErrorGeneric
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

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(5));
        setLng(pos.coords.longitude.toFixed(5));
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10_000 }
    );
  };

  const submit = () => {
    if (!valid) return;
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    onSubmit({
      name: name.trim(),
      type,
      url: type === "webcam" ? undefined : url.trim(),
      deviceId: type === "webcam" ? deviceId || undefined : undefined,
      location: location.trim() || undefined,
      lat: Number.isFinite(parsedLat) ? parsedLat : undefined,
      lng: Number.isFinite(parsedLng) ? parsedLng : undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] grid-rows-[auto_1fr_auto] border-[var(--hairline)] bg-coal text-bone sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-black uppercase tracking-[0.08em]">
            {editing ? t.cameraDialog.configureTitle : t.cameraDialog.addTitle}
          </DialogTitle>
          <DialogDescription className="text-xs text-ash">
            {TYPE_HINTS[type]}
          </DialogDescription>
        </DialogHeader>

        <div className="thin-scroll grid gap-4 overflow-y-auto py-2">
          <div className="grid gap-1.5">
            <Label className="micro-label">{t.cameraDialog.name}</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.cameraDialog.namePlaceholder}
              className="border-[var(--hairline)] bg-soot text-bone placeholder:text-ash/50"
            />
          </div>

          <div className="grid gap-1.5">
            <Label className="micro-label">{t.cameraDialog.sourceType}</Label>
            <div className="grid grid-cols-3 gap-1">
              {(
                [
                  { v: "webcam", label: t.cameraDialog.webcam, Icon: Camera },
                  { v: "hls", label: t.cameraDialog.hls, Icon: Globe },
                  { v: "mjpeg", label: t.cameraDialog.mjpeg, Icon: Video },
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
              <Label className="micro-label">{t.cameraDialog.device}</Label>
              {deviceError ? (
                <p className="text-[10px] leading-relaxed text-ember">{deviceError}</p>
              ) : devices.length === 0 ? (
                <p className="text-[10px] text-ash">{t.cameraDialog.detectingDevices}</p>
              ) : (
                <Select value={deviceId} onValueChange={setDeviceId}>
                  <SelectTrigger className="border-[var(--hairline)] bg-white text-bone">
                    <SelectValue placeholder={t.cameraDialog.selectDevicePlaceholder} />
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
              <Label className="micro-label">{t.cameraDialog.streamUrl}</Label>
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
            <Label className="micro-label">{t.cameraDialog.locationLabel}</Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t.cameraDialog.locationPlaceholder}
              className="border-[var(--hairline)] bg-soot text-bone placeholder:text-ash/50"
            />
          </div>

          <div className="grid gap-1.5">
            <div className="flex items-center justify-between">
              <Label className="micro-label">{t.cameraDialog.mapPosition}</Label>
              <button
                type="button"
                onClick={useMyLocation}
                disabled={locating}
                className="flex items-center gap-1 text-[10px] font-semibold tracking-[0.1em] text-[var(--indigo)] hover:opacity-75 disabled:opacity-50"
              >
                <LocateFixed className="h-3 w-3" />
                {locating ? t.cameraDialog.locating : t.cameraDialog.useMyLocation}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold tracking-[0.08em] text-ash/70">
                  LAT
                </span>
                <Input
                  inputMode="decimal"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  placeholder="0.0000"
                  className="border-[var(--hairline)] bg-soot pl-9 font-mono text-xs text-bone placeholder:text-ash/50"
                />
              </div>
              <div className="relative">
                <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold tracking-[0.08em] text-ash/70">
                  LNG
                </span>
                <Input
                  inputMode="decimal"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  placeholder="0.0000"
                  className="border-[var(--hairline)] bg-soot pl-9 font-mono text-xs text-bone placeholder:text-ash/50"
                />
              </div>
            </div>
            <p className="text-[10px] text-ash">{t.cameraDialog.mapPositionBody}</p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="hairline border bg-transparent text-ash hover:text-bone"
          >
            {t.cameraDialog.cancel}
          </Button>
          <Button
            onClick={submit}
            disabled={!valid}
            className="bg-primary font-semibold text-white hover:opacity-85"
          >
            {editing ? t.cameraDialog.saveChanges : t.cameraDialog.addCamera}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
