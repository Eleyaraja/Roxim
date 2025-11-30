/**
 * LocalStorage Helper for Interview Session Tracking
 */

export interface InterviewSession {
  id: string
  date: string
  template: string
  templateName: string
  score: number
  questionsAnswered: number
  totalTime: number
  answers: SessionAnswer[]
}

export interface SessionAnswer {
  questionId: number
  questionText: string
  transcription: string
  timeSpent: number
  scores: {
    clarity: number
    relevance: number
    completeness: number
    technical_accuracy: number
    communication: number
    overall: number
  }
}

const STORAGE_KEY = 'interview_sessions'
const MAX_SESSIONS = 20

/**
 * Get all interview sessions from localStorage
 */
export function getSessions(): InterviewSession[] {
  if (typeof window === 'undefined') return []
  
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Error reading sessions:', error)
    return []
  }
}

/**
 * Save a new interview session
 */
export function saveSession(session: InterviewSession): void {
  if (typeof window === 'undefined') return
  
  try {
    const sessions = getSessions()
    
    // Add new session at the beginning
    sessions.unshift(session)
    
    // Keep only last MAX_SESSIONS
    const trimmed = sessions.slice(0, MAX_SESSIONS)
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  } catch (error) {
    console.error('Error saving session:', error)
  }
}

/**
 * Get session by ID
 */
export function getSessionById(id: string): InterviewSession | null {
  const sessions = getSessions()
  return sessions.find(s => s.id === id) || null
}

/**
 * Delete a session
 */
export function deleteSession(id: string): void {
  if (typeof window === 'undefined') return
  
  try {
    const sessions = getSessions()
    const filtered = sessions.filter(s => s.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error('Error deleting session:', error)
  }
}

/**
 * Clear all sessions
 */
export function clearAllSessions(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Error clearing sessions:', error)
  }
}

/**
 * Get statistics from all sessions
 */
export function getStatistics() {
  const sessions = getSessions()
  
  if (sessions.length === 0) {
    return {
      totalInterviews: 0,
      averageScore: 0,
      totalQuestions: 0,
      totalTime: 0,
      improvementRate: 0,
      categoryScores: {}
    }
  }
  
  const totalInterviews = sessions.length
  const averageScore = sessions.reduce((sum, s) => sum + s.score, 0) / totalInterviews
  const totalQuestions = sessions.reduce((sum, s) => sum + s.questionsAnswered, 0)
  const totalTime = sessions.reduce((sum, s) => sum + s.totalTime, 0)
  
  // Calculate improvement rate (compare first 5 vs last 5 sessions)
  let improvementRate = 0
  if (sessions.length >= 10) {
    const recent5 = sessions.slice(0, 5)
    const older5 = sessions.slice(-5)
    const recentAvg = recent5.reduce((sum, s) => sum + s.score, 0) / 5
    const olderAvg = older5.reduce((sum, s) => sum + s.score, 0) / 5
    improvementRate = ((recentAvg - olderAvg) / olderAvg) * 100
  }
  
  // Category scores
  const categoryScores: Record<string, { total: number; count: number }> = {}
  sessions.forEach(session => {
    if (!categoryScores[session.template]) {
      categoryScores[session.template] = { total: 0, count: 0 }
    }
    categoryScores[session.template].total += session.score
    categoryScores[session.template].count += 1
  })
  
  const categoryAverages: Record<string, number> = {}
  Object.keys(categoryScores).forEach(key => {
    categoryAverages[key] = categoryScores[key].total / categoryScores[key].count
  })
  
  return {
    totalInterviews,
    averageScore: Math.round(averageScore * 10) / 10,
    totalQuestions,
    totalTime: Math.round(totalTime / 60), // Convert to minutes
    improvementRate: Math.round(improvementRate * 10) / 10,
    categoryScores: categoryAverages
  }
}

/**
 * Get score trend data for charts
 */
export function getScoreTrend() {
  const sessions = getSessions()
  
  // Return last 10 sessions in chronological order
  return sessions
    .slice(0, 10)
    .reverse()
    .map((session, index) => ({
      session: index + 1,
      score: session.score,
      date: new Date(session.date).toLocaleDateString(),
      template: session.templateName
    }))
}
