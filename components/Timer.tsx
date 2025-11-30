'use client'

import { useState, useEffect, useRef } from 'react'
import { Pause, Play, Clock } from 'lucide-react'

interface TimerProps {
  duration: number // in seconds
  onTimeUp: () => void
  isPaused?: boolean
  onPause?: () => void
  onResume?: () => void
}

export default function Timer({ 
  duration, 
  onTimeUp, 
  isPaused = false,
  onPause,
  onResume 
}: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [isExpired, setIsExpired] = useState(false)
  const hasPlayedWarning = useRef(false)
  const audioContextRef = useRef<AudioContext | null>(null)

  // Initialize audio context
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
  }, [])

  // Play beep sound
  const playBeep = () => {
    if (!audioContextRef.current) return
    
    const ctx = audioContextRef.current
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    oscillator.frequency.value = 800
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
    
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.5)
  }

  // Timer countdown
  useEffect(() => {
    if (isPaused || isExpired) return

    if (timeLeft <= 0) {
      setIsExpired(true)
      onTimeUp()
      return
    }

    // Play warning beep at 10 seconds
    if (timeLeft === 10 && !hasPlayedWarning.current) {
      playBeep()
      hasPlayedWarning.current = true
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [timeLeft, isPaused, isExpired, onTimeUp])

  // Calculate display values
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const percentage = (timeLeft / duration) * 100

  // Determine color based on time remaining
  const getColor = () => {
    if (timeLeft > 60) return { stroke: '#10b981', glow: 'rgba(16, 185, 129, 0.5)' } // Green
    if (timeLeft > 30) return { stroke: '#f59e0b', glow: 'rgba(245, 158, 11, 0.5)' } // Yellow
    return { stroke: '#ef4444', glow: 'rgba(239, 68, 68, 0.5)' } // Red
  }

  const colors = getColor()
  const radius = 90
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const handlePauseToggle = () => {
    if (isPaused) {
      onResume?.()
    } else {
      onPause?.()
    }
  }

  return (
    <div className="relative">
      {/* Main Timer Circle */}
      <div className="relative flex items-center justify-center">
        <svg
          className="transform -rotate-90"
          width="220"
          height="220"
          viewBox="0 0 220 220"
        >
          {/* Background circle */}
          <circle
            cx="110"
            cy="110"
            r={radius}
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="12"
            fill="none"
          />
          
          {/* Progress circle */}
          <circle
            cx="110"
            cy="110"
            r={radius}
            stroke={colors.stroke}
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
            style={{
              filter: `drop-shadow(0 0 8px ${colors.glow})`
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Clock className={`w-6 h-6 mb-2 ${
            timeLeft < 30 ? 'text-red-400 animate-pulse' : 'text-gray-400'
          }`} />
          
          <div className={`text-5xl font-bold tabular-nums ${
            timeLeft > 60 ? 'text-green-400' :
            timeLeft > 30 ? 'text-yellow-400' :
            'text-red-400'
          } ${timeLeft < 30 ? 'animate-pulse' : ''}`}>
            {minutes}:{seconds.toString().padStart(2, '0')}
          </div>
          
          <div className="text-sm text-gray-400 mt-2">
            {timeLeft > 60 ? 'Time Remaining' :
             timeLeft > 30 ? 'Hurry Up!' :
             'Almost Done!'}
          </div>
        </div>
      </div>

      {/* Pause/Resume Button */}
      {(onPause || onResume) && !isExpired && (
        <div className="flex justify-center mt-4">
          <button
            onClick={handlePauseToggle}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors"
          >
            {isPaused ? (
              <>
                <Play className="w-4 h-4" />
                <span>Resume</span>
              </>
            ) : (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Time's Up Overlay */}
      {isExpired && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-full animate-fade-in" />
          <div className="relative z-10 text-center animate-bounce-in">
            <div className="text-6xl mb-2">⏰</div>
            <div className="text-3xl font-bold text-red-400 mb-2">
              Time's Up!
            </div>
            <div className="text-sm text-gray-400">
              Submitting your answer...
            </div>
          </div>
        </div>
      )}

      {/* Warning pulse effect */}
      {timeLeft < 30 && timeLeft > 0 && !isPaused && (
        <div 
          className="absolute inset-0 rounded-full animate-ping"
          style={{
            background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
            opacity: 0.3
          }}
        />
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-bounce-in {
          animation: bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
      `}</style>
    </div>
  )
}

/**
 * Compact Timer for smaller spaces
 */
export function CompactTimer({ 
  duration, 
  timeLeft 
}: { 
  duration: number
  timeLeft: number 
}) {
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const percentage = (timeLeft / duration) * 100

  const getColor = () => {
    if (timeLeft > 60) return 'text-green-400'
    if (timeLeft > 30) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="flex items-center gap-3">
      {/* Mini progress bar */}
      <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ${
            timeLeft > 60 ? 'bg-green-400' :
            timeLeft > 30 ? 'bg-yellow-400' :
            'bg-red-400'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Time display */}
      <div className={`text-lg font-bold tabular-nums ${getColor()} ${
        timeLeft < 30 ? 'animate-pulse' : ''
      }`}>
        {minutes}:{seconds.toString().padStart(2, '0')}
      </div>
    </div>
  )
}
