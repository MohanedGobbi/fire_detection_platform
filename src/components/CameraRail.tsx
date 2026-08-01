import type { CameraConfig, StreamInfo } from "@/types/camera";
import { SOURCE_LABEL } from "@/types/camera";
import { Camera, Globe, Pencil, Plus, Trash2, Video } from "lucide-react";

const TYPE_ICON = { webcam: Camera, hls: Globe, mjpeg: Video } as const;

const DOT: Record<string, string> = {
  idle: "var(--ash)",
  connecting: "var(--amber)",
  live: "var(--phosphor)",
  error: "var(--ember)",
  denied: "var(--ember)",
};

interface Props {
  cameras: CameraConfig[];
  streams: Record<string, StreamInfo>;
  selectedId?: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onEdit: (cam: CameraConfig) => void;
  onRemove: (id: string) => void;
}

export function CameraRail({
  cameras,
  streams,
  selectedId,
  onSelect,
  onAdd,
  onEdit,
  onRemove,
}: Props) {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r hairline bg-coal">
      <div className="flex items-center justify-between border-b hairline px-4 py-3">
        <span className="micro-label">Cameras · {cameras.length}</span>
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 rounded-sm bg-primary px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.12em] text-white transition-opacity hover:opacity-85"
        >
          <Plus className="h-3 w-3" />
          ADD
        </button>
      </div>

      <div className="thin-scroll flex-1 overflow-y-auto">
        {cameras.length === 0 && (
          <div className="px-6 py-10 text-center">
            <p className="text-xs leading-relaxed text-ash">
              No cameras configured.
              <br />
              Add your PC webcam to test, or connect
              <br />
              an HLS/MJPEG camera.
            </p>
          </div>
        )}
        {cameras.map((c) => {
          const info = streams[c.id];
          const status = info?.status ?? "idle";
          const alarm = info?.alarm ?? false;
          const Icon = TYPE_ICON[c.type];
          const active = c.id === selectedId;
          return (
            <div
              key={c.id}
              className={`group relative border-b hairline ${
                active ? "bg-soot" : "hover:bg-soot/60"
              }`}
            >
              <button
                onClick={() => onSelect(c.id)}
                className="flex w-full items-start gap-3 px-4 py-3 text-left"
              >
                <span
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                  style={{ background: alarm ? "var(--ember)" : DOT[status] }}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-[13px] font-semibold text-bone">
                      {c.name}
                    </span>
                    <Icon className="h-3.5 w-3.5 shrink-0 text-ash" />
                  </span>
                  <span className="mt-1 flex items-center justify-between text-[11px] text-ash">
                    <span>{SOURCE_LABEL[c.type]}</span>
                    {alarm ? (
                      <span className="font-bold tracking-[0.12em] text-ember">
                        ALARM
                      </span>
                    ) : (
                      <span
                        className="tracking-[0.1em]"
                        style={{ color: DOT[status] }}
                      >
                        {status.toUpperCase()}
                      </span>
                    )}
                  </span>
                </span>
              </button>
              {/* row actions */}
              <span className="absolute right-3 top-3 hidden gap-1 group-hover:flex">
                <button
                  onClick={() => onEdit(c)}
                  className="rounded-sm border hairline bg-coal p-1.5 text-ash hover:text-bone"
                  title="Configure"
                >
                  <Pencil className="h-3 w-3" />
                </button>
                <button
                  onClick={() => onRemove(c.id)}
                  className="rounded-sm border hairline bg-coal p-1.5 text-ash hover:text-ember"
                  title="Remove"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </span>
              {active && (
                <span className="absolute left-0 top-0 h-full w-0.5 bg-[var(--indigo)]" />
              )}
            </div>
          );
        })}
      </div>

      <div className="border-t hairline px-4 py-3 text-[10px] leading-relaxed text-ash">
        Detection runs on the server.
        <br />
        Cameras only supply frames.
      </div>
    </aside>
  );
}
