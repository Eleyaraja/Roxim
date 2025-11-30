"""
Wav2Lip Avatar Backend - GPU Optimized
"""
import os
import sys
import io
import subprocess
from pathlib import Path
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import logging

WAV2LIP_PATH = r"C:\Users\Eleyaraja R\Desktop\qnnect\Wav2Lip"

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).parent
TEMP_DIR = BASE_DIR / "temp"
TEMP_DIR.mkdir(exist_ok=True)

@app.get("/")
async def root():
    return {"status": "running", "model": "Wav2Lip"}

@app.get("/health")
async def health():
    wav2lip_exists = os.path.exists(WAV2LIP_PATH)
    checkpoint_path = os.path.join(WAV2LIP_PATH, "checkpoints", "wav2lip_gan.pth")
    checkpoint_exists = os.path.exists(checkpoint_path)
    
    is_ready = wav2lip_exists and checkpoint_exists
    
    return {
        "status": "healthy" if is_ready else "not_ready",
        "mode": "Wav2Lip",
        "device": "cuda",
        "has_torch": True,
        "model_loaded": is_ready,
        "wav2lip_exists": wav2lip_exists,
        "checkpoint_exists": checkpoint_exists
    }

@app.post("/generate-talking-head")
async def generate(audio: UploadFile, image: UploadFile):
    audio_temp = None
    audio_wav = None
    image_path = None
    generated_video = None
    
    try:
        logger.info("Generating talking head")
        
        # Create unique filenames
        gen_id = os.urandom(4).hex()
        audio_ext = os.path.splitext(audio.filename)[1] or ".webm"
        
        audio_temp = TEMP_DIR / f"audio_{gen_id}{audio_ext}"
        audio_wav = TEMP_DIR / f"audio_{gen_id}.wav"
        image_path = TEMP_DIR / f"image_{gen_id}.jpg"
        
        # Save uploaded files
        logger.info(f"Saving uploaded files...")
        with open(audio_temp, "wb") as f:
            f.write(await audio.read())
        with open(image_path, "wb") as f:
            f.write(await image.read())
        
        # Resize and optimize image
        from PIL import Image
        img = Image.open(image_path)
        original_size = img.size
        
        # Force resize to 512x512 max
        max_size = 512
        if img.size[0] > max_size or img.size[1] > max_size:
            img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
            logger.info(f"Resized image: {original_size} -> {img.size}")
        
        # Convert to RGB and save optimized
        img = img.convert('RGB')
        img.save(image_path, "JPEG", quality=85, optimize=True)
        
        logger.info(f"Audio: {audio_temp.name} ({audio_temp.stat().st_size / 1024:.2f} KB)")
        logger.info(f"Image: {image_path.name} ({image_path.stat().st_size / 1024:.2f} KB)")
        
        # Convert audio to WAV format using ffmpeg
        logger.info("Converting audio to WAV format...")
        ffmpeg_cmd = [
            "ffmpeg", "-y", "-i", str(audio_temp),
            "-ar", "16000",  # 16kHz sample rate
            "-ac", "1",      # Mono
            "-f", "wav",     # WAV format
            str(audio_wav)
        ]
        
        result = subprocess.run(ffmpeg_cmd, capture_output=True, text=True)
        if result.returncode != 0:
            logger.error(f"FFmpeg error: {result.stderr}")
            raise HTTPException(500, f"Audio conversion failed: {result.stderr}")
        
        logger.info(f"✓ Audio converted: {audio_wav.stat().st_size} bytes")
        
        # Wav2Lip saves output to its results folder
        wav2lip_results_dir = Path(WAV2LIP_PATH) / "results"
        wav2lip_results_dir.mkdir(exist_ok=True)
        
        # Output with absolute path
        output_filename = str(wav2lip_results_dir / f"result_{gen_id}.mp4")
        
        # Verify checkpoint exists
        checkpoint_path = os.path.join(WAV2LIP_PATH, "checkpoints", "wav2lip_gan.pth")
        if not os.path.exists(checkpoint_path):
            raise HTTPException(500, f"Checkpoint not found: {checkpoint_path}")
        
        # Use the backend venv Python (which has all dependencies installed)
        backend_venv_python = Path(__file__).parent / "venv" / "Scripts" / "python.exe"
        python_exe = str(backend_venv_python) if backend_venv_python.exists() else "python"
        
        logger.info(f"Using Python: {python_exe}")
        logger.info(f"Checkpoint: {checkpoint_path}")
        logger.info(f"Audio file: {audio_wav}")
        logger.info(f"Image file: {image_path}")
        logger.info(f"Output file: {output_filename}")
        
        # Set environment variable to force CUDA
        env = os.environ.copy()
        env['CUDA_VISIBLE_DEVICES'] = '0'  # Force use of first GPU
        
        # Run Wav2Lip with GPU optimization
        cmd = [
            python_exe,
            os.path.join(WAV2LIP_PATH, "inference.py"),
            "--checkpoint_path", os.path.join(WAV2LIP_PATH, "checkpoints", "wav2lip_gan.pth"),
            "--face", str(image_path),
            "--audio", str(audio_wav),
            "--outfile", output_filename,
            "--fps", "25",
            "--pads", "0", "10", "0", "0",
            "--face_det_batch_size", "2",   # Very small for 4GB VRAM
            "--wav2lip_batch_size", "16",  # Very small for memory safety
            "--resize_factor", "2"          # Downscale by 2x to save memory
        ]
        
        logger.info("Running Wav2Lip inference on GPU...")
        logger.info(f"Command: {' '.join(cmd)}")
        
        result = subprocess.run(
            cmd, 
            capture_output=True, 
            text=True, 
            cwd=WAV2LIP_PATH,
            env=env,  # Pass environment with CUDA settings
            timeout=300  # 5 minute timeout
        )
        
        # Always log output for debugging
        logger.info("=== Wav2Lip Output ===")
        if result.stdout:
            logger.info(f"STDOUT:\n{result.stdout}")
        if result.stderr:
            logger.info(f"STDERR:\n{result.stderr}")
        logger.info("======================")
        
        if result.returncode != 0:
            logger.error(f"Wav2Lip failed with return code {result.returncode}")
            raise HTTPException(500, f"Wav2Lip failed: {result.stderr}")
        
        logger.info("✓ Wav2Lip process completed")
        
        # Find the generated video
        expected_output = Path(output_filename)
        
        if not expected_output.exists():
            logger.warning(f"Expected output not found: {expected_output}")
            logger.info("Searching for generated video in results folder...")
            
            mp4_files = list(wav2lip_results_dir.glob("*.mp4"))
            if mp4_files:
                generated_video = max(mp4_files, key=lambda p: p.stat().st_mtime)
                logger.info(f"Found video: {generated_video.name}")
            else:
                logger.error(f"No video files found in {wav2lip_results_dir}")
                raise HTTPException(500, "Video generation completed but output file not found")
        else:
            generated_video = expected_output
            logger.info(f"✓ Video found: {generated_video.name}")
        
        # Read video data
        with open(generated_video, "rb") as f:
            video_data = f.read()
        
        logger.info(f"✓ Video size: {len(video_data) / 1024:.2f} KB")
        
        # Cleanup temp files
        try:
            if audio_temp and audio_temp.exists():
                audio_temp.unlink()
            if audio_wav and audio_wav.exists():
                audio_wav.unlink()
            if image_path and image_path.exists():
                image_path.unlink()
            if generated_video and generated_video.exists():
                generated_video.unlink()
        except Exception as e:
            logger.warning(f"Cleanup error: {e}")
        
        return StreamingResponse(
            io.BytesIO(video_data), 
            media_type="video/mp4",
            headers={
                "Content-Disposition": "inline; filename=talking_head.mp4",
                "Cache-Control": "no-cache"
            }
        )
        
    except subprocess.TimeoutExpired:
        logger.error("Wav2Lip generation timed out after 5 minutes")
        raise HTTPException(500, "Video generation timed out. Try with shorter audio or lower quality image.")
    
    except Exception as e:
        logger.error(f"Error: {e}", exc_info=True)
        
        # Emergency cleanup
        try:
            if audio_temp and audio_temp.exists():
                audio_temp.unlink()
            if audio_wav and audio_wav.exists():
                audio_wav.unlink()
            if image_path and image_path.exists():
                image_path.unlink()
        except:
            pass
        
        raise HTTPException(500, str(e))

if __name__ == "__main__":
    import uvicorn
    
    logger.info("=" * 60)
    logger.info("Starting Wav2Lip Avatar Backend")
    logger.info(f"Wav2Lip Path: {WAV2LIP_PATH}")
    logger.info(f"Temp Directory: {TEMP_DIR}")
    
    # Check CUDA availability
    try:
        import torch
        cuda_available = torch.cuda.is_available()
        if cuda_available:
            logger.info(f"✓ CUDA Available: {torch.cuda.get_device_name(0)}")
        else:
            logger.warning("⚠ CUDA not available - will use CPU (slow!)")
    except:
        logger.warning("⚠ PyTorch not found in backend venv")
    
    logger.info("=" * 60)
    
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
