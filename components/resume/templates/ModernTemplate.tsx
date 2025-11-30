'use client'

import { ResumeData } from '@/lib/resume-types'
import { Mail, Phone, MapPin, Linkedin, Github, Globe, Calendar } from 'lucide-react'

interface ModernTemplateProps {
  data: ResumeData
}

export default function ModernTemplate({ data }: ModernTemplateProps) {
  const { personal, experience, education, skills, projects } = data

  const formatDate = (date: string) => {
    if (!date) return ''
    const [year, month] = date.split('-')
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${monthNames[parseInt(month) - 1]} ${year}`
  }

  return (
    <div className="max-w-4xl mx-auto bg-white text-gray-900 p-8 min-h-[11in] font-sans">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {personal.fullName || 'Your Name'}
        </h1>
        <h2 className="text-xl text-blue-600 font-medium mb-4">
          {personal.title || 'Professional Title'}
        </h2>
        
        {/* Contact Info */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          {personal.email && (
            <div className="flex items-center gap-1">
              <Mail className="w-4 h-4" />
              <span>{personal.email}</span>
            </div>
          )}
          {personal.phone && (
            <div className="flex items-center gap-1">
              <Phone className="w-4 h-4" />
              <span>{personal.phone}</span>
            </div>
          )}
          {personal.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{personal.location}</span>
            </div>
          )}
          {personal.linkedin && (
            <div className="flex items-center gap-1">
              <Linkedin className="w-4 h-4" />
              <span>{personal.linkedin}</span>
            </div>
          )}
          {personal.github && (
            <div className="flex items-center gap-1">
              <Github className="w-4 h-4" />
              <span>{personal.github}</span>
            </div>
          )}
          {personal.portfolio && (
            <div className="flex items-center gap-1">
              <Globe className="w-4 h-4" />
              <span>{personal.portfolio}</span>
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-3 gap-8">
        {/* Main Content - 2 columns */}
        <div className="col-span-2 space-y-6">
          {/* Experience */}
          {experience.length > 0 && (
            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
                PROFESSIONAL EXPERIENCE
              </h3>
              <div className="space-y-4">
                {experience.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h4 className="font-bold text-gray-900">{exp.position}</h4>
                        <p className="text-blue-600 font-medium">{exp.company}</p>
                        {exp.location && (
                          <p className="text-sm text-gray-600">{exp.location}</p>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 text-right">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {exp.description && (
                      <p className="text-gray-700 mb-2 text-sm">{exp.description}</p>
                    )}
                    
                    {exp.bullets.length > 0 && exp.bullets[0] && (
                      <ul className="list-disc ml-5 space-y-1">
                        {exp.bullets.filter(bullet => bullet.trim()).map((bullet, index) => (
                          <li key={index} className="text-sm text-gray-700">{bullet}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
                PROJECTS
              </h3>
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id}>
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-gray-900">{project.name}</h4>
                      {project.date && (
                        <span className="text-sm text-gray-600">{project.date}</span>
                      )}
                    </div>
                    
                    {project.techStack.length > 0 && (
                      <div className="mb-2">
                        <span className="text-sm font-medium text-gray-700">Tech Stack: </span>
                        <span className="text-sm text-blue-600">{project.techStack.join(', ')}</span>
                      </div>
                    )}
                    
                    {project.description && (
                      <p className="text-sm text-gray-700 mb-2">{project.description}</p>
                    )}
                    
                    {project.achievements.length > 0 && project.achievements[0] && (
                      <ul className="list-disc ml-5 space-y-1">
                        {project.achievements.filter(achievement => achievement.trim()).map((achievement, index) => (
                          <li key={index} className="text-sm text-gray-700">{achievement}</li>
                        ))}
                      </ul>
                    )}
                    
                    <div className="flex gap-4 mt-2 text-sm">
                      {project.github && (
                        <a href={project.github} className="text-blue-600 hover:underline">
                          GitHub
                        </a>
                      )}
                      {project.demo && (
                        <a href={project.demo} className="text-blue-600 hover:underline">
                          Live Demo
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Skills */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
              SKILLS
            </h3>
            <div className="space-y-4">
              {skills.programming.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Programming</h4>
                  <div className="flex flex-wrap gap-1">
                    {skills.programming.map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {skills.frameworks.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Frameworks</h4>
                  <div className="flex flex-wrap gap-1">
                    {skills.frameworks.map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {skills.tools.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Tools</h4>
                  <div className="flex flex-wrap gap-1">
                    {skills.tools.map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {skills.soft.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Soft Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {skills.soft.map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Education */}
          {education.length > 0 && (
            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
                EDUCATION
              </h3>
              <div className="space-y-3">
                {education.map((edu) => (
                  <div key={edu.id}>
                    <h4 className="font-bold text-gray-900">{edu.degree}</h4>
                    {edu.major && (
                      <p className="text-sm text-blue-600">{edu.major}</p>
                    )}
                    <p className="text-sm text-gray-700">{edu.institution}</p>
                    <p className="text-xs text-gray-600">
                      {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                    </p>
                    {edu.gpa && (
                      <p className="text-xs text-gray-600">GPA: {edu.gpa}</p>
                    )}
                    
                    {edu.achievements.length > 0 && edu.achievements[0] && (
                      <ul className="list-disc ml-4 mt-1">
                        {edu.achievements.filter(achievement => achievement.trim()).map((achievement, index) => (
                          <li key={index} className="text-xs text-gray-700">{achievement}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
