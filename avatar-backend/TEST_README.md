# Wav2Lip Backend Testing Guide

## Quick Start

### 1. Make sure backend is running
```powershell
cd avatar-backend
.\venv\Scripts\activate
python app.py
```

You should see:
```
INFO:__main__:Starting Wav2Lip Backend
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 2. Test the backend health
Open a new PowerShell window:
```powershell
curl http://localhost:8000/health
```

Should return:
```json
{
  "status": "healthy",
  "mode": "Wav2Lip",
  "device": "cpu",
  "has_torch": true,
  "model_loaded": true,
  "wav2lip_exists": true,
  "checkpoint_exists": true
}
```

## Testing Video Generation

### Option 1: Interactive Test (Recommended)
```powershell
cd avatar-backend
.\venv\Scripts\activate
python test_generator.py
```

This will:
1. Check backend health
2. Let you choose to use your own files or generate test audio
3. Generate a talking head video
4. Save it as `test_output.mp4`

### Option 2: Quick Test (Command Line)
```powershell
cd avatar-backend
.\venv\Scripts\activate
python quick_test.py path\to\audio.wav path\to\image.jpg
```

Example:
```powershell
python quick_test.py test_audio.wav avatar.jpg
```

This generates `quick_test_output.mp4` immediately.

### Option 3: Batch File (Windows)
```powershell
cd avatar-backend
.\test.bat
```

## Preparing Test Files

### Audio File (.wav)
- Must be WAV format
- Any length (shorter is faster for testing)
- You can use online TTS services or record your own

### Image File (.jpg)
- Must be JPG/JPEG format
- Should contain a clear face
- Recommended: 512x512 or larger
- Place in `avatar-backend/` folder

## Example Test Files

Create a test audio using Python:
```python
import pyttsx3

engine = pyttsx3.init()
engine.save_to_file("Hello, this is a test", "test_audio.wav")
engine.runAndWait()
```

Or download a sample:
- Audio: Use any TTS service (Google TTS, etc.)
- Image: Use any portrait photo

## Troubleshooting

### Backend not responding
```
❌ Backend not available
```
**Solution:** Make sure backend is running on port 8000

### Wav2Lip not found
```json
{
  "wav2lip_exists": false
}
```
**Solution:** Check that Wav2Lip folder exists at:
```
C:\Users\Eleyaraja R\Desktop\qnnect\Wav2Lip
```

### Checkpoint not found
```json
{
  "checkpoint_exists": false
}
```
**Solution:** Download wav2lip_gan.pth and place at:
```
C:\Users\Eleyaraja R\Desktop\qnnect\Wav2Lip\checkpoints\wav2lip_gan.pth
```

Download from: https://github.com/Rudrabha/Wav2Lip

### Video generation fails
Check the backend logs for detailed error messages.

Common issues:
- Missing Python dependencies in Wav2Lip
- Incorrect file formats
- Insufficient disk space

## Expected Output

Successful generation:
```
🔍 Testing backend health...
✅ Backend is healthy!

🎬 Generating video...
   Audio: test_audio.wav
   Image: avatar.jpg
📤 Uploading to backend...
✅ Video generated successfully!
💾 Video saved to: test_output.mp4
   Size: 1234.56 KB
```

The output video will show the face from your image speaking with lip movements synchronized to your audio!

## Next Steps

Once testing works:
1. Restart your Next.js frontend
2. The interview should now work with video avatars
3. The avatar will generate real-time talking head videos during the interview
