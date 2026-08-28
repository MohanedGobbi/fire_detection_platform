import type { StatusEntry } from "@/lib/statusLaw";

interface Props extends StatusEntry {
  pulse?: boolean;
  size?: number;
}

export function StatusSwatch({ color, label, shape, pulse, size = 8 }: Props) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={pulse ? "pyro-marker-alarm" : undefined}
        style={{
          width: size,
          height: size,
          background: color,
          borderRadius: shape === "diamond" ? 2 : "50%",
          transform: shape === "diamond" ? "rotate(45deg)" : undefined,
          boxShadow: "0 0 0 1px var(--hairline)",
          flexShrink: 0,
        }}
      />
      <span className="text-[10px] leading-tight text-ash">{label}</span>
    </div>
  );
}
