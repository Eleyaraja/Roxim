'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Calendar, MapPin, AlertCircle } from 'lucide-react'

const upcomingInternships = [
  {
    company: 'Google',
    role: 'Software Engineering Intern - Summer 2025',
    deadline: '2025-12-31',
    location: 'Mountain View, CA / Remote',
    applyUrl: 'https://careers.google.com/students'
  },
  {
    company: 'Microsoft',
    role: 'Software Engineering Intern',
    deadline: '2025-12-15',
    location: 'Redmond, WA / Multiple Locations',
    applyUrl: 'https://careers.microsoft.com/students'
  },
  {
    company: 'Meta',
    role: 'Software Engineer Intern',
    deadline: '2025-12-20',
    location: 'Menlo Park, CA',
    applyUrl: 'https://www.metacareers.com/students'
  },
  {
    company: 'Amazon',
    role: 'SDE Intern - Summer 2025',
    deadline: '2026-01-15',
    location: 'Seattle, WA / Multiple Locations',
    applyUrl: 'https://www.amazon.jobs/en/teams/internships-for-students'
  },
  {
    company: 'Apple',
    role: 'Software Engineering Intern',
    deadline: '2025-12-10',
    location: 'Cupertino, CA',
    applyUrl: 'https://www.apple.com/careers/us/students.html'
  },
  {
    company: 'Netflix',
    role: 'Software Engineer Intern',
    deadline: '2026-01-05',
    location: 'Los Gatos, CA',
    applyUrl: 'https://jobs.netflix.com/students'
  },
  {
    company: 'Stripe',
    role: 'Software Engineering Intern',
    deadline: '2025-12-25',
    location: 'San Francisco, CA / Remote',
    applyUrl: 'https://stripe.com/jobs/university'
  },
  {
    company: 'Airbnb',
    role: 'Software Engineer Intern',
    deadline: '2026-01-10',
    location: 'San Francisco, CA',
    applyUrl: 'https://careers.airbnb.com/university'
  }
]

export default function InternshipsTimeline() {
  const router = useRouter()
  
  const prepareForInternship = (internship: typeof upcomingInternships[0]) => {
    localStorage.setItem('targetJob', JSON.stringify({
      title: internship.role,
      company: internship.company,
      location: internship.location,
      type: 'Internship'
    }))
    router.push(`/interview/start?role=${encodeURIComponent(internship.role)}`)
  }
  
  const getDaysUntilDeadline = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return days
  }
  
  const isUrgent = (deadline: string) => {
    return getDaysUntilDeadline(deadline) <= 14
  }
  
  return (
    <div className="space-y-4">
      {upcomingInternships.map((internship, i) => {
        const daysLeft = getDaysUntilDeadline(internship.deadline)
        const urgent = isUrgent(internship.deadline)
        
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
            className={`
              flex flex-col md:flex-row md:items-center gap-4 
              bg-gray-900 rounded-xl p-6 
              border transition-all
              ${urgent 
                ? 'border-orange-500/50 shadow-lg shadow-orange-500/20' 
                : 'border-gray-800 hover:border-blue-500/50'
              }
            `}
          >
            {/* Company logo */}
            <img
              src={`https://logo.clearbit.com/${internship.company.toLowerCase()}.com`}
              alt={internship.company}
              className="w-16 h-16 rounded-lg bg-white p-2 flex-shrink-0"
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${internship.company}&background=3B82F6&color=fff&size=64`
              }}
            />
            
            {/* Details */}
            <div className="flex-1 min-w-0">
              <h4 className="text-lg font-bold text-white mb-1 truncate">
                {internship.role}
              </h4>
              <p className="text-gray-400 font-medium mb-2">{internship.company}</p>
              
              <div className="flex flex-wrap gap-3 text-sm">
                <div className="flex items-center gap-1.5 text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span>{internship.location}</span>
                </div>
                
                <div className={`flex items-center gap-1.5 font-medium ${urgent ? 'text-orange-400' : 'text-blue-400'}`}>
                  <Calendar className="w-4 h-4" />
                  <span>
                    {daysLeft > 0 
                      ? `${daysLeft} days left` 
                      : 'Deadline passed'
                    }
                  </span>
                </div>
              </div>
              
              {urgent && daysLeft > 0 && (
                <div className="flex items-center gap-1.5 mt-2 text-orange-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-medium">Apply soon! Deadline: {new Date(internship.deadline).toLocaleDateString()}</span>
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => prepareForInternship(internship)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap"
              >
                Prepare Now
              </button>
              <a
                href={internship.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white px-4 py-2.5 rounded-lg transition-all border border-gray-700"
                title="Apply directly"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
