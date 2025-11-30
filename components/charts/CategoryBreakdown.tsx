'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface CategoryBreakdownProps {
  data: Array<{
    category: string
    score: number
    count: number
  }>
}

export default function CategoryBreakdown({ data }: CategoryBreakdownProps) {
  // Sort by score (lowest first to identify weak areas)
  const sortedData = [...data].sort((a, b) => a.score - b.score)

  // Color based on score
  const getColor = (score: number) => {
    if (score >= 8) return '#10B981' // Green
    if (score >= 6) return '#F59E0B' // Yellow
    return '#EF4444' // Red
  }

  return (
    <div className="rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-6">
      <h3 className="text-xl font-bold text-white mb-4">Category Performance</h3>
      <p className="text-sm text-gray-400 mb-6">Sorted by score - focus on areas that need improvement</p>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={sortedData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            type="number" 
            domain={[0, 10]}
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
          />
          <YAxis 
            type="category" 
            dataKey="category"
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            width={120}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#F3F4F6'
            }}
            formatter={(value: number, name: string, props: any) => [
              `${value.toFixed(1)}/10 (${props.payload.count} interviews)`,
              'Average Score'
            ]}
          />
          <Bar dataKey="score" radius={[0, 8, 8, 0]}>
            {sortedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.score)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-500"></div>
          <span className="text-gray-400">Strong (8+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-yellow-500"></div>
          <span className="text-gray-400">Good (6-8)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500"></div>
          <span className="text-gray-400">Needs Work (&lt;6)</span>
        </div>
      </div>
    </div>
  )
}
