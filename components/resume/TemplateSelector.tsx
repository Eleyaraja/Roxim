'use client'

import { useState } from 'react'
import { TemplateType } from '@/lib/resume-types'
import { ChevronDown, Check } from 'lucide-react'

interface TemplateSelectorProps {
  selected: TemplateType
  onChange: (template: TemplateType) => void
}

export default function TemplateSelector({ selected, onChange }: TemplateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const templates = [
    {
      id: 'modern' as TemplateType,
      name: 'Modern Minimalist',
      description: 'Clean, two-column layout with subtle colors',
      color: 'bg-blue-500'
    },
    {
      id: 'executive' as TemplateType,
      name: 'Executive Bold',
      description: 'Traditional layout with strong typography',
      color: 'bg-gray-800'
    },
    {
      id: 'tech' as TemplateType,
      name: 'Tech Engineer',
      description: 'ATS-optimized, clean and scannable',
      color: 'bg-green-500'
    },
    {
      id: 'creative' as TemplateType,
      name: 'Creative Designer',
      description: 'Visual elements with colorful accents',
      color: 'bg-purple-500'
    },
    {
      id: 'academic' as TemplateType,
      name: 'Academic Research',
      description: 'Publication-focused, traditional format',
      color: 'bg-amber-600'
    }
  ]

  const selectedTemplate = templates.find(t => t.id === selected) || templates[0]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 transition-colors"
      >
        <div className={`w-3 h-3 rounded-full ${selectedTemplate.color}`}></div>
        <span className="font-medium">{selectedTemplate.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20 overflow-hidden">
            <div className="p-2">
              <div className="text-sm font-medium text-gray-300 px-3 py-2">
                Choose Template
              </div>
              
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    onChange(template.id)
                    setIsOpen(false)
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-700 transition-colors text-left"
                >
                  <div className={`w-4 h-4 rounded-full ${template.color} flex-shrink-0`}></div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white">{template.name}</div>
                    <div className="text-sm text-gray-400 truncate">{template.description}</div>
                  </div>
                  
                  {selected === template.id && (
                    <Check className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
            
            <div className="border-t border-gray-700 p-3">
              <p className="text-xs text-gray-500">
                Templates are optimized for ATS systems and professional standards
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
