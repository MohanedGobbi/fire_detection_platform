import { useMemo, useState } from "react";
import { Link } from "react-router";
import { TopBar } from "@/components/TopBar";
import { StatusSwatch } from "@/components/StatusSwatch";
import { useCameras } from "@/hooks/useCameras";
import { reportPhotoUrl, useReports } from "@/hooks/useReports";
import { useLanguage } from "@/hooks/useLanguage";
import type { Dictionary, Lang } from "@/lib/languageData";
import type { FireReport, ReportStatus } from "@/types/report";
import { REPORT_STATUS_COLOR } from "@/lib/statusLaw";
import { ImageOff, MapPin, Phone } from "lucide-react";

type Filter = "all" | ReportStatus;

function formatTime(ms: number, lang: Lang) {
  return new Date(ms).toLocaleString(lang === "ar" ? "ar" : "en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Admin() {
  const { t, lang } = useLanguage();
  const { cameras, streams } = useCameras();
  const { reports, loaded, setStatus } = useReports();
  const [filter, setFilter] = useState<Filter>("all");

  const FILTERS: { key: Filter; label: string }[] = [
    { key: "all", label: t.admin.filterAll },
    { key: "new", label: t.admin.filterNew },
    { key: "acknowledged", label: t.admin.filterAck },
    { key: "false_alarm", label: t.admin.filterFalse },
  ];

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: reports.length, new: 0, acknowledged: 0, false_alarm: 0 };
    for (const r of reports) c[r.status]++;
    return c;
  }, [reports]);

  const visible = filter === "all" ? reports : reports.filter((r) => r.status === filter);

  return (
    <div className="flex h-full flex-col bg-soot text-bone">
      <TopBar cameras={cameras} streams={streams} />

      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-6 py-8 sm:px-10">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b hairline pb-5">
            <div>
              <h1 className="font-display text-2xl font-black tracking-tight text-bone">
                {t.admin.title}
              </h1>
              <p className="mt-1 text-sm text-ash">
                {t.admin.subtitle}
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 text-[11px] font-bold tracking-[0.1em] transition-colors ${
                  filter === f.key
                    ? "bg-[var(--pine)]/10 text-pine"
                    : "text-ash hover:bg-coal hover:text-bone"
                }`}
              >
                {f.label.toUpperCase()} · {counts[f.key]}
              </button>
            ))}
          </div>

          <div className="mt-6">
            {!loaded ? (
              <p className="py-16 text-center micro-label">{t.admin.loading}</p>
            ) : visible.length === 0 ? (
              <div className="border hairline bg-coal px-6 py-16 text-center">
                <p className="text-sm text-ash">
                  {reports.length === 0 ? t.admin.noneYet : t.admin.noneMatch}
                </p>
                {reports.length === 0 && (
                  <Link
                    to="/report"
                    className="btn-plate mt-5 inline-flex bg-primary text-white hover:opacity-90"
                  >
                    {t.admin.openForm}
                  </Link>
                )}
              </div>
            ) : (
              <ul className="grid gap-3">
                {visible.map((r) => (
                  <ReportRow key={r.id} report={r} onSetStatus={setStatus} t={t} lang={lang} />
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportRow({
  report,
  onSetStatus,
  t,
  lang,
}: {
  report: FireReport;
  onSetStatus: (id: string, status: ReportStatus) => void;
  t: Dictionary;
  lang: Lang;
}) {
  const photo = reportPhotoUrl(report);

  return (
    <li className="flex flex-col gap-4 border hairline bg-coal p-4 sm:flex-row">
      <div className="h-28 w-full shrink-0 overflow-hidden border hairline bg-soot sm:h-24 sm:w-32">
        {photo ? (
          <img src={photo} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ash">
            <ImageOff className="h-5 w-5" strokeWidth={1.5} />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <StatusSwatch
            color={REPORT_STATUS_COLOR[report.status]}
            label={t.common.reportStatusLabel[report.status]}
            shape="diamond"
            pulse={report.status === "new"}
          />
          <span className="text-[10px] tabular-nums text-ash">{formatTime(report.createdAt, lang)}</span>
        </div>

        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-bone">
          {report.description}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-ash">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {report.lat.toFixed(4)}, {report.lng.toFixed(4)}
          </span>
          {report.contact && (
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {report.contact}
            </span>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {(
            [
              ["acknowledged", t.common.acknowledge],
              ["false_alarm", t.common.falseAlarm],
              ["new", t.common.reset],
            ] as const
          ).map(([status, label]) => (
            <button
              key={status}
              onClick={() => onSetStatus(report.id, status)}
              disabled={status === report.status}
              className="border hairline px-3 py-1.5 text-[10px] font-bold tracking-[0.1em] text-bone transition-colors hover:bg-soot disabled:cursor-default disabled:bg-soot disabled:text-ash disabled:opacity-60"
            >
              {label.toUpperCase()}
            </button>
          ))}
          <Link
            to="/map"
            className="ml-auto px-3 py-1.5 text-[10px] font-bold tracking-[0.1em] text-ash transition-colors hover:text-bone"
          >
            {t.admin.viewOnMap}
          </Link>
        </div>
      </div>
    </li>
  );
}
