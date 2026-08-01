#!/usr/bin/env python3
"""
PYROPHYTE detection server.

Cameras (webcams, drones, pole cams) are only frame sources — this server is
the single authority that processes frames and raises alarms.

Endpoints
---------
GET  /health                    -> {"ok": true, "detector": "...", "uptime_s": n}
POST /detect?camera_id=CAM-1    body: JPEG bytes
                                -> {"detections": [{x,y,w,h,confidence,label}],
                                    "alarm": bool, "detector": "..."}

Detector:
  * If server/models/best.pt exists and ultralytics is installed, a YOLOv8
    fire/smoke model is used (classes: fire, smoke; "other" is ignored).
  * Otherwise the previous classical heuristic detector is used.

Alarm authority:
  * Temporal persistence: >= ALARM_MIN_HITS fire frames inside
    ALARM_WINDOW_S per camera. Smoke alone never raises an alarm.

Swap-in point for other deep models: drop an ONNX/PT file in server/models/
and replace detect() with your inference — the HTTP contract stays identical.
"""

from __future__ import annotations

import argparse
import io
import json
import time
from collections import deque
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

import numpy as np
from PIL import Image

# --------------------------------------------------------------------------
# Configuration
# --------------------------------------------------------------------------

MAX_W = 256            # heuristic-only: frames are downscaled before analysis
ALARM_WINDOW_S = 8.0   # sliding window for temporal persistence
ALARM_MIN_HITS = 2     # fire-positive frames inside the window -> ALARM
MAX_HISTORY_S = 30.0   # prune per-camera history older than this

MODEL_PATH = Path(__file__).resolve().with_name("models") / "best.pt"
FIRE_CONF_THRESHOLD = 0.20
SMOKE_CONF_THRESHOLD = 0.30

# --------------------------------------------------------------------------
# Model loading
# --------------------------------------------------------------------------

_model = None
DETECTOR_NAME = "heuristic-hsv-v1"


def load_model():
    """Load the YOLO fire/smoke model if available."""
    global _model, DETECTOR_NAME
    if _model is not None:
        return
    if not MODEL_PATH.exists():
        return
    try:
        from ultralytics import YOLO

        _model = YOLO(str(MODEL_PATH), verbose=False)
        DETECTOR_NAME = "yolov8-fire-smoke"
        print(f"[pyrophyte] loaded model: {MODEL_PATH}")
    except Exception as e:
        print(f"[pyrophyte] failed to load {MODEL_PATH}: {e}; using heuristic fallback")


# --------------------------------------------------------------------------
# Detection
# --------------------------------------------------------------------------


def rgb_to_hsv(arr: np.ndarray):
    """Vectorized RGB->HSV. arr: HxWx3 float in [0,1]. Returns h,s,v in [0,1]."""
    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
    maxc = arr.max(-1)
    minc = arr.min(-1)
    v = maxc
    c = maxc - minc
    s = np.where(maxc > 0, c / np.maximum(maxc, 1e-6), 0.0)

    eps = np.maximum(c, 1e-6)
    rc = (maxc - r) / eps
    gc = (maxc - g) / eps
    bc = (maxc - b) / eps
    h = np.where(
        maxc == r,
        bc - gc,
        np.where(maxc == g, 2.0 + rc - bc, 4.0 + gc - rc),
    )
    h = (h / 6.0) % 1.0
    h = np.where(c <= 1e-6, 0.0, h)
    return h, s, v


def label_regions(mask: np.ndarray, label: str, min_frac: float, base_conf: float):
    """8-connected flood fill over a boolean mask -> normalized detections."""
    H, W = mask.shape
    visited = np.zeros_like(mask, dtype=bool)
    min_area = max(6, int(H * W * min_frac))
    out = []
    for y0 in range(H):
        for x0 in range(W):
            if not mask[y0, x0] or visited[y0, x0]:
                continue
            stack = [(y0, x0)]
            visited[y0, x0] = True
            xs, ys = [], []
            while stack:
                cy, cx = stack.pop()
                xs.append(cx)
                ys.append(cy)
                for dy in (-1, 0, 1):
                    for dx in (-1, 0, 1):
                        ny, nx = cy + dy, cx + dx
                        if (
                            0 <= ny < H
                            and 0 <= nx < W
                            and mask[ny, nx]
                            and not visited[ny, nx]
                        ):
                            visited[ny, nx] = True
                            stack.append((ny, nx))
            area = len(xs)
            if area < min_area:
                continue
            x1, x2 = min(xs), max(xs)
            y1, y2 = min(ys), max(ys)
            box_area = (x2 - x1 + 1) * (y2 - y1 + 1)
            fill = area / box_area
            size_score = min(1.0, area / (H * W * 0.04))
            conf = min(0.97, base_conf + 0.35 * size_score + 0.15 * fill)
            out.append(
                {
                    "x": round(x1 / W, 4),
                    "y": round(y1 / H, 4),
                    "w": round((x2 - x1 + 1) / W, 4),
                    "h": round((y2 - y1 + 1) / H, 4),
                    "confidence": round(conf, 2),
                    "label": label,
                }
            )
    out.sort(key=lambda d: d["confidence"], reverse=True)
    return out[:6]


