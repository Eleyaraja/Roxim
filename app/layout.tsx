import type { Metadata } from 'next'
import './globals.css'
import UsageBanner from '@/components/UsageBanner'
import MainNav from '@/components/MainNav'
import CustomCursor from '@/components/CustomCursor'
import FloatingChatWidget from '@/components/FloatingChatWidget'
import { InterviewProvider } from '@/contexts/InterviewContext'

export const metadata: Metadata = {
  title: 'AI Interview Prep - Practice with AI',
  description: 'Prepare for interviews with AI-powered feedback and emotion analysis',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased cursor-none">
        <InterviewProvider>
          <CustomCursor />
          <MainNav />
          <UsageBanner />
          <FloatingChatWidget />
          {children}
        </InterviewProvider>
      </body>
    </html>
  )
}
