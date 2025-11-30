/**
 * LLM Chat Module - Handles all Gemini API interactions
 * Manages multi-turn conversations with context and adaptive questioning
 */

import { CandidateProfile, Question, AnswerAnalysis, MetricsSnapshot, CompanyPersona } from './types'

import { callLLM, callLLMStream, ChatMessage } from './llmRouter'

// Debug mode - set to true to see timing metrics
const DEBUG_MODE = typeof window !== 'undefined' && localStorage.getItem('debug') === 'true'

interface ChatHistory {
  role: 'user' | 'model'
  parts: { text: string }[]
}

import { InterviewState, initializeInterviewState, markTopicAsked, addQuestion, isQuestionSimilar, getTopicsSummary, inferTopicFromQuestion } from './interviewState'

export class InterviewChatSession {
  private history: ChatHistory[] = []
  private profile: CandidateProfile
  private questionCount: number = 0
  private companyPersona: CompanyPersona
  private adaptiveDifficulty: boolean
  private currentDifficulty: 'easy' | 'medium' | 'hard' = 'medium'
  public lastCallDuration: number = 0 // For debug display
  private interviewState: InterviewState

  constructor(
    profile: CandidateProfile,
    companyPersona: CompanyPersona = 'general',
    adaptiveDifficulty: boolean = true
  ) {
    this.profile = profile
    this.companyPersona = companyPersona
    this.adaptiveDifficulty = adaptiveDifficulty
    this.interviewState = initializeInterviewState(profile)
  }

  /**
   * Initialize the interview with a greeting and profile summary
   * Uses Groq for fast, conversational responses
   */
  async startInterview(): Promise<{ greeting: string; profileSummary: string; firstQuestion: Question }> {
    const systemPrompt = this.buildCompactSystemPrompt()
    
    const hasResume = this.profile.resumeText && this.profile.resumeText.length > 50
    
    console.log('🎬 Starting interview with resume:', hasResume ? 'YES' : 'NO')
    
    const userPrompt = hasResume 
      ? `The candidate has uploaded their resume (see system prompt). 

CRITICAL: You MUST return ONLY valid JSON. No other text.

Return this exact JSON structure:
{
  "greeting": "1 sentence greeting",
  "profileSummary": "mention specific project/company/tech from their resume",
  "question": "ask about specific experience from their resume",
  "category": "behavioral|technical|situational|culture"
}

Do NOT include any text before or after the JSON.
Do NOT ask follow-up questions.
ONLY return the JSON object.`
      : `Start interview. Return ONLY valid JSON with no other text:
{
  "greeting": "1 sentence greeting",
  "profileSummary": "1 sentence about background",
  "question": "first question",
  "category": "behavioral|technical|situational|culture"
}`
    
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]
    
