'use client'

import LandingNav from '@/components/landing/LandingNav'
import LandingHero from '@/components/landing/LandingHero'
import LandingFeatures from '@/components/landing/LandingFeatures'
import LandingComment from '@/components/landing/LandingComment'
import LandingMobileMoney from '@/components/landing/LandingMobileMoney'
import LandingTemoignages from '@/components/landing/LandingTemoignages'
import LandingPricing from '@/components/landing/LandingPricing'
import LandingFAQ from '@/components/landing/LandingFAQ'
import LandingCTA from '@/components/landing/LandingCTA'
import LandingFooter from '@/components/landing/LandingFooter'

export default function LandingPage() {
  return (
    <div style={{ background: '#060B14', minHeight: '100vh', color: '#F8FAFC' }}>
      <LandingNav />
      <LandingHero />
      <LandingFeatures />
      <LandingComment />
      <LandingMobileMoney />
      <LandingTemoignages />
      <LandingPricing />
      <LandingFAQ />
      <LandingCTA />
      <LandingFooter />
    </div>
  )
}
