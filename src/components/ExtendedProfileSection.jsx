import { useEffect, useState } from 'react'
import { apiClient, openAuthedFile } from '../lib/apiClient'
import { ShieldIcon, CameraIcon, TrashIcon, DocumentIcon } from './Icons'
import AuthedImage from './AuthedImage'

const DISCLAIMER =
  'Thông tin trong mục này chỉ mang tính tham khảo để cá nhân hoá gợi ý — KHÔNG phải chẩn đoán y khoa và không thay thế tư vấn của bác sĩ.'

function emptyConditionRow() {
  return { name_vi: '', diagnosed_date: '', note: '' }
}

function ConsentGate({ onConsent, submitting }) {
  const [checked, setChecked] = useState(false)

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white">
          <ShieldIcon className="h-4.5 w-4.5" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-amber-900">Trước khi tiếp tục — dữ liệu nhạy cảm</h3>
          <p className="mt-1.5 text-sm text-amber-800">
            Mục này cho phép bạn lưu ảnh khuôn mặt, bệnh lý da liễu đã được chẩn đoán, và file kết quả
            khám để cá nhân hoá gợi ý tốt hơn. Đây là dữ liệu sinh trắc học/sức khoẻ:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-amber-800">
            <li>Chỉ dùng để cá nhân hoá gợi ý trên tài khoản của bạn, không chia sẻ cho bên thứ ba.</li>
            <li>Bạn có thể xoá vĩnh viễn ảnh/bệnh lý/báo cáo bất kỳ lúc nào.</li>
            <li>{DISCLAIMER}</li>
          </ul>
          <label className="mt-3 flex cursor-pointer items-start gap-2 text-sm font-medium text-amber-900">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
            />
            Tôi đã đọc và đồng ý lưu các thông tin trên.
          </label>
          <button
            type="button"
            disabled={!checked || submitting}
            onClick={onConsent}
            className="mt-3 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Đang lưu...' : 'Tôi đồng ý, tiếp tục'}
          </button>
        </div>
      </div>
    </div>
  )
}

