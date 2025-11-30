'use client'

import { useState } from 'react'
import { Education } from '@/lib/resume-types'
import { Plus, Trash2, GripVertical } from 'lucide-react'

interface EducationSectionProps {
  education: Education[]
  onChange: (education: Education[]) => void
}

export default function EducationSection({ education, onChange }: EducationSectionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(education[0]?.id || null)

  const addEducation = () => {
    const newEdu: Education = {
      id: crypto.randomUUID(),
      institution: '',
      degree: '',
      major: '',
      gpa: '',
      startDate: '',
      endDate: '',
      achievements: ['']
    }
    onChange([...education, newEdu])
    setExpandedId(newEdu.id)
  }

  const updateEducation = (id: string, field: keyof Education, value: any) => {
    onChange(education.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    ))
  }

  const deleteEducation = (id: string) => {
    onChange(education.filter(edu => edu.id !== id))
  }

  const addAchievement = (eduId: string) => {
    onChange(education.map(edu =>
      edu.id === eduId ? { ...edu, achievements: [...edu.achievements, ''] } : edu
    ))
  }

  const updateAchievement = (eduId: string, index: number, value: string) => {
    onChange(education.map(edu =>
      edu.id === eduId ? {
        ...edu,
        achievements: edu.achievements.map((a, i) => i === index ? value : a)
      } : edu
    ))
  }

  const deleteAchievement = (eduId: string, index: number) => {
    onChange(education.map(edu =>
      edu.id === eduId ? {
        ...edu,
        achievements: edu.achievements.filter((_, i) => i !== index)
      } : edu
    ))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Education</h3>
        <button
          onClick={addEducation}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Education
        </button>
      </div>

      {education.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          No education added yet. Click "Add Education" to get started.
        </div>
      )}

      <div className="space-y-4">
        {education.map((edu) => (
          <div
            key={edu.id}
            className="rounded-lg bg-gray-900/50 border border-gray-700 overflow-hidden"
          >
            {/* Header */}
            <div
              onClick={() => setExpandedId(expandedId === edu.id ? null : edu.id)}
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <GripVertical className="w-5 h-5 text-gray-500" />
                <div>
                  <h4 className="font-semibold text-white">
                    {edu.degree || 'Degree'} {edu.major && `in ${edu.major}`}
                  </h4>
                  <p className="text-sm text-gray-400">
                    {edu.institution || 'Institution'} • {edu.startDate || 'Start'} - {edu.endDate || 'End'}
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  deleteEducation(edu.id)
                }}
                className="p-2 rounded-lg hover:bg-red-900/50 text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            {expandedId === edu.id && (
              <div className="p-4 border-t border-gray-700 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Institution Name"
                    value={edu.institution}
                    onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                    className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Degree (e.g., Bachelor of Science)"
                    value={edu.degree}
                    onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                    className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Major/Field of Study"
                    value={edu.major}
                    onChange={(e) => updateEducation(edu.id, 'major', e.target.value)}
                    className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="GPA (optional)"
                    value={edu.gpa || ''}
                    onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                    className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="month"
                    placeholder="Start Date"
                    value={edu.startDate}
                    onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                    className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="month"
                    placeholder="End Date"
                    value={edu.endDate}
                    onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                    className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Achievements */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Achievements & Activities
                  </label>
                  {edu.achievements.map((achievement, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={achievement}
                        onChange={(e) => updateAchievement(edu.id, index, e.target.value)}
                        placeholder="• Dean's List, Club President, etc."
                        className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                      />
                      {edu.achievements.length > 1 && (
                        <button
                          onClick={() => deleteAchievement(edu.id, index)}
                          className="p-2 rounded-lg hover:bg-red-900/50 text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addAchievement(edu.id)}
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    + Add achievement
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
