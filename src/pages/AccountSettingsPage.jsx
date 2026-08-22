import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { apiClient } from '../lib/apiClient'
import { formatVnd, formatDateTime } from '../lib/format'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { UserIcon, WalletIcon, ShieldIcon, CheckCircleIcon } from '../components/Icons'

function PersonalInfoCard({ account, onSaved }) {
  const [fullName, setFullName] = useState(account.fullName)
  const [phone, setPhone] = useState(account.phone)
  const [dateOfBirth, setDateOfBirth] = useState(account.dateOfBirth)
  const [addressVi, setAddressVi] = useState(account.addressVi)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const updated = await apiClient.put('/account', { fullName, phone, dateOfBirth, addressVi }, { auth: true })
      onSaved(updated)
      setMessage('Đã lưu thông tin cá nhân.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[28px] border border-[#c5e7dd] bg-white p-7 shadow-xs space-y-4">
      <div className="flex items-center gap-2">
        <UserIcon className="h-5 w-5 text-[#2fa98c]" />
        <h2 className="text-lg font-bold text-[#0e3b33]">Thông tin cá nhân</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-[#2fa98c]">Họ và tên</label>
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nguyễn Văn A"
            className="mt-1.5 w-full rounded-xl border border-[#c5e7dd] bg-[#eaf7f1] px-3.5 py-2.5 text-sm text-[#0e3b33] focus:border-[#2fa98c] focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-[#2fa98c]">Số điện thoại</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="09xxxxxxxx"
            className="mt-1.5 w-full rounded-xl border border-[#c5e7dd] bg-[#eaf7f1] px-3.5 py-2.5 text-sm text-[#0e3b33] focus:border-[#2fa98c] focus:outline-none"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-[#2fa98c]">Ngày sinh</label>
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-[#c5e7dd] bg-[#eaf7f1] px-3.5 py-2.5 text-sm text-[#0e3b33] focus:border-[#2fa98c] focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-[#2fa98c]">Email</label>
          <input
            disabled
            value={account.email}
            className="mt-1.5 w-full rounded-xl border border-[#c5e7dd] bg-[#f5f5f5] px-3.5 py-2.5 text-sm text-[#64748B]"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-[#2fa98c]">Địa chỉ</label>
        <input
          value={addressVi}
          onChange={(e) => setAddressVi(e.target.value)}
          placeholder="Số nhà, đường, quận/huyện, tỉnh/thành"
          className="mt-1.5 w-full rounded-xl border border-[#c5e7dd] bg-[#eaf7f1] px-3.5 py-2.5 text-sm text-[#0e3b33] focus:border-[#2fa98c] focus:outline-none"
        />
        <p className="mt-1 text-[11px] text-[#64748B]">
          Dùng làm vị trí dự phòng để tính khoảng cách ở "Dịch Vụ Quanh Bạn" khi trình duyệt không cấp quyền vị trí.
        </p>
      </div>

      {message && <p className="text-sm font-medium text-emerald-600">{message}</p>}
      {error && <p className="text-sm font-medium text-rose-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="rounded-xl bg-[#2fa98c] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0e3b33] disabled:opacity-60"
      >
        {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
      </button>
    </form>
  )
}

function WalletCard({ wallet }) {
  if (!wallet) return null
  return (
    <div className="rounded-[28px] border border-[#c5e7dd] bg-white p-7 shadow-xs">
      <div className="flex items-center gap-2">
        <WalletIcon className="h-5 w-5 text-[#2fa98c]" />
        <h2 className="text-lg font-bold text-[#0e3b33]">Ví của tôi</h2>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-[#eaf7f1] p-4">
          <p className="text-xs text-[#64748B]">Số dư</p>
          <p className="mt-1 text-xl font-black text-[#2fa98c]">{formatVnd(wallet.balanceVnd)}</p>
        </div>
        <div className="rounded-2xl bg-[#eaf7f1] p-4">
          <p className="text-xs text-[#64748B]">Điểm tích luỹ</p>
          <p className="mt-1 text-xl font-black text-[#2fa98c]">{wallet.loyaltyPoints}</p>
        </div>
        <div className="rounded-2xl bg-[#eaf7f1] p-4">
          <p className="text-xs text-[#64748B]">Gói hiện tại</p>
          <p className="mt-1 text-xl font-black text-[#2fa98c]">{wallet.planId === 'free' ? 'Miễn phí' : wallet.planId}</p>
        </div>
      </div>
    </div>
  )
}

function BankLinkCard({ account, bankOptions, onChanged }) {
  const [bankName, setBankName] = useState(bankOptions[0] || '')
  const [accountNumber, setAccountNumber] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handleLink(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const updated = await apiClient.post('/account/bank-link', { bankName, accountNumber }, { auth: true })
      onChanged(updated)
      setAccountNumber('')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleUnlink() {
    setBusy(true)
    setError('')
    try {
      const updated = await apiClient.delete('/account/bank-link', { auth: true })
      onChanged(updated)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="rounded-[28px] border border-[#c5e7dd] bg-white p-7 shadow-xs">
      <div className="flex items-center gap-2">
        <ShieldIcon className="h-5 w-5 text-[#2fa98c]" />
        <h2 className="text-lg font-bold text-[#0e3b33]">Ngân hàng liên kết</h2>
      </div>

      {account.bankName ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#eaf7f1] p-4">
          <div className="flex items-center gap-3">
            <CheckCircleIcon className="h-6 w-6 text-[#2fa98c]" />
            <div>
              <p className="font-bold text-[#0e3b33]">{account.bankName}</p>
              <p className="text-xs text-[#64748B]">Số tài khoản {account.bankAccountMasked} · Liên kết lúc {formatDateTime(account.bankLinkedAt)}</p>
            </div>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={handleUnlink}
            className="rounded-xl border border-rose-200 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 disabled:opacity-60"
          >
            Huỷ liên kết
          </button>
        </div>
      ) : (
        <form onSubmit={handleLink} className="mt-4 space-y-3">
          <p className="text-xs text-[#64748B]">Liên kết ví với tài khoản ngân hàng để nạp tiền nhanh hơn.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="rounded-xl border border-[#c5e7dd] bg-[#eaf7f1] px-3.5 py-2.5 text-sm text-[#0e3b33] focus:border-[#2fa98c] focus:outline-none"
            >
              {bankOptions.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <input
              required
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Số tài khoản"
              className="rounded-xl border border-[#c5e7dd] bg-[#eaf7f1] px-3.5 py-2.5 text-sm text-[#0e3b33] focus:border-[#2fa98c] focus:outline-none"
            />
          </div>
          {error && <p className="text-sm font-medium text-rose-600">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="rounded-xl bg-[#2fa98c] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0e3b33] disabled:opacity-60"
          >
            {busy ? 'Đang liên kết...' : 'Liên kết ngân hàng'}
          </button>
        </form>
      )}
    </div>
  )
}

function AccountSettingsPage() {
  useDocumentTitle('Tài khoản của tôi')
  const [account, setAccount] = useState(null)
  const [wallet, setWallet] = useState(null)
  const [bankOptions, setBankOptions] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    Promise.all([
      apiClient.get('/account', { auth: true }),
      apiClient.get('/chat/wallet', { auth: true }).catch(() => null),
      apiClient.get('/account/bank-options'),
    ])
      .then(([accountData, walletData, banks]) => {
        setAccount(accountData)
        setWallet(walletData)
        setBankOptions(banks)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

  if (status === 'loading') {
    return <p className="mx-auto mt-24 text-center text-sm text-[#64748B]">Đang tải...</p>
  }
  if (status === 'error' || !account) {
    return <p className="mx-auto mt-24 text-center text-sm text-rose-600">Không tải được thông tin tài khoản.</p>
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#eaf7f1] via-[#FCFDFC] to-[#eaf7f1] py-16 px-4 sm:px-6 lg:px-8 mt-12">
      <div className="relative z-10 mx-auto max-w-[800px] space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-2"
        >
          <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-[#0e3b33]">
            Tài khoản của tôi
          </h1>
          <p className="text-sm text-[#64748B]">Quản lý thông tin cá nhân, ví và ngân hàng liên kết.</p>
        </motion.div>

        <PersonalInfoCard account={account} onSaved={setAccount} />
        <WalletCard wallet={wallet} />
        <BankLinkCard account={account} bankOptions={bankOptions} onChanged={setAccount} />
      </div>
    </div>
  )
}

export default AccountSettingsPage
