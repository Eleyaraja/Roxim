'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Eye,
  RefreshCw,
  Calendar,
  Clock,
  Award
} from 'lucide-react'
import { getSessions, deleteSession, InterviewSession } from '@/lib/storage'
import InterviewDetailModal from '@/components/InterviewDetailModal'

export default function HistoryPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<InterviewSession[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTemplate, setFilterTemplate] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date')
  const [selectedSession, setSelectedSession] = useState<InterviewSession | null>(null)

  // Load sessions on client side only to avoid hydration mismatch
  useEffect(() => {
    setSessions(getSessions())
  }, [])

  // Get unique templates
  const templates = useMemo(() => {
    const unique = new Set(sessions.map(s => s.template))
    return ['all', ...Array.from(unique)]
  }, [sessions])

  // Filter and sort sessions
  const filteredSessions = useMemo(() => {
    let filtered = sessions

    // Filter by template
    if (filterTemplate !== 'all') {
      filtered = filtered.filter(s => s.template === filterTemplate)
    }

    // Search
    if (searchQuery) {
      filtered = filtered.filter(s =>
        s.templateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.template.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      } else {
        return b.score - a.score
      }
    })

    return filtered
  }, [sessions, filterTemplate, searchQuery, sortBy])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    })
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    return `${mins} min`
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-400 bg-green-500/10'
    if (score >= 6) return 'text-yellow-400 bg-yellow-500/10'
    return 'text-red-400 bg-red-500/10'
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this interview?')) {
      deleteSession(id)
      setSessions(getSessions())
    }
  }

  const handleDownloadPDF = (session: InterviewSession) => {
    // Simple text export for now
    const content = `
Interview Report
================
Template: ${session.templateName}
Date: ${formatDate(session.date)} ${formatTime(session.date)}
Score: ${session.score.toFixed(1)}/10
Questions: ${session.questionsAnswered}
Duration: ${formatDuration(session.totalTime)}

Questions & Answers:
${session.answers.map((a, i) => `
${i + 1}. ${a.questionText}
Answer: ${a.transcription}
Score: ${a.scores?.overall.toFixed(1)}/10
`).join('\n')}
    `.trim()

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `interview-${session.id}.txt`
    link.click()
  }

  if (sessions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-3xl font-bold text-white mb-4">No Interview History</h2>
          <p className="text-gray-400 mb-8">Complete your first interview to see it here</p>
          <button
            onClick={() => router.push('/interview/start')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Start Your First Interview
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-4xl font-bold text-white">Interview History</h1>
              <p className="text-gray-400 mt-1">{sessions.length} interviews completed</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search interviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Template Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={filterTemplate}
              onChange={(e) => setFilterTemplate(e.target.value)}
              className="pl-10 pr-8 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
            >
              {templates.map(t => (
                <option key={t} value={t}>
                  {t === 'all' ? 'All Templates' : t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('date')}
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                sortBy === 'date'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Date
            </button>
            <button
              onClick={() => setSortBy('score')}
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                sortBy === 'score'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Score
            </button>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Date & Time</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Template</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-400">Score</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-400">Questions</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-400">Duration</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredSessions.map((session) => (
                <tr
                  key={session.id}
                  className="hover:bg-gray-700/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <div>
                        <div className="font-medium">{formatDate(session.date)}</div>
                        <div className="text-sm text-gray-500">{formatTime(session.date)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white font-medium">{session.templateName}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(session.score)}`}>
                        {session.score.toFixed(1)}/10
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-300">
                    {session.questionsAnswered}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-1 text-gray-300">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>{formatDuration(session.totalTime)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedSession(session)}
                        className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownloadPDF(session)}
                        className="p-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
                        title="Download Report"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(session.id)}
                        className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              className="rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-semibold">{session.templateName}</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {formatDate(session.date)} • {formatTime(session.date)}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(session.score)}`}>
                  {session.score.toFixed(1)}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                <span>{session.questionsAnswered} questions</span>
                <span>•</span>
                <span>{formatDuration(session.totalTime)}</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedSession(session)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </button>
                <button
                  onClick={() => handleDownloadPDF(session)}
                  className="p-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(session.id)}
                  className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredSessions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No interviews found matching your filters</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedSession && (
        <InterviewDetailModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
          onDownload={() => handleDownloadPDF(selectedSession)}
        />
      )}
    </div>
  )
}
