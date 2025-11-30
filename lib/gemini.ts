const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY
const GEMINI_MODEL = 'gemini-2.0-flash-exp' // Fast Flash model
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

export async function generateQuestions(resumeText: string, role: string): Promise<any[]> {
  const prompt = `Based on this resume and the target role of ${role}, generate 5 relevant interview questions. 
  Focus on the candidate's experience, skills, and achievements mentioned in the resume.
  
  Resume:
  ${resumeText.substring(0, 3000)}
  
  Return ONLY a JSON array of objects with this structure:
  [{"question": "question text", "category": "technical|behavioral|situational"}]`

  try {
    const response = await callGemini(prompt)
    const questions = parseQuestionsFromResponse(response)
    return questions
  } catch (error) {
    console.error('Question generation error:', error)
    // Fallback questions
    return [
      { question: "Tell me about yourself and your background.", category: "behavioral" },
      { question: "What are your greatest strengths?", category: "behavioral" },
      { question: "Describe a challenging project you worked on.", category: "situational" },
      { question: "Where do you see yourself in 5 years?", category: "behavioral" },
      { question: "Why are you interested in this role?", category: "behavioral" }
    ]
  }
}

export async function analyzeAnswer(question: string, answer: string, resumeContext: string): Promise<any> {
  const prompt = `Analyze this interview answer and provide a score and feedback.
  
  Question: ${question}
  Answer: ${answer}
  
  Evaluate based on:
  1. Relevance to the question
  2. Use of STAR method (Situation, Task, Action, Result)
  3. Clarity and conciseness
  4. Specific examples and details
  
  Return ONLY a JSON object with this structure:
  {"score": 0-100, "feedback": "detailed feedback text", "strengths": ["strength1", "strength2"], "improvements": ["improvement1", "improvement2"]}`

  try {
    const response = await callGemini(prompt)
    return parseAnalysisFromResponse(response)
  } catch (error) {
    console.error('Answer analysis error:', error)
    return {
      score: 70,
      feedback: "Good answer. Consider providing more specific examples and using the STAR method.",
      strengths: ["Clear communication"],
      improvements: ["Add more specific details", "Use concrete examples"]
    }
  }
}

async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to .env.local')
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      }
    })
  })

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.candidates[0].content.parts[0].text
}

function parseQuestionsFromResponse(response: string): any[] {
  try {
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    throw new Error('No JSON found in response')
  } catch (error) {
    // Fallback parsing
    const lines = response.split('\n').filter(line => line.trim())
    return lines.slice(0, 5).map((line, i) => ({
      question: line.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, ''),
      category: i % 2 === 0 ? 'behavioral' : 'technical'
    }))
  }
}

function parseAnalysisFromResponse(response: string): any {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    throw new Error('No JSON found in response')
  } catch (error) {
    return {
      score: 70,
      feedback: response.substring(0, 200),
      strengths: ["Clear communication"],
      improvements: ["Add more details"]
    }
  }
}
