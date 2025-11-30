/**
 * Centralized Gemini API Client with Rate Limiting
 * 
 * Uses gemini-2.0-flash-lite for all calls
 * Implements retry logic and usage tracking
 */

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY
const GEMINI_MODEL = 'gemini-2.0-flash-lite' // Lightest, fastest model
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`
const GEMINI_STREAM_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent`

// Conservative rate limits for free tier
const MAX_CALLS_PER_DAY = 25
const MAX_CALLS_PER_MINUTE = 5
const RETRY_DELAY_MS = 3000 // 3 seconds
const MAX_RETRIES = 2

// Usage tracking (stored in localStorage)
interface UsageStats {
  date: string
  callCount: number
  lastCallTime: number
}

class GeminiClient {
  private static instance: GeminiClient
  
  private constructor() {}
  
  static getInstance(): GeminiClient {
    if (!GeminiClient.instance) {
      GeminiClient.instance = new GeminiClient()
    }
    return GeminiClient.instance
  }

  /**
   * Get today's usage stats
   */
  private getUsageStats(): UsageStats {
    if (typeof window === 'undefined') {
      return { date: new Date().toDateString(), callCount: 0, lastCallTime: 0 }
    }

    const stored = localStorage.getItem('gemini_usage')
    if (!stored) {
      return { date: new Date().toDateString(), callCount: 0, lastCallTime: 0 }
    }

    const stats: UsageStats = JSON.parse(stored)
    const today = new Date().toDateString()

    // Reset if it's a new day
    if (stats.date !== today) {
      return { date: today, callCount: 0, lastCallTime: 0 }
    }

    return stats
  }

