'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, FileText, Download, Save, Clock, Sparkles } from 'lucide-react'
import { getResumes, createResume, getSampleResume, saveResume } from '@/lib/resume-storage'
import { Resume, ResumeData } from '@/lib/resume-types'
import AIGenerateModal from '@/components/resume/AIGenerateModal'

export default function ResumePage() {
  const router = useRouter()
  const [resumes, setResumes] = useState<Resume[]>([])
  const [showAIModal, setShowAIModal] = useState(false)

  useEffect(() => {
    setResumes(getResumes())
  }, [])

  const handleAIGenerate = (resumeData: ResumeData) => {
    const newResume = createResume('AI Generated Resume')
    newResume.data = resumeData
    saveResume(newResume)
    router.push(`/resume/${newResume.id}`)
  }

  const handleCreateNew = () => {
    const newResume = createResume('Untitled Resume')
    saveResume(newResume)
    router.push(`/resume/${newResume.id}`)
  }

  const handleLoadSample = () => {
    const sample = getSampleResume()
    saveResume(sample)
    router.push(`/resume/${sample.id}`)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400 bg-green-500/10'
    if (score >= 60) return 'text-yellow-400 bg-yellow-500/10'
    return 'text-red-400 bg-red-500/10'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Resume Builder</h1>
          <p className="text-gray-400">Create ATS-optimized resumes with AI assistance</p>
        </div>

        {/* Featured: AI Generate - Qnnect */}
        <div className="mb-6">
          <button
            onClick={() => setShowAIModal(true)}
            className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-size-200 bg-pos-0 hover:bg-pos-100 p-8 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl shadow-blue-500/20"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                {/* Qnnect Logo */}
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30 group-hover:scale-110 transition-transform">
                  <div className="w-6 h-10 rounded-full border-2 border-white flex items-start justify-center p-2">
                    <div className="w-2 h-3 bg-white rounded-full animate-pulse" />
                  </div>
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-3xl font-bold text-white">Qnnect AI Resume Generator</h3>
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold text-white border border-white/30">
                      NEW
                    </span>
                  </div>
                  <p className="text-blue-100 text-lg">Generate a complete professional resume in seconds with AI</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-white animate-pulse" />
                <div className="text-white text-4xl group-hover:translate-x-2 transition-transform">→</div>
              </div>
            </div>
          </button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">

          <button
            onClick={handleCreateNew}
            className="group relative overflow-hidden rounded-xl bg-gray-800 border border-gray-700 p-6 transition-all hover:scale-105 hover:border-gray-600"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-500/20 p-3">
                <Plus className="w-8 h-8 text-blue-400" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-white">Create New</h3>
                <p className="text-sm text-gray-400">Start from scratch</p>
              </div>
            </div>
          </button>

          <button
            onClick={handleLoadSample}
            className="group relative overflow-hidden rounded-xl bg-gray-800 border border-gray-700 p-6 transition-all hover:scale-105 hover:border-gray-600"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-purple-500/20 p-3">
                <FileText className="w-8 h-8 text-purple-400" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-white">Load Sample</h3>
                <p className="text-sm text-gray-400">See best practices</p>
              </div>
            </div>
          </button>
        </div>

        {/* AI Generate Modal */}
        <AIGenerateModal
          isOpen={showAIModal}
          onClose={() => setShowAIModal(false)}
          onGenerate={handleAIGenerate}
        />

        {/* Resumes List */}
        {resumes.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Your Resumes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  onClick={() => router.push(`/resume/${resume.id}`)}
                  className="group cursor-pointer rounded-xl bg-gray-800/50 border border-gray-700 p-6 transition-all hover:scale-105 hover:border-gray-600 hover:bg-gray-800"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1 line-clamp-1">
                        {resume.name}
                      </h3>
                      <p className="text-sm text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(resume.lastModified)}
                      </p>
                    </div>
                    {resume.atsScore > 0 && (
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(resume.atsScore)}`}>
                        {resume.atsScore}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 capitalize">{resume.template}</span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {resumes.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-2xl font-bold text-white mb-2">No resumes yet</h3>
            <p className="text-gray-400 mb-8">Create your first resume to get started</p>
          </div>
        )}
      </div>
    </div>
  )
}
