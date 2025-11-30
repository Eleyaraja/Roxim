'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Briefcase, MapPin, DollarSign, Clock } from 'lucide-react'

interface Job {
  id: string
  title: string
  company: string
  location: string
  salary?: string
  type: string
  posted: string
  logo?: string
  applyUrl: string
  description: string
  skills: string[]
}

export default function JobsGrid() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const router = useRouter()
  
  useEffect(() => {
    fetchJobs()
  }, [])
  
  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs')
      const data = await response.json()
      setJobs(data.jobs || [])
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const prepareForJob = (job: Job) => {
    // Store job details for interview context
    localStorage.setItem('targetJob', JSON.stringify(job))
    
    // Navigate to interview
    router.push(`/interview/start?job=${job.id}&role=${encodeURIComponent(job.title)}`)
  }
  
  const filteredJobs = jobs.filter(job => {
    if (filter === 'all') return true
    if (filter === 'full-time') return job.type.toLowerCase().includes('full')
    if (filter === 'internship') return job.type.toLowerCase().includes('intern')
    if (filter === 'remote') return job.location.toLowerCase().includes('remote')
    return true
  })
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-800 rounded-xl p-6 animate-pulse">
            <div className="h-12 w-12 bg-gray-700 rounded mb-4"></div>
            <div className="h-6 bg-gray-700 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-2/3 mb-4"></div>
            <div className="flex gap-2 mb-4">
              <div className="h-6 bg-gray-700 rounded w-20"></div>
              <div className="h-6 bg-gray-700 rounded w-24"></div>
            </div>
            <div className="h-10 bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    )
  }
  
  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        {['all', 'full-time', 'internship', 'remote'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`
              px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all
              ${filter === f
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/50'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }
            `}
          >
            {f.charAt(0).toUpperCase() + f.slice(1).replace('-', ' ')}
          </button>
        ))}
      </div>
      
      {/* Jobs grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.map((job, index) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all group relative overflow-hidden"
          >
            {/* Hover glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-purple-600/0 group-hover:from-blue-600/10 group-hover:to-purple-600/10 transition-all duration-300"></div>
            
            <div className="relative z-10">
              {/* Company logo */}
              {job.logo ? (
                <img src={job.logo} alt={job.company} className="w-12 h-12 mb-4 rounded" />
              ) : (
                <div className="w-12 h-12 mb-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded flex items-center justify-center text-white font-bold text-xl">
                  {job.company.charAt(0)}
                </div>
              )}
              
              {/* Job title */}
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                {job.title}
              </h3>
              
              {/* Company */}
              <p className="text-gray-400 font-medium mb-3">{job.company}</p>
              
              {/* Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{job.location}</span>
                </div>
                
                {job.salary && (
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <DollarSign className="w-4 h-4" />
                    <span>{job.salary}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{job.posted}</span>
                </div>
              </div>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-blue-500/20 text-blue-400 text-xs px-3 py-1 rounded-full font-medium">
                  {job.type}
                </span>
                {job.skills.slice(0, 2).map((skill, i) => (
                  <span key={i} className="bg-gray-700 text-gray-300 text-xs px-3 py-1 rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
              
              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => prepareForJob(job)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 group/btn"
                >
                  <Briefcase className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                  <span>Prepare Interview</span>
                </button>
                <a
                  href={job.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2.5 rounded-lg transition-all flex items-center justify-center"
                  title="Apply directly"
                >
                  🔗
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No jobs found for this filter.</p>
        </div>
      )}
    </div>
  )
}
