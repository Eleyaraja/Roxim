'use client'

import { ResumeData, TemplateType } from '@/lib/resume-types'
import ModernTemplate from './templates/ModernTemplate'
import ExecutiveTemplate from './templates/ExecutiveTemplate'
import TechTemplate from './templates/TechTemplate'
import CreativeTemplate from './templates/CreativeTemplate'
import AcademicTemplate from './templates/AcademicTemplate'

interface ResumePreviewProps {
  data: ResumeData
  template: TemplateType
}

export default function ResumePreview({ data, template }: ResumePreviewProps) {
  const templates = {
    modern: ModernTemplate,
    executive: ExecutiveTemplate,
    tech: TechTemplate,
    creative: CreativeTemplate,
    academic: AcademicTemplate
  }

  const TemplateComponent = templates[template] || ModernTemplate

  return (
    <div className="rounded-xl bg-white border border-gray-700 overflow-hidden shadow-2xl">
      <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="ml-2 text-sm text-gray-600 font-medium">
            {data.personal.fullName || 'Resume'} - {template.charAt(0).toUpperCase() + template.slice(1)} Template
          </span>
        </div>
      </div>
      
      <div className="bg-white" id="resume-preview">
        <TemplateComponent data={data} />
      </div>
    </div>
  )
}
