@echo off
echo ========================================
echo Wav2Lip Video Generator Test
echo ========================================
echo.

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install requests if needed
pip install requests pyttsx3 --quiet

REM Run test script
python test_generator.py

pause
