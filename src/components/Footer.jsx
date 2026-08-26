import { Link } from 'react-router-dom'
import LogoIcon from './LogoIcon'
export default function Footer() { return <footer className="border-t border-slate-200 bg-white">
  <div className="page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
    <div><LogoIcon/><p className="mt-4 max-w-sm text-sm font-bold text-[#183153]">Đúng cộng đồng. Đúng điều bạn cần.</p><p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">Không gian kết nối toàn bộ đời sống đại học, khởi đầu tại HCMUS.</p></div>
    <div><h4 className="font-bold">TLUCS</h4><Link className="footer-link" to="/cach-hoat-dong">Cách hoạt động</Link><Link className="footer-link" to="/peers">Trở thành người hỗ trợ</Link><Link className="footer-link" to="/yeu-cau">Khám phá yêu cầu</Link></div>
    <div><h4 className="font-bold">An toàn</h4><p className="mt-4 text-sm leading-6 text-slate-500">Chỉ hỗ trợ học tập và chia sẻ trải nghiệm. Không làm hộ, thi hộ hay mua bán đề.</p></div>
  </div><div className="page flex flex-wrap justify-between gap-3 border-t border-slate-100 py-6 text-xs text-slate-400"><span>© 2026 TLUCS</span><span>Trusted Local University Community Space · Khởi đầu từ HCMUS.</span></div>
</footer> }
