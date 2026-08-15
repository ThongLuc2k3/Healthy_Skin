import { useEffect, useState } from 'react'
import { apiClient } from '../lib/apiClient'

export default function SponsoredStrip() {
  const [ads, setAds] = useState([])

  useEffect(() => {
    apiClient.get('/sponsored/ads').then(setAds).catch(() => {})
  }, [])

  if (ads.length === 0) return null

  return (
    <section className="relative py-16 bg-[#F7FBFC] border-t border-[#E7ECEE]">
      <div className="mx-auto max-w-[1200px] px-6 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A87A45]">
          Quảng cáo · Liên kết tiếp thị
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {ads.map((ad) => (
            <a
              key={ad.id}
              href={ad.linkUrl}
              target="_blank"
              rel="noopener noreferrer nofollow sponsored"
              className="flex items-center justify-center rounded-2xl border border-[#D8B27A]/30 bg-[#D8B27A]/8 px-6 py-5 text-sm font-bold text-[#A87A45] transition hover:border-[#D8B27A] hover:bg-[#D8B27A]/15"
            >
              {ad.sponsorName}
            </a>
          ))}
        </div>
        <p className="mt-4 text-[11px] text-[#64748B]">
          Nội dung tài trợ, không phải đánh giá khách quan từ HEALTHY SKIN.
        </p>
      </div>
    </section>
  )
}
