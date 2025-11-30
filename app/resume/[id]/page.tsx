'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Save, Download, ArrowLeft, Clock } from 'lucide-react'
import { getResumeById, saveResume, saveVersion } from '@/lib/resume-storage'
import { Resume, ResumeData } from '@/lib/resume-types'
import ResumeEditor from '@/components/resume/ResumeEditor'
import ResumePreview from '@/components/resume/ResumePreview'
import TemplateSelector from '@/components/resume/TemplateSelector'
import ATSScoreCard from '@/components/resume/ATSScoreCard'
import ExportModal from '@/components/resume/ExportModal'
import ResumeTips from '@/components/resume/ResumeTips'

export default function ResumeEditorPage() {
  const params = useParams()
  const router = useRouter()
  const [resume, setResume] = useState<Resume | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)

  // Load resume
  useEffect(() => {
    const id = params.id as string
    const loaded = getResumeById(id)
    
    if (!loaded) {
      router.push('/resume')
      return
    }
    
    setResume(loaded)
  }, [params.id, router])

  // Auto-save every 5 seconds
  useEffect(() => {
    if (!resume) return

    const interval = setInterval(() => {
      handleSave(true)
    }, 5000)

    return () => clearInterval(interval)
  }, [resume])

  const handleSave = useCallback((isAutoSave = false) => {
    if (!resume) return

    setIsSaving(true)
    
    // Save version every manual save
    if (!isAutoSave) {
      saveVersion(resume.id, resume.data)
    }
    
    saveResume(resume)
    setLastSaved(new Date())
    
    setTimeout(() => setIsSaving(false), 500)
  }, [resume])

  const handleDataChange = (data: ResumeData) => {
    if (!resume) return
    setResume({ ...resume, data })
  }

  const handleTemplateChange = (template: Resume['template']) => {
    if (!resume) return
    setResume({ ...resume, template })
  }

  const handleNameChange = (name: string) => {
    if (!resume) return
    setResume({ ...resume, name })
  }

  if (!resume) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Top Bar */}
      <div className="sticky top-16 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/resume')}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <input
                type="text"
                value={resume.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="text-xl font-bold bg-transparent text-white border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2"
              />
              
              {lastSaved && (
                <span className="text-sm text-gray-400 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">
              <TemplateSelector
                selected={resume.template}
                onChange={handleTemplateChange}
              />
              
              <button
                onClick={() => handleSave(false)}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save'}</span>
              </button>
              
              <button
                onClick={() => setIsExportModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="hidden md:inline">Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Editor - 2 columns */}
          <div className="lg:col-span-2">
            <ResumeEditor
              data={resume.data}
              onChange={handleDataChange}
            />
          </div>

          {/* Preview + ATS - 1 column */}
          <div className="space-y-4">
            {/* Tips */}
            <ResumeTips />
            
            {/* ATS Score */}
            <ATSScoreCard resume={resume} />
            
            {/* Preview */}
            <div className="sticky top-32">
              <ResumePreview
                data={resume.data}
                template={resume.template}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        resumeData={resume.data}
        templateId={resume.template}
        resumeName={resume.name}
      />
    </div>
  )
}
