import React from 'react'
import AuthedImage from './AuthedImage'

function StatRow({ label, before, after, change, suffix = '' }) {
  const isPositive = change > 0
  const isNegative = change < 0
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-2 text-sm">
      <span className="text-slate-500">{label}</span>
      <div className="flex items-center gap-3">
        {before != null && (
          <span className="text-slate-400 line-through">{before}{suffix}</span>
        )}
        <span className="font-semibold text-slate-800">{after}{suffix}</span>
        {change !== 0 && (
          <span
            className={`text-xs font-bold px-1.5 py-0.5 rounded ${
              isPositive
                ? 'bg-emerald-50 text-emerald-600'
                : isNegative
                  ? 'bg-red-50 text-red-500'
                  : ''
            }`}
          >
            {isPositive ? '+' : ''}{change}{suffix}
          </span>
        )}
      </div>
    </div>
  )
}

function SectionCard({ title, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <h3 className="font-bold text-slate-800 mb-3 text-base">{title}</h3>
      {children}
    </div>
  )
}

export default function MilestoneDiff({ diff, previous, current }) {
  if (!diff) {
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        {current?.facePhotoUrl || current?.milestonePhotoUrl ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {current.facePhotoUrl && (
              <div className="text-center">
                <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Ảnh hồ sơ</p>
                <AuthedImage
                  src={current.facePhotoUrl}
                  alt="Ảnh hồ sơ"
                  className="w-80 h-80 rounded-2xl object-cover border-2 border-slate-200 shadow-sm"
                />
              </div>
            )}
            {current.milestonePhotoUrl && (
              <div className="text-center">
                <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Ảnh báo cáo</p>
                <img
                  src={current.milestonePhotoUrl}
                  alt="Ảnh báo cáo"
                  className="w-80 h-80 rounded-2xl object-cover border-2 border-emerald-200 shadow-sm"
                />
              </div>
            )}
          </div>
        ) : null}
        <p className="text-slate-400 text-sm">Tạo thêm một milestone khác để xem so sánh.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Ảnh hồ sơ + Ảnh báo cáo, 2 cột ngang hàng */}
      {(current?.facePhotoUrl || current?.milestonePhotoUrl) && (
        <SectionCard title="Hình ảnh">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {current?.facePhotoUrl && (
              <div className="flex flex-col items-center gap-3">
                <p className="text-xs font-semibold text-slate-400 uppercase">Ảnh hồ sơ</p>
                <AuthedImage
                  src={current.facePhotoUrl}
                  alt="Hồ sơ"
                  className="w-80 h-80 rounded-2xl object-cover border-2 border-slate-200 shadow-sm"
                />
              </div>
            )}
            {current?.milestonePhotoUrl && (
              <div className="flex flex-col items-center gap-3">
                <p className="text-xs font-semibold text-slate-400 uppercase">Ảnh báo cáo</p>
                <div className="flex items-center gap-4">
                  {previous?.milestonePhotoUrl && (
                    <>
                      <div className="text-center">
                        <p className="text-xs text-slate-400 mb-1">Trước</p>
                        <img
                          src={previous.milestonePhotoUrl}
                          alt="Trước"
                          className="w-80 h-80 rounded-2xl object-cover border-2 border-slate-200 shadow-sm"
                        />
                      </div>
                      <span className="text-slate-300 text-2xl">→</span>
                    </>
                  )}
                  <div className="text-center">
                    {previous?.milestonePhotoUrl && <p className="text-xs text-slate-400 mb-1">Sau</p>}
                    <img
                      src={current.milestonePhotoUrl}
                      alt="Báo cáo"
                      className="w-80 h-80 rounded-2xl object-cover border-2 border-emerald-200 shadow-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </SectionCard>
      )}

      {/* Loại da */}
      {diff.skinType && (
        <SectionCard title="Loại da">
          <div className="flex items-center justify-center gap-4 text-sm">
            <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full">{diff.skinType.before}</span>
            <span className="text-slate-300">→</span>
            <span className="bg-emerald-50 text-emerald-700 font-semibold px-3 py-1 rounded-full">{diff.skinType.after}</span>
          </div>
        </SectionCard>
      )}

      {/* Điểm danh */}
      <SectionCard title="Điểm danh">
        <StatRow label="Tỉ lệ hoàn thành" before={diff.completionRate?.before} after={diff.completionRate?.after} change={diff.completionRate?.change} suffix="%" />
        <StatRow label="Streak" before={diff.streak?.before} after={diff.streak?.after} change={diff.streak?.change} suffix=" ngày" />
        <StatRow label="Tổng ngày điểm danh" before={diff.checkinDays?.before} after={diff.checkinDays?.after} change={diff.checkinDays?.change} suffix=" ngày" />
      </SectionCard>

      {/* Quét */}
      <SectionCard title="Quét mỹ phẩm">
        <StatRow label="Tổng lượt quét" before={diff.scanTotal?.before} after={diff.scanTotal?.after} change={diff.scanTotal?.change} />
        <StatRow label="Sản phẩm phù hợp" before={diff.scanSuitable?.before} after={diff.scanSuitable?.after} change={diff.scanSuitable?.change} />
      </SectionCard>

      {/* Lộ trình */}
      <SectionCard title="Lộ trình">
        <StatRow label="Nhiệm vụ đã hoàn thành" before={diff.tasksDone?.before} after={diff.tasksDone?.after} change={diff.tasksDone?.change} />
      </SectionCard>
    </div>
  )
}
