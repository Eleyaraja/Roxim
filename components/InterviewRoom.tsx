'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Video, VideoOff, Play, Square, MessageSquare } from 'lucide-react'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { useEmotionDetection } from '@/hooks/useEmotionDetection'
import { useMicLevel } from '@/hooks/useMicLevel'
import { speakText, stopSpeaking } from '@/lib/textToSpeech'
// Avatar video generation disabled
import { InterviewChatSession } from '@/lib/llmChat'
import { analyzeTranscript, createMetricsSnapshot } from '@/lib/metricsEngine'
import { analyzeTextEmotion, emotionToConfidence, combineConfidenceSignals } from '@/lib/emotionAnalysis'
import { useAnimatedConfidence } from '@/hooks/useAnimatedConfidence'
import { Question, Answer, EmotionSnapshot, CandidateProfile } from '@/lib/types'
import Avatar from './Avatar'
import VideoAvatar from './VideoAvatar'

interface InterviewRoomProps {
  profile: CandidateProfile
  companyPersona: any
  adaptiveDifficulty: boolean
  onComplete: (data: any) => void
}

export default function InterviewRoom({ profile, companyPersona, adaptiveDifficulty, onComplete }: InterviewRoomProps) {
  // Interview state
  const [phase, setPhase] = useState<'greeting' | 'interview' | 'ending'>('greeting')
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [questionNumber, setQuestionNumber] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [greeting, setGreeting] = useState('')
  const [profileSummary, setProfileSummary] = useState('')
  const [acknowledgement, setAcknowledgement] = useState('')
  const [streamingText, setStreamingText] = useState('')
  const [thinkingMessage, setThinkingMessage] = useState('')
  const [showTimeout, setShowTimeout] = useState(false)
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false)
  const [recordingStartTime, setRecordingStartTime] = useState(0)
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [micStream, setMicStream] = useState<MediaStream | null>(null)
  
  // Avatar state
  const [avatarState, setAvatarState] = useState<'idle' | 'speaking' | 'listening' | 'thinking'>('idle')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [avatarVideoUrl, setAvatarVideoUrl] = useState<string>('')
  const [useVideoAvatar, setUseVideoAvatar] = useState(false)
  
  // Debug info
  const [debugInfo, setDebugInfo] = useState('')
  const debugMode = typeof window !== 'undefined' && localStorage.getItem('debug') === 'true'
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const chatSessionRef = useRef<InterviewChatSession | null>(null)
  const emotionTimelineRef = useRef<EmotionSnapshot[]>([])
  
  // Hooks
  const { transcript, interimTranscript, isListening, startListening, stopListening, resetTranscript } = useSpeechRecognition()
  const { emotion, confidence, startDetection, stopDetection } = useEmotionDetection(videoRef)
  const { displayedConfidence, setTargetConfidence } = useAnimatedConfidence(70)
  const mouthLevel = useMicLevel(micStream)

  const TOTAL_QUESTIONS = 10

  // Initialize interview
  useEffect(() => {
    // Check video avatar FIRST, then initialize
    const init = async () => {
      await checkVideoAvatarAvailability()
      await initializeInterview()
    }
    init()
    return () => {
      cleanup()
    }
  }, [])

  // Video avatar disabled - using static avatar only
  const checkVideoAvatarAvailability = async () => {
    console.log('ℹ️ Video avatar feature disabled - using static avatar')
    setUseVideoAvatar(false)
    return true
  }

  // Track emotions during recording
  useEffect(() => {
    if (isRecording) {
      const snapshot: EmotionSnapshot = {
        timestamp: Date.now(),
        emotion: emotion as any,
        confidence,
        eyeContact: confidence, // Simplified
        smileIntensity: emotion === 'happy' ? 0.8 : 0.3
      }
      emotionTimelineRef.current.push(snapshot)
    }
  }, [emotion, confidence, isRecording])

  const initializeInterview = async () => {
    console.log('🚀 Initializing interview...')
    try {
      // Setup camera
      console.log('📹 Setting up camera...')
      await setupCamera()
      console.log('✅ Camera ready')
      
      // Initialize chat session
      console.log('🤖 Creating chat session...')
      chatSessionRef.current = new InterviewChatSession(profile, companyPersona, adaptiveDifficulty)
      console.log('✅ Chat session created')
      
      // Start interview
      setAvatarState('thinking')
      console.log('💭 Starting interview with Gemini...')
      
      const { greeting: greetingText, profileSummary: summary, firstQuestion } = await chatSessionRef.current.startInterview()
      
      console.log('✅ Got response:', { greeting: greetingText, summary, question: firstQuestion.question })
      
      setGreeting(greetingText)
      setProfileSummary(summary)
      setCurrentQuestion(firstQuestion)
      setQuestionNumber(1)
      
      // Speak greeting and first question
      console.log('🔊 Speaking greeting...')
      await speakGreeting(greetingText, summary, firstQuestion.question)
      
      setPhase('interview')
      setAvatarState('idle')
      console.log('✅ Interview initialized successfully')
    } catch (error: any) {
      console.error('❌ Failed to initialize interview:', error)
      setAvatarState('idle')
      setShowTimeout(true)
      
      // User-friendly error messages
      if (error.message?.includes('Rate limit')) {
        setThinkingMessage('⏱️ Rate limit reached. Please wait 1 minute and refresh the page.')
      } else if (error.message?.includes('API key')) {
        setThinkingMessage('🔑 API key issue. Please check your .env.local file.')
      } else {
        setThinkingMessage(`❌ ${error.message || 'Failed to start interview. Please check console and retry.'}`)
      }
    }
  }

  const setupCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setMicStream(stream) // Save stream for lip-sync
      startDetection()
    } catch (err) {
      console.error('Camera access denied:', err)
    }
  }

  const cleanup = () => {
    const stream = videoRef.current?.srcObject as MediaStream
    stream?.getTracks().forEach(track => track.stop())
    stopDetection()
    stopSpeaking()
  }

  const speakGreeting = async (greetingText: string, summary: string, question: string) => {
    const fullText = `${greetingText} ${summary} ${question}`
    
    console.log('🎤 speakGreeting called')
    console.log('   useVideoAvatar:', useVideoAvatar)
    console.log('   fullText length:', fullText.length)
    
    if (useVideoAvatar) {
      console.log('✅ Using video avatar for greeting')
      await speakWithVideo(fullText)
    } else {
      console.log('⚠️ NOT using video avatar - falling back to TTS')
      await speakText(
        greetingText,
        () => {
          setIsSpeaking(true)
          setAvatarState('speaking')
        },
        () => {
          setIsSpeaking(false)
        }
      )
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
      await speakText(
        summary,
        () => {
          setIsSpeaking(true)
          setAvatarState('speaking')
        },
        () => {
          setIsSpeaking(false)
        }
      )
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
      await speakText(
        question,
        () => {
          setIsSpeaking(true)
          setAvatarState('speaking')
        },
        () => {
          setIsSpeaking(false)
          setAvatarState('idle')
        }
      )
    }
  }

  const speakQuestion = async (text: string, ack?: string) => {
    const fullText = ack ? `${ack}. ${text}` : text
    
    console.log('🎤 speakQuestion called')
    console.log('   useVideoAvatar:', useVideoAvatar)
    console.log('   text:', text.substring(0, 50))
    
    if (useVideoAvatar) {
      console.log('✅ Using video avatar for question')
      await speakWithVideo(fullText)
    } else {
      console.log('⚠️ NOT using video avatar - falling back to TTS')
      if (ack) {
        await speakText(
          ack,
          () => {
            setIsSpeaking(true)
            setAvatarState('speaking')
          },
          () => {
            setIsSpeaking(false)
          }
        )
        await new Promise(resolve => setTimeout(resolve, 300))
      }
      
      await speakText(
        text,
        () => {
          setIsSpeaking(true)
          setAvatarState('speaking')
        },
        () => {
          setIsSpeaking(false)
          setAvatarState('idle')
        }
      )
    }
  }

  const speakWithVideo = async (text: string) => {
    console.log('🎬 Starting video generation...')
    setAvatarState('thinking')
    setThinkingMessage('Generating video avatar... (3-5 seconds)')
    
    try {
      const startTime = Date.now()
      
      // Generate TTS audio blob
      console.log('🎤 Generating audio...')
      const audioBlob = await textToAudioBlob(text)
      if (!audioBlob) {
        throw new Error('Failed to generate audio')
      }
      console.log('✅ Audio generated')
      
      // Generate talking head video - DISABLED FOR NOW
      console.log('🎥 Video generation disabled - using audio only')
      
      const generationTime = ((Date.now() - startTime) / 1000).toFixed(1)
      console.log(`✅ Audio generated in ${generationTime}s`)
      
      // Skip video URL creation - just use audio
      setThinkingMessage('')
      
      // Play audio only
      setIsSpeaking(true)
      setAvatarState('speaking')
      console.log('▶️ Playing audio...')
      
      // Wait for audio duration (estimate 3 seconds per sentence)
      const estimatedDuration = text.split('.').length * 3000
      console.log(`⏱️ Estimated audio duration: ${(estimatedDuration/1000).toFixed(1)}s`)
      
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          setIsSpeaking(false)
          setAvatarState('idle')
          console.log('✅ Audio playback complete')
          resolve()
        }, estimatedDuration)
      })
      
    } catch (error) {
      console.error('❌ Audio generation failed:', error)
      setThinkingMessage('')
      setIsSpeaking(false)
      setAvatarState('idle')
      // Continue interview even if audio fails
      setAvatarState('idle')
      setIsSpeaking(false)
      window.location.href = '/'
    }
  }

  const textToAudioBlob = async (text: string): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        resolve(null)
        return
      }

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 1

      // Use MediaRecorder to capture audio
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const destination = audioContext.createMediaStreamDestination()
      const mediaRecorder = new MediaRecorder(destination.stream)
      const chunks: Blob[] = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' })
        resolve(audioBlob)
      }

      utterance.onend = () => {
        setTimeout(() => mediaRecorder.stop(), 100)
      }

      utterance.onerror = () => {
        mediaRecorder.stop()
        resolve(null)
      }

      mediaRecorder.start()
      window.speechSynthesis.speak(utterance)
    })
  }

  const startRecording = () => {
    if (!currentQuestion) return
    
    resetTranscript()
    emotionTimelineRef.current = []
    recordedChunksRef.current = []
    setRecordingStartTime(Date.now())
    
    const stream = videoRef.current?.srcObject as MediaStream
    if (!stream) return

    try {
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' })
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data)
        }
      }

      mediaRecorder.start()
      startListening()
      setIsRecording(true)
      setAvatarState('listening')
    } catch (error) {
      console.error('Failed to start recording:', error)
    }
  }

  const stopRecording = async () => {
    if (!currentQuestion || !chatSessionRef.current) return
    
    mediaRecorderRef.current?.stop()
    stopListening()
    setIsRecording(false)
    
    // Wait a moment for final transcript to settle
    await new Promise(resolve => setTimeout(resolve, 500))
    
    setAvatarState('thinking')
    setStreamingText('')
    setShowTimeout(false)

    const endTime = Date.now()

    // Create video blob
    const videoBlob = new Blob(recordedChunksRef.current, { type: 'video/webm' })
    const videoUrl = URL.createObjectURL(videoBlob)

    // Analyze metrics
    const metrics = analyzeTranscript(
      transcript,
      recordingStartTime,
      endTime,
      emotionTimelineRef.current
    )

    // Analyze emotion from text (async)
    let emotionConfidence = metrics.confidence
    try {
      const emotionAnalysis = await analyzeTextEmotion(transcript)
      emotionConfidence = emotionToConfidence(emotionAnalysis.dominantEmotion, emotionAnalysis.confidenceScore)
      
      // Update animated confidence bar
      const finalConfidence = combineConfidenceSignals(
        emotionConfidence,
        metrics.confidence,
        1 - (metrics.fillerWords / Math.max(metrics.wordCount, 1)),
        metrics.wordCount > 30 ? 0.8 : 0.5
      )
      setTargetConfidence(finalConfidence * 100)
    } catch (error) {
      console.warn('Emotion analysis failed:', error)
    }

    // Quick heuristic analysis (no API call)
    const metricsSnapshot = createMetricsSnapshot(emotion, emotionConfidence, metrics.engagement)
    const analysis = chatSessionRef.current.quickScore(transcript, metricsSnapshot)

    // Save answer
    const answer: Answer = {
      questionId: currentQuestion.id,
      transcript,
      videoBlob,
      videoUrl,
      startTime: recordingStartTime,
      endTime,
      metrics,
      analysis
    }

    const newAnswers = [...answers, answer]
    setAnswers(newAnswers)

    // Show thinking message after 2 seconds
    const thinkingTimer = setTimeout(() => {
      const messages = [
        "Let me think about your answer...",
        "Considering your response...",
        "Processing that...",
        "Hmm, interesting..."
      ]
      setThinkingMessage(messages[Math.floor(Math.random() * messages.length)])
    }, 2000)

    // Timeout after 30 seconds
    const timeoutTimer = setTimeout(() => {
      setShowTimeout(true)
      setAvatarState('idle')
    }, 30000)

    try {
      // Get next question with streaming (includes scoring in same call)
      const startTime = Date.now()
      let fullText = ''
      
      const { question: nextQuestion, acknowledgement: ack, shouldEnd, score, feedback } = await chatSessionRef.current.getNextQuestionStreaming(
        transcript,
        currentQuestion?.question || '',
        metricsSnapshot,
        questionNumber,
        TOTAL_QUESTIONS,
        (chunk) => {
          fullText += chunk
          setStreamingText(fullText)
          setAvatarState('speaking')
          clearTimeout(thinkingTimer)
          setThinkingMessage('')
        }
      )

      clearTimeout(thinkingTimer)
      clearTimeout(timeoutTimer)
      setThinkingMessage('')

      // Update answer with score and feedback from API
      const lastAnswer = newAnswers[newAnswers.length - 1]
      if (lastAnswer?.analysis) {
        lastAnswer.analysis.overallScore = score
        lastAnswer.analysis.feedback = feedback.feedbackText
        lastAnswer.analysis.strengths = [feedback.strength]
        lastAnswer.analysis.improvements = [feedback.improvement]
      }

      // Update debug info
      if (debugMode) {
        const duration = ((Date.now() - startTime) / 1000).toFixed(1)
        setDebugInfo(`Model: gemini-2.0-flash-lite • ${duration}s`)
      }

      if (shouldEnd) {
        await finishInterview(newAnswers)
      } else {
        setAcknowledgement(ack || '')
        setCurrentQuestion(nextQuestion)
        setQuestionNumber(questionNumber + 1)
        setStreamingText('')
        
        // Speak the acknowledgement and question with proper state management
        await speakQuestion(nextQuestion.question, ack)
        
        // After speaking completes, transition to listening state
        setAvatarState('idle')
      }
    } catch (error) {
      clearTimeout(thinkingTimer)
      clearTimeout(timeoutTimer)
      console.error('Error getting next question:', error)
      setShowTimeout(true)
      setAvatarState('idle')
    }
  }

  const retryQuestion = async () => {
    setShowTimeout(false)
    setAvatarState('thinking')
    
    // Retry with a simpler fallback question
    const fallbackQuestions = [
      "Tell me about a challenge you've faced in your work.",
      "What's your greatest professional achievement?",
      "How do you handle working under pressure?",
      "Describe your ideal work environment."
    ]
    
    const fallbackQ = fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)]
    const question: Question = {
      id: `q-${questionNumber}`,
      question: fallbackQ,
      category: 'behavioral',
      difficulty: 'medium',
      isFollowUp: false
    }
    
    setCurrentQuestion(question)
    await speakQuestion(question.question)
    // State is already set to idle by speakQuestion
  }

  const finishInterview = async (finalAnswers: Answer[]) => {
    setPhase('ending')
    setAvatarState('thinking')
    
    const summary = await chatSessionRef.current!.generateFinalSummary(finalAnswers)
    
    const closingText = "Thank you for your time today. I'll prepare your detailed feedback now."
    
    if (useVideoAvatar) {
      await speakWithVideo(closingText)
    } else {
      await speakText(
        closingText,
        () => {
          setIsSpeaking(true)
          setAvatarState('speaking')
        },
        () => {
          setIsSpeaking(false)
          setAvatarState('idle')
        }
      )
    }
    
    onComplete({
      profile,
      answers: finalAnswers,
      summary,
      companyPersona,
      adaptiveDifficulty
    })
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-4 h-screen flex flex-col">
        {/* Header */}
        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="text-sm bg-gray-800 px-4 py-2 rounded-full">
              Question {questionNumber} of {TOTAL_QUESTIONS}
            </div>
            <div className="h-2 w-48 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                style={{ width: `${(questionNumber / TOTAL_QUESTIONS) * 100}%` }}
              />
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <EmotionIndicator emotion={emotion} confidence={displayedConfidence / 100} />
            {debugMode && debugInfo && (
              <div className="text-xs bg-gray-800 px-3 py-1 rounded-full text-gray-400">
                {debugInfo}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 grid md:grid-cols-2 gap-4 mb-4">
          {/* Left: AI Avatar */}
          <div className="bg-gray-800 rounded-xl p-6 flex flex-col">
            <VideoAvatar 
              isSpeaking={isSpeaking}
              videoUrl="/avatars/interviewer-talking.mp4"
              className="w-full aspect-video mb-4"
            />
            
            {/* Question Display */}
            {currentQuestion && (
              <div className="mt-6 bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    {streamingText ? (
                      <p className="text-lg">{streamingText}<span className="animate-pulse">▊</span></p>
                    ) : (
                      <p className="text-lg">{currentQuestion.question}</p>
                    )}
                  </div>
                </div>
                {acknowledgement && !streamingText && (
                  <p className="text-sm text-gray-400 mt-2 italic">"{acknowledgement}"</p>
                )}
                {thinkingMessage && (
                  <p className="text-sm text-yellow-400 mt-2 italic animate-pulse">{thinkingMessage}</p>
                )}
              </div>
            )}

            {/* Timeout Error */}
            {showTimeout && (
              <div className="mt-6 bg-red-900/30 border border-red-500 rounded-lg p-4">
                <p className="text-red-200 mb-3">Hmm, I'm having trouble thinking of the next question. Let me try again.</p>
                <button
                  onClick={retryQuestion}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-semibold"
                >
                  Retry Question
                </button>
              </div>
            )}

            {/* Greeting Phase */}
            {phase === 'greeting' && greeting && (
              <div className="mt-6 space-y-3">
                <div className="bg-blue-900/30 rounded-lg p-4">
                  <p className="text-sm text-blue-200">{greeting}</p>
                </div>
                <div className="bg-purple-900/30 rounded-lg p-4">
                  <p className="text-sm text-purple-200">{profileSummary}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right: User Video */}
          <div className="bg-gray-800 rounded-xl p-4 relative flex flex-col">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="flex-1 w-full object-cover rounded-lg"
            />
            
            {/* Video Controls */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
              <button
                onClick={() => setVideoEnabled(!videoEnabled)}
                className={`p-3 rounded-full ${videoEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'} transition-colors`}
                title={videoEnabled ? 'Turn off camera' : 'Turn on camera'}
              >
                {videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`p-3 rounded-full ${audioEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'} transition-colors`}
                title={audioEnabled ? 'Mute microphone' : 'Unmute microphone'}
              >
                {audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>
            </div>

            {/* Live Notes - AI taking notes */}
            {isRecording && transcript && (
              <div className="absolute top-4 right-4 bg-yellow-900/80 backdrop-blur-sm rounded-lg p-3 max-w-xs">
                <p className="text-xs text-yellow-200 mb-1 font-semibold">📝 Notes from HR:</p>
                <p className="text-xs text-yellow-100">
                  {transcript.split(' ').slice(0, 15).join(' ')}...
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom: Transcript and Controls */}
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {isRecording ? (
                <div className="flex items-start gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-sm text-gray-400">Recording</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-400 mb-1">Your response:</p>
                    <div className="text-white">
                      {transcript && <span>{transcript}</span>}
                      {interimTranscript && (
                        <span className="text-gray-400 italic"> {interimTranscript}</span>
                      )}
                      {!transcript && !interimTranscript && <span className="text-gray-500">Listening...</span>}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  {isSpeaking ? 'Interviewer is speaking...' : 'Ready to answer'}
                </div>
              )}
            </div>

            <div className="ml-4">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  disabled={isSpeaking || phase === 'ending'}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-8 py-4 rounded-full flex items-center gap-2 text-lg font-semibold transition-all transform hover:scale-105 disabled:transform-none"
                >
                  <Play className="w-6 h-6" />
                  Start Answer
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="bg-red-600 hover:bg-red-700 px-8 py-4 rounded-full flex items-center gap-2 text-lg font-semibold transition-all transform hover:scale-105"
                >
                  <Square className="w-6 h-6" />
                  Stop & Submit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function EmotionIndicator({ emotion, confidence }: { emotion: string; confidence: number }) {
  const emotionColors: any = {
    happy: 'bg-green-500',
    neutral: 'bg-blue-500',
    nervous: 'bg-yellow-500',
    confident: 'bg-purple-500',
    thinking: 'bg-orange-500'
  }

  const emotionEmojis: any = {
    happy: '😊',
    neutral: '😐',
    nervous: '😰',
    confident: '😎',
    thinking: '🤔'
  }

  return (
    <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-full">
      <div className={`w-3 h-3 rounded-full ${emotionColors[emotion] || 'bg-gray-500'} animate-pulse`} />
      <span className="text-sm">{emotionEmojis[emotion] || '😐'}</span>
      <span className="text-sm capitalize">{emotion}</span>
      <span className="text-sm text-gray-400">({Math.round(confidence * 100)}%)</span>
    </div>
  )
}
