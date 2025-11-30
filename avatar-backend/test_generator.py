"""
Test Video Generator
Quick script to test Wav2Lip backend without frontend
"""
import requests
import os
from pathlib import Path

BACKEND_URL = "http://localhost:8000"

def test_health():
    """Test backend health endpoint"""
    print("🔍 Testing backend health...")
    try:
        response = requests.get(f"{BACKEND_URL}/health")
        if response.status_code == 200:
            data = response.json()
            print("✅ Backend is healthy!")
            print(f"   Status: {data.get('status')}")
            print(f"   Mode: {data.get('mode')}")
            print(f"   Device: {data.get('device')}")
            print(f"   Has Torch: {data.get('has_torch')}")
            print(f"   Model Loaded: {data.get('model_loaded')}")
            print(f"   Wav2Lip Exists: {data.get('wav2lip_exists')}")
            print(f"   Checkpoint Exists: {data.get('checkpoint_exists')}")
            return True
        else:
            print(f"❌ Backend returned status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Failed to connect to backend: {e}")
        return False

def generate_test_video(audio_path, image_path, output_path="test_output.mp4"):
    """Generate talking head video from audio and image"""
    print(f"\n🎬 Generating video...")
    print(f"   Audio: {audio_path}")
    print(f"   Image: {image_path}")
    
    if not os.path.exists(audio_path):
        print(f"❌ Audio file not found: {audio_path}")
        return False
    
    if not os.path.exists(image_path):
        print(f"❌ Image file not found: {image_path}")
        return False
    
    try:
        with open(audio_path, 'rb') as audio_file, open(image_path, 'rb') as image_file:
            files = {
                'audio': ('audio.wav', audio_file, 'audio/wav'),
                'image': ('image.jpg', image_file, 'image/jpeg')
            }
            
            print("📤 Uploading files to backend...")
            response = requests.post(
                f"{BACKEND_URL}/generate-talking-head",
                files=files,
                timeout=300  # 5 minutes timeout
            )
            
            if response.status_code == 200:
                print("✅ Video generated successfully!")
                
                # Save the video
                with open(output_path, 'wb') as f:
                    f.write(response.content)
                
                print(f"💾 Video saved to: {output_path}")
                print(f"   Size: {len(response.content) / 1024:.2f} KB")
                return True
            else:
                print(f"❌ Backend returned error {response.status_code}")
                print(f"   Response: {response.text}")
                return False
                
    except Exception as e:
        print(f"❌ Failed to generate video: {e}")
        return False

def create_test_audio():
    """Create a simple test audio file using TTS"""
    print("\n🎤 Creating test audio...")
    try:
        import pyttsx3
        
        engine = pyttsx3.init()
        engine.setProperty('rate', 150)
        
        text = "Hello! This is a test of the Wav2Lip talking head system. I am speaking to verify that the video generation is working correctly."
        
        output_path = "test_audio.wav"
        engine.save_to_file(text, output_path)
        engine.runAndWait()
        
        if os.path.exists(output_path):
            print(f"✅ Test audio created: {output_path}")
            return output_path
        else:
            print("❌ Failed to create test audio")
            return None
            
    except ImportError:
        print("⚠️  pyttsx3 not installed. Install with: pip install pyttsx3")
        print("   Or provide your own audio file")
        return None
    except Exception as e:
        print(f"❌ Failed to create test audio: {e}")
        return None

def main():
    print("=" * 60)
    print("🎬 Wav2Lip Video Generator Test")
    print("=" * 60)
    
    # Test backend health
    if not test_health():
        print("\n❌ Backend is not available. Please start it first:")
        print("   cd avatar-backend")
        print("   .\\venv\\Scripts\\activate")
        print("   python app.py")
        return
    
    print("\n" + "=" * 60)
    print("📝 Test Options:")
    print("=" * 60)
    print("1. Use your own audio and image files")
    print("2. Generate test audio (requires pyttsx3)")
    print("3. Exit")
    
    choice = input("\nEnter choice (1-3): ").strip()
    
    if choice == "1":
        audio_path = input("Enter audio file path (.wav): ").strip()
        image_path = input("Enter image file path (.jpg): ").strip()
        output_path = input("Enter output video path (default: test_output.mp4): ").strip() or "test_output.mp4"
        
        if generate_test_video(audio_path, image_path, output_path):
            print(f"\n✅ SUCCESS! Video saved to: {output_path}")
            print(f"   You can play it with: {output_path}")
        
    elif choice == "2":
        audio_path = create_test_audio()
        if audio_path:
            image_path = input("Enter image file path (.jpg): ").strip()
            output_path = input("Enter output video path (default: test_output.mp4): ").strip() or "test_output.mp4"
            
            if generate_test_video(audio_path, image_path, output_path):
                print(f"\n✅ SUCCESS! Video saved to: {output_path}")
                print(f"   You can play it with: {output_path}")
        
    elif choice == "3":
        print("👋 Goodbye!")
        return
    
    else:
        print("❌ Invalid choice")

if __name__ == "__main__":
    main()