def _detect_heuristic(jpeg_bytes: bytes):
    """Run the classical CV detector on one JPEG frame."""
    img = Image.open(io.BytesIO(jpeg_bytes)).convert("RGB")
    w, h = img.size
    if w > MAX_W:
        img = img.resize((MAX_W, max(1, round(h * MAX_W / w))), Image.BILINEAR)
    arr = np.asarray(img).astype(np.float32) / 255.0
    hh, ss, vv = rgb_to_hsv(arr)
    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]

    # Flame: warm hue, saturated, bright, and the classic R > G >= B ordering
    flame = (
        ((hh < 0.16) | (hh > 0.92))
        & (ss > 0.45)
        & (vv > 0.55)
        & (r > g + 0.04)
        & (g >= b * 0.8)
    )
    # Smoke: desaturated, neutral gray, mid-to-high brightness
    smoke = (
        (ss < 0.22)
        & (vv > 0.45)
        & (vv < 0.90)
        & (np.abs(r - g) < 0.05)
        & (np.abs(g - b) < 0.06)
    )
    # ignore smoke regions touching the very top of frame (usually sky)
    smoke[: max(1, arr.shape[0] // 8), :] = False

    detections = label_regions(flame, "fire", min_frac=0.002, base_conf=0.45)
    detections += label_regions(smoke, "smoke", min_frac=0.01, base_conf=0.30)
    detections.sort(key=lambda d: d["confidence"], reverse=True)
    return detections[:6]


def _detect_yolo(jpeg_bytes: bytes):
    """Run the YOLO fire/smoke model on one JPEG frame."""
    img = Image.open(io.BytesIO(jpeg_bytes)).convert("RGB")
    W, H = img.size
    results = _model(img, verbose=False)[0]
    boxes = results.boxes
    out = []
    if boxes is not None and len(boxes) > 0:
        xyxy = boxes.xyxy.cpu().numpy()
        confs = boxes.conf.cpu().numpy()
        clses = boxes.cls.cpu().numpy().astype(int)
        for (x1, y1, x2, y2), conf, cls in zip(xyxy, confs, clses):
            label = _model.names.get(int(cls), "unknown")
            if label == "other":
                continue
            min_conf = (
                FIRE_CONF_THRESHOLD if label == "fire" else SMOKE_CONF_THRESHOLD
            )
            if float(conf) < min_conf:
                continue
            out.append(
                {
                    "x": round(float(x1) / W, 4),
                    "y": round(float(y1) / H, 4),
                    "w": round((float(x2) - float(x1)) / W, 4),
                    "h": round((float(y2) - float(y1)) / H, 4),
                    "confidence": round(float(conf), 2),
                    "label": label,
                }
            )
    out.sort(key=lambda d: d["confidence"], reverse=True)
    return out[:10]


def detect(jpeg_bytes: bytes):
    """Run the configured detector on one JPEG frame."""
    if _model is not None:
        return _detect_yolo(jpeg_bytes)
    return _detect_heuristic(jpeg_bytes)


# --------------------------------------------------------------------------
# Alarm authority — temporal persistence per camera
# --------------------------------------------------------------------------

_history: dict[str, deque] = {}


def update_alarm(camera_id: str, fire_seen: bool) -> bool:
    now = time.time()
    q = _history.setdefault(camera_id, deque())
    q.append((now, fire_seen))
    while q and now - q[0][0] > MAX_HISTORY_S:
        q.popleft()
    window_hits = sum(1 for t, f in q if f and now - t <= ALARM_WINDOW_S)
    return window_hits >= ALARM_MIN_HITS


# --------------------------------------------------------------------------
# HTTP layer
# --------------------------------------------------------------------------

START = time.time()


class Handler(BaseHTTPRequestHandler):
    server_version = "PyrophyteDetect/1.0"

    # silence per-request logging
    def log_message(self, *_):
        pass

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def _json(self, code: int, payload: dict):
        body = json.dumps(payload).encode()
        self.send_response(code)
        self._cors()
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self):
        if urlparse(self.path).path == "/health":
            self._json(
                200,
                {
                    "ok": True,
                    "detector": DETECTOR_NAME,
                    "uptime_s": round(time.time() - START, 1),
                    "cameras_tracked": len(_history),
                },
            )
        else:
            self._json(404, {"error": "not found"})

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path != "/detect":
            self._json(404, {"error": "not found"})
            return
        camera_id = parse_qs(parsed.query).get("camera_id", ["unknown"])[0]
        try:
            length = int(self.headers.get("Content-Length", "0"))
            body = self.rfile.read(length)
            if not body:
                raise ValueError("empty body")
            detections = detect(body)
        except Exception as e:  # noqa: BLE001 - report any decode failure
            self._json(400, {"error": f"invalid frame: {e}"})
            return
        fire_seen = any(d["label"] == "fire" for d in detections)
        alarm = update_alarm(camera_id, fire_seen)
        self._json(
            200,
            {"detections": detections, "alarm": alarm, "detector": DETECTOR_NAME},
        )


def main():
    ap = argparse.ArgumentParser(description="PYROPHYTE detection server")
    ap.add_argument("--host", default="127.0.0.1")
    ap.add_argument("--port", type=int, default=8700)
    args = ap.parse_args()

    load_model()

    server = ThreadingHTTPServer((args.host, args.port), Handler)
    print(f"[pyrophyte] detection server on http://{args.host}:{args.port}")
    print(f"[pyrophyte] detector: {DETECTOR_NAME} — POST /detect?camera_id=<id>")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
