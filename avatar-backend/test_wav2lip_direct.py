"""
Direct test of Wav2Lip to see what's happening
"""
import subprocess
import sys
from pathlib import Path

WAV2LIP_PATH = r"C:\Users\Eleyaraja R\Desktop\qnnect\Wav2Lip"
BACKEND_VENV = Path(__file__).parent / "venv" / "Scripts" / "python.exe"

# Find the most recent files in temp
temp_dir = Path(__file__).parent / "temp"
wav_files = list(temp_dir.glob("audio_*.wav"))
jpg_files = list(temp_dir.glob("image_*.jpg"))

if not wav_files or not jpg_files:
    print("ERROR: No test files found in temp folder")
    sys.exit(1)

# Use most recent files
test_audio = max(wav_files, key=lambda p: p.stat().st_mtime)
test_image = max(jpg_files, key=lambda p: p.stat().st_mtime)
output_file = Path(WAV2LIP_PATH) / "results" / "direct_test.mp4"

print(f"Python: {BACKEND_VENV}")
print(f"Wav2Lip: {WAV2LIP_PATH}")
print(f"Audio: {test_audio.name} ({test_audio.stat().st_size / 1024:.2f} KB)")
print(f"Image: {test_image.name} ({test_image.stat().st_size / 1024:.2f} KB)")
print(f"Output: {output_file}")
print()

cmd = [
    str(BACKEND_VENV),
    str(Path(WAV2LIP_PATH) / "inference.py"),
    "--checkpoint_path", str(Path(WAV2LIP_PATH) / "checkpoints" / "wav2lip_gan.pth"),
    "--face", str(test_image),
    "--audio", str(test_audio),
    "--outfile", str(output_file),
    "--fps", "25"
]

print("Running command:")
print(" ".join(cmd))
print()

result = subprocess.run(
    cmd,
    cwd=WAV2LIP_PATH,
    capture_output=False,  # Show output directly
    text=True
)

print()
print(f"Return code: {result.returncode}")
print(f"Output exists: {output_file.exists()}")

if output_file.exists():
    print(f"✅ SUCCESS! Video created: {output_file}")
    print(f"   Size: {output_file.stat().st_size / 1024:.2f} KB")
else:
    print("❌ FAILED: No output file created")
