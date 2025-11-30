'use client'

import { useState } from 'react'
import { Experience } from '@/lib/resume-types'
import { Plus, Trash2, Sparkles, GripVertical } from 'lucide-react'

interface ExperienceSectionProps {
  experiences: Experience[]
  onChange: (experiences: Experience[]) => void
}

export default function ExperienceSection({ experiences, onChange }: ExperienceSectionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(experiences[0]?.id || null)

  const addExperience = () => {
    const newExp: Experience = {
      id: crypto.randomUUID(),
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      bullets: ['']
    }
    onChange([...experiences, newExp])
    setExpandedId(newExp.id)
  }

  const updateExperience = (id: string, field: keyof Experience, value: any) => {
    onChange(experiences.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    ))
  }

  const deleteExperience = (id: string) => {
    onChange(experiences.filter(exp => exp.id !== id))
  }

  const addBullet = (expId: string) => {
    onChange(experiences.map(exp =>
      exp.id === expId ? { ...exp, bullets: [...exp.bullets, ''] } : exp
    ))
  }

  const updateBullet = (expId: string, index: number, value: string) => {
    onChange(experiences.map(exp =>
      exp.id === expId ? {
        ...exp,
        bullets: exp.bullets.map((b, i) => i === index ? value : b)
      } : exp
    ))
  }

  const deleteBullet = (expId: string, index: number) => {
    onChange(experiences.map(exp =>
      exp.id === expId ? {
        ...exp,
        bullets: exp.bullets.filter((_, i) => i !== index)
      } : exp
    ))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Work Experience</h3>
        <button
          onClick={addExperience}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Experience
        </button>
      </div>

      {experiences.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          No experience added yet. Click "Add Experience" to get started.
        </div>
      )}

      <div className="space-y-4">
        {experiences.map((exp, index) => (
          <div
            key={exp.id}
            className="rounded-lg bg-gray-900/50 border border-gray-700 overflow-hidden"
          >
            {/* Header */}
            <div
              onClick={() => setExpandedId(expandedId === exp.id ? null : exp.id)}
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <GripVertical className="w-5 h-5 text-gray-500" />
                <div>
                  <h4 className="font-semibold text-white">
                    {exp.position || 'Untitled Position'} {exp.company && `at ${exp.company}`}
                  </h4>
                  <p className="text-sm text-gray-400">
                    {exp.startDate || 'Start'} - {exp.current ? 'Present' : exp.endDate || 'End'}
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  deleteExperience(exp.id)
                }}
                className="p-2 rounded-lg hover:bg-red-900/50 text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            {expandedId === exp.id && (
              <div className="p-4 border-t border-gray-700 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Company Name"
                    value={exp.company}
                    onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                    className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Job Title"
                    value={exp.position}
                    onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                    className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Location"
                    value={exp.location}
                    onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                    className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                  <div className="flex gap-2">
                    <input
                      type="month"
                      placeholder="Start Date"
                      value={exp.startDate}
                      onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                      className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="month"
                      placeholder="End Date"
                      value={exp.endDate}
                      onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                      disabled={exp.current}
                      className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-gray-300">
                  <input
                    type="checkbox"
                    checked={exp.current}
                    onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                    className="rounded"
                  />
                  I currently work here
                </label>

                {/* Bullets */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Key Achievements & Responsibilities
                  </label>
                  {exp.bullets.map((bullet, bulletIndex) => (
                    <div key={bulletIndex} className="flex gap-2">
                      <textarea
                        value={bullet}
                        onChange={(e) => updateBullet(exp.id, bulletIndex, e.target.value)}
                        placeholder="• Describe your achievement or responsibility..."
                        rows={2}
                        className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
                      />
                      <button
                        onClick={() => {/* AI enhance - implement later */}}
                        className="p-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                        title="AI Enhance"
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                      {exp.bullets.length > 1 && (
                        <button
                          onClick={() => deleteBullet(exp.id, bulletIndex)}
                          className="p-2 rounded-lg hover:bg-red-900/50 text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addBullet(exp.id)}
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    + Add bullet point
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
