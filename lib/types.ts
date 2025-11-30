// Core type definitions for the interview system

export interface CandidateProfile {
  skills: string[]
  yearsOfExperience: number
  domains: string[]
  strengths: string[]
  gaps: string[]
  targetRole: string
  resumeText: string
  jobDescription?: string
}

export interface Question {
  id: string
  question: string
  category: 'behavioral' | 'technical' | 'situational' | 'culture'
  difficulty: 'easy' | 'medium' | 'hard'
  isFollowUp: boolean
  parentQuestionId?: string
}

export interface Answer {
  questionId: string
  transcript: string
  videoBlob?: Blob
  videoUrl?: string
  startTime: number
  endTime: number
  metrics: AnswerMetrics
  analysis?: AnswerAnalysis
}

export interface AnswerMetrics {
  wordCount: number
  speakingSpeed: number // words per minute
  fillerWords: number
  pauseCount: number
  avgPauseLength: number
  confidence: number // 0-1
  engagement: number // 0-1
  eyeContact: number // 0-1
  emotionTimeline: EmotionSnapshot[]
}

export interface EmotionSnapshot {
  timestamp: number
  emotion: 'happy' | 'confident' | 'neutral' | 'nervous' | 'thinking'
  confidence: number
  eyeContact: number
  smileIntensity: number
}

export interface AnswerAnalysis {
  overallScore: number // 0-100
  relevance: number // 0-10
  structure: number // 0-10 (STAR method)
  depth: number // 0-10
  clarity: number // 0-10
  feedback: string
  strengths: string[]
  improvements: string[]
  idealAnswerOutline?: string
}

export interface InterviewSession {
  id: string
  profile: CandidateProfile
  questions: Question[]
  answers: Answer[]
  startTime: number
  endTime?: number
  overallScore?: number
  companyPersona?: CompanyPersona
  adaptiveDifficulty: boolean
}

export interface InterviewSummary {
  overallScore: number
  summary: string
  keyStrengths: string[]
  areasForImprovement: string[]
  nextSteps: string[]
  detailedFeedback?: Array<{
    questionId: string
    feedback: string
    strengths: string[]
    improvements: string[]
  }>
}

export interface ConversationMessage {
  role: 'user' | 'model'
  parts: { text: string }[]
  timestamp: number
}

export interface GeminiChatSession {
  history: ConversationMessage[]
  sendMessage: (text: string) => Promise<string>
}

export type CompanyPersona = 'big-tech' | 'startup' | 'finance' | 'consulting' | 'general'

export interface AvatarState {
  state: 'idle' | 'listening' | 'speaking' | 'thinking'
  isSpeaking: boolean
  isListening: boolean
}

export interface MetricsSnapshot {
  confidence: number
  engagement: number
  emotion: string
  timestamp: number
}
