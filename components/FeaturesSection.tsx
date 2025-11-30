'use client'

import { motion } from 'framer-motion'
import { Brain, BarChart3, FileText, Video, Zap, Shield, Bot } from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Personalization',
    description: 'Questions tailored to your resume, experience level, and target role.'
  },
  {
    icon: Video,
    title: 'Realistic Interview Simulation',
    description: 'Practice with video avatars that replicate real interview scenarios.'
  },
  {
    icon: Bot,
    title: 'Career Guidance Bot',
    description: '24/7 AI career counselor for interview tips, career advice, and job strategies.'
  },
  {
    icon: BarChart3,
    title: 'Performance Analytics',
    description: 'Track your progress with detailed metrics and improvement suggestions.'
  },
  {
    icon: FileText,
    title: 'Resume Optimization',
    description: 'ATS-friendly resume builder with AI-powered content suggestions.'
  },
  {
    icon: Zap,
    title: 'Instant Feedback',
    description: 'Get real-time analysis of your answers with actionable insights.'
  },
  {
    icon: Shield,
    title: 'Company-Specific Prep',
    description: 'Practice questions from Google, Amazon, Microsoft, and more.'
  }
]

export default function FeaturesSection() {
  return (
    <section className="py-32 bg-gray-900">
      <div className="container mx-auto px-6">
        
        <div className="max-w-3xl mx-auto text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl font-bold text-white mb-6"
          >
            Everything you need to ace your interview
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-400"
          >
            Comprehensive tools powered by cutting-edge AI technology
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-8 bg-gray-950 border border-gray-800 rounded-xl hover:border-blue-500/50 transition-all"
            >
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
                <feature.icon className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
        
      </div>
    </section>
  )
}
