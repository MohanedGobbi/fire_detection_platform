/* Direction contract: see the HTML comment at the top of index.html's <body>.
   Hero note: the first viewport is now the Sylva "Living Green" 3D hero
   (public/landing-pages/inner-green-3d.html, from the open-source ThreeUI
   Community catalog, MIT-licensed) — customized with FireDetect's own copy,
   real live server/report stats, and real navigation; every "Sylva"/ThreeUI
   brand reference was removed from the copied file. Its fixed-pixel-offset
   layout can't safely mirror for RTL, so that one hero stays English-only;
   everything below it is fully bilingual. */
import { CAMERA_STATUS_LAW, REPORT_STATUS_LAW } from "@/lib/statusLaw";
import { StatusSwatch } from "@/components/StatusSwatch";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/hooks/useLanguage";
import { Link } from "react-router";
import { Bot, Camera, Flame, Map as MapIcon, UserRound, ArrowRight } from "lucide-react";

export default function Landing() {
  const { t, dir } = useLanguage();
  const arrow = dir === "rtl" ? "h-3.5 w-3.5 scale-x-[-1]" : "h-3.5 w-3.5";

  return (
    <div className="min-h-full bg-soot text-bone">
      <LanguageToggle className="fixed top-4 z-50 rtl:left-4 ltr:right-4 border border-white/25 bg-black/20 text-white backdrop-blur-sm hover:bg-black/35" />

      {/* ---------------------------------------------------------- hero */}
      <section id="hero" className="relative h-[100svh] min-h-[880px] w-full overflow-hidden bg-[#383b34]">
        <iframe
          src="/landing-pages/inner-green-3d.html"
          title="FireDetect — before it burns, we're watching"
          className="h-full w-full border-0"
          loading="eager"
        />
      </section>

      {/* ------------------------------------------------------ mechanism */}
      <section id="how-it-works" className="bg-soot py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6 sm:px-10">
          <div className="max-w-2xl border-b hairline pb-6">
            <h2 className="font-display text-3xl font-black tracking-tight text-bone sm:text-4xl">
              {t.works.title}
            </h2>
          </div>

          <div className="mt-10 grid gap-10 sm:grid-cols-3 sm:gap-0">
            <Module
              icon={<Camera className="h-6 w-6" strokeWidth={1.75} />}
              title={t.works.m1title}
              body={t.works.m1body}
              dir={dir}
            />
            <Module
              icon={
                <span className="flex items-center gap-1.5">
                  <Bot className="h-6 w-6" strokeWidth={1.75} />
                  <UserRound className="h-5 w-5" strokeWidth={1.75} />
                </span>
              }
              title={t.works.m2title}
              body={t.works.m2body}
              dir={dir}
            />
            <Module
              icon={<MapIcon className="h-6 w-6" strokeWidth={1.75} />}
              title={t.works.m3title}
              body={t.works.m3body}
              dir={dir}
              last
            />
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- status law */}
      <section className="bg-[var(--pine-deep)] py-20 text-white sm:py-24">
        <div className="mx-auto max-w-6xl px-6 sm:px-10">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-black tracking-tight sm:text-4xl">
              {t.status.title}
            </h2>
            <p className="mt-4 text-white/70">{t.status.body}</p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            <div className="border border-white/15 bg-white/[0.04] p-6">
              <div className="micro-label text-white/50">{t.status.cameraLabel}</div>
              <div className="mt-4 grid gap-3">
                {CAMERA_STATUS_LAW.map((entry, i) => (
                  <div key={entry.label} className="[&_span:last-child]:text-white/75">
                    <StatusSwatch
                      {...entry}
                      label={[t.status.cameraAlarm, t.status.cameraRecent, t.status.cameraClear][i]}
                      size={12}
                      pulse={i === 0}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="border border-white/15 bg-white/[0.04] p-6">
              <div className="micro-label text-white/50">{t.status.reportLabel}</div>
              <div className="mt-4 grid gap-3">
                {REPORT_STATUS_LAW.map((entry, i) => (
                  <div key={entry.label} className="[&_span:last-child]:text-white/75">
                    <StatusSwatch
                      {...entry}
                      label={[t.status.reportNew, t.status.reportAck, t.status.reportFalse][i]}
                      size={12}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ get started */}
      <section className="bg-[var(--danger-veryhigh)] py-20 text-white sm:py-28">
        <div className="mx-auto max-w-6xl px-6 sm:px-10">
          <h2 className="font-display text-3xl font-black tracking-tight sm:text-4xl">
            {t.start.title}
          </h2>
          <p className="mt-3 max-w-xl text-white/85">{t.start.body}</p>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <StepCard
              step="1"
              icon={<Camera className="h-5 w-5" strokeWidth={1.75} />}
              title={t.start.s1title}
              body={t.start.s1body}
              to="/dashboard"
              cta={t.start.s1cta}
              arrowClass={arrow}
            />
            <StepCard
              step="2"
              icon={<MapIcon className="h-5 w-5" strokeWidth={1.75} />}
              title={t.start.s2title}
              body={t.start.s2body}
              to="/map"
              cta={t.start.s2cta}
              arrowClass={arrow}
            />
            <StepCard
              step="3"
              icon={<Flame className="h-5 w-5" strokeWidth={1.75} />}
              title={t.start.s3title}
              body={t.start.s3body}
              to="/report"
              cta={t.start.s3cta}
              arrowClass={arrow}
            />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ footer */}
      <footer className="border-t border-white/10 bg-[var(--pine-deep)] py-10 text-white/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <div className="flex items-center gap-2.5">
            <span className="font-display text-sm font-black tracking-tight text-white">
              FIREDETECT
            </span>
            <span className="text-xs">{t.footer.tagline}</span>
          </div>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-bold tracking-[0.1em]">
            <Link to="/dashboard" className="hover:text-white">
              {t.nav.dashboard.toUpperCase()}
            </Link>
            <Link to="/map" className="hover:text-white">
              {t.nav.map.toUpperCase()}
            </Link>
            <Link to="/report" className="hover:text-white">
              {t.nav.report.toUpperCase()}
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function Module({
  icon,
  title,
  body,
  last,
  dir,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  last?: boolean;
  dir: "ltr" | "rtl";
}) {
  const divider = dir === "rtl" ? "sm:border-l" : "sm:border-r";
  const outerEdge = dir === "rtl" ? "first:sm:pr-0" : "first:sm:pl-0";
  return (
    <div className={`px-0 sm:px-8 ${!last ? `${divider} hairline` : ""} ${outerEdge}`}>
      <div className="text-pine">{icon}</div>
      <h3 className="mt-4 font-display text-lg font-black tracking-tight text-bone">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-ash">{body}</p>
    </div>
  );
}

function StepCard({
  step,
  icon,
  title,
  body,
  to,
  cta,
  arrowClass,
}: {
  step: string;
  icon: React.ReactNode;
  title: string;
  body: string;
  to: string;
  cta: string;
  arrowClass: string;
}) {
  return (
    <Link
      to={to}
      className="group flex flex-col border border-white/25 bg-white/[0.06] p-6 transition-colors hover:bg-white/[0.12]"
    >
      <div className="flex items-center justify-between">
        <span className="font-display text-2xl font-black text-white/40">{step}</span>
        {icon}
      </div>
      <h3 className="mt-4 font-display text-lg font-black tracking-tight">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-white/80">{body}</p>
      <div className="mt-5 flex items-center gap-1.5 text-[11px] font-bold tracking-[0.12em]">
        {cta.toUpperCase()}
        <ArrowRight className={`${arrowClass} transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5`} />
      </div>
    </Link>
  );
}
