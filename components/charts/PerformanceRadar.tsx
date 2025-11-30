'use client'

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts'

interface PerformanceRadarProps {
  data: Array<{
    category: string
    score: number
    fullMark: number
  }>
}

export default function PerformanceRadar({ data }: PerformanceRadarProps) {
  return (
    <div className="rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-6">
      <h3 className="text-xl font-bold text-white mb-4">Performance by Category</h3>
      <p className="text-sm text-gray-400 mb-6">Your strengths and areas for improvement</p>

      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data}>
          <PolarGrid stroke="#374151" />
          <PolarAngleAxis 
            dataKey="category" 
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 10]} 
            tick={{ fill: '#9CA3AF', fontSize: 10 }}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#8B5CF6"
            fill="#8B5CF6"
            fillOpacity={0.6}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#F3F4F6'
            }}
            formatter={(value: number) => [`${value.toFixed(1)}/10`, 'Score']}
          />
        </RadarChart>
      </ResponsiveContainer>

      <div className="mt-4 flex items-center justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
          <span className="text-gray-400">Your Performance</span>
        </div>
      </div>
    </div>
  )
}
