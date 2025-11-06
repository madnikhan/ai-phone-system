import Navbar from '@/components/landing/Navbar'
import Hero from '@/components/landing/Hero'
import Features from '@/components/landing/Features'
import HowItWorks from '@/components/landing/HowItWorks'
import PhoneDemoSection from '@/components/landing/PhoneDemoSection'
import Integration from '@/components/landing/Integration'
import Pricing from '@/components/landing/Pricing'
import Contact from '@/components/landing/Contact'
import Footer from '@/components/landing/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <PhoneDemoSection />
      <Integration />
      <Pricing />
      <Contact />
      <Footer />
    </main>
  )
}

