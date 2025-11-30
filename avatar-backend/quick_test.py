"""
Quick Test - Generates a test video immediately
Usage: python quick_test.py <audio.wav> <image.jpg>
"""
import sys
import requests
import os

BACKEND_URL = "http://localhost:8000"

def quick_test(audio_path, image_path):
    """Quick test of video generation"""
    
    # Check files exist
    if not os.path.exists(audio_path):
        print(f"❌ Audio file not found: {audio_path}")
        return False
    
    if not os.path.exists(image_path):
        print(f"❌ Image file not found: {image_path}")
        return False
    
    print("🔍 Testing backend health...")
    try:
        health = requests.get(f"{BACKEND_URL}/health", timeout=5)
        if health.status_code != 200:
            print(f"❌ Backend not healthy: {health.status_code}")
            return False
        print("✅ Backend is healthy")
    except Exception as e:
        print(f"❌ Backend not available: {e}")
        print("   Make sure backend is running: python app.py")
        return False
    
    print(f"\n🎬 Generating video...")
    print(f"   Audio: {audio_path}")
    print(f"   Image: {image_path}")
    
    try:
        with open(audio_path, 'rb') as audio_file, open(image_path, 'rb') as image_file:
            files = {
                'audio': ('audio.wav', audio_file, 'audio/wav'),
                'image': ('image.jpg', image_file, 'image/jpeg')
            }
            
            print("📤 Uploading to backend...")
            response = requests.post(
                f"{BACKEND_URL}/generate-talking-head",
                files=files,
                timeout=300
            )
            
            if response.status_code == 200:
                output_path = "quick_test_output.mp4"
                with open(output_path, 'wb') as f:
                    f.write(response.content)
                
                print(f"\n✅ SUCCESS!")
                print(f"   Video saved: {output_path}")
                print(f"   Size: {len(response.content) / 1024:.2f} KB")
                print(f"\n   Play with: {output_path}")
                return True
            else:
                print(f"❌ Error {response.status_code}: {response.text}")
                return False
                
    except Exception as e:
        print(f"❌ Failed: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python quick_test.py <audio.wav> <image.jpg>")
        print("\nExample:")
        print("  python quick_test.py test_audio.wav avatar.jpg")
        sys.exit(1)
    
    audio_path = sys.argv[1]
    image_path = sys.argv[2]
    
    success = quick_test(audio_path, image_path)
    sys.exit(0 if success else 1)
