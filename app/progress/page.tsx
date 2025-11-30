'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Download, Trash2 } from 'lucide-react'
import StatsCards from '@/components/charts/StatsCards'
import PerformanceRadar from '@/components/charts/PerformanceRadar'
import ImprovementLine from '@/components/charts/ImprovementLine'
import CategoryBreakdown from '@/components/charts/CategoryBreakdown'
import { getSessions, getStatistics, getScoreTrend, clearAllSessions } from '@/lib/storage'

export default function ProgressPage() {
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [scoreTrend, setScoreTrend] = useState<any[]>([])
  const [radarData, setRadarData] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    // Always show fixed demo data for display purposes
    const demoStats = {
      totalInterviews: 12,
      averageScore: 7.8,
      improvementRate: 15.3,
      categoryScores: {
        'frontend': 8.2,
        'backend': 7.5,
        'fullstack': 7.8,
        'dsa': 6.9,
        'behavioral': 8.5
      }
    }
    
    const demoTrend = [
      { session: 1, score: 6.5 },
      { session: 2, score: 6.8 },
      { session: 3, score: 7.0 },
      { session: 4, score: 7.2 },
      { session: 5, score: 7.5 },
      { session: 6, score: 7.4 },
      { session: 7, score: 7.8 },
      { session: 8, score: 8.0 },
      { session: 9, score: 7.9 },
      { session: 10, score: 8.2 },
      { session: 11, score: 8.3 },
      { session: 12, score: 8.5 }
    ]
    
    const demoRadar = [
      { category: 'Frontend', score: 8.2, fullMark: 10 },
      { category: 'Backend', score: 7.5, fullMark: 10 },
      { category: 'Full Stack', score: 7.8, fullMark: 10 },
      { category: 'DSA', score: 6.9, fullMark: 10 },
      { category: 'Behavioral', score: 8.5, fullMark: 10 }
    ]
    
    const demoCategory = [
      { category: 'Frontend', score: 8.2, count: 3 },
      { category: 'Backend', score: 7.5, count: 2 },
      { category: 'Full Stack', score: 7.8, count: 4 },
      { category: 'DSA', score: 6.9, count: 2 },
      { category: 'Behavioral', score: 8.5, count: 1 }
    ]
    
    setStats(demoStats)
    setScoreTrend(demoTrend)
    setRadarData(demoRadar)
    setCategoryData(demoCategory)
  }

  const formatCategoryName = (key: string) => {
    const names: Record<string, string> = {
      'frontend': 'Frontend',
      'backend': 'Backend',
      'fullstack': 'Full Stack',
      'dsa': 'DSA',
      'behavioral': 'Behavioral'
    }
    return names[key] || key
  }

  const getBestCategory = () => {
    if (!stats || !stats.categoryScores) return { name: 'N/A', score: 0 }
    const entries = Object.entries(stats.categoryScores) as [string, number][]
    if (entries.length === 0) return { name: 'N/A', score: 0 }
    const best = entries.reduce((a, b) => a[1] > b[1] ? a : b)
    return { name: formatCategoryName(best[0]), score: best[1] }
  }

  const getWeakestCategory = () => {
    if (!stats || !stats.categoryScores) return { name: 'N/A', score: 0 }
    const entries = Object.entries(stats.categoryScores) as [string, number][]
    if (entries.length === 0) return { name: 'N/A', score: 0 }
    const weakest = entries.reduce((a, b) => a[1] < b[1] ? a : b)
    return { name: formatCategoryName(weakest[0]), score: weakest[1] }
  }

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all interview history? This cannot be undone.')) {
      clearAllSessions()
      loadData()
      alert('All interview history has been cleared.')
    }
  }

  const handleExportData = () => {
    const sessions = getSessions()
    const dataStr = JSON.stringify(sessions, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `interview-history-${new Date().toISOString().split('T')[0]}.json`
    link.click()
  }

  const isDemo = true // Always show as demo data

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="text-white">Loading...</div>
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
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold text-white">Progress Dashboard</h1>
                {isDemo && (
                  <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 text-sm font-semibold">
                    Demo Data
                  </span>
                )}
              </div>
              <p className="text-gray-400 mt-1">
                {isDemo 
                  ? 'Showing sample data - Complete interviews to see your real progress' 
                  : 'Track your interview performance and improvement'}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleExportData}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">Export</span>
            </button>
            <button
              onClick={handleClearData}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-900/50 hover:bg-red-900/70 text-red-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden md:inline">Clear</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards
          totalInterviews={stats.totalInterviews}
          averageScore={stats.averageScore}
          improvementRate={stats.improvementRate}
          bestCategory={getBestCategory()}
          weakestCategory={getWeakestCategory()}
        />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Radar */}
          {radarData.length > 0 && (
            <PerformanceRadar data={radarData} />
          )}

          {/* Improvement Line */}
          {scoreTrend.length > 0 && (
            <ImprovementLine data={scoreTrend} />
          )}

          {/* Category Breakdown */}
          {categoryData.length > 0 && (
            <CategoryBreakdown data={categoryData} />
          )}

          {/* Additional Info Card */}
          <div className="rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-6">
            <h3 className="text-xl font-bold text-white mb-4">Quick Tips</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-400">💡</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Focus on Weak Areas</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Practice categories with lower scores to improve overall performance
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-400">📈</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Consistent Practice</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Regular interviews lead to better improvement over time
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-400">🎯</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Review Feedback</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Study AI feedback to understand areas for improvement
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-700">
                <button
                  onClick={() => router.push('/interview/start')}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  Start New Interview
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
