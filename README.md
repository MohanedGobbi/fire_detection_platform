# PYROPHYTE — Fire Detection Platform

A fire-watch camera platform. Cameras (PC webcam, IP cameras, drones) are only
frame sources — a local detection server analyzes the frames and is the single
authority that raises fire alarms.

## Run it

**1. Detection server** (terminal 1):

```bash
python server/detect_server.py --port 8700
# or double-click start-detection-server.bat
```

**2. Web console** (terminal 2):

```bash
npm install
npm run dev
```

Open the console, click **ADD**, choose **Webcam** to test with this PC's
camera. The top bar shows whether the detection server is connected; the
switch enables/disables analysis.

## Architecture

```
webcam / HLS / MJPEG camera ──► browser feed ──► JPEG frame every 800ms
                                                        │
                                                        ▼ POST /detect?camera_id=…
                                          server/detect_server.py (port 8700)
                                          · HSV flame color model (R>G>B rule)
                                          · smoke region analysis
                                          · temporal persistence: ≥2 fire frames
                                            in 8s per camera ⇒ ALARM
                                                        │
                                                        ▼ JSON {detections, alarm}
                                          UI draws boxes, raises the alarm,
                                          logs the event
```

## HTTP contract

| Endpoint | Description |
| --- | --- |
| `GET /health` | `{"ok", "detector", "uptime_s", "cameras_tracked"}` |
| `POST /detect?camera_id=<id>` | body: JPEG → `{"detections": [{x,y,w,h,confidence,label}], "alarm": bool}` |

Coordinates are normalized `[0,1]`. `label` is `fire` or `smoke`. Only `fire`
contributes to alarms.

## Swapping in a deep model

Detector v1 is a classical CV heuristic — real, but tuned for sensitivity, not
precision. To use a trained model (e.g. YOLO fire/smoke weights), drop an ONNX
file in `server/models/` and replace `detect()` in
`server/detect_server.py` with ONNX Runtime inference. The HTTP contract and
the alarm logic stay identical — the UI needs no changes.

## Camera notes

- **Webcam** works out of the box (browser permission required).
- **HLS** (`.m3u8`) plays via hls.js; most NVRs/IP cams can publish HLS.
- **MJPEG** plays via `<img>`. Detection of MJPEG feeds requires the camera to
  send CORS headers, otherwise the browser blocks frame reads (`AI: FRAME
  BLOCKED BY CORS`).
- **RTSP** cameras/drones need a bridge that republishes as HLS, e.g.
  [MediaMTX](https://github.com/bluenviron/mediamtx) — one config file, no code.

Camera configs persist in the browser's localStorage.
