'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface Question {
  id: number
  category: string
  difficulty: string
  type?: string
  text: string
  sample_answer: string
  tags: string[]
  expected_time: number
}

interface Template {
  id: string
  name: string
  description: string
  icon: string
  question_ids: number[]
  duration_per_question: number
  difficulty: string
  color: string
}

interface InterviewContextType {
  selectedTemplate: Template | null
  setSelectedTemplate: (template: Template | null) => void
  questions: Question[]
  setQuestions: (questions: Question[]) => void
  resumeData: any
  setResumeData: (data: any) => void
}

const InterviewContext = createContext<InterviewContextType | undefined>(undefined)

export function InterviewProvider({ children }: { children: ReactNode }) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [resumeData, setResumeData] = useState<any>(null)

  return (
    <InterviewContext.Provider
      value={{
        selectedTemplate,
        setSelectedTemplate,
        questions,
        setQuestions,
        resumeData,
        setResumeData,
      }}
    >
      {children}
    </InterviewContext.Provider>
  )
}

export function useInterview() {
  const context = useContext(InterviewContext)
  if (context === undefined) {
    throw new Error('useInterview must be used within an InterviewProvider')
  }
  return context
}
