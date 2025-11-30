import { NextRequest, NextResponse } from 'next/server'

const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY
const GROQ_MODEL = process.env.NEXT_PUBLIC_GROQ_MODEL || 'llama-3.3-70b-versatile'

export async function POST(request: NextRequest) {
  try {
    const { company, role, interviewType, count = 5 } = await request.json()
    
    if (!company || !role) {
      return NextResponse.json({ error: 'Company and role are required' }, { status: 400 })
    }
    
    const systemPrompt = `You are an expert interview coach who creates realistic, company-specific interview questions.

Generate ${count} ${interviewType || 'technical'} interview questions specifically for ${company}'s ${role} position.

Requirements:
- Questions should reflect ${company}'s actual interview style and culture
- Include company-specific technologies, products, or methodologies
- Mix difficulty levels (2 medium, 2 hard, 1 very hard)
- For technical: focus on coding, system design, or technical concepts
- For behavioral: use STAR method scenarios relevant to ${company}

Return ONLY valid JSON array (no markdown, no code blocks):
[
  {
    "question": "The interview question text",
    "difficulty": "medium|hard|very_hard",
    "category": "coding|system_design|behavioral|technical",
    "hints": ["hint 1", "hint 2"],
    "expectedAnswer": "Brief description of what a good answer includes"
  }
]`

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
          { 
            role: 'user', 
            content: `Generate ${count} ${interviewType || 'technical'} interview questions for ${company} ${role} position.` 
          }
        ],
        temperature: 0.8,
        max_tokens: 2000
      })
    })
    
    if (!response.ok) {
      throw new Error('Groq API request failed')
    }
    
    const data = await response.json()
    const content = data.choices[0]?.message?.content || ''
    
    // Parse JSON from response
    let questions
    try {
      // Remove markdown code blocks if present
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0])
      } else {
        questions = JSON.parse(content)
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      console.error('Content:', content)
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
    }
    
    // Add IDs and format
    const formattedQuestions = questions.map((q: any, index: number) => ({
      id: `${company.toLowerCase()}-${role.toLowerCase()}-${index + 1}`,
      text: q.question,
      difficulty: q.difficulty || 'medium',
      category: q.category || 'technical',
      hints: q.hints || [],
      expectedAnswer: q.expectedAnswer || '',
      company: company,
      role: role,
      interviewType: interviewType || 'technical'
    }))
    
    return NextResponse.json({ questions: formattedQuestions })
    
  } catch (error) {
    console.error('Question generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    )
  }
}
