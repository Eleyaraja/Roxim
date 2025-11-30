'use client'

import { useEffect, useRef } from 'react'

interface VideoAvatarProps {
  isSpeaking: boolean
  videoUrl?: string
  className?: string
}

export default function VideoAvatar({ isSpeaking, videoUrl, className = '' }: VideoAvatarProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (isSpeaking) {
      // Play video when AI is speaking
      video.play().catch(err => console.log('Video play error:', err))
    } else {
      // Pause video when AI stops speaking
      video.pause()
    }
  }, [isSpeaking])

  // Default to a placeholder if no video provided
  const defaultVideo = videoUrl || '/avatars/interviewer-talking.mp4'

  return (
    <div className={`relative ${className}`}>
      <video
        ref={videoRef}
        src={defaultVideo}
        loop
        muted
        playsInline
        className="w-full h-full object-cover rounded-xl"
        onError={(e) => {
          console.error('Video load error:', e)
          // Fallback to static image if video fails
          const target = e.target as HTMLVideoElement
          target.style.display = 'none'
        }}
      />
      
      {/* Fallback static image */}
      <img
        src="/avatars/interviewer-static.jpg"
        alt="Interviewer"
        className="w-full h-full object-cover rounded-xl"
        style={{ display: 'none' }}
        onError={(e) => {
          const target = e.target as HTMLImageElement
          target.style.display = 'none'
        }}
      />

      {/* Speaking indicator */}
      {isSpeaking && (
        <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-2 rounded-full">
          <div className="flex gap-1">
            <div className="w-1 h-4 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1 h-4 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
            <div className="w-1 h-4 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
          </div>
          <span className="text-white text-sm font-medium">Speaking...</span>
        </div>
      )}

      {/* Idle indicator */}
      {!isSpeaking && (
        <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm px-3 py-2 rounded-full">
          <span className="text-gray-300 text-sm">Listening...</span>
        </div>
      )}
    </div>
  )
}
