import { NextRequest, NextResponse } from 'next/server'
import { didService } from '@/lib/did-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, voice } = body

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    console.log('🎬 Generating avatar for text:', text.substring(0, 50) + '...')

    const videoUrl = await didService.generateVideo({
      text,
      voice: voice || 'en-US-JennyNeural'
    })

    return NextResponse.json({ videoUrl })
  } catch (error: any) {
    console.error('❌ Avatar generation error:', error)
    
    return NextResponse.json(
      { error: error.message || 'Failed to generate avatar video' },
      { status: 500 }
    )
  }
}
