import { Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import HomePage from './pages/HomePage'
import ProfileForm from './pages/ProfileForm'
import RecommendationPage from './pages/RecommendationPage'
import ScanDemoPage from './pages/ScanDemoPage'
import ScanHistoryPage from './pages/ScanHistoryPage'
import MotivationPage from './pages/MotivationPage'
import RoadmapPage from './pages/RoadmapPage'
import CheckInPage from './pages/CheckInPage'
import StreakCalendarPage from './pages/StreakCalendarPage'
import ExpertListPage from './pages/ExpertListPage'
import ExpertDetailPage from './pages/ExpertDetailPage'
import BookingDetailPage from './pages/BookingDetailPage'
import CustomRoadmapPage from './pages/CustomRoadmapPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ChatWidget from './components/ChatWidget'
import PlanBuilderPage from './pages/PlanBuilderPage'
import SkinPlaygroundPage from './pages/SkinPlaygroundPage'

function App() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#02040b] text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-white noise">
      {/* Background ambient radial glow layers matching Web A */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_0%,#0a1a2e_0%,#050b18_50%,#02040b_100%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 grid-bg opacity-40 mask-fade-b" />

      <NavBar />
      <main className="relative z-10">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<ProfileForm />} />
          <Route path="/results" element={<RecommendationPage />} />
          <Route path="/scan" element={<ScanDemoPage />} />
          <Route path="/history" element={<ScanHistoryPage />} />
          <Route path="/motivation" element={<MotivationPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/roadmap/plan" element={<PlanBuilderPage />} />
          <Route path="/checkin" element={<CheckInPage />} />
          <Route path="/streak" element={<StreakCalendarPage />} />
          <Route path="/skin-lab" element={<SkinPlaygroundPage />} />
          <Route path="/experts" element={<ExpertListPage />} />
          <Route path="/experts/:id" element={<ExpertDetailPage />} />
          <Route path="/my-bookings/:id" element={<BookingDetailPage />} />
          <Route path="/roadmap/custom" element={<CustomRoadmapPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </main>
      <ChatWidget />
    </div>
  )
}

export default App
