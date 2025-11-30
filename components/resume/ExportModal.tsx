'use client'

import { useState } from 'react'
import { X, Download, FileText, File, Loader2 } from 'lucide-react'
import { ResumeData } from '@/lib/resume-types'
import { exportResume } from '@/lib/resume-export'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  resumeData: ResumeData
  templateId: string
  resumeName: string
}

export default function ExportModal({
  isOpen,
  onClose,
  resumeData,
  templateId,
  resumeName
}: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'text'>('pdf')
  const [isExporting, setIsExporting] = useState(false)
  const [filename, setFilename] = useState(resumeName.replace(/\s+/g, '_'))

  if (!isOpen) return null

  const formats = [
    {
      id: 'pdf' as const,
      name: 'PDF',
      description: 'Best for applications and printing',
      icon: FileText,
      color: 'text-red-400',
      available: true
    },
    {
      id: 'text' as const,
      name: 'Plain Text',
      description: 'Simple text format for ATS systems',
      icon: File,
      color: 'text-gray-400',
      available: true
    }
  ]

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      await exportResume(resumeData, selectedFormat, templateId, filename)
      
      // Close modal after successful export
      setTimeout(() => {
        setIsExporting(false)
        onClose()
      }, 1000)
    } catch (error) {
      console.error('Export error:', error)
      alert('Failed to export resume. Please try again.')
      setIsExporting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-gray-800 rounded-xl border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-green-400" />
            <h3 className="text-xl font-bold text-white">Export Resume</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Filename */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Filename
            </label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="my-resume"
            />
            <p className="mt-1 text-xs text-gray-500">
              Extension will be added automatically
            </p>
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-3">
              Export Format
            </label>
            <div className="space-y-2">
              {formats.map((format) => {
                const Icon = format.icon
                const isSelected = selectedFormat === format.id
                
                return (
                  <button
                    key={format.id}
                    onClick={() => setSelectedFormat(format.id)}
                    disabled={!format.available}
                    className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
                    } ${!format.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Icon className={`w-6 h-6 ${format.color}`} />
                    <div className="flex-1 text-left">
                      <div className="font-medium text-white">{format.name}</div>
                      <div className="text-sm text-gray-400">{format.description}</div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Info */}
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-sm text-gray-300">
              <span className="font-medium text-blue-400">Tip:</span>{' '}
              {selectedFormat === 'pdf' 
                ? 'PDF format preserves your resume\'s formatting and is best for most applications.'
                : 'Plain text format is ideal for ATS systems that prefer simple formatting.'
              }
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || !filename.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Export</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
