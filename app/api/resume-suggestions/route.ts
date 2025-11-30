import { NextRequest, NextResponse } from 'next/server'

const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY
const GROQ_MODEL = process.env.NEXT_PUBLIC_GROQ_MODEL || 'llama-3.3-70b-versatile'

export async function POST(request: NextRequest) {
  try {
    const { text, context, type } = await request.json()
    
    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }
    
    let systemPrompt = ''
    
    switch (type) {
      case 'bullet':
        systemPrompt = `You are a resume expert. Improve this resume bullet point to be more impactful, quantifiable, and ATS-friendly. Start with an action verb. Keep it concise (1-2 lines). Return ONLY the improved bullet point, nothing else.`
        break
      case 'summary':
        systemPrompt = `You are a resume expert. Improve this professional summary to be more compelling and highlight key strengths. Keep it 2-3 sentences. Return ONLY the improved summary, nothing else.`
        break
      case 'description':
        systemPrompt = `You are a resume expert. Improve this job/project description to be more professional and impactful. Keep it concise. Return ONLY the improved description, nothing else.`
        break
      default:
        systemPrompt = `You are a resume expert. Improve this text to be more professional, impactful, and ATS-friendly. Return ONLY the improved text, nothing else.`
    }
    
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
          { role: 'user', content: `Original: ${text}${context ? `\n\nContext: ${context}` : ''}` }
        ],
        temperature: 0.7,
        max_tokens: 200
      })
    })
    
    if (!response.ok) {
      throw new Error('Groq API request failed')
    }
    
    const data = await response.json()
    const suggestion = data.choices[0]?.message?.content?.trim() || text
    
    return NextResponse.json({ suggestion })
    
  } catch (error) {
    console.error('Suggestion error:', error)
    return NextResponse.json(
      { error: 'Failed to generate suggestion' },
      { status: 500 }
    )
  }
}
