// AI-powered resume enhancement utilities
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '')

export interface EnhancementSuggestion {
  original: string
  enhanced: string
  reason: string
}

export async function enhanceBulletPoint(
  bullet: string,
  position: string,
  company: string
): Promise<EnhancementSuggestion> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    
    const prompt = `You are a professional resume writer. Enhance this bullet point to be more impactful and ATS-friendly.

Position: ${position}
Company: ${company}
Original bullet point: ${bullet}

Requirements:
1. Start with a strong action verb
2. Include quantifiable metrics if possible (or suggest where to add them)
3. Highlight impact and results
4. Keep it concise (1-2 lines)
5. Use industry keywords
6. Make it ATS-scannable

Respond in JSON format:
{
  "enhanced": "the enhanced bullet point",
  "reason": "brief explanation of changes made"
}

Only return the JSON, no other text.`

    const result = await model.generateContent(prompt)
    const response = result.response.text()
    
    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Invalid response format')
    }
    
    const parsed = JSON.parse(jsonMatch[0])
    
    return {
      original: bullet,
      enhanced: parsed.enhanced,
      reason: parsed.reason
    }
  } catch (error) {
    console.error('AI enhancement error:', error)
    throw new Error('Failed to enhance bullet point')
  }
}

export async function enhanceProjectDescription(
  description: string,
  projectName: string,
  techStack: string[]
): Promise<EnhancementSuggestion> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    
    const prompt = `You are a professional resume writer. Enhance this project description to be more compelling.

Project: ${projectName}
Tech Stack: ${techStack.join(', ')}
Original description: ${description}

Requirements:
1. Highlight technical complexity
2. Emphasize problem-solving
3. Show impact or results
4. Keep it concise (2-3 lines max)
5. Use technical keywords

Respond in JSON format:
{
  "enhanced": "the enhanced description",
  "reason": "brief explanation of changes made"
}

Only return the JSON, no other text.`

    const result = await model.generateContent(prompt)
    const response = result.response.text()
    
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Invalid response format')
    }
    
    const parsed = JSON.parse(jsonMatch[0])
    
    return {
      original: description,
      enhanced: parsed.enhanced,
      reason: parsed.reason
    }
  } catch (error) {
    console.error('AI enhancement error:', error)
    throw new Error('Failed to enhance description')
  }
}

export async function suggestSkills(
  currentSkills: string[],
  position: string,
  experience: string[]
): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    
    const prompt = `You are a career advisor. Suggest relevant skills to add based on the candidate's profile.

Target Position: ${position}
Current Skills: ${currentSkills.join(', ')}
Experience Summary: ${experience.join('; ')}

Suggest 5-10 relevant skills that:
1. Are commonly required for this position
2. Complement existing skills
3. Are in-demand in the industry
4. Are ATS-friendly keywords

Respond in JSON format:
{
  "skills": ["skill1", "skill2", "skill3", ...]
}

Only return the JSON, no other text.`

    const result = await model.generateContent(prompt)
    const response = result.response.text()
    
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Invalid response format')
    }
    
    const parsed = JSON.parse(jsonMatch[0])
    
    return parsed.skills || []
  } catch (error) {
    console.error('AI suggestion error:', error)
    return []
  }
}

export async function optimizeForATS(
  resumeText: string,
  targetRole: string
): Promise<{
  score: number
  suggestions: string[]
  keywords: string[]
}> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    
    const prompt = `You are an ATS (Applicant Tracking System) expert. Analyze this resume for ATS optimization.

Target Role: ${targetRole}
Resume Content: ${resumeText}

Provide:
1. ATS compatibility score (0-100)
2. Top 5 improvement suggestions
3. Missing keywords for this role

Respond in JSON format:
{
  "score": 85,
  "suggestions": ["suggestion1", "suggestion2", ...],
  "keywords": ["keyword1", "keyword2", ...]
}

Only return the JSON, no other text.`

    const result = await model.generateContent(prompt)
    const response = result.response.text()
    
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Invalid response format')
    }
    
    const parsed = JSON.parse(jsonMatch[0])
    
    return {
      score: parsed.score || 0,
      suggestions: parsed.suggestions || [],
      keywords: parsed.keywords || []
    }
  } catch (error) {
    console.error('ATS optimization error:', error)
    return {
      score: 0,
      suggestions: [],
      keywords: []
    }
  }
}
