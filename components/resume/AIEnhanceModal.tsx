'use client'

import { useState } from 'react'
import { X, Sparkles, Loader2, Check } from 'lucide-react'
import { EnhancementSuggestion } from '@/lib/resume-ai'

interface AIEnhanceModalProps {
  isOpen: boolean
  onClose: () => void
  original: string
  suggestion: EnhancementSuggestion | null
  isLoading: boolean
  onAccept: (enhanced: string) => void
  onReject: () => void
}

export default function AIEnhanceModal({
  isOpen,
  onClose,
  original,
  suggestion,
  isLoading,
  onAccept,
  onReject
}: AIEnhanceModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-gray-800 rounded-xl border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <h3 className="text-xl font-bold text-white">AI Enhancement</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Original */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Original
            </label>
            <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-700">
              <p className="text-gray-300">{original}</p>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              <span className="ml-3 text-gray-400">AI is enhancing your content...</span>
            </div>
          )}

          {/* Enhanced */}
          {suggestion && !isLoading && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Enhanced
                </label>
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <p className="text-white">{suggestion.enhanced}</p>
                </div>
              </div>

              {/* Reason */}
              <div className="p-4 rounded-lg bg-gray-900/30">
                <p className="text-sm text-gray-400">
                  <span className="font-medium text-blue-400">Why this is better:</span>{' '}
                  {suggestion.reason}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {suggestion && !isLoading && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700">
            <button
              onClick={onReject}
              className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
            >
              Keep Original
            </button>
            <button
              onClick={() => onAccept(suggestion.enhanced)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Use Enhanced</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
