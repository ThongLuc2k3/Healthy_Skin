# Roadmap sau CTP 2026 (Phase 7 trở đi)

> Tài liệu tham khảo — KHÔNG phải việc cần làm cho bản demo hiện tại. Bản demo (Phase 1-6) đang
> tuân thủ nguyên tắc "rule-based, không AI/OCR thật, không backend" — các mục dưới đây đi ngược
> lại nguyên tắc đó một cách có chủ đích, vì chúng chỉ dành cho giai đoạn phát triển sản phẩm thật
> sau khi qua vòng thi. Xem `Build.md` mục "PHASE 7 TRỞ ĐI" để biết nguyên văn.

## Nhóm 1 — Nâng cấp lõi kỹ thuật

> **Cập nhật:** đội đã chủ động triển khai trước 3/4 mục dưới đây (xem `server/`) — quyết định có
> chủ đích, đi trước lịch trình gốc của roadmap này. Chi tiết kiến trúc ở
> `/home/thongluc/.claude/plans/gleaming-noodling-dove.md`.

- [x] Backend thật (Node.js/Express) thay thế state client-side — SQLite thay vì Postgres cho giai đoạn này, dễ nâng cấp sau
- [x] Tài khoản người dùng: đăng ký/đăng nhập (JWT), lưu hồ sơ cơ địa vĩnh viễn, lịch sử scan
- [x] Nhận diện ảnh thật cho sản phẩm/thực phẩm — đổi từ kế hoạch gốc (Google Cloud Vision, yêu cầu billing) sang **Gemini API** (Google AI Studio, free tier thật không cần thẻ) sau khi phát hiện Vision API chặn bởi `BILLING_DISABLED`. Cấu hình `GEMINI_API_KEY` (xem `HUONG_DAN_CHAY.md`).
- [x] (một phần, chỉ áp dụng cho luồng quét ảnh) Nâng cấp matching engine sang có suy luận AI — **quyết định có chủ đích, khác `matchEngine.js`**: khi quét ảnh qua Gemini, kết quả phù hợp/cần cân nhắc/nên tránh do AI tự suy luận trực tiếp (không qua rule-based, không giới hạn 40 mục database), còn tìm kiếm thủ công + trang Kết quả vẫn 100% rule-based như cũ. Đánh đổi: kết quả AI có thể không nhất quán giữa các lần chạy và khó audit lý do như rule-based.

## Nhóm 2 — Vòng 3: Cộng đồng

- Hồ sơ cơ địa ẩn danh hóa để nhóm người dùng tương đồng xem review của nhau
- Hệ thống kiểm duyệt nội dung bởi bác sĩ da liễu + chuyên gia dinh dưỡng thật
- Tính năng phân biệt hàng thật–giả (cần nghiên cứu riêng, độ khó cao)

## Nhóm 3 — Kinh doanh & mở rộng

- Mô hình freemium: giới hạn số lượt scan/tháng cho tài khoản miễn phí
- Affiliate: gắn link mua hàng qua đối tác TMĐT đã xác nhận "phù hợp"
- Dashboard B2B: insight ẩn danh cho nhãn hàng (xu hướng cơ địa, thành phần bị tránh nhiều)
- Mở rộng cho nam giới: nội dung/database riêng biệt cho nhu cầu da nam giới

## Nhóm 4 — Nền tảng đa thiết bị

- Chuyển web app sang PWA để cài vào màn hình chính điện thoại, không cần app store
- Nếu cần app thật trên store: tái sử dụng logic đã có, viết lại giao diện bằng React Native

## Gợi ý thứ tự triển khai khi bắt đầu

1. Backend + tài khoản người dùng (Nhóm 1) — nền tảng để mọi tính năng khác dựa vào
2. OCR thật (Nhóm 1) — thay thế phần "scan demo" hiện tại
3. PWA (Nhóm 4) — chi phí thấp, tăng trải nghiệm nhanh
4. Cộng đồng, kinh doanh, mobile app riêng — làm sau khi có người dùng thật và dữ liệu đủ lớn
