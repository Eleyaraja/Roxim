import { NextRequest, NextResponse } from 'next/server'

const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY
const GROQ_MODEL = process.env.NEXT_PUBLIC_GROQ_MODEL || 'llama-3.3-70b-versatile'

export async function POST(request: NextRequest) {
  try {
    const { prompt, jobTitle, experience, skills } = await request.json()
    
    if (!prompt && !jobTitle) {
      return NextResponse.json({ error: 'Job title or prompt is required' }, { status: 400 })
    }
    
    const systemPrompt = `You are an expert resume writer and career coach. Generate professional, ATS-optimized resume content based on the user's input.

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "personal": {
    "fullName": "Full Name",
    "title": "Professional Title",
    "email": "email@example.com",
    "phone": "+1234567890",
    "location": "City, State",
    "linkedin": "linkedin.com/in/username",
    "github": "github.com/username",
    "portfolio": "portfolio.com",
    "summary": "Professional summary (2-3 sentences)"
  },
  "experience": [
    {
      "position": "Job Title",
      "company": "Company Name",
      "location": "City, State",
      "startDate": "Jan 2020",
      "endDate": "Present",
      "current": true,
      "description": "Brief role description",
      "bullets": ["Achievement 1", "Achievement 2", "Achievement 3"]
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "major": "Major",
      "institution": "University Name",
      "location": "City, State",
      "startDate": "2016",
      "endDate": "2020",
      "gpa": "3.8",
      "achievements": ["Achievement 1", "Achievement 2"]
    }
  ],
  "skills": {
    "programming": ["Skill1", "Skill2"],
    "frameworks": ["Framework1", "Framework2"],
    "tools": ["Tool1", "Tool2"],
    "soft": ["Soft Skill1", "Soft Skill2"]
  },
  "projects": [
    {
      "name": "Project Name",
      "date": "2023",
      "techStack": ["Tech1", "Tech2"],
      "description": "Project description",
      "achievements": ["Achievement 1", "Achievement 2"],
      "github": "github.com/project",
      "demo": "demo-link.com"
    }
  ]
}

Guidelines:
- Use action verbs and quantify achievements
- Make content ATS-friendly
- Keep bullets concise and impactful
- Focus on relevant experience for the target role
- Include realistic but impressive achievements`

    const userPrompt = prompt || `Generate a professional resume for a ${jobTitle} position${experience ? ` with ${experience} years of experience` : ''}${skills ? ` skilled in ${skills}` : ''}.`
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    })
    
    if (!response.ok) {
      throw new Error('Groq API request failed')
    }
    
    const data = await response.json()
    const content = data.choices[0]?.message?.content || ''
    
    // Parse JSON from response
    let resumeData
    try {
      // Remove markdown code blocks if present
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        resumeData = JSON.parse(jsonMatch[0])
      } else {
        resumeData = JSON.parse(content)
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
    }
    
    return NextResponse.json({ resumeData })
    
  } catch (error) {
    console.error('Resume generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate resume' },
      { status: 500 }
    )
  }
}
