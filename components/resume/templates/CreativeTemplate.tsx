'use client'

import { ResumeData } from '@/lib/resume-types'
import ModernTemplate from './ModernTemplate'

interface CreativeTemplateProps {
  data: ResumeData
}

// Creative template - will be customized in future sessions
export default function CreativeTemplate({ data }: CreativeTemplateProps) {
  // For now, use Modern template as base
  return <ModernTemplate data={data} />
}
