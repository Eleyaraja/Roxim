'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Download, RotateCcw, TrendingUp, Clock, MessageSquare } from 'lucide-react'

export default function ResultsDashboard({ data, onRestart }: any) {
  const { answers, summary, profile } = data
  
  const overallScore = summary?.overallScore || calculateOverallScore(answers)
  const emotionTimeline = answers.map((a: any, i: number) => ({
    question: `Q${i + 1}`,
    confidence: Math.round((a.metrics?.confidence || 0.5) * 100)
  }))

  const answerScores = answers.map((a: any, i: number) => ({
    question: `Q${i + 1}`,
    score: a.analysis?.overallScore || 70
  }))

  const speakingPaceData = answers.map((a: any, i: number) => ({
    question: `Q${i + 1}`,
    wpm: a.metrics?.speakingSpeed || 0
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Interview Results</h1>
          <div className="flex gap-4">
            <button
              onClick={() => downloadReport(data)}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              <Download className="w-5 h-5" />
              Download Report
            </button>
            <button
              onClick={onRestart}
              className="flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
            >
              <RotateCcw className="w-5 h-5" />
              New Interview
            </button>
          </div>
        </div>

        {/* Summary Section */}
        {summary && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Interview Summary</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{summary.summary}</p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2 text-green-600">Key Strengths</h3>
                <ul className="space-y-1">
                  {summary.keyStrengths?.map((strength: string, i: number) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-orange-600">Areas for Improvement</h3>
                <ul className="space-y-1">
                  {summary.areasForImprovement?.map((area: string, i: number) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-orange-500">→</span>
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <ScoreCard
            icon={<TrendingUp className="w-8 h-8" />}
            title="Overall Score"
            value={`${overallScore}/100`}
            color="blue"
          />
          <ScoreCard
            icon={<MessageSquare className="w-8 h-8" />}
            title="Avg Confidence"
            value={`${Math.round(answers.reduce((acc: number, a: any) => acc + (a.metrics?.confidence || 0.5), 0) / answers.length * 100)}%`}
            color="green"
          />
          <ScoreCard
            icon={<Clock className="w-8 h-8" />}
            title="Avg Speaking Speed"
            value={`${Math.round(answers.reduce((acc: number, a: any) => acc + (a.metrics?.speakingSpeed || 0), 0) / answers.length)} WPM`}
            color="purple"
          />
          <ScoreCard
            icon={<MessageSquare className="w-8 h-8" />}
            title="Avg Words"
            value={`${Math.round(answers.reduce((acc: number, a: any) => acc + (a.metrics?.wordCount || 0), 0) / answers.length)}`}
            color="orange"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Confidence Timeline</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={emotionTimeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="question" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="confidence" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Answer Scores</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={answerScores}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="question" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="score" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Speaking Pace</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={speakingPaceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="question" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="wpm" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-500 mt-2 text-center">Ideal: 120-150 WPM</p>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Question-by-Question Breakdown</h2>
          {answers.map((answer: any, index: number) => {
            const detailedFeedback = summary?.detailedFeedback?.find((f: any) => f.questionId === answer.questionId)
            return (
              <AnswerCard 
                key={index} 
                answer={answer} 
                index={index}
                detailedFeedback={detailedFeedback}
              />
            )
          })}
        </div>

        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Key Improvement Areas</h3>
          <ul className="space-y-3">
            {generateImprovementTips(answers).map((tip, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function ScoreCard({ icon, title, value, color }: any) {
  const colors: any = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  }

  return (
    <div className={`bg-gradient-to-br ${colors[color]} text-white rounded-xl p-6 shadow-lg`}>
      <div className="mb-2">{icon}</div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm opacity-90">{title}</div>
    </div>
  )
}

function AnswerCard({ answer, index, detailedFeedback }: any) {
  const metrics = answer.metrics || {}
  const analysis = answer.analysis || {}
  
  // Get detailed feedback from summary if available
  const feedback = detailedFeedback || {}
  const strengths = feedback.strengths || analysis.strengths || []
  const improvements = feedback.improvements || analysis.improvements || []
  const feedbackText = feedback.feedback || analysis.feedback || ''
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-lg font-semibold">Question {index + 1}</h4>
          <span className="text-xs text-gray-500 capitalize">{answer.question?.category || 'General'}</span>
        </div>
        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-semibold">
          Score: {analysis.overallScore || 70}/100
        </span>
      </div>
      
      <p className="text-gray-700 dark:text-gray-300 mb-4 font-medium">{answer.question?.question || 'Question text'}</p>
      
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Your Answer:</p>
        <p className="text-gray-800 dark:text-gray-200">{answer.transcript}</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Confidence</p>
          <p className="font-semibold">{Math.round((metrics.confidence || 0.5) * 100)}%</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Speaking Speed</p>
          <p className="font-semibold">{metrics.speakingSpeed || 0} WPM</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Word Count</p>
          <p className="font-semibold">{metrics.wordCount || 0}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Filler Words</p>
          <p className="font-semibold">{metrics.fillerWords || 0}</p>
        </div>
      </div>

      {feedbackText && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
          <p className="text-sm font-semibold mb-2">Feedback:</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">{feedbackText}</p>
        </div>
      )}

      {(strengths.length > 0 || improvements.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {strengths.length > 0 && strengths[0] && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
              <p className="text-sm font-semibold mb-2 text-green-700 dark:text-green-300">✓ What Worked Well:</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{strengths[0]}</p>
            </div>
          )}
          {improvements.length > 0 && improvements[0] && (
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
              <p className="text-sm font-semibold mb-2 text-orange-700 dark:text-orange-300">→ How to Improve:</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{improvements[0]}</p>
            </div>
          )}
        </div>
      )}

      {answer.videoUrl && (
        <div className="mt-4">
          <p className="text-sm font-semibold mb-2">Recording:</p>
          <video src={answer.videoUrl} controls className="w-full max-w-md rounded-lg" />
        </div>
      )}
    </div>
  )
}

function calculateOverallScore(answers: any[]): number {
  if (!answers || answers.length === 0) return 0
  return Math.round(answers.reduce((acc, a) => acc + (a.analysis?.overallScore || 70), 0) / answers.length)
}

function generateImprovementTips(answers: any[]): string[] {
  const tips = []
  const avgConfidence = answers.reduce((acc, a) => acc + (a.metrics?.confidence || 0.5), 0) / answers.length
  const avgScore = calculateOverallScore(answers)
  const avgFillerWords = answers.reduce((acc, a) => acc + (a.metrics?.fillerWords || 0), 0) / answers.length

  if (avgConfidence < 0.6) {
    tips.push('Work on building confidence - practice speaking in front of a mirror or with friends')
  }
  if (avgScore < 70) {
    tips.push('Structure your answers using the STAR method (Situation, Task, Action, Result)')
  }
  if (avgFillerWords > 5) {
    tips.push('Reduce filler words like "um", "like", and "you know" - pause instead of filling silence')
  }
  
  const shortAnswers = answers.filter(a => (a.metrics?.wordCount || 0) < 50)
  if (shortAnswers.length > answers.length / 2) {
    tips.push('Provide more detailed answers - aim for 1-2 minutes (150-300 words) per response')
  }

  const avgSpeed = answers.reduce((acc, a) => acc + (a.metrics?.speakingSpeed || 0), 0) / answers.length
  if (avgSpeed < 100) {
    tips.push('Speak a bit faster - aim for 120-150 words per minute for natural conversation')
  } else if (avgSpeed > 160) {
    tips.push('Slow down your speaking pace - take time to articulate your thoughts clearly')
  }

  tips.push('Review common interview questions for your role and prepare specific examples')
  tips.push('Practice active listening and ensure you fully understand the question before answering')

  return tips
}

function downloadReport(data: any) {
  const report = JSON.stringify(data, null, 2)
  const blob = new Blob([report], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `interview-report-${new Date().toISOString()}.json`
  a.click()
}
