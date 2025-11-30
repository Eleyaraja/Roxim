/**
 * Animated Confidence Hook
 * Smoothly animates confidence bar from current to target value
 */

import { useState, useEffect, useRef } from 'react'

export function useAnimatedConfidence(initialValue: number = 70) {
  const [displayedConfidence, setDisplayedConfidence] = useState(initialValue)
  const [targetConfidence, setTargetConfidence] = useState(initialValue)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    // Cancel any ongoing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    const startValue = displayedConfidence
    const endValue = targetConfidence
    const duration = 800 // ms
    const startTime = Date.now()

    const animate = () => {
      const now = Date.now()
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function (ease-out)
      const eased = 1 - Math.pow(1 - progress, 3)
      
      const currentValue = startValue + (endValue - startValue) * eased
      setDisplayedConfidence(currentValue)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [targetConfidence])

  return {
    displayedConfidence: Math.round(displayedConfidence),
    setTargetConfidence
  }
}
