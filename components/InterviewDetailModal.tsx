'use client'

import { X, Download, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import { InterviewSession } from '@/lib/storage'

interface InterviewDetailModalProps {
  session: InterviewSession
  onClose: () => void
  onDownload: () => void
}

export default function InterviewDetailModal({ session, onClose, onDownload }: InterviewDetailModalProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-400'
    if (score >= 6) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-gray-900 border border-gray-700 shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">{session.templateName}</h2>
            <p className="text-sm text-gray-400 mt-1">{formatDate(session.date)}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onDownload}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-100px)] p-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="rounded-lg bg-gray-800/50 p-4 border border-gray-700">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <TrendingUp className="w-4 h-4" />
                <span>Overall Score</span>
              </div>
              <p className={`text-3xl font-bold ${getScoreColor(session.score)}`}>
                {session.score.toFixed(1)}/10
              </p>
            </div>

            <div className="rounded-lg bg-gray-800/50 p-4 border border-gray-700">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <CheckCircle className="w-4 h-4" />
                <span>Questions</span>
              </div>
              <p className="text-3xl font-bold text-white">
                {session.questionsAnswered}
              </p>
            </div>

            <div className="rounded-lg bg-gray-800/50 p-4 border border-gray-700">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <Clock className="w-4 h-4" />
                <span>Duration</span>
              </div>
              <p className="text-3xl font-bold text-white">
                {formatDuration(session.totalTime)}
              </p>
            </div>

            <div className="rounded-lg bg-gray-800/50 p-4 border border-gray-700">
              <div className="text-gray-400 text-sm mb-1">Avg per Question</div>
              <p className="text-3xl font-bold text-white">
                {(session.totalTime / session.questionsAnswered / 60).toFixed(1)}m
              </p>
            </div>
          </div>

          {/* Questions & Answers */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-4">Questions & Feedback</h3>
            
            {session.answers.map((answer, index) => (
              <div
                key={index}
                className="rounded-xl bg-gray-800/50 border border-gray-700 p-6 hover:border-gray-600 transition-colors"
              >
                {/* Question */}
                <div className="mb-4">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </span>
                    <p className="text-white font-medium flex-1">{answer.questionText}</p>
                  </div>
                </div>

                {/* Answer */}
                <div className="mb-4 pl-11">
                  <p className="text-sm text-gray-400 mb-1">Your Answer:</p>
                  <p className="text-gray-300 text-sm bg-gray-900/50 rounded-lg p-3">
                    {answer.transcription || 'No transcription available'}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Time spent: {formatDuration(answer.timeSpent)}
                  </p>
                </div>

                {/* Scores */}
                {answer.scores && (
                  <div className="mb-4 pl-11">
                    <p className="text-sm text-gray-400 mb-2">Scores:</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {Object.entries(answer.scores).map(([key, value]) => {
                        if (key === 'overall') return null
                        return (
                          <div key={key} className="flex items-center justify-between bg-gray-900/50 rounded px-3 py-2">
                            <span className="text-xs text-gray-400 capitalize">
                              {key.replace('_', ' ')}
                            </span>
                            <span className={`text-sm font-bold ${getScoreColor(value as number)}`}>
                              {(value as number).toFixed(1)}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                    <div className="mt-2 flex items-center justify-between bg-blue-900/20 rounded px-3 py-2 border border-blue-700/30">
                      <span className="text-sm font-medium text-blue-400">Overall Score</span>
                      <span className={`text-lg font-bold ${getScoreColor(answer.scores.overall)}`}>
                        {answer.scores.overall.toFixed(1)}/10
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
