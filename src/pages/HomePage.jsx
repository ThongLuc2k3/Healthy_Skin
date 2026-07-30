import Hero from '../components/Hero'
import Analysis from '../components/Analysis'
import Technology from '../components/Technology'
import Dashboard from '../components/Dashboard'
import Routine from '../components/Routine'
import CTA from '../components/CTA'
import Footer from '../components/Footer'
import { SectionSeam } from '../components/SectionSeam'
import { useGsapScroll } from '../hooks/useGsapScroll'

function HomePage() {
  useGsapScroll()

  return (
    <div className="relative min-h-screen bg-[#F7FBFC] text-[#17353D] antialiased overflow-x-hidden">
      <main>
        <Hero />
        <SectionSeam />
        <Analysis />
        <SectionSeam />
        <Technology />
        <Dashboard />
        <Routine />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}

export default HomePage