function FacePhotoBlock({ facePhotoUrl, onUpload, onDelete, busy }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">Ảnh khuôn mặt (tuỳ chọn)</p>
      <div className="mt-3 flex items-center gap-4">
        {facePhotoUrl ? (
          <AuthedImage src={facePhotoUrl} alt="Ảnh khuôn mặt" className="h-20 w-20 rounded-xl object-cover" />
        ) : (
          <span className="flex h-20 w-20 items-center justify-center rounded-xl bg-slate-50 text-slate-300">
            <CameraIcon className="h-6 w-6" />
          </span>
        )}
        <div className="flex flex-col gap-2">
          <label className="cursor-pointer rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            <input
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              disabled={busy}
              onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
            />
            {facePhotoUrl ? 'Đổi ảnh' : 'Tải ảnh lên'}
          </label>
          {facePhotoUrl && (
            <button
              type="button"
              disabled={busy}
              onClick={onDelete}
              className="flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
            >
              <TrashIcon className="h-3.5 w-3.5" />
              Xoá ảnh
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function DiagnosedConditionsBlock({ conditions, onSave, saving }) {
  const [rows, setRows] = useState(conditions.length > 0 ? conditions : [])
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    setRows(conditions)
    setDirty(false)
  }, [conditions])

  function updateRow(index, field, value) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)))
    setDirty(true)
  }

  function addRow() {
    setRows((prev) => [...prev, emptyConditionRow()])
    setDirty(true)
  }

  function removeRow(index) {
    setRows((prev) => prev.filter((_, i) => i !== index))
    setDirty(true)
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">
        Bệnh lý da liễu đã được chẩn đoán (tuỳ chọn)
      </p>

      <div className="mt-3 space-y-3">
        {rows.map((row, index) => (
          <div key={index} className="grid grid-cols-1 gap-2 rounded-xl border border-slate-100 p-3 sm:grid-cols-[1fr_120px_1fr_auto]">
            <input
              type="text"
              placeholder="Tên bệnh (vd: Viêm da cơ địa)"
              value={row.name_vi}
              onChange={(e) => updateRow(index, 'name_vi', e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
            />
            <input
              type="text"
              placeholder="2025-03"
              value={row.diagnosed_date}
              onChange={(e) => updateRow(index, 'diagnosed_date', e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Ghi chú (vd: BS BV Da liễu chẩn đoán)"
              value={row.note}
              onChange={(e) => updateRow(index, 'note', e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => removeRow(index)}
              className="flex items-center justify-center rounded-lg px-2 text-red-500 hover:bg-red-50"
              aria-label="Xoá dòng"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={addRow}
          className="rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-500 hover:border-emerald-300 hover:text-emerald-700"
        >
          + Thêm bệnh lý
        </button>
        {dirty && (
          <button
            type="button"
            disabled={saving}
            onClick={() => onSave(rows)}
            className="rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? 'Đang lưu...' : 'Lưu bệnh lý'}
          </button>
        )}
      </div>
    </div>
  )
}

function ExpertReportsBlock({ reports, onUpload, onDelete, busy }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">
        Báo cáo/kết quả khám (tuỳ chọn)
      </p>

      <ul className="mt-3 space-y-2">
        {reports.map((report) => (
          <li
            key={report.id}
            className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 px-3 py-2"
          >
            <button
              type="button"
              onClick={() => openAuthedFile(report.fileUrl)}
              className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-emerald-700"
            >
              <DocumentIcon className="h-4 w-4 text-slate-400" />
              {report.originalName || `Báo cáo #${report.id}`}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onDelete(report.id)}
              className="text-red-500 hover:text-red-600 disabled:opacity-50"
              aria-label="Xoá báo cáo"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </li>
        ))}
        {reports.length === 0 && <li className="text-sm text-slate-400">Chưa có báo cáo nào.</li>}
      </ul>

      <label className="mt-3 inline-block cursor-pointer rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
        <input
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          disabled={busy}
          onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
        />
        Tải lên báo cáo (ảnh hoặc PDF)
      </label>
    </div>
  )
}

function ExtendedProfileSection() {
  const [status, setStatus] = useState('loading')
  const [profileData, setProfileData] = useState(null)
  const [reports, setReports] = useState([])
  const [busy, setBusy] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    Promise.all([apiClient.get('/profile', { auth: true }), apiClient.get('/profile/expert-reports', { auth: true })])
      .then(([profile, reportsList]) => {
        setProfileData(profile)
        setReports(reportsList)
        setStatus('ready')
      })
      .catch((err) => {
        setErrorMessage(err.message)
        setStatus('error')
      })
  }, [])

  async function handleConsent() {
    setBusy(true)
    setErrorMessage('')
    try {
      const updated = await apiClient.post('/profile/consent', {}, { auth: true })
      setProfileData(updated)
    } catch (err) {
      setErrorMessage(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleFaceUpload(file) {
    setBusy(true)
    setErrorMessage('')
    try {
      const formData = new FormData()
      formData.append('facePhoto', file)
      const updated = await apiClient.post('/profile/face-photo', formData, { auth: true, isFormData: true })
      setProfileData(updated)
    } catch (err) {
      setErrorMessage(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleFaceDelete() {
    setBusy(true)
    setErrorMessage('')
    try {
      const updated = await apiClient.delete('/profile/face-photo', { auth: true })
      setProfileData(updated)
    } catch (err) {
      setErrorMessage(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleSaveConditions(rows) {
    setBusy(true)
    setErrorMessage('')
    try {
      const cleaned = rows.filter((r) => r.name_vi.trim().length > 0)
      const updated = await apiClient.put(
        '/profile/diagnosed-conditions',
        { diagnosedConditions: cleaned },
        { auth: true },
      )
      setProfileData(updated)
    } catch (err) {
      setErrorMessage(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleReportUpload(file) {
    setBusy(true)
    setErrorMessage('')
    try {
      const formData = new FormData()
      formData.append('report', file)
      const created = await apiClient.post('/profile/expert-report', formData, { auth: true, isFormData: true })
      setReports((prev) => [created, ...prev])
    } catch (err) {
      setErrorMessage(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleReportDelete(id) {
    setBusy(true)
    setErrorMessage('')
    try {
      await apiClient.delete(`/profile/expert-report/${id}`, { auth: true })
      setReports((prev) => prev.filter((r) => r.id !== id))
    } catch (err) {
      setErrorMessage(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (status === 'loading') {
    return <p className="text-center text-sm text-slate-400">Đang tải hồ sơ mở rộng...</p>
  }
  if (status === 'error') {
    return <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{errorMessage}</p>
  }

  return (
    <section>
      <h2 className="text-base font-semibold text-slate-900">Hồ sơ mở rộng (tuỳ chọn)</h2>
      <p className="text-sm text-slate-500">{DISCLAIMER}</p>

      <div className="mt-3 space-y-4">
        {!profileData.consentGivenAt ? (
          <ConsentGate onConsent={handleConsent} submitting={busy} />
        ) : (
          <>
            <FacePhotoBlock
              facePhotoUrl={profileData.facePhotoUrl}
              onUpload={handleFaceUpload}
              onDelete={handleFaceDelete}
              busy={busy}
            />
            <DiagnosedConditionsBlock
              conditions={profileData.diagnosedConditions}
              onSave={handleSaveConditions}
              saving={busy}
            />
            <ExpertReportsBlock
              reports={reports}
              onUpload={handleReportUpload}
              onDelete={handleReportDelete}
              busy={busy}
            />
          </>
        )}

        {errorMessage && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{errorMessage}</p>
        )}
      </div>
    </section>
  )
}

export default ExtendedProfileSection
