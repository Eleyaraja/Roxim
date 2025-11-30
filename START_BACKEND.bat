@echo off
REM One-click backend starter
REM Double-click this file from Windows Explorer!

cd avatar-backend

if not exist "venv\Scripts\python.exe" (
    echo First time setup...
    call setup.bat
)

echo Starting backend...
call start.bat
