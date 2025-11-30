'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Code2, 
  Server, 
  Rocket, 
  Binary, 
  Users, 
  Upload,
  Clock,
  FileText,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import { useInterview } from '@/contexts/InterviewContext'
import templatesData from '@/data/templates.json'
import questionsData from '@/data/questions.json'

const iconMap = {
  '💻': Code2,
  '⚙️': Server,
  '🚀': Rocket,
  '🧮': Binary,
  '👥': Users,
}

const colorMap = {
  blue: 'from-blue-500 to-cyan-500',
  green: 'from-green-500 to-emerald-500',
  purple: 'from-purple-500 to-pink-500',
  red: 'from-red-500 to-orange-500',
  yellow: 'from-yellow-500 to-amber-500',
}

export default function InterviewStartPage() {
  const router = useRouter()
  const { setSelectedTemplate, setQuestions, setResumeData } = useInterview()
  const [isUploading, setIsUploading] = useState(false)

  const handleTemplateSelect = (template: any) => {
    // Get questions for this template
    const templateQuestions = questionsData.questions.filter(q =>
      template.question_ids.includes(q.id)
    )

    // Shuffle and take first 5 questions
    const shuffled = templateQuestions.sort(() => Math.random() - 0.5)
    const selectedQuestions = shuffled.slice(0, 5)

    setSelectedTemplate(template)
    setQuestions(selectedQuestions)
    setResumeData(null)

    // Redirect to interview session
    router.push('/interview/session')
  }

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      console.log('📄 Reading resume file:', file.name, file.type)
      let text = ''
      
      // Handle different file types
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        // Plain text file
        text = await file.text()
        console.log('✅ Text file read successfully')
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
        // Word document - use mammoth
        const mammoth = (await import('mammoth')).default
        const arrayBuffer = await file.arrayBuffer()
        const result = await mammoth.extractRawText({ arrayBuffer })
        text = result.value
        console.log('✅ Word document parsed successfully')
      } else {
        // Try reading as text for other formats
        text = await file.text()
        console.log('⚠️ Unknown format, reading as text')
      }
      
      console.log('📄 Resume content:', {
        filename: file.name,
        textLength: text.length,
        preview: text.substring(0, 200)
      })
      
      // Store resume data with full text - AI will parse it
      const resumeInfo = { 
        text: text, 
        filename: file.name,
        fileType: file.type,
        skills: [], // AI will extract these
        yearsOfExperience: 0 // AI will extract this
      }
      
      setResumeData(resumeInfo)
      console.log('✅ Resume data stored - AI will analyze it')
      
      // Store in localStorage as backup
      localStorage.setItem('uploadedResume', JSON.stringify(resumeInfo))
      console.log('💾 Resume saved to localStorage')
      
      // Use Full Stack template as default for resume-based interviews
      const defaultTemplate = templatesData.templates.find(t => t.id === 'fullstack')
      if (defaultTemplate) {
        handleTemplateSelect(defaultTemplate)
      }
    } catch (error) {
      console.error('Error uploading resume:', error)
      alert('Failed to upload resume. Please use a .txt or .docx file.')
    } finally {
      setIsUploading(false)
    }
  }

  // Helper function to extract skills from resume text
  const extractSkillsFromText = (text: string): string[] => {
    const commonSkills = [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'React', 'Node.js', 
      'Angular', 'Vue', 'Next.js', 'Express', 'MongoDB', 'SQL', 'PostgreSQL',
      'AWS', 'Azure', 'Docker', 'Kubernetes', 'Git', 'REST API', 'GraphQL',
      'HTML', 'CSS', 'Tailwind', 'Bootstrap', 'Redux', 'Jest', 'Testing'
    ]
    
    return commonSkills.filter(skill => 
      text.toLowerCase().includes(skill.toLowerCase())
    )
  }

  // Helper function to extract years of experience
  const extractYearsFromText = (text: string): number => {
    const yearMatch = text.match(/(\d+)\+?\s*years?\s*(of\s*)?experience/i)
    if (yearMatch) {
      return parseInt(yearMatch[1])
    }
    
    // Try to count date ranges (e.g., "2020 - 2023")
    const dateRanges = text.match(/\d{4}\s*[-–]\s*(\d{4}|present|current)/gi)
    if (dateRanges && dateRanges.length > 0) {
      return Math.min(dateRanges.length * 2, 15)
    }
    
    return 3 // Default
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold text-white mb-4">
            Choose Your Interview Path
          </h1>
          <p className="text-xl text-gray-300">
            Select a template or upload your resume for a personalized experience
          </p>
        </div>

        {/* Resume Upload Section */}
        <div className="max-w-2xl mx-auto mb-16">
          <label
            htmlFor="resume-upload"
            className="group relative block cursor-pointer"
          >
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-1 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="relative rounded-xl bg-gray-900 p-8 transition-all duration-300 group-hover:bg-gray-800">
                <div className="flex items-center justify-center gap-4">
                  <div className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 p-4">
                    <Upload className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-2xl font-bold text-white mb-1">
                      {isUploading ? 'Uploading...' : 'Upload Your Resume'}
                    </h3>
                    <p className="text-gray-400">
                      Get personalized questions based on your experience
                    </p>
                  </div>
                  <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
                </div>
              </div>
            </div>
            <input
              id="resume-upload"
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleResumeUpload}
              className="hidden"
              disabled={isUploading}
            />
          </label>
        </div>

        {/* Divider */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <div className="h-px bg-gray-600 flex-1 max-w-xs"></div>
          <span className="text-gray-400 text-sm font-medium">OR CHOOSE A TEMPLATE</span>
          <div className="h-px bg-gray-600 flex-1 max-w-xs"></div>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {templatesData.templates.map((template, index) => {
            const Icon = iconMap[template.icon as keyof typeof iconMap] || Code2
            const gradient = colorMap[template.color as keyof typeof colorMap]
            const questionCount = template.question_ids.length
            const estimatedTime = Math.ceil((template.duration_per_question * 5) / 60)

            return (
              <div
                key={template.id}
                className="group relative animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-gray-700 hover:border-gray-600">
                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>

                  {/* Icon */}
                  <div className={`relative mb-4 inline-flex rounded-xl bg-gradient-to-br ${gradient} p-3`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <div className="relative">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {template.name}
                    </h3>
                    <p className="text-gray-400 mb-4 min-h-[48px]">
                      {template.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-6 text-sm">
                      <div className="flex items-center gap-1 text-gray-400">
                        <FileText className="w-4 h-4" />
                        <span>{questionCount} questions</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>~{estimatedTime} min</span>
                      </div>
                    </div>

                    {/* Difficulty Badge */}
                    <div className="mb-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        template.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                        template.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {template.difficulty.charAt(0).toUpperCase() + template.difficulty.slice(1)}
                      </span>
                    </div>

                    {/* Button */}
                    <button
                      onClick={() => handleTemplateSelect(template)}
                      className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r ${gradient} text-white font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-${template.color}-500/50 group-hover:scale-105`}
                    >
                      <span>Quick Start</span>
                      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer Info */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 text-sm">
            Each interview includes 5 carefully selected questions • Voice recording • AI-powered feedback
          </p>
        </div>
      </div>
    </div>
  )
}
