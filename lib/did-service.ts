// D-ID Talking Avatar Service
import axios from 'axios'

const DID_API_URL = 'https://api.d-id.com'
const DID_API_KEY = process.env.NEXT_PUBLIC_DID_API_KEY || process.env.DID_API_KEY

interface CreateTalkOptions {
  text: string
  voice?: string
  avatar?: string
}

interface TalkResponse {
  id: string
  status: 'created' | 'started' | 'done' | 'error'
  result_url?: string
  error?: string
}

class DIDService {
  private apiKey: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || DID_API_KEY || ''
    
    if (!this.apiKey) {
      console.warn('⚠️ D-ID API key not found. Set NEXT_PUBLIC_DID_API_KEY in .env.local')
    }
  }

  /**
   * Create a talking avatar video
   */
  async createTalk(options: CreateTalkOptions): Promise<string> {
    if (!this.apiKey) {
      throw new Error('D-ID API key is required. Get one at https://studio.d-id.com')
    }

    try {
      const response = await axios.post(
        `${DID_API_URL}/talks`,
        {
          script: {
            type: 'text',
            input: options.text,
            provider: {
              type: 'microsoft',
              voice_id: options.voice || 'en-US-JennyNeural'
            }
          },
          config: {
            fluent: true,
            pad_audio: 0,
            stitch: true
          },
          source_url: options.avatar || 'https://create-images-results.d-id.com/default-presenter-image.png'
        },
        {
          headers: {
            'Authorization': `Basic ${this.apiKey}`,
            'Content-Type': 'application/json',
            'accept': 'application/json'
          }
        }
      )

      return response.data.id
    } catch (error: any) {
      console.error('❌ D-ID createTalk error:', error.response?.data || error.message)
      throw new Error(error.response?.data?.message || 'Failed to create talking avatar')
    }
  }

  /**
   * Get talk status and video URL
   */
  async getTalkStatus(talkId: string): Promise<TalkResponse> {
    if (!this.apiKey) {
      throw new Error('D-ID API key is required')
    }

    try {
      const response = await axios.get(
        `${DID_API_URL}/talks/${talkId}`,
        {
          headers: {
            'Authorization': `Basic ${this.apiKey}`,
            'accept': 'application/json'
          }
        }
      )

      return {
        id: response.data.id,
        status: response.data.status,
        result_url: response.data.result_url,
        error: response.data.error
      }
    } catch (error: any) {
      console.error('❌ D-ID getTalkStatus error:', error.response?.data || error.message)
      throw new Error('Failed to get talk status')
    }
  }

  /**
   * Generate video and wait for completion
   */
  async generateVideo(options: CreateTalkOptions): Promise<string> {
    console.log('🎬 Starting D-ID video generation...')
    
    // Create talk
    const talkId = await this.createTalk(options)
    console.log('✅ Talk created:', talkId)

    // Poll for completion (max 2 minutes)
    const maxAttempts = 40 // 40 * 3s = 2 minutes
    let attempts = 0

    while (attempts < maxAttempts) {
      await this.sleep(3000) // Wait 3 seconds between checks
      
      const status = await this.getTalkStatus(talkId)
      console.log(`📊 Status: ${status.status} (attempt ${attempts + 1}/${maxAttempts})`)

      if (status.status === 'done' && status.result_url) {
        console.log('✅ Video ready:', status.result_url)
        return status.result_url
      }

      if (status.status === 'error') {
        throw new Error(status.error || 'Video generation failed')
      }

      attempts++
    }

    throw new Error('Video generation timeout (2 minutes)')
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Export singleton instance
export const didService = new DIDService()

// Export class for custom instances
export default DIDService
