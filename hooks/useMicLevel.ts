/**
 * Hook to analyze microphone audio level in real-time
 * Returns a normalized volume level (0-1) for lip-sync
 */

import { useEffect, useState, useRef } from 'react'

export function useMicLevel(stream: MediaStream | null): number {
  const [level, setLevel] = useState(0)
  const animationFrameRef = useRef<number>()
  const audioContextRef = useRef<AudioContext>()
  const analyserRef = useRef<AnalyserNode>()

  useEffect(() => {
    if (!stream) {
      setLevel(0)
      return
    }

    try {
      // Create audio context and analyser
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const analyser = audioContext.createAnalyser()
      const source = audioContext.createMediaStreamSource(stream)
      
      analyser.fftSize = 512
      analyser.smoothingTimeConstant = 0.8
      source.connect(analyser)

      audioContextRef.current = audioContext
      analyserRef.current = analyser

      const dataArray = new Uint8Array(analyser.frequencyBinCount)

      const updateLevel = () => {
        if (!analyserRef.current) return

        analyserRef.current.getByteTimeDomainData(dataArray)

        // Calculate RMS (root mean square) for volume
        let sum = 0
        for (let i = 0; i < dataArray.length; i++) {
          const normalized = (dataArray[i] - 128) / 128
          sum += normalized * normalized
        }
        const rms = Math.sqrt(sum / dataArray.length)

        // Normalize and amplify for mouth movement (0-1 range)
        const normalizedLevel = Math.min(1, rms * 8)
        
        // Smooth the transition
        setLevel(prev => prev * 0.7 + normalizedLevel * 0.3)

        animationFrameRef.current = requestAnimationFrame(updateLevel)
      }

      updateLevel()

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
        if (analyserRef.current) {
          analyserRef.current.disconnect()
        }
        if (audioContextRef.current) {
          audioContextRef.current.close()
        }
      }
    } catch (error) {
      console.error('Error setting up audio analysis:', error)
      return
    }
  }, [stream])

  return level
}
