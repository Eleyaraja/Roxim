'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send, Minimize2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  role: 'bot' | 'user'
  content: string
}

export default function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'bot', 
      content: 'Hi! I\'m your Qnnect Career Guide. Ask me anything about interviews, careers, or job search!' 
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return
    
    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/career-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      })
      
      const data = await response.json()
      
      const botResponse: Message = {
        role: 'bot',
        content: data.response || 'I apologize, but I encountered an error. Please try again.'
      }
      
      setMessages(prev => [...prev, botResponse])
    } catch (error) {
      console.error('Chat error:', error)
      const errorResponse: Message = {
        role: 'bot',
        content: 'I apologize, but I\'m having trouble connecting right now. Please try again.'
      }
      setMessages(prev => [...prev, errorResponse])
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }
  
  return (
    <>
      {/* Floating Button - Cursor Style */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 group"
          >
            {/* Outer glow ring */}
            <div className="absolute inset-0 w-20 h-20 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 bg-blue-500/30 rounded-full blur-xl group-hover:bg-blue-500/50 transition-all" />
            
            {/* Main circle - matching cursor */}
            <div className="relative w-16 h-16 rounded-full border-2 border-gray-600 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center shadow-2xl group-hover:border-blue-400 group-hover:bg-blue-900/50 transition-all">
              {/* Inner glowing dot */}
              <motion.div 
                className="w-4 h-4 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50"
                animate={{
                  opacity: [1, 0.4, 1],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <div className="absolute w-3 h-3 rounded-full bg-blue-400 animate-pulse" />
            </div>
            
            {/* Pulse rings */}
            <motion.div
              className="absolute inset-0 border-2 border-blue-400 rounded-full"
              animate={{
                scale: [1, 1.8, 1],
                opacity: [0.6, 0, 0.6],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut"
              }}
            />
            <motion.div
              className="absolute inset-0 border-2 border-blue-500 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.4, 0, 0.4],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut",
                delay: 0.5
              }}
            />
          </motion.button>
        )}
      </AnimatePresence>
      
      {/* Chat Widget */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-6 right-6 w-96 h-[600px] bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Logo */}
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                  <div className="w-4 h-6 rounded-full border-2 border-white flex items-start justify-center p-1">
                    <motion.div 
                      className="w-1 h-1.5 bg-white rounded-full"
                      animate={{
                        opacity: [1, 0.3, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-bold">Qnnect Career Guide</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-white/80 text-xs">Online</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-950">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      msg.role === 'bot'
                        ? 'bg-gray-800 text-gray-200'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </motion.div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 p-3 rounded-2xl">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input */}
            <div className="p-4 bg-gray-900 border-t border-gray-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  disabled={isLoading}
                  className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-xl border border-gray-700 focus:border-blue-500 focus:outline-none disabled:opacity-50 text-sm"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
