import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { CameraConfig, StreamInfo } from "@/types/camera";

interface Props {
  cameras: CameraConfig[];
  streams: Record<string, StreamInfo>;
  onSelectCamera: (id: string) => void;
}

export function GlobalMap({ cameras, streams, onSelectCamera }: Props) {
  // Center map on the first camera with coordinates, or default to [20, 0]
  const centerCam = cameras.find((c) => c.lat !== undefined && c.lng !== undefined);
  const center: [number, number] = centerCam && centerCam.lat && centerCam.lng
    ? [centerCam.lat, centerCam.lng]
    : [20, 0];

  return (
    <div className="flex-1 w-full h-full relative z-0">
      <MapContainer
        center={center}
        zoom={3}
        style={{ width: "100%", height: "100%", background: "var(--soot)" }}
        zoomControl={false}
      >
        {/* Base Layer: Light Theme */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {cameras.map((cam) => {
          if (cam.lat === undefined || cam.lng === undefined) return null;
          
          const stream = streams[cam.id];
          const isAlarm = stream?.alarm;
          const isOffline = stream?.status === "error" || stream?.status === "denied";
          
          // Create a professional looking marker icon using L.divIcon
          // Highlight in red with a pulse if there's an alarm
          // Gray if offline, white/green if live and normal
          let markerColorClass = "bg-[var(--phosphor)]";
          let outerPulse = "";
          
          if (isAlarm) {
            markerColorClass = "bg-[var(--ember)]";
            outerPulse = "animate-ping opacity-75 bg-[var(--ember)]";
          } else if (isOffline || !stream || stream.status === "idle") {
            markerColorClass = "bg-[var(--ash)]";
          }

          const customIcon = L.divIcon({
            className: "custom-leaflet-icon",
            html: `
              <div class="relative flex items-center justify-center w-6 h-6">
                ${isAlarm ? `<span class="absolute inline-flex w-full h-full rounded-full ${outerPulse}"></span>` : ''}
                <span class="relative inline-flex rounded-full h-3 w-3 ${markerColorClass} shadow-[0_0_8px_rgba(0,0,0,0.5)] border border-[var(--coal)]"></span>
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          return (
            <Marker key={cam.id} position={[cam.lat, cam.lng]} icon={customIcon}>
              <Popup className="camera-popup" closeButton={false}>
                <div className="bg-coal text-bone p-3 rounded-sm border hairline min-w-[150px] shadow-xl">
                  <h4 className="font-display font-bold text-sm truncate mb-1">{cam.name}</h4>
                  <p className="text-xs text-ash mb-3 truncate">{cam.location || 'Unknown location'}</p>
                  
                  {isAlarm && (
                    <div className="bg-[var(--ember)]/10 border border-[var(--ember)]/30 text-[var(--ember)] text-[10px] uppercase tracking-wider font-bold py-1 px-2 rounded-sm mb-3 inline-block">
                      🔥 Fire Detected
                    </div>
                  )}

                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      onSelectCamera(cam.id);
                    }}
                    className="w-full text-center bg-primary text-white hover:opacity-85 transition-opacity text-[10px] uppercase font-semibold tracking-wider py-1.5 rounded-sm"
                  >
                    View Camera
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {/* Legend / Overlay info */}
      <div className="absolute bottom-6 left-6 z-[1000] pointer-events-none">
        <div className="bg-coal/90 border hairline backdrop-blur-md px-4 py-3 rounded-md shadow-2xl">
          <h3 className="text-bone font-display font-semibold text-sm mb-2">Camera Status</h3>
          
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--phosphor)] border border-coal"></span>
              <span className="text-xs text-bone">Online & Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex w-2.5 h-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--ember)] opacity-75"></span>
                <span className="relative inline-flex rounded-full w-2.5 h-2.5 bg-[var(--ember)] border border-coal"></span>
              </span>
              <span className="text-xs text-bone">Fire Detected</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--ash)] border border-coal"></span>
              <span className="text-xs text-bone">Offline / Idle</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
