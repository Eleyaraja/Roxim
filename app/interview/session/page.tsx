'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useInterview } from '@/contexts/InterviewContext'
import { 
  ArrowLeft, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import InterviewRoom from '@/components/InterviewRoom'
import { CandidateProfile } from '@/lib/types'
import ResultsDashboard from '@/components/ResultsDashboard'

export default function InterviewSessionPage() {
  const router = useRouter()
  const { selectedTemplate, questions, resumeData } = useInterview()
  const [isReady, setIsReady] = useState(false)
  const [hasPermissions, setHasPermissions] = useState(false)
  const [permissionError, setPermissionError] = useState('')
  const [interviewComplete, setInterviewComplete] = useState(false)
  const [completedData, setCompletedData] = useState<any>(null)
  
  // MUST be at the top - hooks must be called in the same order every render
  const actualResumeData = React.useMemo(() => {
    let data = resumeData
    
    if (!data || !data.text) {
      if (typeof window !== 'undefined') {
        const storedResume = localStorage.getItem('uploadedResume')
        if (storedResume) {
          try {
            data = JSON.parse(storedResume)
            console.log('✅ Resume recovered from localStorage')
          } catch (e) {
            console.error('Failed to parse stored resume:', e)
          }
        }
      }
    }
    
    return data
  }, [resumeData])
  
  // Create profile BEFORE any conditional returns
  const profile: CandidateProfile = React.useMemo(() => ({
    skills: actualResumeData?.skills || ['JavaScript', 'React', 'Node.js'],
    yearsOfExperience: actualResumeData?.yearsOfExperience || 3,
    domains: [selectedTemplate?.name || 'General'],
    strengths: actualResumeData?.strengths || [],
    gaps: [],
    targetRole: selectedTemplate?.name || 'General',
    resumeText: actualResumeData?.text || ''
  }), [actualResumeData, selectedTemplate])
  
  // Log resume info once
  useEffect(() => {
    if (actualResumeData?.text) {
      console.log('✅ Resume loaded for interview:', {
        filename: actualResumeData.filename,
        textLength: actualResumeData.text.length,
        preview: actualResumeData.text.substring(0, 100)
      })
      if (typeof window !== 'undefined') {
        localStorage.removeItem('uploadedResume')
      }
    } else {
      console.log('ℹ️ No resume provided, using template-based interview')
    }
  }, [actualResumeData])

  useEffect(() => {
    // Check for custom company-specific questions first
    const isCustom = localStorage.getItem('isCustomInterview')
    const customQuestionsStr = localStorage.getItem('customQuestions')
    
    if (isCustom === 'true' && customQuestionsStr) {
      // We have custom questions, proceed
      checkPermissions()
      return
    }
    
    // Otherwise check if we have template and questions
    if (!selectedTemplate || questions.length === 0) {
      router.push('/interview/start')
      return
    }

    // Check for media permissions
    checkPermissions()
  }, [selectedTemplate, questions, router])

  const checkPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: true 
      })
      
      // Stop the stream immediately - we just needed to check permissions
      stream.getTracks().forEach(track => track.stop())
      
      setHasPermissions(true)
    } catch (error: any) {
      console.error('Permission error:', error)
      setPermissionError(error.message || 'Failed to get media permissions')
      setHasPermissions(false)
    }
  }

  const handleStartInterview = () => {
    setIsReady(true)
  }

  const handleComplete = async (data: any) => {
    // Save interview results to localStorage
    const { saveSession } = require('@/lib/storage')
    const { generateInterviewSummary } = require('@/lib/interview-summary')
    
    // Calculate overall score from answers
    const answers = data.answers || []
    const totalScore = answers.reduce((sum: number, answer: any) => {
      return sum + (answer.analysis?.overallScore || 70)
    }, 0)
    const averageScore = answers.length > 0 ? totalScore / answers.length : 0
    
    // Calculate total time
    const totalTime = answers.reduce((sum: number, answer: any) => {
      return sum + (answer.timeSpent || 0)
    }, 0)
    
    // Generate AI-powered summary based on actual answers
    console.log('🤖 Generating AI summary for', answers.length, 'answers...')
    const summary = await generateInterviewSummary(answers, profile, selectedTemplate)
    console.log('✅ Summary generated:', summary)
    
    // Create session object
    const session = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      template: selectedTemplate?.id || 'unknown',
      templateName: selectedTemplate?.name || 'Unknown Template',
      score: Math.round(averageScore * 10) / 10,
      questionsAnswered: answers.length,
      totalTime: Math.round(totalTime),
      answers: answers.map((answer: any) => ({
        questionId: answer.questionId || 0,
        questionText: answer.question?.question || '',
        transcription: answer.transcript || '',
        timeSpent: answer.timeSpent || 0,
        scores: {
          clarity: answer.analysis?.clarity || 70,
          relevance: answer.analysis?.relevance || 70,
          completeness: answer.analysis?.completeness || 70,
          technical_accuracy: answer.analysis?.technicalAccuracy || 70,
          communication: answer.analysis?.communication || 70,
          overall: answer.analysis?.overallScore || 70
        }
      }))
    }
    
    // Save to localStorage
    saveSession(session)
    
    // Show results dashboard with AI-generated summary
    setCompletedData({ ...data, summary })
    setInterviewComplete(true)
  }

  if (!selectedTemplate || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading interview...</p>
        </div>
      </div>
    )
  }

  if (!isReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="container mx-auto px-4 py-12">
          {/* Back Button */}
          <button
            onClick={() => router.push('/interview/start')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Templates</span>
          </button>

          {/* Setup Card */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Interview Setup
              </h1>
              <p className="text-gray-400 mb-8">
                {selectedTemplate.name} • {questions.length} questions
              </p>

              {/* Permissions Check */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-900/50">
                  {hasPermissions ? (
                    <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">
                      Camera & Microphone Access
                    </h3>
                    <p className="text-sm text-gray-400">
                      {hasPermissions 
                        ? 'Permissions granted. You\'re ready to start!'
                        : permissionError || 'Checking permissions...'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-900/50">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">
                      Questions Loaded
                    </h3>
                    <p className="text-sm text-gray-400">
                      {questions.length} questions ready for your interview
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-900/50">
                  <Clock className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">
                      Estimated Time
                    </h3>
                    <p className="text-sm text-gray-400">
                      ~{Math.ceil((selectedTemplate.duration_per_question * questions.length) / 60)} minutes
                    </p>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-8">
                <h3 className="font-semibold text-blue-400 mb-2">
                  Interview Tips
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• Find a quiet place with good lighting</li>
                  <li>• Look at the camera when answering</li>
                  <li>• Take your time to think before answering</li>
                  <li>• Speak clearly and at a moderate pace</li>
                  <li>• You can pause and resume anytime</li>
                </ul>
              </div>

              {/* Start Button */}
              <button
                onClick={handleStartInterview}
                disabled={!hasPermissions}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg transition-all duration-300 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Video className="w-6 h-6" />
                <span>Start Interview</span>
              </button>

              {!hasPermissions && (
                <p className="text-center text-sm text-gray-400 mt-4">
                  Please allow camera and microphone access to continue
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Profile is already defined at the top with useMemo
  // Company persona based on template
  const companyPersona = {
    name: 'Tech Company',
    culture: 'innovative',
    values: ['collaboration', 'innovation', 'growth']
  }

  // Show results dashboard if interview is complete
  if (interviewComplete && completedData) {
    return (
      <ResultsDashboard
        data={{
          answers: completedData.answers || [],
          profile: profile,
          summary: completedData.summary || {}
        }}
        onRestart={() => router.push('/interview/start')}
      />
    )
  }

  return (
    <InterviewRoom
      profile={profile}
      companyPersona={companyPersona}
      adaptiveDifficulty={true}
      onComplete={handleComplete}
    />
  )
}
