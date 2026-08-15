import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { apiClient } from '../lib/apiClient'
import { MapIcon, SearchIcon } from '../components/Icons'

function VenueCard({ venue, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      <Link
        to={`/dich-vu/${venue.id}`}
        className="block h-full rounded-[24px] border border-[#E8EEF0] bg-white p-6 shadow-xs transition hover:border-[#2C8E92] hover:shadow-md"
      >
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2C8E92]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#2C8E92]">
          {venue.category}
        </span>
        <h3 className="mt-3 text-lg font-bold text-[#17353D]">{venue.name}</h3>
        <p className="mt-1 text-xs text-[#64748B]">{venue.areaVi}</p>
        <p className="mt-2 text-sm leading-relaxed text-[#64748B]">{venue.descriptionVi}</p>
      </Link>
    </motion.div>
  )
}

function ServicesNearbyPage() {
  const [venues, setVenues] = useState([])
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState('')
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    apiClient.get('/venues/categories').then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    setStatus('loading')
    apiClient
      .get(activeCategory ? `/venues?category=${encodeURIComponent(activeCategory)}` : '/venues')
      .then((data) => {
        setVenues(data)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [activeCategory])

  const grouped = useMemo(() => venues, [venues])

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#F7FBFC] via-[#FCFDFC] to-[#F7FBFC] py-16 px-4 sm:px-6 lg:px-8 mt-12">
      <div className="relative z-10 mx-auto max-w-[1100px]">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#67D6E8]/15 text-[#2C8E92]">
            <MapIcon className="h-6 w-6" />
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight text-[#17353D]">
            Dịch Vụ Quanh Bạn
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-[#64748B]">
            Đặt spa, phòng khám, gym, xông hơi... tại các trung tâm đối tác với giá cố định do chính
            trung tâm niêm yết. Áp voucher từ Kho Voucher để được giảm giá.{' '}
            <Link to="/dich-vu/voucher" className="font-semibold text-[#2C8E92] underline">
              Xem Kho Voucher của bạn
            </Link>
            . Đây là dữ liệu minh hoạ (demo), chưa phải mạng lưới đối tác thật.
          </p>
        </motion.div>

        {categories.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setActiveCategory('')}
              className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                !activeCategory ? 'bg-[#2C8E92] text-white' : 'bg-white border border-[#E8EEF0] text-[#64748B]'
              }`}
            >
              Tất cả
            </button>
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setActiveCategory(c)}
                className={`rounded-full px-4 py-2 text-xs font-bold capitalize transition ${
                  activeCategory === c ? 'bg-[#2C8E92] text-white' : 'bg-white border border-[#E8EEF0] text-[#64748B]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        <div className="mt-10">
          {status === 'loading' && (
            <p className="text-center text-sm text-[#64748B]">Đang tải danh sách trung tâm...</p>
          )}
          {status === 'error' && (
            <p className="text-center text-sm text-rose-600">Không tải được danh sách trung tâm.</p>
          )}
          {status === 'ready' && grouped.length === 0 && (
            <div className="mx-auto max-w-md rounded-2xl border border-[#E8EEF0] bg-white p-8 text-center">
              <SearchIcon className="mx-auto h-8 w-8 text-[#2C8E92]" />
              <p className="mt-3 text-sm text-[#64748B]">Chưa có trung tâm nào trong danh mục này.</p>
            </div>
          )}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {grouped.map((venue, i) => (
              <VenueCard key={venue.id} venue={venue} index={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ServicesNearbyPage
