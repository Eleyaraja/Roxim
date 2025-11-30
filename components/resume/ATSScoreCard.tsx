'use client'

import { useState, useEffect } from 'react'
import { Resume } from '@/lib/resume-types'
import { Award, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'

interface ATSScoreCardProps {
  resume: Resume
}

interface ATSScore {
  overall: number
  categories: {
    name: string
    score: number
    status: 'good' | 'warning' | 'error'
    message: string
  }[]
}

export default function ATSScoreCard({ resume }: ATSScoreCardProps) {
  const [score, setScore] = useState<ATSScore | null>(null)

  useEffect(() => {
    // Calculate ATS score based on resume data
    const calculateScore = () => {
      const categories = []
      let totalScore = 0

      // Contact Information (20 points)
      const contactScore = calculateContactScore()
      categories.push(contactScore)
      totalScore += contactScore.score

      // Experience (25 points)
      const experienceScore = calculateExperienceScore()
      categories.push(experienceScore)
      totalScore += experienceScore.score

      // Skills (20 points)
      const skillsScore = calculateSkillsScore()
      categories.push(skillsScore)
      totalScore += skillsScore.score

      // Education (15 points)
      const educationScore = calculateEducationScore()
      categories.push(educationScore)
      totalScore += educationScore.score

      // Formatting (20 points)
      const formattingScore = calculateFormattingScore()
      categories.push(formattingScore)
      totalScore += formattingScore.score

      setScore({
        overall: totalScore,
        categories
      })
    }

    const calculateContactScore = (): {
      name: string
      score: number
      status: 'good' | 'warning' | 'error'
      message: string
    } => {
      let score = 0
      const { personal } = resume.data
      
      if (personal.fullName) score += 4
      if (personal.email) score += 4
      if (personal.phone) score += 4
      if (personal.location) score += 4
      if (personal.linkedin || personal.github || personal.portfolio) score += 4

      return {
        name: 'Contact Information',
        score,
        status: score >= 16 ? 'good' : score >= 12 ? 'warning' : 'error',
        message: score >= 16 ? 'Complete contact info' : 'Add more contact details'
      }
    }

    const calculateExperienceScore = (): {
      name: string
      score: number
      status: 'good' | 'warning' | 'error'
      message: string
    } => {
      let score = 0
      const { experience } = resume.data
      
      if (experience.length > 0) score += 10
      if (experience.length >= 2) score += 5
      
      const hasBullets = experience.some(exp => exp.bullets.length > 0)
      if (hasBullets) score += 10

      return {
        name: 'Work Experience',
        score,
        status: score >= 20 ? 'good' : score >= 15 ? 'warning' : 'error',
        message: score >= 20 ? 'Strong experience section' : 'Add more experience details'
      }
    }

    const calculateSkillsScore = (): {
      name: string
      score: number
      status: 'good' | 'warning' | 'error'
      message: string
    } => {
      let score = 0
      const { skills } = resume.data
      
      if (skills.programming.length > 0) score += 5
      if (skills.frameworks.length > 0) score += 5
      if (skills.tools.length > 0) score += 5
      if (skills.soft.length > 0) score += 5

      return {
        name: 'Skills',
        score,
        status: score >= 15 ? 'good' : score >= 10 ? 'warning' : 'error',
        message: score >= 15 ? 'Comprehensive skills' : 'Add more skills'
      }
    }

    const calculateEducationScore = (): {
      name: string
      score: number
      status: 'good' | 'warning' | 'error'
      message: string
    } => {
      let score = 0
      const { education } = resume.data
      
      if (education.length > 0) score += 10
      if (education.some(edu => edu.gpa)) score += 5

      return {
        name: 'Education',
        score,
        status: score >= 10 ? 'good' : score >= 5 ? 'warning' : 'error',
        message: score >= 10 ? 'Education complete' : 'Add education details'
      }
    }

    const calculateFormattingScore = (): {
      name: string
      score: number
      status: 'good' | 'warning' | 'error'
      message: string
    } => {
      let score = 20 // Default good formatting with our templates
      
      return {
        name: 'ATS Formatting',
        score,
        status: 'good' as const,
        message: 'Template is ATS-optimized'
      }
    }

    calculateScore()
  }, [resume])

  if (!score) return null

  const getScoreColor = (overall: number) => {
    if (overall >= 80) return 'text-green-400'
    if (overall >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getScoreLabel = (overall: number) => {
    if (overall >= 80) return 'Excellent'
    if (overall >= 60) return 'Good'
    return 'Needs Work'
  }

  return (
    <div className="rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Award className="w-6 h-6 text-blue-400" />
        <h3 className="text-xl font-bold text-white">ATS Score</h3>
      </div>

      {/* Overall Score */}
      <div className="text-center mb-6 p-6 rounded-lg bg-gray-900/50">
        <div className={`text-5xl font-bold mb-2 ${getScoreColor(score.overall)}`}>
          {score.overall}
        </div>
        <div className="text-gray-400 text-sm">out of 100</div>
        <div className={`text-lg font-medium mt-2 ${getScoreColor(score.overall)}`}>
          {getScoreLabel(score.overall)}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-3">
        {score.categories.map((category, index) => (
          <div key={index} className="p-4 rounded-lg bg-gray-900/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {category.status === 'good' && <CheckCircle className="w-4 h-4 text-green-400" />}
                {category.status === 'warning' && <AlertCircle className="w-4 h-4 text-yellow-400" />}
                {category.status === 'error' && <AlertCircle className="w-4 h-4 text-red-400" />}
                <span className="font-medium text-white">{category.name}</span>
              </div>
              <span className={`font-bold ${
                category.status === 'good' ? 'text-green-400' :
                category.status === 'warning' ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {category.score}
              </span>
            </div>
            <p className="text-sm text-gray-400">{category.message}</p>
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
        <div className="flex items-start gap-2">
          <TrendingUp className="w-4 h-4 text-blue-400 mt-0.5" />
          <div className="text-sm text-gray-300">
            <span className="font-medium text-blue-400">Pro Tip:</span> ATS systems scan for keywords, clear formatting, and complete information. Keep improving your score!
          </div>
        </div>
      </div>
    </div>
  )
}
