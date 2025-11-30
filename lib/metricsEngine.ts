/**
 * Metrics Engine - Computes speech and behavioral metrics from transcripts and facial data
 * 
 * Provides real-time confidence scoring based on:
 * - Speaking pace (WPM)
 * - Filler words
 * - Pauses
 * - Answer length
 * 
 * Future: Can be extended to call HF emotion models
 */

import { AnswerMetrics, EmotionSnapshot } from './types'

/**
 * Analyze transcript and compute speech metrics
 */
export function analyzeTranscript(
  transcript: string,
  startTime: number,
  endTime: number,
  emotionTimeline: EmotionSnapshot[]
): AnswerMetrics {
  const duration = (endTime - startTime) / 1000 // seconds
  const words = transcript.trim().split(/\s+/)
  const wordCount = words.length

  // Speaking speed (words per minute)
  const speakingSpeed = duration > 0 ? (wordCount / duration) * 60 : 0

  // Filler words detection
  const fillerWords = countFillerWords(transcript)

  // Pause detection (rough estimate from transcript)
  const pauseCount = detectPauses(transcript)
  const avgPauseLength = duration > 0 ? (duration - (wordCount * 0.3)) / Math.max(pauseCount, 1) : 0

  // Aggregate emotion metrics
  const avgConfidence = emotionTimeline.length > 0
    ? emotionTimeline.reduce((sum, e) => sum + e.confidence, 0) / emotionTimeline.length
    : 0.5

  const avgEyeContact = emotionTimeline.length > 0
    ? emotionTimeline.reduce((sum, e) => sum + e.eyeContact, 0) / emotionTimeline.length
    : 0.5

  // Compute real-time confidence score
  const confidence = computeConfidenceSignals(transcript, {
    speakingSpeed,
    fillerWords,
    wordCount,
    pauseCount,
    avgPauseLength,
    duration
  })

  // Engagement score based on multiple factors
  const engagement = calculateEngagement(
    speakingSpeed,
    fillerWords,
    wordCount,
    avgEyeContact,
    emotionTimeline
  )

  return {
    wordCount,
    speakingSpeed: Math.round(speakingSpeed),
    fillerWords,
    pauseCount,
    avgPauseLength: Math.round(avgPauseLength * 10) / 10,
    confidence: Math.round(confidence * 100) / 100,
    engagement: Math.round(engagement * 100) / 100,
    eyeContact: Math.round(avgEyeContact * 100) / 100,
    emotionTimeline
  }
}

/**
 * Compute confidence score from speaking metrics
 * 
 * This is a client-side heuristic. Future enhancement:
 * - Call HF emotion model on backend
 * - Analyze tone, sentiment, hesitation
 * - Use voice features (pitch, energy)
 * 
 * For now: based on pace, fillers, pauses, length
 */
export function computeConfidenceSignals(
  answerText: string,
  rawMetrics: {
    speakingSpeed: number
    fillerWords: number
    wordCount: number
    pauseCount: number
    avgPauseLength: number
    duration: number
  }
): number {
  let score = 70 // Base score

  const { speakingSpeed, fillerWords, wordCount, pauseCount, avgPauseLength } = rawMetrics

  // Speaking speed scoring
  // Ideal: 120-150 WPM
  if (speakingSpeed >= 120 && speakingSpeed <= 150) {
    score += 10 // Good pace
  } else if (speakingSpeed < 80) {
    score -= 15 // Too slow (nervous/uncertain)
  } else if (speakingSpeed > 180) {
    score -= 10 // Too fast (anxious)
  } else if (speakingSpeed < 120) {
    score -= 5 // Slightly slow
  } else if (speakingSpeed > 150) {
    score -= 5 // Slightly fast
  }

  // Filler words penalty
  if (wordCount > 0) {
    const fillerRatio = fillerWords / wordCount
    if (fillerRatio > 0.1) {
      score -= 20 // Too many fillers (> 10%)
    } else if (fillerRatio > 0.05) {
      score -= 10 // Some fillers (5-10%)
    }
  }

  // Answer length scoring
  if (wordCount < 20) {
    score -= 15 // Too short
  } else if (wordCount < 40) {
    score -= 5 // Somewhat short
  } else if (wordCount > 200) {
    score -= 5 // Too long (rambling)
  }

  // Pause analysis
  if (avgPauseLength > 2) {
    score -= 10 // Long pauses (hesitation)
  } else if (avgPauseLength > 1.5) {
    score -= 5 // Moderate pauses
  }

  // Clamp to 0-100
  return Math.max(0, Math.min(100, score)) / 100
}

/**
 * Count filler words in transcript
 */
