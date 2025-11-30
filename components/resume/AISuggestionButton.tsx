'use client'

import { useState } from 'react'
import { Sparkles, Loader2, Check, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface AISuggestionButtonProps {
  text: string
  type: 'bullet' | 'summary' | 'description'
  context?: string
  onApply: (suggestion: string) => void
  className?: string
}

export default function AISuggestionButton({ 
  text, 
  type, 
  context, 
  onApply,
  className = ''
}: AISuggestionButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [suggestion, setSuggestion] = useState('')
  const [showSuggestion, setShowSuggestion] = useState(false)
  const [error, setError] = useState('')

  const getSuggestion = async () => {
    if (!text.trim()) return

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/resume-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, type, context })
      })

      if (!response.ok) {
        throw new Error('Failed to get suggestion')
      }

      const { suggestion: newSuggestion } = await response.json()
      setSuggestion(newSuggestion)
      setShowSuggestion(true)
    } catch (err) {
      console.error('Suggestion error:', err)
      setError('Failed to get suggestion')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApply = () => {
    onApply(suggestion)
    setShowSuggestion(false)
    setSuggestion('')
  }

  const handleDismiss = () => {
    setShowSuggestion(false)
    setSuggestion('')
    setError('')
  }

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={getSuggestion}
        disabled={isLoading || !text.trim()}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-blue-500/20 hover:border-blue-500/40"
        title="Get AI suggestion"
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Sparkles className="w-3.5 h-3.5" />
        )}
        <span className="hidden sm:inline">Improve</span>
      </motion.button>

      {/* Suggestion Popup */}
      <AnimatePresence>
        {showSuggestion && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute z-50 mt-2 w-80 max-w-[90vw] bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-gray-700 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-semibold text-white">AI Suggestion</span>
                </div>
                <button
                  onClick={handleDismiss}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              {/* Original */}
              <div>
                <p className="text-xs text-gray-400 mb-1">Original:</p>
                <p className="text-sm text-gray-300 bg-gray-800 p-2 rounded-lg">{text}</p>
              </div>

              {/* Suggestion */}
              <div>
                <p className="text-xs text-gray-400 mb-1">Improved:</p>
                <p className="text-sm text-white bg-blue-600/10 border border-blue-500/20 p-2 rounded-lg">
                  {suggestion}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleDismiss}
                  className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium transition-all"
                >
                  Dismiss
                </button>
                <button
                  onClick={handleApply}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Apply
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute z-50 mt-2 bg-red-500/10 border border-red-500/20 rounded-lg p-2"
          >
            <p className="text-red-400 text-xs">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
