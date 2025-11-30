'use client'

import { useState } from 'react'
import { Project } from '@/lib/resume-types'
import { Plus, Trash2, GripVertical, X } from 'lucide-react'

interface ProjectsSectionProps {
  projects: Project[]
  onChange: (projects: Project[]) => void
}

export default function ProjectsSection({ projects, onChange }: ProjectsSectionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(projects[0]?.id || null)
  const [newTech, setNewTech] = useState<Record<string, string>>({})

  const addProject = () => {
    const newProj: Project = {
      id: crypto.randomUUID(),
      name: '',
      techStack: [],
      description: '',
      github: '',
      demo: '',
      date: '',
      achievements: ['']
    }
    onChange([...projects, newProj])
    setExpandedId(newProj.id)
  }

  const updateProject = (id: string, field: keyof Project, value: any) => {
    onChange(projects.map(proj => 
      proj.id === id ? { ...proj, [field]: value } : proj
    ))
  }

  const deleteProject = (id: string) => {
    onChange(projects.filter(proj => proj.id !== id))
  }

  const addTech = (projId: string) => {
    const tech = newTech[projId]?.trim()
    if (!tech) return
    
    onChange(projects.map(proj =>
      proj.id === projId ? { ...proj, techStack: [...proj.techStack, tech] } : proj
    ))
    setNewTech({ ...newTech, [projId]: '' })
  }

  const removeTech = (projId: string, index: number) => {
    onChange(projects.map(proj =>
      proj.id === projId ? {
        ...proj,
        techStack: proj.techStack.filter((_, i) => i !== index)
      } : proj
    ))
  }

  const addAchievement = (projId: string) => {
    onChange(projects.map(proj =>
      proj.id === projId ? { ...proj, achievements: [...proj.achievements, ''] } : proj
    ))
  }

  const updateAchievement = (projId: string, index: number, value: string) => {
    onChange(projects.map(proj =>
      proj.id === projId ? {
        ...proj,
        achievements: proj.achievements.map((a, i) => i === index ? value : a)
      } : proj
    ))
  }

  const deleteAchievement = (projId: string, index: number) => {
    onChange(projects.map(proj =>
      proj.id === projId ? {
        ...proj,
        achievements: proj.achievements.filter((_, i) => i !== index)
      } : proj
    ))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Projects</h3>
        <button
          onClick={addProject}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Project
        </button>
      </div>

      {projects.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          No projects added yet. Click "Add Project" to get started.
        </div>
      )}

      <div className="space-y-4">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="rounded-lg bg-gray-900/50 border border-gray-700 overflow-hidden"
          >
            <div
              onClick={() => setExpandedId(expandedId === proj.id ? null : proj.id)}
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <GripVertical className="w-5 h-5 text-gray-500" />
                <div>
                  <h4 className="font-semibold text-white">{proj.name || 'Untitled Project'}</h4>
                  <p className="text-sm text-gray-400">
                    {proj.techStack.length > 0 ? proj.techStack.join(', ') : 'No tech stack'}
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  deleteProject(proj.id)
                }}
                className="p-2 rounded-lg hover:bg-red-900/50 text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {expandedId === proj.id && (
              <div className="p-4 border-t border-gray-700 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Project Name"
                    value={proj.name}
                    onChange={(e) => updateProject(proj.id, 'name', e.target.value)}
                    className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Date (e.g., 2024)"
                    value={proj.date}
                    onChange={(e) => updateProject(proj.id, 'date', e.target.value)}
                    className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="url"
                    placeholder="GitHub URL"
                    value={proj.github || ''}
                    onChange={(e) => updateProject(proj.id, 'github', e.target.value)}
                    className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="url"
                    placeholder="Demo URL"
                    value={proj.demo || ''}
                    onChange={(e) => updateProject(proj.id, 'demo', e.target.value)}
                    className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <textarea
                  placeholder="Project description..."
                  value={proj.description}
                  onChange={(e) => updateProject(proj.id, 'description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
                />

                {/* Tech Stack */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tech Stack</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newTech[proj.id] || ''}
                      onChange={(e) => setNewTech({ ...newTech, [proj.id]: e.target.value })}
                      onKeyPress={(e) => e.key === 'Enter' && addTech(proj.id)}
                      placeholder="Add technology..."
                      className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={() => addTech(proj.id)}
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {proj.techStack.map((tech, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      >
                        {tech}
                        <button onClick={() => removeTech(proj.id, index)}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Achievements */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Key Achievements</label>
                  {proj.achievements.map((achievement, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={achievement}
                        onChange={(e) => updateAchievement(proj.id, index, e.target.value)}
                        placeholder="• Describe impact or result..."
                        className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                      />
                      {proj.achievements.length > 1 && (
                        <button
                          onClick={() => deleteAchievement(proj.id, index)}
                          className="p-2 rounded-lg hover:bg-red-900/50 text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addAchievement(proj.id)}
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
