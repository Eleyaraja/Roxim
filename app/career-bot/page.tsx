'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Message {
  role: 'bot' | 'user'
  content: string
}

export default function CareerBotPage() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'bot', 
      content: 'Hello! I\'m your Qnnect Career Guide. I can help you with career advice, interview preparation, resume tips, and job search strategies. What would you like to know?' 
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
      // Call Groq API for career guidance
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
        content: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.'
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
  
  const quickQuestions = [
    'How do I prepare for a Google interview?',
    'What should I include in my resume?',
    'How do I answer "Tell me about yourself"?',
    'What are common behavioral interview questions?'
  ]
  
  return (
    <div className="min-h-screen bg-gray-950 pt-20">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-5xl mx-auto">
          
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-1">Career Guidance Bot</h1>
                <p className="text-gray-400">Ask me anything about your career path</p>
              </div>
            </div>
          </div>
          
          {/* Chat Container */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            {/* Messages */}
            <div className="h-[600px] overflow-y-auto p-6 space-y-6">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}
                >
                  {msg.role === 'bot' && (
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-2xl p-4 rounded-2xl ${
                      msg.role === 'bot'
                        ? 'bg-gray-800 text-gray-200'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-gray-800 p-4 rounded-2xl">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Quick Questions */}
            {messages.length === 1 && (
              <div className="border-t border-gray-800 p-4 bg-gray-900/50">
                <p className="text-sm text-gray-400 mb-3">Quick questions to get started:</p>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((question, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(question)}
                      className="text-sm px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-all border border-gray-700"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Input */}
            <div className="border-t border-gray-800 p-4">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about careers, interviews, companies..."
                  disabled={isLoading}
                  className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-blue-500 focus:outline-none disabled:opacity-50"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}
