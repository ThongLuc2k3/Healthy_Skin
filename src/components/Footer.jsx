import { Link } from 'react-router-dom'

// Gộp chung 1 khung điều hướng duy nhất thay vì chia 3 cột tiêu đề riêng — footer chỉ cần lối tắt
// nhanh tới các trang, không cần phân nhóm rạch ròi như menu chính.
const FOOTER_LINKS = [
  { label: 'Hồ sơ cá nhân', to: '/profile' },
  { label: 'Quét ảnh thật AI', to: '/scan' },
  { label: 'Lịch sử quét', to: '/history' },
  { label: 'Chuyên gia tư vấn', to: '/experts' },
  { label: 'Dịch Vụ Quanh Bạn', to: '/dich-vu' },
  { label: 'Gói Trợ Lý', to: '/pricing' },
  { label: 'Dành cho chuyên gia', to: '/expert-dashboard' },
  { label: 'Quản trị', to: '/admin' },
  { label: 'Skin Lab', to: '/skin-lab' },
  { label: 'Góc truyền động lực', to: '/motivation' },
  { label: 'Diễn đàn đánh giá', to: '/reviews' },
  { label: 'Về chúng tôi', to: '/about' },
]

// 4 mục cũ ở đây từng là "Rule-Based Engine / Computer Vision / Vision Transformers / Neural
// Match Engine" trình bày như 4 link điều hướng riêng biệt, nhưng cả 4 đều trỏ chung 1 neo
// #technology — trông như 4 trang khác nhau trong khi thực chất chỉ là 1 chỗ. Đổi thành nhãn
// tĩnh (không phải link) dưới 1 CTA duy nhất để không gây hiểu nhầm.
const TECH_HIGHLIGHTS = ['Hệ thống quy tắc đối chiếu', 'Thị giác máy tính', 'Mô hình nhận diện hình ảnh', 'Công cụ đối sánh thông minh']

export default function Footer() {
  return (
    <footer className="relative border-t-2 border-[#2fa98c] bg-[#eaf7f1] text-[#0e3b33] text-left">
      <div className="mx-auto max-w-[1200px] px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_2fr]">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/logo1.png"
                alt="HEALTHY SKIN Logo"
                className="h-10 w-auto object-contain"
              />
              <span className="font-display text-xl font-extrabold text-[#0e3b33]">
                HEALTHY<span className="text-[#2fa98c]"> SKIN</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#64748B] font-normal">
              Đúng da, đúng dưỡng chất, từ trong ra ngoài. Nền tảng cá nhân hóa chăm sóc da và dinh dưỡng dựa trên hồ sơ cá nhân duy nhất.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#f6fbf9] border border-[#c5e7dd] px-4 py-2 shadow-xs">
              <span className="h-2 w-2 rounded-full bg-[#2fa98c] animate-pulse" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#2fa98c]">
                Hệ thống đang hoạt động
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[#2fa98c]">
              Điều hướng nhanh
            </h4>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
              {FOOTER_LINKS.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="text-sm font-medium text-[#64748B] hover:text-[#2fa98c] transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            to="/#technology"
            className="text-xs font-bold uppercase tracking-wider text-[#2fa98c] hover:underline shrink-0"
          >
            Công nghệ đang dùng ↓
          </Link>
          {TECH_HIGHLIGHTS.map((label) => (
            <span
              key={label}
              className="rounded-full bg-white border border-[#c5e7dd] px-3 py-1 text-[11px] font-semibold text-[#64748B]"
            >
              {label}
            </span>
          ))}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-semibold text-[#64748B]">
            © 2026 HEALTHY SKIN. Cá nhân hóa chăm sóc da &amp; dinh dưỡng.
          </p>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#2fa98c]">
            VẬN HÀNH BỞI CÔNG NGHỆ AI PHÂN TÍCH DA
          </p>
        </div>
      </div>
    </footer>
  )
}

