/**
 * Interview State Management
 * Tracks topics, questions, and conversation flow to avoid repetition
 */

import { CandidateProfile } from './types'

export interface InterviewState {
  candidateProfile: CandidateProfile
  askedTopics: Set<string>
  remainingTopics: string[]
  askedQuestions: string[]
  questionCount: number
}

/**
 * Initialize interview state from candidate profile
 */
export function initializeInterviewState(profile: CandidateProfile): InterviewState {
  // Generate topics from profile
  const allTopics = [
    // Skills
    ...profile.skills.slice(0, 8).map(s => `skill:${s}`),
    // Strengths
    ...profile.strengths.slice(0, 5),
    // Gaps (areas to explore)
    ...profile.gaps.slice(0, 3).map(g => `gap:${g}`),
    // Common behavioral topics
    'leadership',
    'teamwork',
    'problem-solving',
    'conflict-resolution',
    'time-management',
    'communication',
    'adaptability',
    'decision-making'
  ]

  // Remove duplicates
  const uniqueTopics = Array.from(new Set(allTopics))

  return {
    candidateProfile: profile,
    askedTopics: new Set(),
    remainingTopics: uniqueTopics,
    askedQuestions: [],
    questionCount: 0
  }
}

/**
 * Mark a topic as asked and remove from remaining
 */
export function markTopicAsked(state: InterviewState, topic: string) {
  state.askedTopics.add(topic)
  state.remainingTopics = state.remainingTopics.filter(t => t !== topic)
}

/**
 * Add question to history
 */
export function addQuestion(state: InterviewState, question: string) {
  state.askedQuestions.push(question)
  state.questionCount++
}

/**
 * Check if a new question is too similar to previous ones
 * Returns true if too similar (should regenerate)
 */
export function isQuestionSimilar(newQuestion: string, existingQuestions: string[]): boolean {
  if (existingQuestions.length === 0) return false

  const newWords = new Set(
    newQuestion.toLowerCase()
      .split(' ')
      .filter(w => w.length > 3) // Only meaningful words
  )

  for (const existing of existingQuestions) {
    const existingWords = new Set(
      existing.toLowerCase()
        .split(' ')
        .filter(w => w.length > 3)
    )

    // Calculate Jaccard similarity
    const intersection = [...newWords].filter(w => existingWords.has(w)).length
    const union = new Set([...newWords, ...existingWords]).size
    const similarity = union > 0 ? intersection / union : 0

    // If > 50% similar, it's too repetitive
    if (similarity > 0.5) {
      return true
    }
  }

  return false
}

/**
 * Get topics summary for system prompt
 */
export function getTopicsSummary(state: InterviewState): string {
  const asked = Array.from(state.askedTopics).slice(0, 10).join(', ')
  const remaining = state.remainingTopics.slice(0, 10).join(', ')

  return `Topics covered: ${asked || 'none yet'}
Remaining topics: ${remaining || 'all covered'}`
}

/**
 * Infer topic from question text
 */
export function inferTopicFromQuestion(question: string, state: InterviewState): string {
  const questionLower = question.toLowerCase()

  // Check remaining topics
  for (const topic of state.remainingTopics) {
    const topicWords = topic.toLowerCase().replace('skill:', '').replace('gap:', '').split('-')
    if (topicWords.some(word => questionLower.includes(word))) {
      return topic
    }
  }

  // Check for common behavioral topics
  if (questionLower.includes('lead') || questionLower.includes('leadership')) return 'leadership'
  if (questionLower.includes('team')) return 'teamwork'
  if (questionLower.includes('conflict')) return 'conflict-resolution'
  if (questionLower.includes('problem') || questionLower.includes('challenge')) return 'problem-solving'
  if (questionLower.includes('time') || questionLower.includes('deadline')) return 'time-management'
  if (questionLower.includes('communicate')) return 'communication'

  return 'general'
}
