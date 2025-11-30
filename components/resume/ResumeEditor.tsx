'use client'

import { useState } from 'react'
import { ResumeData } from '@/lib/resume-types'
import { User, Briefcase, GraduationCap, Code, FolderGit2 } from 'lucide-react'
import PersonalInfoSection from './PersonalInfoSection'
import ExperienceSection from './ExperienceSection'
import EducationSection from './EducationSection'
import SkillsSection from './SkillsSection'
import ProjectsSection from './ProjectsSection'

interface ResumeEditorProps {
  data: ResumeData
  onChange: (data: ResumeData) => void
}

export default function ResumeEditor({ data, onChange }: ResumeEditorProps) {
  const [activeTab, setActiveTab] = useState('personal')

  const tabs = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Code },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
  ]

  return (
    <div className="rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 overflow-hidden">
      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-gray-700 bg-gray-900/50">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-800/50'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'personal' && (
          <PersonalInfoSection
            data={data.personal}
            onChange={(personal) => onChange({ ...data, personal })}
          />
        )}
        
        {activeTab === 'experience' && (
          <ExperienceSection
            experiences={data.experience}
            onChange={(experience) => onChange({ ...data, experience })}
          />
        )}
        
        {activeTab === 'education' && (
          <EducationSection
            education={data.education}
            onChange={(education) => onChange({ ...data, education })}
          />
        )}
        
        {activeTab === 'skills' && (
          <SkillsSection
            skills={data.skills}
            onChange={(skills) => onChange({ ...data, skills })}
          />
        )}
        
        {activeTab === 'projects' && (
          <ProjectsSection
            projects={data.projects}
            onChange={(projects) => onChange({ ...data, projects })}
          />
        )}
      </div>
    </div>
  )
}
