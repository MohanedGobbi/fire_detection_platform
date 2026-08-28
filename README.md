# FireDetect — Early Wildfire Detection Platform

An early wildfire/fire detection platform for watch teams covering large
outdoor areas. Cameras (PC webcam, IP cameras, drones) are only frame sources
— a local detection server analyzes the frames and is the single authority
that raises fire alarms. A live map plots camera locations and alarm state
alongside public fire reports (`/report`), and a marketing landing page
(`/`) introduces the platform. See [PRODUCT.md](PRODUCT.md) for product
context.

## Run it

**1. Install Python deps** (one time):

```bash
pip install -r server/requirements.txt
```

**2. Download the fire/smoke model** (one time):

```bash
mkdir -p server/models
curl -L -o server/models/best.pt \
  https://huggingface.co/SalahALHaismawi/yolov26-fire-detection/resolve/main/best.pt
```

The detector automatically falls back to the classical heuristic if the model
is missing.

**3. Detection server** (terminal 1):

```bash
python server/detect_server.py --port 8700
# or double-click start-detection-server.bat
```

**4. Web console** (terminal 2):

```bash
npm install
npm run dev
```

Open `http://localhost:3000` for the landing page, or go straight to
`/dashboard`, click **ADD**, and choose **Webcam** to test with this PC's
camera. The top bar shows whether the detection server is connected; the
switch enables/disables analysis. `/map` shows camera + report locations
live; `/report` is the public, no-login fire-report form.

## Architecture

```
webcam / HLS / MJPEG camera ──► browser feed ──► JPEG frame every 800ms
                                                        │
                                                        ▼ POST /detect?camera_id=…
                                          server/detect_server.py (port 8700)
                                          · YOLOv8 fire/smoke model
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

## Swapping the model

`server/detect_server.py` loads `server/models/best.pt` with `ultralytics` if
available. To use a different YOLO checkpoint, replace that file. The HTTP
contract and alarm logic stay identical — the UI needs no changes.

## Camera notes

- **Webcam** works out of the box (browser permission required).
- **HLS** (`.m3u8`) plays via hls.js; most NVRs/IP cams can publish HLS.
- **MJPEG** plays via `<img>`. Detection of MJPEG feeds requires the camera to
  send CORS headers, otherwise the browser blocks frame reads (`AI: FRAME
  BLOCKED BY CORS`).
- **RTSP** cameras/drones need a bridge that republishes as HLS, e.g.
  [MediaMTX](https://github.com/bluenviron/mediamtx) — one config file, no code.

Camera configs persist in the browser's localStorage.
