/**
 * Resume Builder - Type Definitions
 */

export interface PersonalInfo {
  fullName: string
  email: string
  phone: string
  linkedin?: string
  github?: string
  portfolio?: string
  location: string
  title: string
  summary?: string
}

export interface Experience {
  id: string
  company: string
  position: string
  location: string
  startDate: string
  endDate: string
  current: boolean
  description: string
  bullets: string[]
}

export interface Education {
  id: string
  institution: string
  degree: string
  major: string
  gpa?: string
  startDate: string
  endDate: string
  achievements: string[]
}

export interface Skills {
  programming: string[]
  frameworks: string[]
  tools: string[]
  soft: string[]
}

export interface Project {
  id: string
  name: string
  techStack: string[]
  description: string
  github?: string
  demo?: string
  date: string
  achievements: string[]
}

export interface CustomSection {
  id: string
  title: string
  items: Array<{
    id: string
    title: string
    subtitle?: string
    date?: string
    description?: string
    bullets?: string[]
  }>
}

export interface ResumeData {
  personal: PersonalInfo
  experience: Experience[]
  education: Education[]
  skills: Skills
  projects: Project[]
  custom: CustomSection[]
  sectionOrder: string[]
}

export type TemplateType = 'modern' | 'executive' | 'creative' | 'tech' | 'academic'

export interface Resume {
  id: string
  name: string
  lastModified: number
  template: TemplateType
  atsScore: number
  data: ResumeData
  versions: ResumeVersion[]
}

export interface ResumeVersion {
  id: string
  timestamp: number
  data: ResumeData
}

export interface ATSScore {
  overall: number
  breakdown: {
    keywords: number
    actionVerbs: number
    formatting: number
    completeness: number
    length: number
  }
  suggestions: string[]
}

export interface AIBulletVariations {
  standard: string
  impact: string
  technical: string
}

export interface SkillSuggestions {
  technical: string[]
  soft: string[]
  tools: string[]
  certifications: string[]
}
