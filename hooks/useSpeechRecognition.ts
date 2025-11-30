import { useState, useEffect, useRef } from 'react'

export function useSpeechRecognition() {
  const [finalTranscript, setFinalTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false // Avoid repeat bugs
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.maxAlternatives = 1

    recognition.onresult = (event: any) => {
      let newFinalTranscript = ''
      let newInterimTranscript = ''

      // Process results from the last index
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPiece = event.results[i][0].transcript

        if (event.results[i].isFinal) {
          // Final result - add to permanent transcript
          newFinalTranscript += transcriptPiece + ' '
        } else {
          // Interim result - show as preview only
          newInterimTranscript += transcriptPiece
        }
      }

      // Update final transcript (append new final results)
      if (newFinalTranscript) {
        setFinalTranscript(prev => prev + newFinalTranscript)
        setInterimTranscript('') // Clear interim after final
      }

      // Update interim transcript (replace, don't append)
      if (newInterimTranscript) {
        setInterimTranscript(newInterimTranscript)
        
        // Reset silence timer
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current)
        }
        
        // Auto-stop after 3 seconds of silence
        silenceTimerRef.current = setTimeout(() => {
          if (recognitionRef.current && isListening) {
            recognitionRef.current.stop()
          }
        }, 3000)
      }
    }

    recognition.onerror = (event: any) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.error('Speech recognition error:', event.error)
      }
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
      setInterimTranscript('') // Clear interim on end
      
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current)
      }
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current)
      }
    }
  }, [isListening])

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setFinalTranscript('')
      setInterimTranscript('')
      
      try {
        recognitionRef.current.start()
        setIsListening(true)
      } catch (error) {
        console.error('Failed to start recognition:', error)
      }
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
      setInterimTranscript('') // Clear interim on manual stop
      
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current)
      }
    }
  }

  const resetTranscript = () => {
    setFinalTranscript('')
    setInterimTranscript('')
  }

  // De-duplicate repeated phrases (safety net)
  const getCleanTranscript = () => {
    const full = finalTranscript.trim()
    return deduplicateRepeats(full)
  }

  return {
    transcript: getCleanTranscript(),
    interimTranscript: interimTranscript.trim(),
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    supported: !!recognitionRef.current
  }
}

/**
 * Remove obvious repeated segments from transcript
 * Example: "I actually I actually I actually" -> "I actually"
 */
function deduplicateRepeats(text: string): string {
  if (!text) return text

  const words = text.split(' ')
  if (words.length < 6) return text // Too short to have meaningful repeats

  // Look for repeated 2-4 word phrases at the start
  for (let phraseLen = 4; phraseLen >= 2; phraseLen--) {
    const phrase = words.slice(0, phraseLen).join(' ')
    let repeatCount = 0
    let index = 0

    // Count consecutive repeats
    while (index + phraseLen <= words.length) {
      const segment = words.slice(index, index + phraseLen).join(' ')
      if (segment === phrase) {
        repeatCount++
        index += phraseLen
      } else {
        break
      }
    }

    // If repeated more than 2 times, keep only 1
    if (repeatCount > 2) {
      const rest = words.slice(index).join(' ')
      return phrase + (rest ? ' ' + rest : '')
    }
  }

  return text
}
