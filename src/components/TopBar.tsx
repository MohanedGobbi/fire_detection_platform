import { useEffect, useState } from "react";
import type { CameraConfig, StreamInfo } from "@/types/camera";
import { Flame } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface Props {
  cameras: CameraConfig[];
  streams: Record<string, StreamInfo>;
  detectionEnabled: boolean;
  onDetectionToggle: (on: boolean) => void;
  serverUrl: string;
}

export function TopBar({
  cameras,
  streams,
  detectionEnabled,
  onDetectionToggle,
  serverUrl,
}: Props) {
  const [now, setNow] = useState(() => new Date());
  const [serverOk, setServerOk] = useState<boolean | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  /* poll the detection server's /health — its reachability is real state */
  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const res = await fetch(`${serverUrl}/health`, {
          signal: AbortSignal.timeout(3000),
        });
        if (!cancelled) setServerOk(res.ok);
      } catch {
        if (!cancelled) setServerOk(false);
      }
    };
    check();
    const id = setInterval(check, 10_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [serverUrl]);

  const live = Object.values(streams).filter((s) => s.status === "live").length;
  const alarms = Object.values(streams).filter((s) => s.alarm).length;
  const down = Object.values(streams).filter(
    (s) => s.status === "error" || s.status === "denied"
  ).length;

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b hairline bg-coal px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-primary">
          <Flame className="h-4 w-4 text-white" strokeWidth={2} />
        </div>
        <div>
          <div className="font-display text-xl font-extrabold leading-none tracking-tight text-bone">
            Pyrophyte
          </div>
          <div className="micro-label mt-1">Fire Detection Platform</div>
        </div>
      </div>

      <div className="hidden items-center gap-8 md:flex">
        <Stat label="Cameras" value={String(cameras.length).padStart(2, "0")} tone="var(--bone)" />
        <Stat
          label="Live"
          value={String(live).padStart(2, "0")}
          tone={live ? "var(--phosphor)" : "var(--ash)"}
        />
        <Stat
          label="Alarms"
          value={String(alarms).padStart(2, "0")}
          tone={alarms ? "var(--ember)" : "var(--ash)"}
        />
        <Stat
          label="Offline"
          value={String(down).padStart(2, "0")}
          tone={down ? "var(--ember)" : "var(--ash)"}
        />

        <div className="h-8 w-px bg-[var(--hairline)]" />

        {/* detection server control */}
        <div className="flex items-center gap-3">
          <div>
            <div className="micro-label flex items-center gap-1.5">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{
                  background:
                    serverOk === null
                      ? "var(--ash)"
                      : serverOk
                        ? "var(--phosphor)"
                        : "var(--ember)",
                }}
              />
              Detection Server
            </div>
            <div className="mt-0.5 text-xs font-semibold text-bone">
              {serverOk === null ? "Checking…" : serverOk ? "Connected" : "Unreachable"}
            </div>
          </div>
          <Switch
            checked={detectionEnabled}
            onCheckedChange={onDetectionToggle}
            aria-label="Toggle fire detection"
          />
        </div>

        <div className="h-8 w-px bg-[var(--hairline)]" />

        <div className="text-right">
          <div className="micro-label">Zulu Time</div>
          <div className="mt-0.5 text-sm font-semibold tabular-nums text-bone">
            {now.toISOString().slice(11, 19)}Z
          </div>
        </div>
      </div>
    </header>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div>
      <div className="micro-label">{label}</div>
      <div className="mt-0.5 text-sm font-semibold tabular-nums" style={{ color: tone }}>
        {value}
      </div>
    </div>
  );
}
