'use client'

import { motion } from 'framer-motion'
import { Bot, MessageCircle, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function CareerBotSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-950 via-blue-950/30 to-gray-950 relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10" />
      
      {/* Floating orbs */}
      <motion.div 
        className="absolute top-20 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
        animate={{
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
        animate={{
          y: [0, -30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left: Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-blue-300 text-sm font-medium">AI-Powered Career Guidance</span>
              </div>
              
              <h2 className="text-5xl font-bold text-white mb-6">
                Meet Your 24/7 Career Counselor
              </h2>
              
              <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                Get instant answers to your career questions. From interview strategies to 
                salary negotiation, our AI career bot is here to guide you every step of the way.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Interview Preparation Tips</h3>
                    <p className="text-gray-400">Company-specific advice and common question strategies</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Resume & Cover Letter Help</h3>
                    <p className="text-gray-400">Optimize your application materials for ATS systems</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Career Path Guidance</h3>
                    <p className="text-gray-400">Navigate your career journey with personalized advice</p>
                  </div>
                </div>
              </div>
              
              <Link
                href="/career-bot"
                className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all group shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Start Chatting Now</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
            
            {/* Right: Bot Visual */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              {/* Main Bot Card */}
              <motion.div 
                className="relative bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-3xl p-8 shadow-2xl"
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {/* Qnnect Logo in corner */}
                <motion.div 
                  className="absolute top-4 right-4 flex items-center gap-2"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="w-8 h-12 rounded-full border-2 border-gray-700 flex items-start justify-center p-2 bg-gray-900/50 backdrop-blur-sm">
                    <motion.div 
                      className="w-1.5 h-2.5 bg-blue-500 rounded-full"
                      animate={{
                        opacity: [1, 0.3, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </div>
                  <span className="text-gray-400 text-sm font-semibold">Qnnect</span>
                </motion.div>
                
                {/* Bot Avatar */}
                <div className="flex items-center gap-4 mb-6">
                  <motion.div 
                    className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg"
                    animate={{
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Bot className="w-8 h-8 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-white font-bold text-xl">Career Guide AI</h3>
                    <div className="flex items-center gap-2">
                      <motion.div 
                        className="w-2 h-2 bg-green-400 rounded-full"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [1, 0.7, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                      />
                      <span className="text-green-400 text-sm">Online</span>
                    </div>
                  </div>
                </div>
                
                {/* Sample Conversation */}
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-gray-800 rounded-2xl p-4 border border-gray-700/50"
                  >
                    <p className="text-gray-300 text-sm leading-relaxed">
                      "How should I prepare for a Google software engineering interview?"
                    </p>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6, type: "spring", stiffness: 100 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-4 shadow-lg shadow-blue-500/20"
                  >
                    <p className="text-white text-sm leading-relaxed">
                      "Great question! For Google interviews, focus on data structures, 
                      algorithms, and system design. Practice coding problems daily and 
                      prepare behavioral stories using the STAR method..."
                    </p>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8 }}
                    className="flex gap-2"
                  >
                    <motion.div 
                      className="bg-gray-800 hover:bg-gray-700 rounded-lg px-4 py-2 text-gray-300 text-sm transition-colors border border-gray-700"
                      whileHover={{ scale: 1.05, borderColor: "#3B82F6" }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Tell me more
                    </motion.div>
                    <motion.div 
                      className="bg-gray-800 hover:bg-gray-700 rounded-lg px-4 py-2 text-gray-300 text-sm transition-colors border border-gray-700"
                      whileHover={{ scale: 1.05, borderColor: "#3B82F6" }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Resume tips
                    </motion.div>
                  </motion.div>
                </div>
                
                {/* Floating badges */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: -20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1, type: "spring", stiffness: 200 }}
                  animate={{
                    y: [0, -5, 0],
                  }}
                  transition={{
                    y: {
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }
                  }}
                  className="absolute -top-4 -right-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg shadow-purple-500/30"
                >
                  ⚡ Instant Responses
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
                  animate={{
                    y: [0, 5, 0],
                  }}
                  transition={{
                    y: {
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1.5
                    }
                  }}
                  className="absolute -bottom-4 -left-4 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg shadow-green-500/30"
                >
                  🌟 Always Available
                </motion.div>
              </motion.div>
              
              {/* Decorative elements */}
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-500/20 rounded-3xl blur-3xl" />
            </motion.div>
            
          </div>
          
        </div>
      </div>
    </section>
  )
}
