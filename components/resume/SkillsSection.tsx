'use client'

import { useState } from 'react'
import { Skills } from '@/lib/resume-types'
import { X, Plus } from 'lucide-react'

interface SkillsSectionProps {
  skills: Skills
  onChange: (skills: Skills) => void
}

export default function SkillsSection({ skills, onChange }: SkillsSectionProps) {
  const [newSkill, setNewSkill] = useState({ category: 'programming', value: '' })

  const categories = [
    { key: 'programming', label: 'Programming Languages', color: 'blue' },
    { key: 'frameworks', label: 'Frameworks & Libraries', color: 'purple' },
    { key: 'tools', label: 'Tools & Technologies', color: 'green' },
    { key: 'soft', label: 'Soft Skills', color: 'yellow' }
  ]

  const addSkill = () => {
    if (!newSkill.value.trim()) return
    
    const category = newSkill.category as keyof Skills
    onChange({
      ...skills,
      [category]: [...skills[category], newSkill.value.trim()]
    })
    setNewSkill({ ...newSkill, value: '' })
  }

  const removeSkill = (category: keyof Skills, index: number) => {
    onChange({
      ...skills,
      [category]: skills[category].filter((_, i) => i !== index)
    })
  }

  const getColorClass = (color: string) => {
    const colors = {
      blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      green: 'bg-green-500/20 text-green-400 border-green-500/30',
      yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    }
    return colors[color as keyof typeof colors]
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white">Skills</h3>

      {/* Add Skill */}
      <div className="flex gap-2">
        <select
          value={newSkill.category}
          onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
          className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-blue-500"
        >
          {categories.map(cat => (
            <option key={cat.key} value={cat.key}>{cat.label}</option>
          ))}
        </select>
        <input
          type="text"
          value={newSkill.value}
          onChange={(e) => setNewSkill({ ...newSkill, value: e.target.value })}
          onKeyPress={(e) => e.key === 'Enter' && addSkill()}
          placeholder="Type skill and press Enter"
          className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={addSkill}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Skills by Category */}
      {categories.map(category => {
        const categorySkills = skills[category.key as keyof Skills]
        
        return (
          <div key={category.key}>
            <h4 className="text-sm font-semibold text-gray-300 mb-3">{category.label}</h4>
            <div className="flex flex-wrap gap-2">
              {categorySkills.length === 0 ? (
                <p className="text-sm text-gray-500">No skills added yet</p>
              ) : (
                categorySkills.map((skill, index) => (
                  <span
                    key={index}
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getColorClass(category.color)}`}
                  >
                    {skill}
                    <button
                      onClick={() => removeSkill(category.key as keyof Skills, index)}
                      className="hover:opacity-70"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
