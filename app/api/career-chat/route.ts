import { NextRequest, NextResponse } from 'next/server'

const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY
const GROQ_MODEL = process.env.NEXT_PUBLIC_GROQ_MODEL || 'llama-3.3-70b-versatile'

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }
    
    // Call Groq API for career guidance
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are a professional career guidance counselor and interview coach. 
            You help people with:
            - Career path advice and planning
            - Interview preparation strategies
            - Resume and cover letter tips
            - Job search strategies
            - Company-specific interview insights
            - Salary negotiation advice
            - Professional development guidance
            
            Provide helpful, actionable advice in a friendly but professional tone.
            Keep responses concise (2-3 paragraphs) unless more detail is requested.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    })
    
    if (!response.ok) {
      throw new Error('Groq API request failed')
    }
    
    const data = await response.json()
    const botResponse = data.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a response.'
    
    return NextResponse.json({ response: botResponse })
    
  } catch (error) {
    console.error('Career chat error:', error)
    return NextResponse.json(
      { error: 'Failed to get career guidance' },
      { status: 500 }
    )
  }
}
