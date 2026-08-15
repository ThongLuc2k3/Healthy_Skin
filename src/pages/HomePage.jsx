import Hero from '../components/Hero'
import ExpertsShowcase from '../components/ExpertsShowcase'
import Analysis from '../components/Analysis'
import Technology from '../components/Technology'
import Routine from '../components/Routine'
import ServicesHighlight from '../components/ServicesHighlight'
import SponsoredStrip from '../components/SponsoredStrip'
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
        <ExpertsShowcase />
        <SectionSeam />
        <Analysis />
        <SectionSeam />
        <Technology />
        <Routine />
        <ServicesHighlight />
        <SponsoredStrip />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}

export default HomePage
