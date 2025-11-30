'use client'

import { useEffect, useState } from 'react'

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const [trail, setTrail] = useState<Array<{ x: number; y: number; id: number }>>([])

  useEffect(() => {
    let trailId = 0
    let animationFrameId: number
    
    const handleMouseMove = (e: MouseEvent) => {
      // Cancel any pending animation frame
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      
      // Use requestAnimationFrame for smoother updates
      animationFrameId = requestAnimationFrame(() => {
        setPosition({ x: e.clientX, y: e.clientY })
        
        // Add trail point with timestamp for smoother fading
        const newTrailPoint = { 
          x: e.clientX, 
          y: e.clientY, 
          id: trailId++,
          timestamp: Date.now()
        }
        setTrail(prev => [...prev, newTrailPoint].slice(-5)) // Keep last 5 points for subtle trail
        
        // Check if hovering over interactive element
        const target = e.target as HTMLElement
        const isInteractive = target.closest('a, button, [role="button"], input[type="submit"], input[type="button"]')
        setIsHovering(!!isInteractive)
      })
    }

    const handleMouseLeave = () => {
      setTrail([])
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <>
      {/* Subtle Trail with drop effects */}
      {trail.map((point, index) => {
        const progress = (index + 1) / trail.length
        const opacity = progress * 0.35 // Subtle opacity
        const scale = 0.5 + (progress * 0.4) // Compact scale
        
        return (
          <div
            key={point.id}
            className="fixed pointer-events-none z-[9999]"
            style={{
              left: point.x,
              top: point.y,
              transform: `translate(-50%, -50%) scale(${scale})`,
              opacity: opacity,
              transition: 'opacity 0.2s ease-out, transform 0.2s ease-out',
            }}
          >
            {/* Outer drop glow */}
            <div 
              className={`w-6 h-6 rounded-full ${isHovering ? 'bg-blue-500/60' : 'bg-blue-400/50'} blur-md`}
            />
            {/* Inner drop highlight */}
            <div 
              className={`absolute inset-0 w-3 h-3 m-auto rounded-full ${isHovering ? 'bg-blue-300/70' : 'bg-blue-200/60'} blur-sm`}
            />
            {/* Tiny core drop */}
            <div 
              className={`absolute inset-0 w-1.5 h-1.5 m-auto rounded-full ${isHovering ? 'bg-blue-200' : 'bg-blue-100'}`}
              style={{ opacity: progress * 0.9 }}
            />
          </div>
        )
      })}
      
      {/* Main cursor */}
      <div
        className="fixed pointer-events-none z-[10000]"
        style={{
          left: position.x,
          top: position.y,
          transform: `translate(-50%, -50%) scale(${isHovering ? 1.4 : 1})`,
          transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Outer glow rings - multiple layers */}
        <div className={`absolute inset-0 w-14 h-14 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 ${
          isHovering 
            ? 'bg-blue-500/40 blur-xl animate-pulse' 
            : 'bg-blue-400/25 blur-lg'
        }`} />
        <div className={`absolute inset-0 w-10 h-10 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 ${
          isHovering 
            ? 'bg-blue-400/50 blur-md' 
            : 'bg-blue-300/30 blur-sm'
        }`} />
        
        {/* Main circle with gradient */}
        <div className={`absolute w-7 h-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-all duration-300 ${
          isHovering
            ? 'bg-gradient-to-br from-blue-900/60 to-blue-800/60 border-blue-400 shadow-xl shadow-blue-500/60'
            : 'bg-gradient-to-br from-gray-900/60 to-gray-800/60 border-gray-500'
        }`}>
          {/* Inner glowing dot - enhanced */}
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full transition-all duration-300 ${
            isHovering ? 'bg-blue-400/80 animate-ping' : 'bg-blue-500/60'
          }`} />
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full ${
            isHovering ? 'bg-blue-300 shadow-lg shadow-blue-400/50' : 'bg-blue-400 shadow-md shadow-blue-500/50'
          } animate-pulse`} />
          {/* Core bright dot */}
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full ${
            isHovering ? 'bg-white' : 'bg-blue-200'
          }`} />
        </div>
      </div>
    </>
  )
}
