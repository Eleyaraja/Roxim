'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface ImprovementLineProps {
  data: Array<{
    session: number
    score: number
    date: string
    template: string
  }>
}

export default function ImprovementLine({ data }: ImprovementLineProps) {
  // Calculate trend line
  const calculateTrend = () => {
    if (data.length < 2) return []
    
    const n = data.length
    const sumX = data.reduce((sum, _, i) => sum + i, 0)
    const sumY = data.reduce((sum, d) => sum + d.score, 0)
    const sumXY = data.reduce((sum, d, i) => sum + i * d.score, 0)
    const sumX2 = data.reduce((sum, _, i) => sum + i * i, 0)
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n
    
    return data.map((_, i) => ({
      session: i + 1,
      trend: slope * i + intercept
    }))
  }

  const trendData = calculateTrend()

  return (
    <div className="rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-6">
      <h3 className="text-xl font-bold text-white mb-4">Score Progression</h3>
      <p className="text-sm text-gray-400 mb-6">Track your improvement over time</p>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="session" 
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            label={{ value: 'Interview Session', position: 'insideBottom', offset: -5, fill: '#9CA3AF' }}
          />
          <YAxis 
            domain={[0, 10]}
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            label={{ value: 'Score', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#F3F4F6'
            }}
            formatter={(value: number) => [`${value.toFixed(1)}/10`, 'Score']}
            labelFormatter={(label) => `Session ${label}`}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#3B82F6"
            strokeWidth={3}
            dot={{ fill: '#3B82F6', r: 5 }}
            activeDot={{ r: 7 }}
            name="Actual Score"
          />
          {trendData.length > 0 && (
            <Line
              type="monotone"
              data={trendData}
              dataKey="trend"
              stroke="#10B981"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Trend Line"
            />
          )}
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-gray-400">Your Scores</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-green-500"></div>
          <span className="text-gray-400">Trend</span>
        </div>
      </div>
    </div>
  )
}