    try {
      const response = await callLLM(
        { role: 'interviewer' },
        messages,
        { temperature: 0.7, maxTokens: 256 }
      )
      
      const parsed = this.parseJSON(response.content)

      const question: Question = {
        id: `q-${this.questionCount++}`,
        question: parsed.question || 'Tell me about yourself.',
        category: parsed.category || 'behavioral',
        difficulty: this.currentDifficulty,
        isFollowUp: false
      }

      return {
        greeting: parsed.greeting || 'Hello! Thanks for joining me today.',
        profileSummary: parsed.profileSummary || 'I see you have great experience.',
        firstQuestion: question
      }
    } catch (error) {
      console.error('❌ Error in startInterview:', error)
      throw error
    }
  }

  /**
   * Get the next question AND score previous answer with specific feedback
   * Uses Groq for fast streaming responses
   */
  async getNextQuestionStreaming(
    previousAnswer: string,
    previousQuestion: string,
    metricsSnapshot: MetricsSnapshot,
    questionNumber: number,
    totalQuestions: number = 10,
    onChunk: (text: string) => void
  ): Promise<{ 
    question: Question
    acknowledgement?: string
    shouldEnd: boolean
    score: number
    feedback: { strength: string; improvement: string; feedbackText: string }
  }> {
    // Adjust difficulty if adaptive mode is on
    if (this.adaptiveDifficulty) {
      this.adjustDifficulty(metricsSnapshot.confidence)
    }

    const shouldEnd = questionNumber >= totalQuestions

    if (shouldEnd) {
      return {
        question: null as any,
        acknowledgement: "Thanks! Let me prepare your feedback.",
        shouldEnd: true,
        score: 70,
        feedback: { strength: '', improvement: '', feedbackText: '' }
      }
    }

    const systemPrompt = this.buildCompactSystemPrompt()
    const wordCount = previousAnswer.trim().split(/\s+/).length
    
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { 
        role: 'user', 
        content: `Here is the candidate's answer to your question:

Question: "${previousQuestion}"
Candidate's exact response: "${previousAnswer}"
Word count: ${wordCount}
Confidence: ${Math.round(metricsSnapshot.confidence * 100)}%

INSTRUCTIONS:
1. You MUST read and process their answer BEFORE responding
2. Your acknowledgement should be a specific, contextual reaction to what they said (NOT generic)
3. If answer is under 15 words, ask them to elaborate instead of moving on
4. Make your response feel like a natural conversation - reference something they mentioned
5. Keep responses 1-3 sentences maximum

Evaluate THIS specific answer:
1. Score (0-100)
2. ONE specific strength from what they actually said
3. ONE specific improvement for THIS answer
4. Brief contextual feedback (1-2 sentences referencing their answer)
5. Contextual acknowledgement (e.g., "So you focused on X..." or "I see you handled that by...")
6. Next question (NEW topic) OR follow-up if answer was too short

IMPORTANT:
- Do NOT give generic replies like "Got it" or "Interesting" - be specific
- Do NOT say "clear communication" unless truly exceptional
- If answer is vague or short, ask for elaboration: "Can you tell me more about..."
- Reference their actual words in your acknowledgement

Return JSON:
{
  "score": 0-100,
  "strength": "specific strength from THIS answer",
  "improvement": "specific actionable improvement",
  "feedback": "1-2 sentences about THIS answer",
  "ack": "contextual acknowledgement referencing their answer",
  "question": "next question on NEW topic OR follow-up if too short",
  "category": "behavioral|technical|situational|culture"
}` 
      }
    ]

    const response = await callLLMStream(
      { role: 'interviewer' },
      messages,
      onChunk,
      { temperature: 0.7, maxTokens: 400 }
    )
    
    const parsed = this.parseJSON(response.content)

    const questionText = parsed.question || 'Tell me more about your experience.'
    
    // Check if question is too similar to previous ones
    if (isQuestionSimilar(questionText, this.interviewState.askedQuestions)) {
      console.warn('Question too similar, using fallback')
      // Use a fallback question
      const fallbacks = [
        'Tell me about a time you had to learn something new quickly.',
        'Describe a situation where you had to work with a difficult team member.',
        'What\'s your approach to handling tight deadlines?'
      ]
      const fallbackQ = fallbacks[this.questionCount % fallbacks.length]
      addQuestion(this.interviewState, fallbackQ)
      
      const question: Question = {
        id: `q-${this.questionCount++}`,
        question: fallbackQ,
        category: 'behavioral',
        difficulty: this.currentDifficulty,
        isFollowUp: false
      }
      
      return {
        question,
        acknowledgement: parsed.ack || 'Got it',
        shouldEnd: false,
        score: parsed.score || 70,
        feedback: {
          strength: parsed.strength || 'Provided relevant information',
          improvement: parsed.improvement || 'Add more specific examples',
          feedbackText: parsed.feedback || 'Good answer.'
        }
      }
    }

    // Add question to history
    addQuestion(this.interviewState, questionText)
    
    // Infer and mark topic as asked
    const topic = inferTopicFromQuestion(questionText, this.interviewState)
    markTopicAsked(this.interviewState, topic)

    const question: Question = {
      id: `q-${this.questionCount++}`,
      question: questionText,
      category: parsed.category || 'behavioral',
      difficulty: this.currentDifficulty,
      isFollowUp: false
    }

    return {
      question,
      acknowledgement: parsed.ack,
      shouldEnd: false,
      score: parsed.score || 70,
      feedback: {
        strength: parsed.strength || 'Provided relevant information',
        improvement: parsed.improvement || 'Add more specific examples',
        feedbackText: parsed.feedback || 'Good answer.'
      }
    }
  }

  /**
   * Determine if we should follow up based on answer quality
   */
  private shouldFollowUp(answer: string): boolean {
    const wordCount = answer.split(' ').length
    return wordCount < 50 // Follow up if answer is too short
  }

  /**
   * Get recent history for context (last 4 messages)
   */
  private getRecentHistory(): ChatHistory[] {
    return this.history.slice(-4)
  }

  /**
   * Quick quality gates before LLM scoring
   */
  quickScore(answer: string, metrics: MetricsSnapshot): AnswerAnalysis {
    const wordCount = answer.trim().split(/\s+/).length
    const hasSTAR = /situation|task|action|result/i.test(answer)
    
    // Quality gates
    if (!answer.trim() || answer.toLowerCase() === 'pass') {
      return {
        overallScore: 0,
        relevance: 0,
        structure: 0,
        depth: 0,
        clarity: 0,
        feedback: 'Question was skipped or unanswered.',
        strengths: [],
        improvements: ['Provide an answer to demonstrate your experience'],
        idealAnswerOutline: ''
      }
    }
    
    if (wordCount < 20) {
      return {
        overallScore: 30,
        relevance: 3,
        structure: 3,
        depth: 2,
        clarity: 4,
        feedback: 'Answer is too short. Expand using STAR method: describe the Situation, Task, Action you took, and Result.',
        strengths: [],
        improvements: ['Provide more detail and specific examples'],
        idealAnswerOutline: ''
      }
    }
    
    // Normal heuristic scoring
    const relevance = wordCount > 30 ? 7 : 5
    const structure = hasSTAR ? 8 : 6
    const depth = wordCount > 80 ? 8 : wordCount > 40 ? 6 : 4
    const clarity = metrics.confidence > 0.7 ? 8 : 6
    const overallScore = Math.round((relevance + structure + depth + clarity) * 2.5)

    return {
      overallScore,
      relevance,
      structure,
      depth,
      clarity,
      feedback: '', // Will be filled by LLM
      strengths: [],
      improvements: [],
      idealAnswerOutline: ''
    }
  }

  /**
   * Generate final interview summary with detailed feedback
   * Uses Groq for fast summary generation
   */
  async generateFinalSummary(answers: any[]): Promise<{
    overallScore: number
    summary: string
    keyStrengths: string[]
    areasForImprovement: string[]
    nextSteps: string[]
    detailedFeedback: Array<{ questionId: string; feedback: string; strengths: string[]; improvements: string[] }>
  }> {
    const avgScore = answers.reduce((acc, a) => acc + (a.analysis?.overallScore || 70), 0) / answers.length

    const messages: ChatMessage[] = [
      { 
        role: 'user', 
        content: `Interview: ${answers.length} questions, avg ${Math.round(avgScore)}.

Answers:
${answers.map((a, i) => `Q${i + 1}: "${a.transcript.substring(0, 100)}"`).join('\n')}

JSON:
{
  "overallScore": 0-100,
  "summary": "2 paragraphs",
  "keyStrengths": ["3 items"],
  "areasForImprovement": ["3 items"],
  "nextSteps": ["3 items"]
}` 
      }
    ]

    const response = await callLLM(
      { role: 'interviewer' },
      messages,
      { temperature: 0.7, maxTokens: 512 }
    )
    
    const parsed = this.parseJSON(response.content)

    // Generate simple feedback for each question
    const detailedFeedback = answers.map((a, i) => ({
      questionId: a.questionId,
      feedback: 'Good answer. See overall feedback above.',
      strengths: ['Clear communication'],
      improvements: ['Add more specific examples']
    }))

    return {
      overallScore: parsed.overallScore || Math.round(avgScore),
      summary: parsed.summary || 'Good overall performance.',
      keyStrengths: parsed.keyStrengths || ['Clear communication'],
      areasForImprovement: parsed.areasForImprovement || ['Add more structure'],
      nextSteps: parsed.nextSteps || ['Practice STAR method'],
      detailedFeedback
    }
  }

  /**
   * Compact system prompt with topic tracking and resume context
   */
  private buildCompactSystemPrompt(): string {
    const personaContext = this.getPersonaContext()
    const topicsSummary = getTopicsSummary(this.interviewState)
    
    // Include resume context if available
    const hasResume = this.profile.resumeText && this.profile.resumeText.length > 50
    const resumeContext = hasResume
      ? `\n\n📄 CANDIDATE'S RESUME/DOCUMENT:\n${this.profile.resumeText.substring(0, 3000)}\n\n⚠️ CRITICAL INSTRUCTIONS:
1. This document may be in PDF format or other format - extract the relevant information
2. Identify: candidate's name, experience, skills, projects, companies, education
3. Ask SPECIFIC questions about their actual projects and technologies mentioned
4. Reference real company names, project names, and technologies from the document
5. Make questions personalized and engaging based on their actual background
6. Do NOT ask generic questions - be specific to their experience`
      : '\n\n(No resume provided - ask general questions based on role)'
    
    if (hasResume) {
      console.log('✅ Resume included in system prompt (', this.profile.resumeText.length, 'chars)')
    } else {
      console.log('⚠️ No resume text available for interview')
    }

    return `HR interviewer for ${this.profile.targetRole}. ${this.profile.yearsOfExperience}yr exp, skills: ${this.profile.skills.slice(0, 5).join(', ')}.${resumeContext}

${personaContext}

${topicsSummary}

Style:
- Natural, conversational, 1-3 sentences MAX
- ALWAYS paraphrase or reference their specific answer: "So you handled that by..." or "I see you focused on..."
- Do NOT use generic acknowledgements like "Got it" or "Interesting"
- Do NOT repeat their filler words
- If answer is under 15 words, ask them to elaborate before moving on
- Only speak AFTER processing their full answer
- Make every response contextual and specific to what they said
- If resume is provided, ask about specific projects, technologies, or experiences mentioned in it

IMPORTANT: 
- Pick NEW topics from remaining list. Avoid repeating earlier questions.
- Wait for their complete answer before responding
- Your replies should feel like you actually listened to them
- Reference their resume when asking questions to make it personalized`
  }

  private getPersonaContext(): string {
    const personas = {
      'big-tech': 'Company Style: Large tech company (Google, Meta, Amazon style). Focus on scale, system design, leadership principles, and data-driven decisions.',
      'startup': 'Company Style: Fast-paced startup. Focus on adaptability, wearing multiple hats, ownership, and scrappy problem-solving.',
      'finance': 'Company Style: Financial services firm. Focus on attention to detail, risk management, compliance, and working under pressure.',
      'consulting': 'Company Style: Management consulting. Focus on structured thinking, client communication, and business impact.',
      'general': 'Company Style: General professional environment. Balanced focus on skills, culture fit, and growth potential.'
    }
    return personas[this.companyPersona]
  }

  private adjustDifficulty(confidence: number) {
    if (confidence > 0.8) {
      this.currentDifficulty = 'hard'
    } else if (confidence < 0.5) {
      this.currentDifficulty = 'easy'
    } else {
      this.currentDifficulty = 'medium'
    }
  }



  private parseJSON(response: string): any {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      throw new Error('No JSON found')
    } catch (error) {
      console.error('JSON parse error:', error, 'Response:', response)
      return {}
    }
  }

  getHistory() {
    return this.history
  }
}
