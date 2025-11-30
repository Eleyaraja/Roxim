'use client'

import { useState } from 'react'
import { Upload, FileText, Loader2, ArrowLeft, Briefcase } from 'lucide-react'
import { extractCandidateProfile } from '@/lib/resumeProfile'
import { CompanyPersona } from '@/lib/types'

export default function ResumeUpload({ onComplete, onBack }: { onComplete: (data: any) => void; onBack: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [role, setRole] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [companyPersona, setCompanyPersona] = useState<CompanyPersona>('general')
  const [adaptiveDifficulty, setAdaptiveDifficulty] = useState(true)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError('')

    try {
      const profile = await extractCandidateProfile(
        file,
        jobDescription || undefined,
        role || undefined
      )
      
      onComplete({
        profile,
        companyPersona,
        adaptiveDifficulty
      })
    } catch (err: any) {
      setError(err.message || 'Failed to process resume. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-8">
      <button onClick={onBack} className="mb-8 flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back
      </button>

      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold mb-6 text-center">Setup Your Interview</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Target Role (Optional)</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g., Software Engineer, Product Manager"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Job Description (Optional)</label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here to get more targeted questions..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Company Style</label>
              <select
                value={companyPersona}
                onChange={(e) => setCompanyPersona(e.target.value as CompanyPersona)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="general">General Professional</option>
                <option value="big-tech">Big Tech (Google, Meta, Amazon)</option>
                <option value="startup">Startup</option>
                <option value="finance">Finance</option>
                <option value="consulting">Consulting</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="adaptive"
                checked={adaptiveDifficulty}
                onChange={(e) => setAdaptiveDifficulty(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="adaptive" className="text-sm">
                Enable adaptive difficulty (questions adjust based on your performance)
              </label>
            </div>
          </div>

          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center hover:border-blue-500 transition-colors mt-6">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              disabled={loading}
              className="hidden"
              id="resume-upload"
            />
            <label htmlFor="resume-upload" className="cursor-pointer">
              {loading ? (
                <Loader2 className="w-16 h-16 mx-auto mb-4 text-blue-600 animate-spin" />
              ) : (
                <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              )}
              <p className="text-lg font-medium mb-2">
                {loading ? 'Analyzing your resume with AI...' : 'Upload Your Resume'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">PDF, DOC, or DOCX (Max 10MB)</p>
            </label>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center">
              <Briefcase className="w-5 h-5 mr-2" />
              What happens next?
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• AI analyzes your resume to extract skills, experience, and strengths</li>
              <li>• Compares your profile with job requirements to identify gaps</li>
              <li>• Creates a personalized interview with adaptive questions</li>
              <li>• HR avatar conducts a natural, conversational interview</li>
              <li>• Real-time emotion and confidence tracking during answers</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
