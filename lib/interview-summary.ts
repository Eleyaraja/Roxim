// AI-powered interview summary generation
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function generateInterviewSummary(answers: any[], profile: any, template: any) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '')
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    // Prepare interview data for analysis
    const interviewData = answers.map((answer, i) => ({
      questionNumber: i + 1,
      question: answer.question?.question || `Question ${i + 1}`,
      category: answer.question?.category || 'general',
      candidateAnswer: answer.transcript || '',
      wordCount: answer.metrics?.wordCount || 0,
      speakingSpeed: answer.metrics?.speakingSpeed || 0,
      confidence: Math.round((answer.metrics?.confidence || 0.5) * 100),
      currentScore: answer.analysis?.overallScore || 70,
      currentFeedback: answer.analysis?.feedback || ''
    }))

    const prompt = `You are an expert interview coach analyzing a ${template?.name || 'professional'} interview. 

INTERVIEW DETAILS:
- Role: ${template?.name || 'Professional'}
- Questions Answered: ${answers.length}
- Candidate Profile: ${profile?.targetRole || 'Professional'}

INTERVIEW TRANSCRIPT:
${interviewData.map(q => `
Question ${q.questionNumber} (${q.category}):
"${q.question}"

Candidate's Answer (${q.wordCount} words, ${q.speakingSpeed} WPM, ${q.confidence}% confidence):
"${q.candidateAnswer}"

Current Score: ${q.currentScore}/100
`).join('\n---\n')}

Provide a comprehensive, personalized analysis in JSON format:
{
  "overallScore": <number 0-100 based on all answers>,
  "summary": "<2-3 sentences summarizing the candidate's overall performance, mentioning specific strengths and areas observed>",
  "keyStrengths": [
    "<specific strength 1 with example from their answers>",
    "<specific strength 2 with example from their answers>",
    "<specific strength 3 with example from their answers>"
  ],
  "areasForImprovement": [
    "<specific area 1 with actionable advice>",
    "<specific area 2 with actionable advice>",
    "<specific area 3 with actionable advice>"
  ],
  "detailedFeedback": [
    {
      "questionId": 0,
      "strengths": ["<what they specifically did well in THIS answer>"],
      "improvements": ["<how to specifically improve THIS answer>"],
      "feedback": "<personalized feedback for THIS specific answer, referencing what they said>"
    }
  ],
  "recommendations": [
    "<actionable recommendation 1 based on their performance>",
    "<actionable recommendation 2 based on their performance>",
    "<actionable recommendation 3 based on their performance>"
  ]
}

IMPORTANT:
- Be SPECIFIC - reference actual content from their answers
- Be CONSTRUCTIVE - focus on growth, not criticism
- Be ACTIONABLE - give concrete steps to improve
- Be PERSONALIZED - this should feel custom to THIS candidate
- Analyze communication style, technical depth, structure, examples used
- Consider speaking pace, confidence, and answer completeness

Only return valid JSON, no other text.`

    const result = await model.generateContent(prompt)
    const response = result.response.text()
    
    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const summary = JSON.parse(jsonMatch[0])
      console.log('✅ AI Summary Generated:', summary)
      return summary
    }
    
    // Fallback if JSON parsing fails
    console.warn('⚠️ AI response not in JSON format, using fallback')
    return generateFallbackSummary(answers)
  } catch (error) {
    console.error('❌ Error generating AI summary:', error)
    return generateFallbackSummary(answers)
  }
}

// Fallback summary if AI fails
function generateFallbackSummary(answers: any[]) {
  const avgScore = answers.reduce((sum, a) => sum + (a.analysis?.overallScore || 70), 0) / answers.length
  const avgConfidence = answers.reduce((sum, a) => sum + (a.metrics?.confidence || 0.5), 0) / answers.length
  const avgWordCount = answers.reduce((sum, a) => sum + (a.metrics?.wordCount || 0), 0) / answers.length
  
  return {
    overallScore: Math.round(avgScore),
    summary: `You completed ${answers.length} interview questions with an average score of ${Math.round(avgScore)}/100. Your responses showed ${avgConfidence > 0.6 ? 'good' : 'developing'} confidence with an average of ${Math.round(avgWordCount)} words per answer. Review the detailed feedback below for personalized improvements.`,
    keyStrengths: [
      `Completed all ${answers.length} questions demonstrating commitment`,
      avgWordCount > 100 ? 'Provided detailed, comprehensive answers' : 'Gave concise, focused responses',
      avgConfidence > 0.6 ? 'Demonstrated good confidence in delivery' : 'Showed engagement with the questions'
    ],
    areasForImprovement: [
      avgWordCount < 80 ? 'Expand answers with more specific examples and details' : 'Maintain answer quality while being more concise',
      avgConfidence < 0.6 ? 'Build confidence through practice and preparation' : 'Continue refining your communication style',
      'Structure answers using STAR method (Situation, Task, Action, Result)'
    ],
    detailedFeedback: answers.map((answer, i) => ({
      questionId: i,
      strengths: answer.analysis?.strengths || ['Provided a response to the question'],
      improvements: answer.analysis?.improvements || ['Add more specific examples from your experience'],
      feedback: answer.analysis?.feedback || 'Consider providing more concrete examples and measurable results to strengthen your answer.'
    })),
    recommendations: [
      'Practice answering common interview questions for your target role',
      'Prepare 3-5 detailed STAR stories from your experience',
      'Record yourself answering questions to improve delivery',
      'Research the company and role to tailor your responses'
    ]
  }
}
