import HeroSection from '@/components/HeroSection'
import JobsSection from '@/components/JobsSection'
import InternshipsTimeline from '@/components/InternshipsTimeline'
import FeaturesSection from '@/components/FeaturesSection'
import CTASection from '@/components/CTASection'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950">
      <HeroSection />
      <JobsSection />
      
      {/* Upcoming Internships */}
      <section className="py-32 bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="mb-12">
            <h2 className="text-5xl font-bold text-white mb-4">
              Upcoming Internships
            </h2>
            <p className="text-xl text-gray-400">
              Don't miss these deadlines. Prepare early and ace the interview.
            </p>
          </div>
          
          <InternshipsTimeline />
        </div>
      </section>
      
      <FeaturesSection />
      <CTASection />
    </main>
  )
}
