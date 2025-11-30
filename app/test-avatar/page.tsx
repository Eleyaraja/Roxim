'use client'

import { useState } from 'react'
import DIDAvatar from '@/components/DIDAvatar'
import { ArrowLeft, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function TestAvatarPage() {
  const [testText, setTestText] = useState("Hello! I'm your AI interviewer. Tell me about your experience with React and TypeScript.")
  const [customText, setCustomText] = useState('')
  const [selectedVoice, setSelectedVoice] = useState('en-US-JennyNeural')
  const [key, setKey] = useState(0)

  const sampleQuestions = [
    "Hello! I'm your AI interviewer. Tell me about your experience with React and TypeScript.",
    "Can you describe a challenging project you've worked on recently?",
    "What are your greatest strengths as a developer?",
    "Where do you see yourself in five years?",
    "Why are you interested in this position?"
  ]

  const voices = [
    { id: 'en-US-JennyNeural', name: 'Jenny (Female, Professional)', gender: 'female' },
    { id: 'en-US-AriaNeural', name: 'Aria (Female, Warm)', gender: 'female' },
    { id: 'en-US-SaraNeural', name: 'Sara (Female, Energetic)', gender: 'female' },
    { id: 'en-US-GuyNeural', name: 'Guy (Male, Professional)', gender: 'male' },
    { id: 'en-US-TonyNeural', name: 'Tony (Male, Casual)', gender: 'male' },
    { id: 'en-US-DavisNeural', name: 'Davis (Male, Deep)', gender: 'male' }
  ]

  const handleGenerate = () => {
    if (customText.trim()) {
      setTestText(customText.trim())
      setKey(prev => prev + 1)
    }
  }
  
  const handleQuestionClick = (question: string) => {
    setTestText(question)
    setKey(prev => prev + 1)
  }
  
  const handleVoiceChange = (voiceId: string) => {
    setSelectedVoice(voiceId)
    setKey(prev => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
          
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">
              D-ID Avatar Test
            </h1>
          </div>
          <p className="text-gray-400">
            Test the realistic talking AI avatar with lip-sync
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Avatar Display */}
          <div className="space-y-4">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Avatar Preview
              </h2>
              
              <DIDAvatar 
                key={key}
                text={testText}
                voice={selectedVoice}
                onComplete={() => {
                  console.log('✅ Video completed!')
                }}
              />

              <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-sm text-blue-400 font-medium mb-1">
                  💡 What's Happening:
                </p>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Generating lip-synced video (15-30s)</li>
                  <li>• Using Microsoft Azure TTS</li>
                  <li>• Professional avatar with realistic speech</li>
                  <li>• Auto-plays when ready</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="space-y-4">
            {/* Voice Selection */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Select Voice
              </h2>
              
              <div className="space-y-2">
                {voices.map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => handleVoiceChange(voice.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                      selectedVoice === voice.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{voice.name}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        voice.gender === 'female' 
                          ? 'bg-pink-500/20 text-pink-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {voice.gender}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sample Questions */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Sample Questions
              </h2>
              
              <div className="space-y-2">
                {sampleQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuestionClick(question)}
                    className="w-full text-left px-4 py-3 rounded-lg bg-gray-700/50 text-gray-300 hover:bg-gray-700 transition-all text-sm"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Text */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Custom Text
              </h2>
              
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Enter your own text for the avatar to speak..."
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={4}
              />
              
              <button
                onClick={handleGenerate}
                disabled={!customText.trim()}
                className="mt-3 w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg transition-all hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Generate Avatar
              </button>
            </div>

            {/* Info */}
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <p className="text-sm text-yellow-400 font-medium mb-2">
                ⚡ API Usage
              </p>
              <p className="text-sm text-gray-300">
                Each generation uses 1 credit. Free tier: 20 credits/month.
                Check usage at{' '}
                <a 
                  href="https://studio.d-id.com/account-settings" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  D-ID Dashboard
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
