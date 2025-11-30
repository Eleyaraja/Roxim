'use client'

import { Lightbulb, X } from 'lucide-react'
import { useState } from 'react'

export default function ResumeTips() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  const tips = [
    'Use action verbs like "Led", "Developed", "Increased" to start bullet points',
    'Quantify achievements with numbers, percentages, or metrics whenever possible',
    'Keep bullet points concise - aim for 1-2 lines each',
    'Tailor your resume for each job by including relevant keywords',
    'Use the AI enhance feature to improve your bullet points',
    'Aim for an ATS score of 80+ for best results'
  ]

  return (
    <div className="rounded-xl bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-700/50 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          <h3 className="font-bold text-white">Pro Tips</h3>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <ul className="space-y-2">
        {tips.map((tip, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
            <span className="text-blue-400 mt-0.5">•</span>
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
