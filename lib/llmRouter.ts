/**
 * LLM Router - Unified interface for all LLM providers
 * 
 * Supports:
 * - Groq (OpenAI-compatible, fast chat)
 * - Gemini (Google AI, multimodal)
 * - Local (self-hosted HF models - placeholder)
 */

import { LLMProvider, LLMRole, getProviderForRole, PROVIDER_CONFIGS, isProviderConfigured } from '@/config/llm'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface LLMCallOptions {
  temperature?: number
  maxTokens?: number
  stream?: boolean
  systemInstruction?: string
}

export interface LLMResponse {
  content: string
  provider: LLMProvider
  model: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export interface LLMConfig {
  provider?: LLMProvider
  role?: LLMRole
}

/**
 * Main LLM router function
 * Call any LLM provider with a unified interface
 */
export async function callLLM(
  config: LLMConfig,
  messages: ChatMessage[],
  options: LLMCallOptions = {}
): Promise<LLMResponse> {
  // Determine provider
  let provider: LLMProvider
  if (config.provider) {
    provider = config.provider
  } else if (config.role) {
    provider = getProviderForRole(config.role).provider
  } else {
    throw new Error('Must specify either provider or role')
  }

  // Check if provider is configured
  if (!isProviderConfigured(provider)) {
    throw new Error(`Provider ${provider} is not configured. Please add API key to .env.local`)
  }

  // Route to appropriate provider
  switch (provider) {
    case 'groq':
      return await callGroq(messages, options)
    case 'gemini':
      return await callGemini(messages, options)
    case 'local':
      return await callLocal(messages, options)
    default:
      throw new Error(`Unknown provider: ${provider}`)
  }
}

/**
 * Call Groq API (OpenAI-compatible)
 */
async function callGroq(
  messages: ChatMessage[],
  options: LLMCallOptions = {}
): Promise<LLMResponse> {
  const config = PROVIDER_CONFIGS.groq
  
  if (!config.apiKey) {
    throw new Error('Groq API key not configured')
  }

  const temperature = options.temperature ?? config.temperature
  const maxTokens = options.maxTokens ?? config.maxTokens

  const response = await fetch(config.endpoint!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content
      })),
      temperature,
      max_tokens: maxTokens,
      stream: false
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Groq API error (${response.status}): ${error}`)
  }

  const data = await response.json()
  
  return {
    content: data.choices[0].message.content,
    provider: 'groq',
    model: config.model,
    usage: data.usage ? {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens
    } : undefined
  }
}

/**
 * Call Gemini API
 */
async function callGemini(
  messages: ChatMessage[],
  options: LLMCallOptions = {}
): Promise<LLMResponse> {
  const config = PROVIDER_CONFIGS.gemini
  
  if (!config.apiKey) {
    throw new Error('Gemini API key not configured')
  }

  const temperature = options.temperature ?? config.temperature
  const maxTokens = options.maxTokens ?? config.maxTokens

  // Convert messages to Gemini format
  const systemInstruction = messages.find(m => m.role === 'system')?.content
  const conversationMessages = messages.filter(m => m.role !== 'system')

  const contents = conversationMessages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }))

  const body: any = {
    contents,
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens
    }
  }

  if (systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: systemInstruction }]
    }
  }

  const url = `${config.endpoint}/${config.model}:generateContent?key=${config.apiKey}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Gemini API error (${response.status}): ${error}`)
  }

  const data = await response.json()
  const content = data.candidates[0].content.parts[0].text

  return {
    content,
    provider: 'gemini',
    model: config.model,
    usage: data.usageMetadata ? {
      promptTokens: data.usageMetadata.promptTokenCount,
      completionTokens: data.usageMetadata.candidatesTokenCount,
      totalTokens: data.usageMetadata.totalTokenCount
    } : undefined
  }
}

/**
 * Call local self-hosted model (placeholder)
 * 
 * For now, falls back to Groq. When ready to use local HF model:
 * 1. Start your local server (e.g., vLLM, text-generation-inference)
 * 2. Set NEXT_PUBLIC_LOCAL_ENDPOINT in .env.local
 * 3. This function will call your local endpoint
 */
async function callLocal(
  messages: ChatMessage[],
  options: LLMCallOptions = {}
): Promise<LLMResponse> {
  const config = PROVIDER_CONFIGS.local

  // Check if local endpoint is configured
  if (!config.endpoint || config.endpoint.includes('localhost')) {
    // Fallback to Groq for now
    const response = await callGroq(messages, options)
    return {
      ...response,
      provider: 'local' // Mark as local even though it's using Groq
    }
  }

  // Local server is configured - call it (OpenAI-compatible format)
  const temperature = options.temperature ?? config.temperature
  const maxTokens = options.maxTokens ?? config.maxTokens

  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(config.apiKey ? { 'Authorization': `Bearer ${config.apiKey}` } : {})
    },
    body: JSON.stringify({
      model: config.model,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content
      })),
      temperature,
      max_tokens: maxTokens,
      stream: false
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Local LLM error (${response.status}): ${error}`)
  }

  const data = await response.json()
  
  return {
    content: data.choices[0].message.content,
    provider: 'local',
    model: config.model,
    usage: data.usage ? {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens
    } : undefined
  }
}

/**
 * Streaming version of callLLM (currently only for Groq)
 */
export async function callLLMStream(
  config: LLMConfig,
  messages: ChatMessage[],
  onChunk: (text: string) => void,
  options: LLMCallOptions = {}
): Promise<LLMResponse> {
  // Determine provider
  let provider: LLMProvider
  if (config.provider) {
    provider = config.provider
  } else if (config.role) {
    provider = getProviderForRole(config.role).provider
  } else {
    throw new Error('Must specify either provider or role')
  }

  // Only Groq supports streaming for now
  if (provider !== 'groq') {
    // Fallback to non-streaming
    return await callLLM(config, messages, options)
  }

  return await callGroqStream(messages, onChunk, options)
}

/**
 * Call Groq with streaming
 */
async function callGroqStream(
  messages: ChatMessage[],
  onChunk: (text: string) => void,
  options: LLMCallOptions = {}
): Promise<LLMResponse> {
  const config = PROVIDER_CONFIGS.groq
  
  if (!config.apiKey) {
    throw new Error('Groq API key not configured')
  }

  const temperature = options.temperature ?? config.temperature
  const maxTokens = options.maxTokens ?? config.maxTokens

  const response = await fetch(config.endpoint!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content
      })),
      temperature,
      max_tokens: maxTokens,
      stream: true
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Groq API error (${response.status}): ${error}`)
  }

  const reader = response.body?.getReader()
  const decoder = new TextDecoder()
  let fullContent = ''

  if (!reader) {
    throw new Error('No response body')
  }

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n').filter(line => line.trim() !== '')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') continue

          try {
            const parsed = JSON.parse(data)
            const content = parsed.choices[0]?.delta?.content
            if (content) {
              fullContent += content
              onChunk(content)
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

  return {
    content: fullContent,
    provider: 'groq',
    model: config.model
  }
}
