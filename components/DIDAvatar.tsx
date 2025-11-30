'use client'

import { useState, useEffect } from 'react'
import { Loader2, AlertCircle, Volume2 } from 'lucide-react'

interface DIDAvatarProps {
  text: string
  voice?: string
  onComplete?: () => void
  autoPlay?: boolean
}

export default function DIDAvatar({ 
  text, 
  voice = 'en-US-JennyNeural',
  onComplete,
  autoPlay = true 
}: DIDAvatarProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (autoPlay && text) {
      generateVideo()
    }
  }, [text, autoPlay])

  const generateVideo = async () => {
    setLoading(true)
    setError(null)
    setVideoUrl(null)

    try {
      const response = await fetch('/api/generate-avatar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text, voice })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate video')
      }

      setVideoUrl(data.videoUrl)
    } catch (err: any) {
      console.error('Avatar generation error:', err)
      setError(err.message || 'Failed to generate avatar')
    } finally {
      setLoading(false)
    }
  }

  const handleVideoEnd = () => {
    if (onComplete) {
      onComplete()
    }
  }

  if (loading) {
    return (
      <div className="relative w-full aspect-video bg-gray-900 rounded-xl flex flex-col items-center justify-center p-8">
        <Loader2 className="w-16 h-16 text-blue-400 animate-spin mb-4" />
        <p className="text-white font-medium mb-2">Generating AI Avatar...</p>
        <p className="text-gray-400 text-sm text-center">
          This takes 15-30 seconds. Creating lip-synced video...
        </p>
        <div className="mt-4 w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative w-full aspect-video bg-red-900/20 border-2 border-red-500/50 rounded-xl flex flex-col items-center justify-center p-8">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <p className="text-red-400 font-medium mb-2">Failed to Generate Avatar</p>
        <p className="text-gray-400 text-sm text-center mb-4">{error}</p>
        <button
          onClick={generateVideo}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (videoUrl) {
    return (
      <div className="relative w-full aspect-video bg-gray-900 rounded-xl overflow-hidden">
        <video
          src={videoUrl}
          autoPlay
          controls
          onEnded={handleVideoEnd}
          className="w-full h-full object-cover"
        />
        
        {/* AI Speaking Badge */}
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/70 backdrop-blur-sm px-3 py-2 rounded-full">
          <Volume2 className="w-4 h-4 text-green-400 animate-pulse" />
          <span className="text-white text-sm font-medium">AI Speaking</span>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full aspect-video bg-gray-900 rounded-xl flex items-center justify-center">
      <p className="text-gray-500">No video generated</p>
    </div>
  )
}
