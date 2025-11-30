'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function InterviewRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to /interview/start
    router.replace('/interview/start')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p>Redirecting to interview...</p>
      </div>
    </div>
  )
}