function countFillerWords(transcript: string): number {
  const fillerPatterns = [
    /\bum+\b/gi,
    /\buh+\b/gi,
    /\blike\b/gi,
    /\byou know\b/gi,
    /\bbasically\b/gi,
    /\bactually\b/gi,
    /\bliterally\b/gi,
    /\bkind of\b/gi,
    /\bsort of\b/gi,
    /\bi mean\b/gi
  ]

  let count = 0
  fillerPatterns.forEach(pattern => {
    const matches = transcript.match(pattern)
    if (matches) count += matches.length
  })

  return count
}

/**
 * Detect pauses from transcript patterns
 */
function detectPauses(transcript: string): number {
  // Look for multiple spaces, ellipsis, or sentence breaks
  const pausePatterns = [
    /\s{2,}/g,
    /\.\.\./g,
    /[.!?]\s+/g
  ]

  let count = 0
  pausePatterns.forEach(pattern => {
    const matches = transcript.match(pattern)
    if (matches) count += matches.length
  })

  return Math.max(count, 1)
}

/**
 * Calculate overall engagement score
 */
function calculateEngagement(
  speakingSpeed: number,
  fillerWords: number,
  wordCount: number,
  eyeContact: number,
  emotionTimeline: EmotionSnapshot[]
): number {
  // Ideal speaking speed: 120-150 WPM
  const speedScore = speakingSpeed >= 100 && speakingSpeed <= 160 ? 1.0 : 0.7

  // Filler word penalty
  const fillerRatio = wordCount > 0 ? fillerWords / wordCount : 0
  const fillerScore = Math.max(0, 1 - (fillerRatio * 5))

  // Eye contact score
  const eyeContactScore = eyeContact

  // Positive emotion ratio
  const positiveEmotions = emotionTimeline.filter(e => 
    e.emotion === 'happy' || e.emotion === 'confident'
  ).length
  const emotionScore = emotionTimeline.length > 0 
    ? positiveEmotions / emotionTimeline.length 
    : 0.5

  // Weighted average
  return (speedScore * 0.25 + fillerScore * 0.25 + eyeContactScore * 0.25 + emotionScore * 0.25)
}

/**
 * Create a metrics snapshot for a specific moment
 */
export function createMetricsSnapshot(
  emotion: string,
  confidence: number,
  engagement: number
): { confidence: number; engagement: number; emotion: string; timestamp: number } {
  return {
    confidence,
    engagement,
    emotion,
    timestamp: Date.now()
  }
}

/**
 * Analyze speaking pace trends over time
 */
export function analyzeSpeakingPaceTrend(answers: any[]): {
  trend: 'improving' | 'declining' | 'stable'
  avgSpeed: number
  consistency: number
} {
  if (answers.length < 2) {
    return { trend: 'stable', avgSpeed: 0, consistency: 1 }
  }

  const speeds = answers.map(a => a.metrics?.speakingSpeed || 0)
  const avgSpeed = speeds.reduce((sum, s) => sum + s, 0) / speeds.length

  // Calculate trend
  const firstHalf = speeds.slice(0, Math.floor(speeds.length / 2))
  const secondHalf = speeds.slice(Math.floor(speeds.length / 2))
  
  const firstAvg = firstHalf.reduce((sum, s) => sum + s, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((sum, s) => sum + s, 0) / secondHalf.length

  let trend: 'improving' | 'declining' | 'stable' = 'stable'
  if (secondAvg > firstAvg * 1.1) trend = 'improving'
  else if (secondAvg < firstAvg * 0.9) trend = 'declining'

  // Calculate consistency (lower variance = more consistent)
  const variance = speeds.reduce((sum, s) => sum + Math.pow(s - avgSpeed, 2), 0) / speeds.length
  const consistency = Math.max(0, 1 - (variance / 1000))

  return {
    trend,
    avgSpeed: Math.round(avgSpeed),
    consistency: Math.round(consistency * 100) / 100
  }
}

/**
 * Identify the candidate's weakest competency area
 */
export function identifyWeakestCompetency(answers: any[]): {
  competency: string
  avgScore: number
  questionIds: string[]
} {
  const competencyScores: { [key: string]: { scores: number[]; ids: string[] } } = {}

  answers.forEach(answer => {
    const category = answer.question?.category || 'general'
    if (!competencyScores[category]) {
      competencyScores[category] = { scores: [], ids: [] }
    }
    competencyScores[category].scores.push(answer.analysis?.overallScore || 70)
    competencyScores[category].ids.push(answer.questionId)
  })

  let weakest = { competency: 'behavioral', avgScore: 100, questionIds: [] as string[] }

  Object.entries(competencyScores).forEach(([competency, data]) => {
    const avgScore = data.scores.reduce((sum, s) => sum + s, 0) / data.scores.length
    if (avgScore < weakest.avgScore) {
      weakest = { competency, avgScore, questionIds: data.ids }
    }
  })

  return weakest
}
