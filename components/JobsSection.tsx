'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { MapPin, DollarSign, Clock, ExternalLink, Target, TrendingUp } from 'lucide-react'

// Real company logos from Clearbit API (free CDN)
const COMPANY_LOGOS: Record<string, string> = {
  'Google': 'https://logo.clearbit.com/google.com',
  'Microsoft': 'https://logo.clearbit.com/microsoft.com',
  'Amazon': 'https://logo.clearbit.com/amazon.com',
  'Meta': 'https://logo.clearbit.com/meta.com',
  'Apple': 'https://logo.clearbit.com/apple.com',
  'Netflix': 'https://logo.clearbit.com/netflix.com',
  'Salesforce': 'https://logo.clearbit.com/salesforce.com',
  'Adobe': 'https://logo.clearbit.com/adobe.com',
  'Uber': 'https://logo.clearbit.com/uber.com',
  'Airbnb': 'https://logo.clearbit.com/airbnb.com',
  'Stripe': 'https://logo.clearbit.com/stripe.com',
  'Shopify': 'https://logo.clearbit.com/shopify.com'
}

interface Job {
  company: string
  title: string
  location: string
  salary: string
  type: string
  posted: string
}

export default function JobsSection() {
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')
  
  useEffect(() => {
    fetchJobs()
  }, [])
  
  const fetchJobs = async () => {
    // Mock data with real companies
    const mockJobs: Job[] = [
      { company: 'Google', title: 'Software Engineer', location: 'Mountain View, CA', salary: '$150k-$200k', type: 'Full-time', posted: '2 days ago' },
      { company: 'Microsoft', title: 'Product Manager', location: 'Seattle, WA', salary: '$140k-$180k', type: 'Full-time', posted: '1 day ago' },
      { company: 'Amazon', title: 'SDE Intern', location: 'Remote', salary: '$8k/month', type: 'Internship', posted: '3 days ago' },
      { company: 'Meta', title: 'Frontend Engineer', location: 'Menlo Park, CA', salary: '$160k-$210k', type: 'Full-time', posted: '1 day ago' },
      { company: 'Apple', title: 'iOS Developer', location: 'Cupertino, CA', salary: '$155k-$195k', type: 'Full-time', posted: '5 days ago' },
      { company: 'Netflix', title: 'Data Scientist', location: 'Los Gatos, CA', salary: '$170k-$220k', type: 'Full-time', posted: '2 days ago' },
      { company: 'Stripe', title: 'Backend Engineer', location: 'San Francisco, CA', salary: '$145k-$190k', type: 'Full-time', posted: '4 days ago' },
      { company: 'Salesforce', title: 'Cloud Engineer', location: 'Remote', salary: '$130k-$170k', type: 'Remote', posted: '1 week ago' },
      { company: 'Adobe', title: 'UX Designer', location: 'San Jose, CA', salary: '$120k-$160k', type: 'Full-time', posted: '3 days ago' },
      { company: 'Uber', title: 'ML Engineer', location: 'San Francisco, CA', salary: '$155k-$200k', type: 'Full-time', posted: '2 days ago' },
      { company: 'Airbnb', title: 'Full Stack Engineer', location: 'Remote', salary: '$140k-$185k', type: 'Remote', posted: '1 day ago' },
      { company: 'Shopify', title: 'DevOps Engineer', location: 'Remote', salary: '$135k-$175k', type: 'Remote', posted: '4 days ago' }
    ]
    
    setJobs(mockJobs)
    setLoading(false)
  }
  
  const prepareForJob = (job: Job) => {
    // Store company-specific data
    const companyData = {
      company: job.company,
      role: job.title,
      logo: COMPANY_LOGOS[job.company],
      location: job.location,
      type: job.type,
      salary: job.salary
    }
    
    localStorage.setItem('targetJob', JSON.stringify(job))
    localStorage.setItem('interviewContext', JSON.stringify(companyData))
    
    // Navigate to company-specific preparation page
    router.push(`/interview/company?company=${encodeURIComponent(job.company)}&role=${encodeURIComponent(job.title)}`)
  }
  
  const filteredJobs = jobs.filter(job => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'full-time') return job.type === 'Full-time'
    if (activeFilter === 'internship') return job.type === 'Internship'
    if (activeFilter === 'remote') return job.type === 'Remote'
    return true
  })
  
  const filters = [
    { id: 'all', label: 'All Positions' },
    { id: 'full-time', label: 'Full-time' },
    { id: 'internship', label: 'Internships' },
    { id: 'remote', label: 'Remote' }
  ]
  
  return (
    <section id="jobs-section" className="py-32 bg-gray-950">
      <div className="container mx-auto px-6">
        
        {/* Section header */}
        <div className="max-w-3xl mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-4"
          >
            <TrendingUp className="w-4 h-4" />
            Live Opportunities
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-5xl font-bold text-white mb-6"
          >
            Open Positions at Top Companies
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-400"
          >
            Real-time job listings from industry leaders. One-click interview preparation.
          </motion.p>
        </div>
        
        {/* Filters */}
        <div className="flex gap-3 mb-12 overflow-x-auto pb-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`
                px-6 py-2.5 rounded-lg font-medium whitespace-nowrap transition-all
                ${activeFilter === filter.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-gray-900 text-gray-400 hover:bg-gray-800 border border-gray-800'
                }
              `}
            >
              {filter.label}
            </button>
          ))}
        </div>
        
        {/* Jobs grid */}
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-blue-500/50 hover:bg-gray-800/50 transition-all"
              >
                {/* Company logo */}
                <div className="flex items-start justify-between mb-4">
                  <img 
                    src={COMPANY_LOGOS[job.company]}
                    alt={job.company}
                    className="w-12 h-12 rounded-lg bg-white p-1"
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${job.company}&background=3B82F6&color=fff`
                    }}
                  />
                  <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-medium rounded-full border border-blue-500/20">
                    {job.type}
                  </span>
                </div>
                
                {/* Job info */}
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                  {job.title}
                </h3>
                <p className="text-gray-400 font-medium mb-4">{job.company}</p>
                
                {/* Meta info */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <DollarSign className="w-4 h-4" />
                    {job.salary}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    Posted {job.posted}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-3">
                  <button 
                    onClick={() => prepareForJob(job)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-blue-500/20"
                  >
                    <Target className="w-4 h-4" />
                    Prepare for {job.company}
                  </button>
                  <button className="p-2.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-all border border-gray-700">
                    <ExternalLink className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
      </div>
    </section>
  )
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-6 animate-pulse">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gray-800 rounded-lg" />
            <div className="h-6 w-20 bg-gray-800 rounded-full" />
          </div>
          <div className="h-6 bg-gray-800 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-800 rounded w-1/2 mb-4" />
          <div className="space-y-2 mb-6">
            <div className="h-4 bg-gray-800 rounded w-2/3" />
            <div className="h-4 bg-gray-800 rounded w-1/2" />
            <div className="h-4 bg-gray-800 rounded w-1/3" />
          </div>
          <div className="flex gap-3">
            <div className="flex-1 h-10 bg-gray-800 rounded-lg" />
            <div className="w-10 h-10 bg-gray-800 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}
