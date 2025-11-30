/**
 * AI Avatar Component - Human HR interviewer with real video lip-sync
 * Supports both static image with animated mouth and real ML-generated talking head video
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { AvatarState } from '@/lib/types'

interface AvatarProps {
  state: AvatarState['state']
  isSpeaking: boolean
  isListening: boolean
  mouthLevel?: number // 0-1, drives lip movement
  name?: string
  videoUrl?: string // URL to talking head video (when available)
  useVideoAvatar?: boolean // Enable ML-generated video avatar
}

export default function Avatar({ 
  state, 
  isSpeaking, 
  isListening, 
  mouthLevel = 0,
  name = 'Alex Chen',
  videoUrl,
  useVideoAvatar = false
}: AvatarProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoError, setVideoError] = useState(false)
  const [isVideoReady, setIsVideoReady] = useState(false)

  // Play video when speaking and video is available
  useEffect(() => {
    if (videoRef.current && videoUrl && isSpeaking && !videoError) {
      videoRef.current.play().catch(err => {
        console.error('Video playback error:', err)
        setVideoError(true)
      })
    } else if (videoRef.current && !isSpeaking) {
      videoRef.current.pause()
    }
  }, [isSpeaking, videoUrl, videoError])

  // Reset video when URL changes
  useEffect(() => {
    setVideoError(false)
    setIsVideoReady(false)
  }, [videoUrl])

  // STRICT MODE: Only show video, no fallback
  const shouldShowVideo = useVideoAvatar && videoUrl && isSpeaking && !videoError && isVideoReady
  
  // If video avatar is required but fails, show error
  useEffect(() => {
    if (useVideoAvatar && isSpeaking && videoError) {
      console.error('❌ Video avatar failed - this should not happen in strict mode')
    }
  }, [useVideoAvatar, isSpeaking, videoError])

  const getStateColor = () => {
    switch (state) {
      case 'speaking': return 'from-blue-500 to-purple-500'
      case 'listening': return 'from-green-500 to-teal-500'
      case 'thinking': return 'from-yellow-500 to-orange-500'
      default: return 'from-gray-400 to-gray-500'
    }
  }

  const getStateLabel = () => {
    switch (state) {
      case 'speaking': return isSpeaking ? 'Speaking...' : 'Typing...'
      case 'listening': return 'Listening...'
      case 'thinking': return 'Analyzing your answer...'
      default: return 'Ready'
    }
  }

  // Calculate mouth height based on audio level
  const mouthHeight = 12 + (mouthLevel * 20) // 12-32px range
  const mouthScale = 0.3 + (mouthLevel * 0.7) // 0.3-1.0 scale

  return (
    <div className="flex flex-col items-center justify-center h-full">
      {/* Avatar Container with Glow */}
      <div className="relative">
        {/* Outer glow ring when speaking or listening */}
        {(isSpeaking || isListening) && (
          <div 
            className={`absolute -inset-4 rounded-full bg-gradient-to-br ${getStateColor()} opacity-20 blur-xl animate-pulse`} 
          />
        )}
        
        {/* Main Avatar Circle */}
        <div 
          className={`
            relative w-48 h-48 rounded-full overflow-hidden 
            shadow-2xl transition-all duration-300 
            ${isSpeaking ? 'scale-105 ring-4 ring-blue-400/50' : 'scale-100'}
            ${isListening ? 'ring-4 ring-green-400/50' : ''}
          `}
        >
          {/* Background gradient based on state */}
          <div className={`absolute inset-0 bg-gradient-to-br ${getStateColor()} opacity-10`} />
          
          {/* Video Avatar (when speaking with ML-generated video) */}
          {shouldShowVideo && (
            <video
              ref={videoRef}
              src={videoUrl}
              className="absolute inset-0 w-full h-full object-cover z-10"
              playsInline
              muted={false}
              onLoadedData={() => setIsVideoReady(true)}
              onError={() => {
                console.error('Video load error')
                setVideoError(true)
              }}
              onEnded={() => {
                // Video finished playing
                setIsVideoReady(false)
              }}
            />
          )}

          {/* Static Face Image (fallback or when not speaking) */}
          <img
            src="/avatars/hr-professional.jpg"
            alt="HR Interviewer"
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              shouldShowVideo ? 'opacity-0' : 'opacity-100'
            }`}
            onError={(e) => {
              // Fallback to AI-generated placeholder if image not found
              e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}&backgroundColor=b6e3f4`
            }}
          />

          {/* Animated Mouth Overlay - ONLY for listening, NEVER for speaking */}
          {isListening && !isSpeaking && (
            <div
              className="absolute left-1/2 bottom-16 -translate-x-1/2 bg-rose-900/80 rounded-full"
              style={{
                width: `${30 + mouthLevel * 10}px`,
                height: `${mouthHeight}px`,
                transform: `translateX(-50%) scaleY(${mouthScale})`,
                transition: 'all 60ms ease-out',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
            />
          )}
          
          {/* Error indicator if video fails */}
          {useVideoAvatar && isSpeaking && videoError && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-900/50">
              <p className="text-white text-sm font-bold">VIDEO ERROR</p>
            </div>
          )}

          {/* Eyes highlight when listening (subtle) */}
          {isListening && (
            <>
              <div className="absolute top-12 left-14 w-3 h-3 bg-white/40 rounded-full animate-pulse" />
              <div className="absolute top-12 right-14 w-3 h-3 bg-white/40 rounded-full animate-pulse" />
            </>
          )}
        </div>

        {/* Listening Microphone Indicator */}
        {isListening && (
          <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-3 shadow-lg animate-pulse">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
          </div>
        )}

        {/* Speaking Indicator */}
        {isSpeaking && (
          <div className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-3 shadow-lg">
            <svg className="w-5 h-5 text-white animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
            </svg>
          </div>
        )}

        {/* Thinking Animation */}
        {state === 'thinking' && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex gap-1.5">
            <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>

      {/* Name and State Label */}
      <div className="mt-8 text-center space-y-2">
        <h3 className="text-2xl font-bold text-white">{name}</h3>
        <p className="text-sm text-gray-400">Senior HR Interviewer</p>
        
        <div className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-full
          bg-gradient-to-r ${getStateColor()} bg-opacity-20 backdrop-blur-sm
          border border-white/10
        `}>
          <div className={`w-2 h-2 rounded-full ${
            state === 'speaking' ? 'bg-blue-400 animate-pulse' :
            state === 'listening' ? 'bg-green-400 animate-pulse' :
            state === 'thinking' ? 'bg-yellow-400 animate-pulse' :
            'bg-gray-400'
          }`} />
          <p className="text-sm font-medium text-gray-200">{getStateLabel()}</p>
        </div>
      </div>

      {/* Volume Meter when listening */}
      {isListening && mouthLevel > 0 && (
        <div className="mt-4 w-48">
          <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-100"
              style={{ width: `${mouthLevel * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 text-center mt-1">Volume: {Math.round(mouthLevel * 100)}%</p>
        </div>
      )}

      {/* Idle prompt */}
      {state === 'idle' && !isSpeaking && !isListening && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400 animate-pulse">Ready to begin your interview</p>
        </div>
      )}
    </div>
  )
}

/**
 * Small avatar for results/sidebar
 */
export function AvatarSmall({ state = 'idle', name = 'Alex' }: { state?: AvatarState['state'], name?: string }) {
  const getStateColor = () => {
    switch (state) {
      case 'speaking': return 'from-blue-500 to-purple-500'
      case 'listening': return 'from-green-500 to-teal-500'
      default: return 'from-gray-400 to-gray-500'
    }
  }

  return (
    <div className="relative">
      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getStateColor()} overflow-hidden shadow-lg`}>
        <img
          src="/avatars/hr-professional.jpg"
          alt="HR"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
          }}
        />
      </div>
    </div>
  )
}
