'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, TrendingUp } from 'lucide-react'

export default function HeroSection() {
  const router = useRouter()
  
  const scrollToJobs = () => {
    document.getElementById('jobs-section')?.scrollIntoView({ behavior: 'smooth' })
  }
  
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-b from-gray-950 via-blue-950/20 to-gray-950">
      {/* ENHANCED VISIBLE GRID - More prominent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e3a8a_1px,transparent_1px),linear-gradient(to_bottom,#1e3a8a_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30" />
      
      {/* Gradient orbs with animation */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="relative container mx-auto px-6 py-32">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Logo Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-blue-500/10 border border-blue-500/30 backdrop-blur-sm mb-8"
          >
            {/* Vertical Pill Logo - Scroll Indicator Style */}
            <div className="w-6 h-10 rounded-full border-2 border-gray-700 flex items-start justify-center p-2">
              <div className="w-1 h-2 bg-gray-500 rounded-full animate-pulse" />
            </div>
            <span className="text-blue-400 font-semibold">Qnnect</span>
          </motion.div>
          
          {/* Headline with Qnnect branding */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-6xl md:text-7xl font-bold text-white mb-6 tracking-tight"
          >
            Land Your Dream Job with{' '}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Qnnect
            </span>
          </motion.h1>
          
          {/* Professional subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Your intelligent career companion. Get personalized interview preparation, 
            real-time job insights, and expert guidance powered by advanced AI technology.
          </motion.p>
          
          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button 
              onClick={() => router.push('/interview/start')}
              className="group px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
            >
              Start Free Interview
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={scrollToJobs}
              className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-semibold text-lg transition-all border border-gray-700"
            >
              View Live Jobs
            </button>
          </motion.div>
          
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto"
          >
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">10,000+</div>
              <div className="text-gray-400 text-sm">Interview Questions</div>
            </div>
            <div className="text-center border-x border-gray-800">
              <div className="text-4xl font-bold text-white mb-2">95%</div>
              <div className="text-gray-400 text-sm">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">500+</div>
              <div className="text-gray-400 text-sm">Companies</div>
            </div>
          </motion.div>
          
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-gray-700 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-gray-500 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  )
}
