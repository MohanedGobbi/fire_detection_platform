import { useState } from "react";
import { CameraFeed } from "@/components/CameraFeed";
import { CameraDialog } from "@/components/CameraDialog";
import { CameraRail } from "@/components/CameraRail";
import { TopBar } from "@/components/TopBar";
import { CameraDetailPanel, EventLog } from "@/components/StatusPanels";
import { useCameras } from "@/hooks/useCameras";
import { useLanguage } from "@/hooks/useLanguage";
import { DETECTION_SERVER } from "@/lib/config";
import { localizeCamera } from "@/lib/demoCameras";
import type { CameraConfig, DetectionSettings } from "@/types/camera";
import { Plus, Sparkles } from "lucide-react";

export default function Dashboard() {
  const { t, lang } = useLanguage();
  const {
    cameras: rawCameras,
    streams,
    events,
    addCamera,
    updateCamera,
    removeCamera,
    loadDemoCameras,
    reportStream,
  } = useCameras();
  const cameras = rawCameras.map((c) => localizeCamera(c, lang));

  const [selectedId, setSelectedId] = useState<string>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CameraConfig | null>(null);
  const [detectionEnabled, setDetectionEnabled] = useState(true);

  const detection: DetectionSettings = {
    enabled: detectionEnabled,
    serverUrl: DETECTION_SERVER,
  };

  // default to the first camera so a populated wall shows immediately,
  // without forcing a click before anything renders
  const selected = cameras.find((c) => c.id === selectedId) ?? cameras[0];
  const others = cameras.filter((c) => c.id !== selected?.id);

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (cam: CameraConfig) => {
    // always edit the raw (untranslated) record — a localized display copy
    // must never round-trip back into storage as the "real" name/location
    setEditing(rawCameras.find((c) => c.id === cam.id) ?? cam);
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
                    {t.dashboard.primaryFeed} — {selected.name}
                  </span>
                  <button
                    onClick={() => openEdit(selected)}
                    className="text-[10px] font-semibold tracking-[0.14em] text-ash transition-colors hover:text-bone"
                  >
                    {t.dashboard.configure}
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
                        className="group relative overflow-hidden rounded-sm border hairline bg-coal text-left transition-colors hover:border-[var(--pine)]/50"
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
                    {t.dashboard.addMoreCameras}
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <div className="max-w-sm text-center">
                <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center border hairline bg-coal">
                  <Plus className="h-5 w-5 text-bone" />
                </div>
                <h2 className="font-display text-2xl font-black tracking-tight text-bone">
                  {t.dashboard.noCameraSelectedTitle}
                </h2>
                <p className="mx-auto mt-3 text-sm leading-relaxed text-ash">
                  {t.dashboard.noCameraSelectedBody}
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button onClick={openAdd} className="btn-plate bg-primary text-white hover:opacity-90">
                    {t.dashboard.addCameraCta}
                  </button>
                  <button
                    onClick={loadDemoCameras}
                    className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.12em] text-ash transition-colors hover:text-bone"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    {t.dashboard.loadDemoCameras}
                  </button>
                </div>
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
