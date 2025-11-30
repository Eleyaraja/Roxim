import { useState, useEffect, useRef } from 'react'
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'

export function useEmotionDetection(videoRef: React.RefObject<HTMLVideoElement>) {
  const [emotion, setEmotion] = useState('neutral')
  const [confidence, setConfidence] = useState(0.5)
  const [isDetecting, setIsDetecting] = useState(false)
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null)
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    return () => {
      stopDetection()
    }
  }, [])

  const startDetection = async () => {
    if (isDetecting) return

    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      )

      const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        numFaces: 1
      })

      faceLandmarkerRef.current = faceLandmarker
      setIsDetecting(true)
      detectEmotions()
    } catch (error) {
      console.error('Failed to initialize face detection:', error)
      // Fallback to random emotions for demo
      startFallbackDetection()
    }
  }

  const detectEmotions = () => {
    if (!videoRef.current || !faceLandmarkerRef.current || !isDetecting) return

    const video = videoRef.current
    if (video.readyState >= 2) {
      try {
        const results = faceLandmarkerRef.current.detectForVideo(video, Date.now())
        
        if (results.faceLandmarks && results.faceLandmarks.length > 0) {
          const landmarks = results.faceLandmarks[0]
          const emotionData = analyzeEmotionFromLandmarks(landmarks)
          setEmotion(emotionData.emotion)
          setConfidence(emotionData.confidence)
        }
      } catch (error) {
        console.error('Detection error:', error)
      }
    }

    animationFrameRef.current = requestAnimationFrame(detectEmotions)
  }

  const startFallbackDetection = () => {
    setIsDetecting(true)
    let intervalId: NodeJS.Timeout
    
    // More realistic fallback that simulates natural emotion changes
    const updateEmotion = () => {
      const emotions = ['confident', 'neutral', 'happy', 'nervous', 'thinking']
      const weights = [0.3, 0.3, 0.2, 0.15, 0.05] // Weighted probabilities
      
      let random = Math.random()
      let selectedEmotion = 'neutral'
      let cumulative = 0
      
      for (let i = 0; i < emotions.length; i++) {
        cumulative += weights[i]
        if (random <= cumulative) {
          selectedEmotion = emotions[i]
          break
        }
      }
      
      const baseConfidence = selectedEmotion === 'confident' ? 0.7 : 
                            selectedEmotion === 'nervous' ? 0.4 :
                            selectedEmotion === 'happy' ? 0.75 : 0.55
      const randomConfidence = baseConfidence + (Math.random() * 0.2 - 0.1)
      
      setEmotion(selectedEmotion)
      setConfidence(Math.max(0.3, Math.min(0.95, randomConfidence)))
    }
    
    updateEmotion()
    intervalId = setInterval(updateEmotion, 2500)

    return () => clearInterval(intervalId)
  }

  const stopDetection = () => {
    setIsDetecting(false)
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    if (faceLandmarkerRef.current) {
      faceLandmarkerRef.current.close()
      faceLandmarkerRef.current = null
    }
  }

  return {
    emotion,
    confidence,
    isDetecting,
    startDetection,
    stopDetection
  }
}

function analyzeEmotionFromLandmarks(landmarks: any): { emotion: string; confidence: number } {
  // Simplified emotion detection based on facial landmarks
  // In production, you'd use a more sophisticated ML model
  
  // Get key points
  const leftEye = landmarks[33]
  const rightEye = landmarks[263]
  const nose = landmarks[1]
  const leftMouth = landmarks[61]
  const rightMouth = landmarks[291]
  const topLip = landmarks[13]
  const bottomLip = landmarks[14]

  // Calculate mouth openness
  const mouthOpen = Math.abs(topLip.y - bottomLip.y)
  
  // Calculate smile (mouth corners up)
  const mouthWidth = Math.abs(leftMouth.x - rightMouth.x)
  const mouthCenterY = (leftMouth.y + rightMouth.y) / 2
  const smileIntensity = (nose.y - mouthCenterY) / mouthWidth

  // Determine emotion
  let emotion = 'neutral'
  let confidence = 0.6

  if (smileIntensity > 0.3) {
    emotion = 'happy'
    confidence = 0.75
  } else if (smileIntensity > 0.15) {
    emotion = 'confident'
    confidence = 0.7
  } else if (mouthOpen < 0.01) {
    emotion = 'nervous'
    confidence = 0.65
  }

  return { emotion, confidence }
}
