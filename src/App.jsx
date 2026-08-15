import { Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import HomePage from './pages/HomePage'
import ProfileForm from './pages/ProfileForm'
import ScanDemoPage from './pages/ScanDemoPage'
import ScanHistoryPage from './pages/ScanHistoryPage'
import MotivationPage from './pages/MotivationPage'
import ExpertListPage from './pages/ExpertListPage'
import ExpertDetailPage from './pages/ExpertDetailPage'
import BookingDetailPage from './pages/BookingDetailPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ChatWidget from './components/ChatWidget'
import PricingPage from './pages/PricingPage'
import ExpertDashboardPage from './pages/expert/ExpertDashboardPage'
import ServicesNearbyPage from './pages/ServicesNearbyPage'
import ServiceDetailPage from './pages/ServiceDetailPage'
import MyVouchersPage from './pages/MyVouchersPage'
import SkinPlaygroundPage from './pages/SkinPlaygroundPage'
import WebsiteReviews from './pages/WebsiteReviews'
import AboutPage from './pages/AboutPage'

function App() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-[#e4eff3] via-[#d8e5ec] to-[#eaf2f5] text-[#0F4C5C] antialiased selection:bg-[#0F4C5C]/20 selection:text-[#0F4C5C]">
      {/* Background ambient radial glow layers matching light glass theme */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-br from-[#e4eff3] via-[#d8e5ec] to-[#eaf2f5]" />
      <div className="pointer-events-none fixed inset-0 -z-10 grid-bg opacity-30 mask-fade-b" />

      <NavBar />
      <main className="relative z-10">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<ProfileForm />} />
          <Route path="/scan" element={<ScanDemoPage />} />
          <Route path="/history" element={<ScanHistoryPage />} />
          <Route path="/motivation" element={<MotivationPage />} />
          <Route path="/skin-lab" element={<SkinPlaygroundPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/expert-dashboard" element={<ExpertDashboardPage />} />
          <Route path="/dich-vu" element={<ServicesNearbyPage />} />
          <Route path="/dich-vu/voucher" element={<MyVouchersPage />} />
          <Route path="/dich-vu/:id" element={<ServiceDetailPage />} />
          <Route path="/experts" element={<ExpertListPage />} />
          <Route path="/experts/:id" element={<ExpertDetailPage />} />
          <Route path="/my-bookings/:id" element={<BookingDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/reviews" element={<WebsiteReviews />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </main>
      <ChatWidget />
    </div>
  )
}


export default App

