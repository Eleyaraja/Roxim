'use client'

import { ResumeData } from '@/lib/resume-types'
import ModernTemplate from './ModernTemplate'

interface TechTemplateProps {
  data: ResumeData
}

// Tech template - will be customized in future sessions
export default function TechTemplate({ data }: TechTemplateProps) {
  // For now, use Modern template as base
  return <ModernTemplate data={data} />
}
