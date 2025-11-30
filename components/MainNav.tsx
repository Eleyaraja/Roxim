'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  FileText, 
  Video, 
  BarChart3, 
  History, 
  Menu, 
  X,
  Sparkles,
  Bot
} from 'lucide-react'

export default function MainNav() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/interview/start', label: 'Interview', icon: Video },
    { href: '/resume', label: 'Resume', icon: FileText },
    { href: '/career-bot', label: 'Career Bot', icon: Bot },
    { href: '/progress', label: 'Progress', icon: BarChart3 },
    { href: '/history', label: 'History', icon: History },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 text-white font-bold text-xl group">
              {/* Vertical Pill Logo - Scroll Indicator Style */}
              <div className="w-6 h-10 rounded-full border-2 border-gray-700 flex items-start justify-center p-2 group-hover:scale-110 transition-transform">
                <div className="w-1 h-2 bg-gray-500 rounded-full animate-pulse" />
              </div>
              <span>Qnnect</span>
            </Link>

            {/* Nav Items */}
            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      active
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-white font-bold">
            {/* Vertical Pill Logo - Scroll Indicator Style */}
            <div className="w-5 h-8 rounded-full border-2 border-gray-700 flex items-start justify-center p-1.5">
              <div className="w-1 h-1.5 bg-gray-500 rounded-full animate-pulse" />
            </div>
            <span>Qnnect</span>
          </Link>

          {/* Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-white hover:bg-gray-800"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-gray-900 border-b border-gray-800 shadow-xl">
            <div className="p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      active
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Spacer */}
      <div className="h-16"></div>
    </>
  )
}
