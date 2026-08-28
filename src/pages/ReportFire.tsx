import { useCallback, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { FireMap } from "@/components/FireMap";
import { useCameras } from "@/hooks/useCameras";
import { useReports } from "@/hooks/useReports";
import { useLanguage } from "@/hooks/useLanguage";
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, ImagePlus, LocateFixed, X } from "lucide-react";

const MAX_PHOTO_DIM = 1280;

function compressPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("could not read file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("could not decode image"));
      img.onload = () => {
        const scale = Math.min(1, MAX_PHOTO_DIM / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("canvas unavailable"));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function ReportFire() {
  const { t } = useLanguage();
  const { cameras, streams } = useCameras();
  const { submitReport } = useReports();

  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [description, setDescription] = useState("");
  const [contact, setContact] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const useMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError(t.reportFire.geoUnavailable);
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setError(t.reportFire.geoFailed);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10_000 }
    );
  }, [t]);

  const onPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError(t.reportFire.chooseImage);
      return;
    }
    try {
      const dataUrl = await compressPhoto(file);
      setPhotoPreview(dataUrl);
      setPhotoBase64(dataUrl);
    } catch {
      setError(t.reportFire.photoReadFail);
    }
  };

  const valid = location !== null && description.trim().length > 0;

  const submit = async () => {
    if (!valid || !location) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitReport({
        lat: location.lat,
        lng: location.lng,
        description: description.trim(),
        contact: contact.trim() || undefined,
        photoBase64: photoBase64 ?? undefined,
      });
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : t.reportFire.genericError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-soot text-bone">
      <TopBar cameras={cameras} streams={streams} />

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <div className="thin-scroll flex w-full shrink-0 flex-col overflow-y-auto border-b hairline bg-coal p-6 md:w-[420px] md:border-b-0 md:border-r">
          {done ? (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <CheckCircle2 className="h-10 w-10 text-phosphor" />
              <h2 className="mt-4 font-display text-xl font-extrabold tracking-tight text-bone">
                {t.reportFire.receivedTitle}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ash">
                {t.reportFire.receivedBody}
              </p>
              <Button
                className="mt-6 bg-primary font-semibold text-white hover:opacity-85"
                onClick={() => {
                  setDone(false);
                  setDescription("");
                  setContact("");
                  setPhotoPreview(null);
                  setPhotoBase64(null);
                  setLocation(null);
                }}
              >
                {t.reportFire.submitAnother}
              </Button>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-extrabold tracking-tight text-bone">
                {t.reportFire.title}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-ash">
                {t.reportFire.body}
              </p>

              <div className="mt-6 grid gap-5">
                <div className="grid gap-1.5">
                  <Label className="micro-label">{t.reportFire.locationLabel}</Label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={useMyLocation}
                    disabled={locating}
                    className="hairline justify-start gap-2 border bg-transparent text-bone hover:text-bone"
                  >
                    <LocateFixed className="h-4 w-4" />
                    {locating ? t.reportFire.locating : t.reportFire.useMyLocation}
                  </Button>
                  <p className="text-[11px] text-ash">
                    {location
                      ? t.reportFire.pinnedAt(location.lat.toFixed(4), location.lng.toFixed(4))
                      : t.reportFire.clickMap}
                  </p>
                </div>

                <div className="grid gap-1.5">
                  <Label className="micro-label">{t.reportFire.whatSeeing}</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t.reportFire.descPlaceholder}
                    className="min-h-24 border-[var(--hairline)] bg-soot text-bone placeholder:text-ash/50"
                  />
                </div>

                <div className="grid gap-1.5">
                  <Label className="micro-label">{t.reportFire.contactLabel}</Label>
                  <Input
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder={t.reportFire.contactPlaceholder}
                    className="border-[var(--hairline)] bg-soot text-bone placeholder:text-ash/50"
                  />
                </div>

                <div className="grid gap-1.5">
                  <Label className="micro-label">{t.reportFire.photoLabel}</Label>
                  {photoPreview ? (
                    <div className="relative w-fit">
                      <img
                        src={photoPreview}
                        alt={t.reportFire.photoAlt}
                        className="max-h-40 rounded-sm border hairline"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoPreview(null);
                          setPhotoBase64(null);
                        }}
                        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-bone text-coal"
                        aria-label={t.reportFire.removePhoto}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex w-fit cursor-pointer items-center gap-2 rounded-sm border hairline border-dashed px-3 py-2 text-xs font-semibold text-ash hover:text-bone">
                      <ImagePlus className="h-4 w-4" />
                      {t.reportFire.attachPhoto}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={onPhotoChange}
                      />
                    </label>
                  )}
                </div>

                {error && <p className="text-xs text-ember">{error}</p>}

                <Button
                  onClick={submit}
                  disabled={!valid || submitting}
                  className="bg-primary font-semibold text-white hover:opacity-85"
                >
                  {submitting ? t.reportFire.submitting : t.reportFire.submit}
                </Button>
              </div>
            </>
          )}
        </div>

        <div className="min-h-[280px] flex-1">
          <FireMap
            cameras={[]}
            interactivePick
            pickedLocation={location}
            onPick={(lat, lng) => setLocation({ lat, lng })}
            center={location ? [location.lng, location.lat] : DEFAULT_MAP_CENTER}
            zoom={location ? 12 : DEFAULT_MAP_ZOOM}
            className="h-full w-full"
          />
        </div>
      </div>
    </div>
  );
}
