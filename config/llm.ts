/**
 * LLM Configuration
 * 
 * Central configuration for all LLM providers and their roles
 */

export type LLMProvider = 'groq' | 'gemini' | 'local'
export type LLMRole = 'interviewer' | 'resume_analyzer' | 'coach'

export interface LLMProviderConfig {
  provider: LLMProvider
  model: string
  apiKey?: string
  endpoint?: string
  maxTokens: number
  temperature: number
}

// Provider configurations
export const PROVIDER_CONFIGS: Record<LLMProvider, LLMProviderConfig> = {
  groq: {
    provider: 'groq',
    model: process.env.NEXT_PUBLIC_GROQ_MODEL || 'llama-3.3-70b-versatile',
    apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    maxTokens: 512,
    temperature: 0.7
  },
  gemini: {
    provider: 'gemini',
    model: 'gemini-2.0-flash-lite',
    apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    maxTokens: 512,
    temperature: 0.7
  },
  local: {
    provider: 'local',
    model: process.env.NEXT_PUBLIC_LOCAL_MODEL || 'phi-3.5-mini',
    apiKey: process.env.NEXT_PUBLIC_LOCAL_API_KEY,
    endpoint: process.env.NEXT_PUBLIC_LOCAL_ENDPOINT || 'http://localhost:8000/v1/chat/completions',
    maxTokens: 512,
    temperature: 0.7
  }
}

// Role to provider mapping
export const ROLE_PROVIDER_MAP: Record<LLMRole, LLMProvider> = {
  interviewer: 'groq',        // Fast, conversational
  resume_analyzer: 'gemini',  // Good at structured extraction
  coach: 'groq'               // Placeholder - can switch to 'local' when ready
}

/**
 * Get provider config for a specific role
 */
export function getProviderForRole(role: LLMRole): LLMProviderConfig {
  const provider = ROLE_PROVIDER_MAP[role]
  return PROVIDER_CONFIGS[provider]
}

/**
 * Check if a provider is configured
 */
export function isProviderConfigured(provider: LLMProvider): boolean {
  const config = PROVIDER_CONFIGS[provider]
  
  if (provider === 'local') {
    // Local is optional, always return true (will fallback to groq)
    return true
  }
  
  return !!config.apiKey
}