  /**
   * Update usage stats
   */
  private updateUsageStats() {
    if (typeof window === 'undefined') return

    const stats = this.getUsageStats()
    stats.callCount++
    stats.lastCallTime = Date.now()

    localStorage.setItem('gemini_usage', JSON.stringify(stats))
    
    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent('gemini-usage-updated', { detail: stats }))
  }

  /**
   * Check if we can make a call (rate limiting)
   */
  private canMakeCall(): { allowed: boolean; reason?: string } {
    const stats = this.getUsageStats()

    // Check daily limit
    if (stats.callCount >= MAX_CALLS_PER_DAY) {
      return { 
        allowed: false, 
        reason: `Daily limit reached (${MAX_CALLS_PER_DAY} calls). Please try again tomorrow.` 
      }
    }

    // Check per-minute limit
    const timeSinceLastCall = Date.now() - stats.lastCallTime
    const minTimeBetweenCalls = (60 * 1000) / MAX_CALLS_PER_MINUTE // 12 seconds for 5 RPM

    if (timeSinceLastCall < minTimeBetweenCalls) {
      const waitTime = Math.ceil((minTimeBetweenCalls - timeSinceLastCall) / 1000)
      return { 
        allowed: false, 
        reason: `Rate limit: Please wait ${waitTime} seconds before next call.` 
      }
    }

    return { allowed: true }
  }

  /**
   * Wait before retry
   */
  private async waitForRetry(attempt: number) {
    const delay = RETRY_DELAY_MS * Math.pow(2, attempt) // Exponential backoff
    console.log(`⏳ Waiting ${delay}ms before retry ${attempt + 1}/${MAX_RETRIES}...`)
    await new Promise(resolve => setTimeout(resolve, delay))
  }

  /**
   * Call Gemini API with retry logic
   */
  async call(prompt: string, options: {
    temperature?: number
    maxTokens?: number
    systemInstruction?: string
  } = {}): Promise<string> {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to .env.local')
    }

    // Check rate limits
    const rateCheck = this.canMakeCall()
    if (!rateCheck.allowed) {
      throw new Error(rateCheck.reason)
    }

    const { temperature = 0.7, maxTokens = 512, systemInstruction } = options

    let lastError: Error | null = null

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          await this.waitForRetry(attempt - 1)
        }

        const startTime = Date.now()
        console.log(`🌐 Gemini API call (attempt ${attempt + 1}/${MAX_RETRIES + 1})`)
        console.log(`   Model: ${GEMINI_MODEL}`)
        console.log(`   Prompt length: ${prompt.length} chars`)

        const body: any = {
          contents: [{
            role: 'user',
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens,
          }
        }

        if (systemInstruction) {
          body.systemInstruction = {
            parts: [{ text: systemInstruction }]
          }
        }

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        })

        const duration = ((Date.now() - startTime) / 1000).toFixed(2)

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`❌ Gemini API Error (${response.status}):`, errorText)

          if (response.status === 429) {
            lastError = new Error('Rate limit exceeded')
            console.log(`⚠️ Rate limit hit, will retry...`)
            continue // Retry
          } else if (response.status === 403) {
            throw new Error('API key invalid. Please check your NEXT_PUBLIC_GEMINI_API_KEY in .env.local')
          } else if (response.status === 400) {
            throw new Error('Invalid request. Check model name or prompt format.')
          }

          throw new Error(`Gemini API error (${response.status}): ${response.statusText}`)
        }

        const data = await response.json()
        const text = data.candidates[0].content.parts[0].text

        console.log(`✅ Gemini response received (${duration}s)`)
        console.log(`   Response length: ${text.length} chars`)

        // Update usage stats on success
        this.updateUsageStats()

        return text

      } catch (error: any) {
        lastError = error
        
        if (error.message?.includes('Rate limit') && attempt < MAX_RETRIES) {
          continue // Retry
        }
        
        // Don't retry for other errors
        break
      }
    }

    // All retries failed
    if (lastError?.message?.includes('Rate limit')) {
      throw new Error('We hit today\'s free Gemini limit. Please try again later.')
    }

    throw lastError || new Error('Failed to call Gemini API')
  }

  /**
   * Call Gemini API with streaming (for real-time responses)
   */
  async callStream(
    prompt: string,
    onChunk: (text: string) => void,
    options: {
      temperature?: number
      maxTokens?: number
      systemInstruction?: string
    } = {}
  ): Promise<string> {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured')
    }

    // Check rate limits
    const rateCheck = this.canMakeCall()
    if (!rateCheck.allowed) {
      throw new Error(rateCheck.reason)
    }

    const { temperature = 0.7, maxTokens = 512, systemInstruction } = options

    let lastError: Error | null = null

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          await this.waitForRetry(attempt - 1)
        }

        const startTime = Date.now()
        console.log(`🌐 Gemini streaming call (attempt ${attempt + 1}/${MAX_RETRIES + 1})`)

        const body: any = {
          contents: [{
            role: 'user',
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens,
          }
        }

        if (systemInstruction) {
          body.systemInstruction = {
            parts: [{ text: systemInstruction }]
          }
        }

        const response = await fetch(`${GEMINI_STREAM_URL}?key=${GEMINI_API_KEY}&alt=sse`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        })

        if (!response.ok) {
          if (response.status === 429) {
            lastError = new Error('Rate limit exceeded')
            continue // Retry
          }
          throw new Error(`Gemini API error (${response.status})`)
        }

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        let fullText = ''
        let buffer = ''

        if (!reader) throw new Error('No response body')

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6))
                  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
                  if (text) {
                    fullText += text
                    onChunk(text)
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        } finally {
          reader.releaseLock()
        }

        const duration = ((Date.now() - startTime) / 1000).toFixed(2)
        console.log(`✅ Streaming complete (${duration}s)`)

        // Update usage stats on success
        this.updateUsageStats()

        return fullText

      } catch (error: any) {
        lastError = error
        if (error.message?.includes('Rate limit') && attempt < MAX_RETRIES) {
          continue
        }
        break
      }
    }

    if (lastError?.message?.includes('Rate limit')) {
      throw new Error('We hit today\'s free Gemini limit. Please try again later.')
    }

    throw lastError || new Error('Failed to call Gemini API')
  }

  /**
   * Get current usage stats for display
   */
  getUsage(): { callCount: number; maxCalls: number; date: string } {
    const stats = this.getUsageStats()
    return {
      callCount: stats.callCount,
      maxCalls: MAX_CALLS_PER_DAY,
      date: stats.date
    }
  }
}

export const geminiClient = GeminiClient.getInstance()
export { GEMINI_MODEL }
