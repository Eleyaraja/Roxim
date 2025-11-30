/**
 * Resume Profile Module - Extracts and structures candidate information
 * Uses Gemini to intelligently parse resume and job description
 */

import { CandidateProfile } from './types'
import { parseResume } from './resumeParser'
import { callLLM, ChatMessage } from './llmRouter'

// Cache for resume profiles to avoid re-parsing
const profileCache = new Map<string, CandidateProfile>()

/**
 * Extract structured profile from resume text and optional job description
 * CACHES result to avoid re-calling Gemini for same resume
 */
export async function extractCandidateProfile(
  resumeFile: File,
  jobDescription?: string,
  targetRole?: string
): Promise<CandidateProfile> {
  // Create cache key from file name and size
  const cacheKey = `${resumeFile.name}-${resumeFile.size}-${targetRole || ''}`
  
  // Check cache first
  if (profileCache.has(cacheKey)) {
    console.log('✅ Using cached profile')
    return profileCache.get(cacheKey)!
  }

  // Parse resume to text
  const resumeText = await parseResume(resumeFile)

  // Use Gemini to extract structured information
  const profile = await analyzeResumeWithGemini(resumeText, jobDescription, targetRole)

  const fullProfile = {
    ...profile,
    resumeText,
    jobDescription
  }

  // Cache the result
  profileCache.set(cacheKey, fullProfile)

  return fullProfile
}

async function analyzeResumeWithGemini(
  resumeText: string,
  jobDescription?: string,
  targetRole?: string
): Promise<Omit<CandidateProfile, 'resumeText' | 'jobDescription'>> {
  const prompt = `Analyze this resume and extract key information for interview preparation.

Resume:
${resumeText.substring(0, 4000)}

${jobDescription ? `\nJob Description:\n${jobDescription.substring(0, 2000)}` : ''}
${targetRole ? `\nTarget Role: ${targetRole}` : ''}

Extract and return ONLY a JSON object with this structure:
{
  "skills": ["skill1", "skill2", ...],
  "yearsOfExperience": number,
  "domains": ["domain1", "domain2", ...],
  "strengths": ["strength1", "strength2", ...],
  "gaps": ["gap1", "gap2", ...],
  "targetRole": "inferred or provided role"
}

Guidelines:
- skills: Technical and soft skills mentioned (max 15)
- yearsOfExperience: Total years of professional experience
- domains: Industries or areas of expertise (e.g., "E-commerce", "Healthcare", "FinTech")
- strengths: Key achievements and strong areas based on resume
- gaps: Skills or experiences mentioned in job description but missing/weak in resume
- targetRole: The role they're applying for or best suited for`

  try {
    const messages: ChatMessage[] = [
      { role: 'user', content: prompt }
    ]
    
    const response = await callLLM(
      { role: 'resume_analyzer' },
      messages,
      { temperature: 0.3, maxTokens: 512 }
    )
    
    const parsed = parseJSON(response.content)

    return {
      skills: parsed.skills || extractSkillsFallback(resumeText),
      yearsOfExperience: parsed.yearsOfExperience || extractYearsFallback(resumeText),
      domains: parsed.domains || ['General'],
      strengths: parsed.strengths || ['Professional experience'],
      gaps: parsed.gaps || [],
      targetRole: parsed.targetRole || targetRole || 'Professional'
    }
  } catch (error) {
    console.error('Profile extraction error:', error)
    // Fallback to basic extraction
    return {
      skills: extractSkillsFallback(resumeText),
      yearsOfExperience: extractYearsFallback(resumeText),
      domains: ['General'],
      strengths: ['Professional experience'],
      gaps: [],
      targetRole: targetRole || 'Professional'
    }
  }
}



function parseJSON(response: string): any {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    throw new Error('No JSON found')
  } catch (error) {
    console.error('JSON parse error:', error)
    return {}
  }
}

// Fallback extraction methods
function extractSkillsFallback(text: string): string[] {
  const commonSkills = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'React', 'Node.js', 
    'AWS', 'Docker', 'Kubernetes', 'SQL', 'MongoDB', 'Git',
    'Leadership', 'Communication', 'Problem Solving', 'Agile', 'Scrum'
  ]
  
  return commonSkills.filter(skill => 
    text.toLowerCase().includes(skill.toLowerCase())
  ).slice(0, 10)
}

function extractYearsFallback(text: string): number {
  const yearMatch = text.match(/(\d+)\+?\s*years?/i)
  if (yearMatch) {
    return parseInt(yearMatch[1])
  }
  
  // Try to count date ranges
  const dateRanges = text.match(/\d{4}\s*[-–]\s*(\d{4}|present|current)/gi)
  if (dateRanges && dateRanges.length > 0) {
    return Math.min(dateRanges.length * 2, 15) // Rough estimate
  }
  
  return 3 // Default
}

/**
 * Generate a quick summary of the profile for display
 */
export function generateProfileSummary(profile: CandidateProfile): string {
  return `${profile.targetRole} with ${profile.yearsOfExperience} years of experience in ${profile.domains.join(', ')}. 
Key skills: ${profile.skills.slice(0, 5).join(', ')}.`
}
