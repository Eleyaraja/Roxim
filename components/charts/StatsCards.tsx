'use client'

import { TrendingUp, TrendingDown, Award, Target, BarChart3, AlertCircle } from 'lucide-react'

interface StatsCardsProps {
  totalInterviews: number
  averageScore: number
  improvementRate: number
  bestCategory: { name: string; score: number }
  weakestCategory: { name: string; score: number }
}

export default function StatsCards({
  totalInterviews,
  averageScore,
  improvementRate,
  bestCategory,
  weakestCategory
}: StatsCardsProps) {
  const stats = [
    {
      title: 'Total Interviews',
      value: totalInterviews,
      icon: BarChart3,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-400'
    },
    {
      title: 'Average Score',
      value: `${averageScore.toFixed(1)}/10`,
      icon: Target,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-400'
    },
    {
      title: 'Improvement',
      value: improvementRate >= 0 ? `+${improvementRate.toFixed(1)}%` : `${improvementRate.toFixed(1)}%`,
      icon: improvementRate >= 0 ? TrendingUp : TrendingDown,
      color: improvementRate >= 0 ? 'from-green-500 to-emerald-500' : 'from-red-500 to-orange-500',
      bgColor: improvementRate >= 0 ? 'bg-green-500/10' : 'bg-red-500/10',
      textColor: improvementRate >= 0 ? 'text-green-400' : 'text-red-400',
      subtitle: 'vs first interview'
    },
    {
      title: 'Best Category',
      value: bestCategory.name,
      subtitle: `${bestCategory.score.toFixed(1)}/10`,
      icon: Award,
      color: 'from-yellow-500 to-amber-500',
      bgColor: 'bg-yellow-500/10',
      textColor: 'text-yellow-400'
    },
    {
      title: 'Needs Work',
      value: weakestCategory.name,
      subtitle: `${weakestCategory.score.toFixed(1)}/10`,
      icon: AlertCircle,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-500/10',
      textColor: 'text-orange-400'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div
            key={stat.title}
            className="relative overflow-hidden rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-6 transition-all duration-300 hover:scale-105 hover:border-gray-600 animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`}></div>

            {/* Icon */}
            <div className={`relative mb-4 inline-flex rounded-lg ${stat.bgColor} p-3`}>
              <Icon className={`w-6 h-6 ${stat.textColor}`} />
            </div>

            {/* Content */}
            <div className="relative">
              <p className="text-sm text-gray-400 mb-1">{stat.title}</p>
              <p className={`text-2xl font-bold ${stat.textColor}`}>
                {stat.value}
              </p>
              {stat.subtitle && (
                <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
              )}
            </div>
          </div>
        )
      })}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  )
}
