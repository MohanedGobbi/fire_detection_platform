@echo off
REM PYROPHYTE detection server — cameras only send frames; this server
REM analyzes them and is the single authority that raises fire alarms.
REM Requires: pip install -r server/requirements.txt
REM Place the YOLO checkpoint at server/models/best.pt (see README).
REM Listens on http://127.0.0.1:8700
py "%~dp0server\detect_server.py" --port 8700
pause
