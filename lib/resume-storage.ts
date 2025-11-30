/**
 * Resume Storage - localStorage Management
 */

import { Resume, ResumeData, ResumeVersion } from './resume-types'

const STORAGE_KEY = 'resumes'
const MAX_VERSIONS = 5

/**
 * Get all resumes
 */
export function getResumes(): Resume[] {
  if (typeof window === 'undefined') return []
  
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Error reading resumes:', error)
    return []
  }
}

/**
 * Get resume by ID
 */
export function getResumeById(id: string): Resume | null {
  const resumes = getResumes()
  return resumes.find(r => r.id === id) || null
}

/**
 * Save resume
 */
export function saveResume(resume: Resume): void {
  if (typeof window === 'undefined') return
  
  try {
    const resumes = getResumes()
    const index = resumes.findIndex(r => r.id === resume.id)
    
    // Update last modified
    resume.lastModified = Date.now()
    
    if (index >= 0) {
      resumes[index] = resume
    } else {
      resumes.unshift(resume)
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resumes))
  } catch (error) {
    console.error('Error saving resume:', error)
  }
}

/**
 * Create new resume
 */
export function createResume(name: string): Resume {
  return {
    id: crypto.randomUUID(),
    name,
    lastModified: Date.now(),
    template: 'modern',
    atsScore: 0,
    data: {
      personal: {
        fullName: '',
        email: '',
        phone: '',
        location: '',
        title: ''
      },
      experience: [],
      education: [],
      skills: {
        programming: [],
        frameworks: [],
        tools: [],
        soft: []
      },
      projects: [],
      custom: [],
      sectionOrder: ['experience', 'education', 'skills', 'projects']
    },
    versions: []
  }
}

/**
 * Delete resume
 */
export function deleteResume(id: string): void {
  if (typeof window === 'undefined') return
  
  try {
    const resumes = getResumes()
    const filtered = resumes.filter(r => r.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error('Error deleting resume:', error)
  }
}

/**
 * Duplicate resume
 */
export function duplicateResume(id: string): Resume | null {
  const original = getResumeById(id)
  if (!original) return null
  
  const duplicate: Resume = {
    ...original,
    id: crypto.randomUUID(),
    name: `${original.name} (Copy)`,
    lastModified: Date.now(),
    versions: []
  }
  
  saveResume(duplicate)
  return duplicate
}

/**
 * Save version
 */
export function saveVersion(resumeId: string, data: ResumeData): void {
  const resume = getResumeById(resumeId)
  if (!resume) return
  
  const version: ResumeVersion = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    data: JSON.parse(JSON.stringify(data))
  }
  
  resume.versions.unshift(version)
  
  // Keep only last MAX_VERSIONS
  if (resume.versions.length > MAX_VERSIONS) {
    resume.versions = resume.versions.slice(0, MAX_VERSIONS)
  }
  
  saveResume(resume)
}

/**
 * Restore version
 */
export function restoreVersion(resumeId: string, versionId: string): ResumeData | null {
  const resume = getResumeById(resumeId)
  if (!resume) return null
  
  const version = resume.versions.find(v => v.id === versionId)
  if (!version) return null
  
  return JSON.parse(JSON.stringify(version.data))
}

/**
 * Export resume as JSON
 */
export function exportResumeJSON(resume: Resume): void {
  const dataStr = JSON.stringify(resume, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${resume.name.replace(/\s+/g, '_')}_${Date.now()}.json`
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * Import resume from JSON
 */
export function importResumeJSON(file: File): Promise<Resume> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const resume = JSON.parse(e.target?.result as string) as Resume
        resume.id = crypto.randomUUID() // New ID
        resume.lastModified = Date.now()
        saveResume(resume)
        resolve(resume)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}

/**
 * Get sample resume
 */
export function getSampleResume(): Resume {
  return {
    id: crypto.randomUUID(),
    name: 'Sample Resume',
    lastModified: Date.now(),
    template: 'modern',
    atsScore: 85,
    data: {
      personal: {
        fullName: 'John Doe',
        email: 'john.doe@email.com',
        phone: '+1 (555) 123-4567',
        linkedin: 'linkedin.com/in/johndoe',
        github: 'github.com/johndoe',
        portfolio: 'johndoe.dev',
        location: 'San Francisco, CA',
        title: 'Senior Software Engineer'
      },
      experience: [
        {
          id: '1',
          company: 'Tech Corp',
          position: 'Senior Software Engineer',
          location: 'San Francisco, CA',
          startDate: '2021-01',
          endDate: '',
          current: true,
          description: 'Leading development of cloud-native applications',
          bullets: [
            'Architected and deployed microservices handling 10M+ requests/day using Node.js and Kubernetes',
            'Reduced API response time by 60% through database optimization and caching strategies',
            'Mentored team of 5 junior developers, improving code quality and delivery speed by 40%'
          ]
        },
        {
          id: '2',
          company: 'StartupXYZ',
          position: 'Full Stack Developer',
          location: 'Remote',
          startDate: '2019-06',
          endDate: '2020-12',
          current: false,
          description: 'Built and maintained web applications',
          bullets: [
            'Developed React-based dashboard serving 50K+ users with real-time data visualization',
            'Implemented CI/CD pipeline reducing deployment time from 2 hours to 15 minutes',
            'Collaborated with design team to improve UX, increasing user engagement by 35%'
          ]
        }
      ],
      education: [
        {
          id: '1',
          institution: 'University of California',
          degree: 'Bachelor of Science',
          major: 'Computer Science',
          gpa: '3.8',
          startDate: '2015-09',
          endDate: '2019-05',
          achievements: [
            'Dean\'s List all semesters',
            'President of Computer Science Club',
            'Published research paper on machine learning algorithms'
          ]
        }
      ],
      skills: {
        programming: ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go'],
        frameworks: ['React', 'Next.js', 'Node.js', 'Express', 'FastAPI'],
        tools: ['Docker', 'Kubernetes', 'AWS', 'Git', 'PostgreSQL', 'MongoDB'],
        soft: ['Leadership', 'Communication', 'Problem Solving', 'Team Collaboration']
      },
      projects: [
        {
          id: '1',
          name: 'AI Interview Platform',
          techStack: ['Next.js', 'TypeScript', 'Groq AI', 'Tailwind CSS'],
          description: 'Built an AI-powered interview preparation platform with real-time feedback',
          github: 'github.com/johndoe/ai-interview',
          demo: 'ai-interview.demo.com',
          date: '2024',
          achievements: [
            'Integrated Groq AI for intelligent question generation',
            'Implemented voice recognition with 95% accuracy',
            'Deployed to 1000+ users in first month'
          ]
        }
      ],
      custom: [],
      sectionOrder: ['experience', 'education', 'skills', 'projects']
    },
    versions: []
  }
}
