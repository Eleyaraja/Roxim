'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Target, ArrowLeft, Zap, Users } from 'lucide-react'
import Link from 'next/link'

export default function CompanyInterviewPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const companyName = searchParams.get('company')
  const roleName = searchParams.get('role')
  
  const [interviewData, setInterviewData] = useState<any>(null)
  
  useEffect(() => {
    // Load company-specific data from localStorage
    const stored = localStorage.getItem('interviewContext')
    if (stored) {
      setInterviewData(JSON.parse(stored))
    }
  }, [])
  
  const startInterview = (type: 'technical' | 'behavioral') => {
    if (!companyName || !roleName) return
    
    // Just store the company context - interview room will generate questions dynamically
    localStorage.setItem('companyContext', JSON.stringify({
      company: companyName,
      role: roleName,
      interviewType: type
    }))
    
    // Navigate directly to interview - no waiting!
    router.push('/interview/start')
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-blue-950/20 to-gray-950 pt-20">
      <div className="container mx-auto px-6 py-12">
        
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Jobs
        </Link>
        
        {/* Company Interview Card */}
        {interviewData && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 mb-8 backdrop-blur-sm">
              <div className="flex items-center gap-6 mb-6">
                <img 
                  src={interviewData.logo}
                  alt={companyName || ''}
                  className="w-20 h-20 rounded-xl bg-white p-2"
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${companyName}&background=3B82F6&color=fff&size=80`
                  }}
                />
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    Interview Preparation for {companyName}
                  </h1>
                  <p className="text-xl text-gray-400">{roleName}</p>
                </div>
              </div>
              
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-blue-300 font-medium mb-1">Company-Specific Questions</p>
                    <p className="text-gray-400 text-sm">
                      This interview is customized for {companyName}'s interview process, 
                      culture, and technical requirements.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Interview Type Selection */}
            <div className="grid md:grid-cols-2 gap-6">
              <button 
                onClick={() => startInterview('technical')}
                className="bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-8 rounded-2xl text-left transition-all group"
              >
                <Zap className="w-12 h-12 mb-4 text-blue-200" />
                <h3 className="text-2xl font-bold mb-2">Technical Round</h3>
                <p className="text-blue-100 mb-4">Coding, system design, and problem-solving</p>
                <span className="inline-block bg-white/20 px-4 py-2 rounded-lg text-sm font-medium group-hover:bg-white/30 transition-colors">
                  Start Interview →
                </span>
              </button>
              
              <button 
                onClick={() => startInterview('behavioral')}
                className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white p-8 rounded-2xl text-left transition-all group"
              >
                <Users className="w-12 h-12 mb-4 text-purple-200" />
                <h3 className="text-2xl font-bold mb-2">Behavioral Round</h3>
                <p className="text-purple-100 mb-4">Leadership, teamwork, and culture fit</p>
                <span className="inline-block bg-white/20 px-4 py-2 rounded-lg text-sm font-medium group-hover:bg-white/30 transition-colors">
                  Start Interview →
                </span>
              </button>
            </div>
          </div>
        )}
        
      </div>
    </div>
  )
}
