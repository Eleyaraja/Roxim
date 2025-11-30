/**
 * Usage Banner - Shows Gemini API usage for dev/testing
 * Only visible when debug mode is enabled
 */

'use client'

import { useState, useEffect } from 'react'
import { geminiClient } from '@/lib/geminiClient'
import { X } from 'lucide-react'

export default function UsageBanner() {
  const [usage, setUsage] = useState({ callCount: 0, maxCalls: 25, date: '' })
  const [visible, setVisible] = useState(false)
  const [debugMode, setDebugMode] = useState(false)

  useEffect(() => {
    // Check if debug mode is enabled
    const isDebug = localStorage.getItem('debug') === 'true'
    setDebugMode(isDebug)
    
    if (!isDebug) return

    // Initial load
    setUsage(geminiClient.getUsage())
    setVisible(true)

    // Listen for usage updates
    const handleUsageUpdate = (event: any) => {
      setUsage(geminiClient.getUsage())
    }

    window.addEventListener('gemini-usage-updated', handleUsageUpdate)

    return () => {
      window.removeEventListener('gemini-usage-updated', handleUsageUpdate)
    }
  }, [])

  if (!debugMode || !visible) return null

  const percentage = (usage.callCount / usage.maxCalls) * 100
  const isWarning = percentage > 70
  const isDanger = percentage > 90

  return (
    <div className={`fixed top-4 right-4 z-50 ${
      isDanger ? 'bg-red-900/90' : isWarning ? 'bg-yellow-900/90' : 'bg-blue-900/90'
    } backdrop-blur-sm text-white px-4 py-3 rounded-lg shadow-lg border ${
      isDanger ? 'border-red-500' : isWarning ? 'border-yellow-500' : 'border-blue-500'
    } max-w-xs`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="text-xs font-semibold mb-1">
            🔥 Gemini API Usage (Dev Mode)
          </div>
          <div className="text-sm font-mono">
            {usage.callCount} / {usage.maxCalls} calls today
          </div>
          <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all ${
                isDanger ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <div className="text-xs text-gray-300 mt-1">
            {usage.maxCalls - usage.callCount} calls remaining
          </div>
          {isDanger && (
            <div className="text-xs text-red-300 mt-2 font-semibold">
              ⚠️ Approaching daily limit!
            </div>
          )}
        </div>
        <button
          onClick={() => setVisible(false)}
          className="text-gray-400 hover:text-white transition-colors"
          title="Hide banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-700">
        Model: gemini-2.0-flash-lite
      </div>
    </div>
  )
}
