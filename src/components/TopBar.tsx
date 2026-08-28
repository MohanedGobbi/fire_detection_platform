import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router";
import type { CameraConfig, StreamInfo } from "@/types/camera";
import { DETECTION_SERVER } from "@/lib/config";
import { Switch } from "@/components/ui/switch";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/hooks/useLanguage";

interface Props {
  cameras: CameraConfig[];
  streams: Record<string, StreamInfo>;
  /** only the Dashboard owns the live enable/disable toggle */
  detectionEnabled?: boolean;
  onDetectionToggle?: (on: boolean) => void;
}

export function TopBar({ cameras, streams, detectionEnabled, onDetectionToggle }: Props) {
  const { t } = useLanguage();
  const [now, setNow] = useState(() => new Date());
  const [serverOk, setServerOk] = useState<boolean | null>(null);

  const NAV_LINKS = [
    { to: "/dashboard", label: t.nav.dashboard },
    { to: "/map", label: t.nav.map },
    { to: "/report", label: t.nav.report },
    { to: "/admin", label: t.nav.admin },
  ];

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  /* poll the detection server's /health — its reachability is real state */
  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const res = await fetch(`${DETECTION_SERVER}/health`, {
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
  }, []);

  const live = Object.values(streams).filter((s) => s.status === "live").length;
  const alarms = Object.values(streams).filter((s) => s.alarm).length;
  const down = Object.values(streams).filter(
    (s) => s.status === "error" || s.status === "denied"
  ).length;

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b hairline bg-coal px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3 sm:gap-8">
        <Link to="/" className="flex shrink-0 items-center border-l-2 border-pine pl-3">
          <div>
            <div className="font-display text-xl font-black leading-none tracking-tight text-bone">
              FIREDETECT
            </div>
            <div className="micro-label mt-1 hidden sm:block">{t.topBar.tagline}</div>
          </div>
        </Link>

        <nav className="thin-scroll flex min-w-0 items-center gap-1 overflow-x-auto">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `shrink-0 px-2.5 py-1.5 text-[11px] font-bold tracking-[0.1em] transition-colors sm:px-3 ${
                  isActive
                    ? "bg-[var(--pine)]/10 text-pine"
                    : "text-ash hover:bg-soot hover:text-bone"
                }`
              }
            >
              {link.label.toUpperCase()}
            </NavLink>
          ))}
        </nav>
      </div>

      <LanguageToggle className="shrink-0 text-ash hover:text-bone md:hidden" />

      <div className="hidden items-center gap-8 md:flex">
        <Stat label={t.topBar.cameras} value={String(cameras.length).padStart(2, "0")} tone="var(--bone)" />
        <Stat
          label={t.topBar.live}
          value={String(live).padStart(2, "0")}
          tone={live ? "var(--phosphor)" : "var(--ash)"}
        />
        <Stat
          label={t.topBar.alarms}
          value={String(alarms).padStart(2, "0")}
          tone={alarms ? "var(--ember)" : "var(--ash)"}
        />
        <Stat
          label={t.topBar.offline}
          value={String(down).padStart(2, "0")}
          tone={down ? "var(--ember)" : "var(--ash)"}
        />

        <div className="h-8 w-px bg-[var(--hairline)]" />

        {/* detection server status + optional live toggle */}
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
              {t.topBar.detectionServer}
            </div>
            <div className="mt-0.5 text-xs font-semibold text-bone">
              {serverOk === null ? t.topBar.checking : serverOk ? t.topBar.connected : t.topBar.unreachable}
            </div>
          </div>
          {onDetectionToggle && (
            <Switch
              checked={detectionEnabled}
              onCheckedChange={onDetectionToggle}
              aria-label="Toggle fire detection"
            />
          )}
        </div>

        <div className="h-8 w-px bg-[var(--hairline)]" />

        <div className="text-right">
          <div className="micro-label">{t.topBar.zuluTime}</div>
          <div className="mt-0.5 text-sm font-semibold tabular-nums text-bone">
            {now.toISOString().slice(11, 19)}Z
          </div>
        </div>

        <div className="h-8 w-px bg-[var(--hairline)]" />

        <LanguageToggle className="text-ash hover:text-bone" />
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
