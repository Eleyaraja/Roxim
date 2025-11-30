'use client'

import { useState } from 'react'
import { X, Sparkles, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ResumeData } from '@/lib/resume-types'

interface AIGenerateModalProps {
  isOpen: boolean
  onClose: () => void
  onGenerate: (resumeData: ResumeData) => void
}

export default function AIGenerateModal({ isOpen, onClose, onGenerate }: AIGenerateModalProps) {
  const [jobTitle, setJobTitle] = useState('')
  const [experience, setExperience] = useState('')
  const [skills, setSkills] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    if (!jobTitle.trim()) {
      setError('Please enter a job title')
      return
    }

    setIsGenerating(true)
    setError('')

    try {
      const response = await fetch('/api/generate-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: jobTitle.trim(),
          experience: experience.trim(),
          skills: skills.trim()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate resume')
      }

      const { resumeData } = await response.json()
      onGenerate(resumeData)
      onClose()
    } catch (err) {
      console.error('Generation error:', err)
      setError('Failed to generate resume. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
          />

          {/* Modal - Scrollable Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-full max-w-xl bg-gray-900 border-2 border-gray-700 rounded-2xl shadow-2xl my-8"
            >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Qnnect Logo */}
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30">
                    <div className="w-3 h-6 rounded-full border-2 border-white flex items-start justify-center p-0.5">
                      <div className="w-1 h-1.5 bg-white rounded-full animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-white">Qnnect AI</h2>
                    </div>
                    <p className="text-blue-100 text-xs">Generate professional resume</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-white/80 hover:text-white transition-colors"
                  disabled={isGenerating}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-3">
              {/* Job Title */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Target Job Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g., Software Engineer, Product Manager"
                  disabled={isGenerating}
                  className="w-full bg-gray-800 text-white px-3 py-2.5 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none disabled:opacity-50 text-sm"
                />
              </div>

              {/* Experience */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Years of Experience (Optional)
                </label>
                <input
                  type="text"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="e.g., 3 years, Entry level, 5+ years"
                  disabled={isGenerating}
                  className="w-full bg-gray-800 text-white px-3 py-2.5 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none disabled:opacity-50 text-sm"
                />
              </div>

              {/* Skills */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Key Skills (Optional)
                </label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g., React, Python, AWS, Leadership"
                  disabled={isGenerating}
                  className="w-full bg-gray-800 text-white px-3 py-2.5 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none disabled:opacity-50 text-sm"
                />
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-xl p-3"
                >
                  <p className="text-red-400 text-sm">{error}</p>
                </motion.div>
              )}

              {/* Info */}
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-400 text-xs leading-relaxed">
                    AI will generate a complete, ATS-optimized resume with professional content tailored to your role.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-950 border-t border-gray-800 flex gap-2">
              <button
                onClick={onClose}
                disabled={isGenerating}
                className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all disabled:opacity-50 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !jobTitle.trim()}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate
                  </>
                )}
              </button>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
