import { useEffect, useRef } from "react";
import { DEMO_PHOTOS } from "@/lib/demoCameras";

/** Deterministic 0..1 hash so each demo camera gets a stable, distinct look. */
function seedFromId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return (h % 1000) / 1000;
}

/**
 * A showcase tile: a real still photo of the camera's actual location
 * (CC BY-SA, Wikimedia Commons — public/demo-cameras/CREDITS.md) with a
 * generated atmospheric overlay drawn on top — drifting light, a vignette,
 * faint sensor grain. No video file, no network request beyond the one
 * local image. Paired with the "DEMO FEED" source label in CameraFeed, so
 * it's never mistaken for a live camera image.
 */
export function DemoFeed({ seed }: { seed: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const photo = DEMO_PHOTOS[seed];

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const hue = 96 + seedFromId(seed) * 40; // 96–136: forest green range
    const phase = seedFromId(seed + "p") * Math.PI * 2;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let dpr = Math.min(2, window.devicePixelRatio || 1);
    let w = 0;
    let h = 0;

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = container.clientWidth;
      h = container.clientHeight;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const draw = (t: number) => {
      const drift = reduced ? 0 : t / 4000;
      ctx.clearRect(0, 0, w, h);

      // photo backdrop gets a light scrim only when there's no real photo —
      // otherwise this canvas is a pure overlay, the <img> is the base
      if (!photo) {
        const sky = ctx.createLinearGradient(0, 0, 0, h);
        sky.addColorStop(0, `hsl(${hue - 8} 28% 22%)`);
        sky.addColorStop(0.45, `hsl(${hue} 32% 16%)`);
        sky.addColorStop(1, `hsl(${hue + 4} 38% 9%)`);
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, w, h);
      }

      // two soft drifting light pools (dappled canopy light)
      for (let i = 0; i < 2; i++) {
        const cx = w * (0.3 + 0.4 * i) + Math.sin(drift + phase + i) * w * 0.08;
        const cy = h * 0.4 + Math.cos(drift * 0.8 + phase + i) * h * 0.15;
        const r = Math.max(w, h) * 0.35;
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        glow.addColorStop(0, `hsla(${hue + 10} 45% 55% / ${photo ? 0.08 : 0.16})`);
        glow.addColorStop(1, `hsla(${hue + 10} 45% 55% / 0)`);
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, w, h);
      }

      // vignette for a lens-like feel
      const vg = ctx.createRadialGradient(
        w / 2,
        h / 2,
        Math.max(w, h) * 0.25,
        w / 2,
        h / 2,
        Math.max(w, h) * 0.72
      );
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, `rgba(0,0,0,${photo ? 0.3 : 0.35})`);
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, w, h);

      // faint sensor grain
      ctx.globalAlpha = photo ? 0.05 : 0.04;
      ctx.fillStyle = "#fff";
      for (let i = 0; i < 60; i++) {
        const gx = (Math.sin(i * 12.9898 + (reduced ? 0 : t * 0.0002)) * 43758.5453) % 1;
        const gy = (Math.sin(i * 78.233 + (reduced ? 0 : t * 0.0002)) * 43758.5453) % 1;
        ctx.fillRect(Math.abs(gx) * w, Math.abs(gy) * h, 1.4, 1.4);
      }
      ctx.globalAlpha = 1;

      if (!reduced) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [seed, photo]);

  return (
    <div className="relative h-full w-full">
      {photo && (
        <img
          src={photo}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
      )}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
    </div>
  );
}
