'use client'

import { ResumeData } from '@/lib/resume-types'
import ModernTemplate from './ModernTemplate'

interface ExecutiveTemplateProps {
  data: ResumeData
}

// Executive template - will be customized in future sessions
export default function ExecutiveTemplate({ data }: ExecutiveTemplateProps) {
  // For now, use Modern template as base
  return <ModernTemplate data={data} />
}
