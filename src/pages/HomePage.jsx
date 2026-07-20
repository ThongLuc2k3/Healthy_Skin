import { Link } from 'react-router-dom'
import {
  CheckCircleIcon,
  WarningIcon,
  XCircleIcon,
  UserIcon,
  SparklesIcon,
  SearchIcon,
  CameraIcon,
  PlayIcon,
  ChatBubbleIcon,
  GamepadIcon,
  CalendarIcon,
} from '../components/Icons'
import { useAuth } from '../context/AuthContext'

const FEATURES = [
  {
    icon: UserIcon,
    title: 'Một hồ sơ cơ địa duy nhất',
    desc: 'Khai báo loại da, dị ứng thực phẩm, bệnh lý nền và mục tiêu một lần — dùng chung cho cả chăm sóc da lẫn dinh dưỡng. Không chắc thì chọn "Khác" và mô tả để AI hiểu rõ hơn.',
  },
  {
    icon: SparklesIcon,
    title: 'Gợi ý rõ ràng, có lý do',
    desc: 'Mỗi sản phẩm/thực phẩm được phân vào Phù hợp, Cần cân nhắc hoặc Nên tránh, bấm vào từng mục để AI giải thích sâu hơn.',
  },
  {
    icon: SearchIcon,
    title: 'Quét thử nhanh',
    desc: 'Tìm thủ công hoặc quét ảnh thật bằng AI để kiểm tra ngay mức độ phù hợp với cơ địa của bạn.',
  },
  {
    icon: CalendarIcon,
    title: 'Có lộ trình cải thiện riêng',
    desc: 'Sau khi có kết quả, bạn có thể tạo kế hoạch theo mục tiêu, ngân sách, nhịp sống và sản phẩm đang dùng thay vì chỉ xem danh sách gợi ý tĩnh.',
  },
  {
    icon: PlayIcon,
    title: 'Góc truyền động lực',
    desc: 'Video & nội dung ngắn về skincare, dinh dưỡng, giảm cân lành mạnh — giữ động lực trên hành trình của bạn.',
  },
  {
    icon: GamepadIcon,
    title: 'Skin Lab vui nhộn',
    desc: 'Mini quiz và thử thách nho nhỏ để người dùng quay lại mỗi ngày, giúp app giống một hệ sinh thái sống động hơn.',
  },
  {
    icon: ChatBubbleIcon,
    title: 'Trợ lý AI luôn sẵn sàng',
    desc: 'Nút chat nổi ở mọi trang — hỏi bất cứ điều gì về thành phần, dinh dưỡng hoặc cách dùng app.',
  },
]

const LEGEND = [
  { icon: CheckCircleIcon, label: 'Phù hợp', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { icon: WarningIcon, label: 'Cần cân nhắc', color: 'text-amber-600', bg: 'bg-amber-50' },
  { icon: XCircleIcon, label: 'Nên tránh', color: 'text-red-600', bg: 'bg-red-50' },
]

function HomePage() {
  const { user } = useAuth()

  return (
    <div className="relative">
      <div className="relative mx-auto max-w-3xl px-4 py-16 text-center sm:py-20">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm">
          <SparklesIcon className="h-3.5 w-3.5" />
          DA DƯỠNG
        </span>
        <h1 className="mt-5 bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl">
          Đúng da, đúng dưỡng chất
          <br />
          Từ trong ra ngoài
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-500">
          Nền tảng cá nhân hóa chăm sóc da và dinh dưỡng dựa trên một hồ sơ cơ địa dùng chung, giúp bạn
          biết ngay sản phẩm hay thực phẩm nào phù hợp với chính mình.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/profile"
            className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-600/30 sm:w-auto"
          >
            Bắt đầu khai báo hồ sơ
          </Link>
          <Link
            to="/scan"
            className="w-full rounded-xl border border-slate-200 bg-white px-8 py-3.5 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md sm:w-auto"
          >
            Thử quét sản phẩm
          </Link>
        </div>

        {!user && (
          <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50 p-5 text-left shadow-sm sm:flex-row">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                <CameraIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Tạo tài khoản để lưu hồ sơ &amp; quét ảnh thật bằng AI
                </p>
                <p className="text-sm text-slate-500">
                  Đồng bộ hồ sơ trên mọi thiết bị, xem lại lịch sử quét — miễn phí.
                </p>
              </div>
            </div>
            <div className="flex w-full gap-2 sm:w-auto">
              <Link
                to="/register"
                className="flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-center text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition hover:-translate-y-0.5 sm:flex-none"
              >
                Đăng ký
              </Link>
              <Link
                to="/login"
                className="flex-1 rounded-xl border border-emerald-200 bg-white px-5 py-2.5 text-center text-sm font-semibold text-emerald-700 transition hover:-translate-y-0.5 hover:border-emerald-300 sm:flex-none"
              >
                Đăng nhập
              </Link>
            </div>
          </div>
        )}

        <div className="mt-16 grid gap-4 text-left sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-600 group-hover:text-white">
                <f.icon className="h-5 w-5" />
              </span>
              <h2 className="mt-4 text-sm font-semibold text-slate-900">{f.title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white/70 p-5 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-around">
          {LEGEND.map((item) => (
            <span key={item.label} className="flex items-center justify-center gap-2 text-sm font-medium text-slate-700">
              <span className={`flex h-6 w-6 items-center justify-center rounded-full ${item.bg} ${item.color}`}>
                <item.icon className="h-3.5 w-3.5" />
              </span>
              {item.label}
            </span>
          ))}
        </div>

        <p className="mt-8 text-xs text-slate-400">
          Gợi ý theo hồ sơ dựa trên quy tắc (rule-based), minh bạch lý do. Quét ảnh thật (AI) là tính
          năng bổ sung dành cho tài khoản đã đăng nhập.
        </p>
      </div>
    </div>
  )
}

export default HomePage
