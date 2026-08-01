import { useState } from "react";
import { CameraFeed } from "@/components/CameraFeed";
import { CameraDialog } from "@/components/CameraDialog";
import { CameraRail } from "@/components/CameraRail";
import { TopBar } from "@/components/TopBar";
import { CameraDetailPanel, EventLog } from "@/components/StatusPanels";
import { useCameras } from "@/hooks/useCameras";
import type { CameraConfig, DetectionSettings } from "@/types/camera";
import { Plus } from "lucide-react";

const DETECTION_SERVER = "http://127.0.0.1:8700";

export default function Home() {
  const {
    cameras,
    streams,
    events,
    addCamera,
    updateCamera,
    removeCamera,
    reportStream,
  } = useCameras();

  const [selectedId, setSelectedId] = useState<string>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CameraConfig | null>(null);
  const [detectionEnabled, setDetectionEnabled] = useState(true);

  const detection: DetectionSettings = {
    enabled: detectionEnabled,
    serverUrl: DETECTION_SERVER,
  };

  const selected = cameras.find((c) => c.id === selectedId);
  const others = cameras.filter((c) => c.id !== selected?.id);

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (cam: CameraConfig) => {
    setEditing(cam);
    setDialogOpen(true);
  };

  const handleSubmit = (cfg: Omit<CameraConfig, "id" | "createdAt">) => {
    if (editing) {
      updateCamera(editing.id, cfg);
    } else {
      const cam = addCamera(cfg);
      setSelectedId(cam.id);
    }
  };

  const handleRemove = (id: string) => {
    removeCamera(id);
    if (selectedId === id) setSelectedId(undefined);
  };

  return (
    <div className="flex h-full flex-col bg-soot text-bone">
      <TopBar
        cameras={cameras}
        streams={streams}
        detectionEnabled={detectionEnabled}
        onDetectionToggle={setDetectionEnabled}
        serverUrl={DETECTION_SERVER}
      />

      <div className="flex min-h-0 flex-1">
        <CameraRail
          cameras={cameras}
          streams={streams}
          selectedId={selected?.id}
          onSelect={setSelectedId}
          onAdd={openAdd}
          onEdit={openEdit}
          onRemove={handleRemove}
        />

        {/* main stage */}
        <main className="flex min-w-0 flex-1 flex-col bg-soot">
          {selected ? (
            <>
              <div className="border-b hairline bg-coal">
                <div className="flex items-center justify-between px-4 py-2">
                  <span className="micro-label">
                    Primary Feed — {selected.name}
                  </span>
                  <button
                    onClick={() => openEdit(selected)}
                    className="text-[10px] font-semibold tracking-[0.14em] text-ash transition-colors hover:text-bone"
                  >
                    CONFIGURE
                  </button>
                </div>
                <CameraFeed
                  camera={selected}
                  detection={detection}
                  large
                  onStream={reportStream}
                />
              </div>

              <div className="thin-scroll min-h-0 flex-1 overflow-y-auto p-3">
                {others.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
                    {others.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedId(c.id)}
                        className="group relative overflow-hidden rounded-sm border hairline bg-coal text-left transition-colors hover:border-[var(--indigo)]/50"
                      >
                        <CameraFeed
                          camera={c}
                          detection={detection}
                          onStream={reportStream}
                        />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="px-2 py-4 text-xs text-ash">
                    Add more cameras to build out the monitoring wall.
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <div className="max-w-sm text-center">
                <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-md border hairline bg-coal">
                  <Plus className="h-5 w-5 text-bone" />
                </div>
                <h2 className="font-display text-2xl font-extrabold tracking-tight text-bone">
                  No camera selected
                </h2>
                <p className="mx-auto mt-3 text-sm leading-relaxed text-ash">
                  Add your first camera — this PC's webcam works out of the box
                  for testing. Frames are analyzed by the detection server,
                  which alone raises fire alarms.
                </p>
                <button
                  onClick={openAdd}
                  className="mt-6 rounded-sm bg-primary px-5 py-2.5 text-[11px] font-semibold tracking-[0.14em] text-white transition-opacity hover:opacity-85"
                >
                  ADD CAMERA
                </button>
              </div>
            </div>
          )}
        </main>

        {/* right rail */}
        <aside className="flex w-80 shrink-0 flex-col border-l hairline bg-coal">
          <CameraDetailPanel
            camera={selected}
            stream={selected ? streams[selected.id] : undefined}
          />
          <EventLog events={events} />
        </aside>
      </div>

      <CameraDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
