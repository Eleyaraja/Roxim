/**
 * Emotion Analysis Module
 * 
 * Analyzes text emotion using HuggingFace models
 * Falls back to heuristic if API not configured
 */

const HF_API_KEY = process.env.NEXT_PUBLIC_HF_API_KEY
const HF_MODEL = 'j-hartmann/emotion-english-distilroberta-base'
const HF_API_URL = `https://api-inference.huggingface.co/models/${HF_MODEL}`

interface EmotionScore {
  label: string
  score: number
}

interface EmotionAnalysis {
  dominantEmotion: string
  confidenceScore: number // 0-1
  emotions: EmotionScore[]
}

/**
 * Analyze text emotion using HuggingFace model
 * Falls back to heuristic if API not available
 */
export async function analyzeTextEmotion(text: string): Promise<EmotionAnalysis> {
  // If no API key, use heuristic
  if (!HF_API_KEY || HF_API_KEY === 'your_hf_key_here') {
    return analyzeEmotionHeuristic(text)
  }

  try {
    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: text.substring(0, 500), // Limit length
        options: { wait_for_model: true }
      })
    })

    if (!response.ok) {
      console.warn('HF API error, falling back to heuristic')
      return analyzeEmotionHeuristic(text)
    }

    const data = await response.json()
    
    // HF returns array of emotion scores
    const emotions: EmotionScore[] = Array.isArray(data[0]) ? data[0] : data
    
    // Find dominant emotion
    const dominant = emotions.reduce((max, e) => e.score > max.score ? e : max, emotions[0])

    return {
      dominantEmotion: dominant.label,
      confidenceScore: dominant.score,
      emotions
    }
  } catch (error) {
    console.warn('Emotion analysis failed, using heuristic:', error)
    return analyzeEmotionHeuristic(text)
  }
}

/**
 * Heuristic emotion analysis (fallback)
 */
function analyzeEmotionHeuristic(text: string): EmotionAnalysis {
  const textLower = text.toLowerCase()
  
  // Positive indicators
  const positiveWords = ['success', 'achieved', 'accomplished', 'improved', 'great', 'excellent', 'proud']
  const positiveCount = positiveWords.filter(w => textLower.includes(w)).length

  // Negative indicators
  const negativeWords = ['difficult', 'challenge', 'problem', 'failed', 'struggle', 'hard']
  const negativeCount = negativeWords.filter(w => textLower.includes(w)).length

  // Confidence indicators
  const confidentWords = ['definitely', 'certainly', 'always', 'confident', 'sure']
  const confidentCount = confidentWords.filter(w => textLower.includes(w)).length

  // Uncertain indicators
  const uncertainWords = ['maybe', 'perhaps', 'might', 'possibly', 'unsure', 'think']
  const uncertainCount = uncertainWords.filter(w => textLower.includes(w)).length

  // Determine dominant emotion
  let dominantEmotion = 'neutral'
  let confidenceScore = 0.6

  if (positiveCount > negativeCount && positiveCount > 0) {
    dominantEmotion = 'joy'
    confidenceScore = 0.7
  } else if (negativeCount > positiveCount && negativeCount > 0) {
    dominantEmotion = 'sadness'
    confidenceScore = 0.6
  } else if (confidentCount > uncertainCount) {
    dominantEmotion = 'confidence'
    confidenceScore = 0.75
  } else if (uncertainCount > confidentCount) {
    dominantEmotion = 'fear'
    confidenceScore = 0.5
  }

  return {
    dominantEmotion,
    confidenceScore,
    emotions: [
      { label: dominantEmotion, score: confidenceScore }
    ]
  }
}

/**
 * Map emotion to confidence score
 * 
 * Positive emotions → higher confidence
 * Negative emotions → lower confidence
 */
export function emotionToConfidence(emotion: string, emotionScore: number): number {
  const emotionMap: { [key: string]: number } = {
    'joy': 0.85,
    'confidence': 0.9,
    'neutral': 0.7,
    'surprise': 0.65,
    'anger': 0.5,
    'sadness': 0.4,
    'fear': 0.3,
    'disgust': 0.45
  }

  const baseScore = emotionMap[emotion.toLowerCase()] || 0.7
  
  // Weight by emotion confidence
  return baseScore * emotionScore + (1 - emotionScore) * 0.7
}

/**
 * Combine multiple signals into final confidence score
 */
export function combineConfidenceSignals(
  emotionConfidence: number,
  paceConfidence: number,
  fillerConfidence: number,
  lengthConfidence: number
): number {
  // Weighted average
  const weights = {
    emotion: 0.3,
    pace: 0.25,
    filler: 0.25,
    length: 0.2
  }

  const combined = 
    emotionConfidence * weights.emotion +
    paceConfidence * weights.pace +
    fillerConfidence * weights.filler +
    lengthConfidence * weights.length

  return Math.max(0, Math.min(1, combined))
}
