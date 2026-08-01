@echo off
REM PYROPHYTE detection server — cameras only send frames; this server
REM analyzes them and is the single authority that raises fire alarms.
REM Requires: Python with Pillow + numpy. Listens on http://127.0.0.1:8700
python "%~dp0server\detect_server.py" --port 8700
pause
