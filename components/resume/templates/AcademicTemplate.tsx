'use client'

import { ResumeData } from '@/lib/resume-types'
import ModernTemplate from './ModernTemplate'

interface AcademicTemplateProps {
  data: ResumeData
}

// Academic template - will be customized in future sessions
export default function AcademicTemplate({ data }: AcademicTemplateProps) {
  // For now, use Modern template as base
  return <ModernTemplate data={data} />
}
