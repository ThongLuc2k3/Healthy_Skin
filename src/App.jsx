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
import WebsiteReviews from './pages/WebsiteReviews'
// Nền cố định theo viewport — luôn hiển thị ở 4 góc màn hình dù cuộn tới đâu
const FIXED_ACCENT_STYLE = {
  backgroundImage: [
    'radial-gradient(42rem 42rem at -10% -14%, rgba(16,185,129,0.30), transparent 62%)',
    'radial-gradient(38rem 38rem at 110% -10%, rgba(20,184,166,0.26), transparent 62%)',
    'radial-gradient(34rem 34rem at -12% 112%, rgba(6,182,212,0.24), transparent 62%)',
    'radial-gradient(36rem 36rem at 110% 108%, rgba(16,185,129,0.24), transparent 62%)',
  ].join(', '),
}

function App() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-emerald-50/70 to-teal-50/50">
      <div className="pointer-events-none fixed inset-0 -z-10" style={FIXED_ACCENT_STYLE} />

      <NavBar />
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
        <Route path="/reviews" element={<WebsiteReviews />} />
      </Routes>
      <ChatWidget />
    </div>
  )
}

export default App
