export function speakText(
  text: string, 
  onStart?: () => void,
  onEnd?: () => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Text-to-speech not supported')
      onEnd?.()
      resolve()
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.volume = 1

    utterance.onstart = () => {
      onStart?.()
    }

    utterance.onend = () => {
      onEnd?.()
      resolve()
    }
    
    utterance.onerror = (error) => {
      console.error('Speech synthesis error:', error)
      onEnd?.()
      resolve() // Resolve anyway to not block the flow
    }

    window.speechSynthesis.speak(utterance)
  })
}

export function stopSpeaking(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
}
