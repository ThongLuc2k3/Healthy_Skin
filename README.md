# DA DƯỠNG

MVP demo cho cuộc thi đổi mới sáng tạo CTP 2026 — nền tảng cá nhân hóa chăm sóc da và dinh dưỡng
dựa trên một hồ sơ cơ địa dùng chung.

Bản demo gốc (Phase 1-6) chạy hoàn toàn client-side: đối chiếu rule-based (không dùng AI/ML thật),
database là file JSON tĩnh, phần "scan" mô phỏng bằng tìm kiếm/chọn từ danh sách có sẵn. Kể từ
Phase 7, dự án có thêm một backend thật (`server/`) với tài khoản người dùng và quét ảnh thật bằng
Gemini API (đọc ảnh + suy luận phù hợp/cần cân nhắc/nên tránh trực tiếp, không giới hạn trong database
— khác với tìm kiếm thủ công vẫn dùng `matchEngine.js` rule-based như cũ) — frontend vẫn tự chạy độc
lập, không bắt buộc backend, và tự chuyển về chế độ demo (localStorage + JSON tĩnh) nếu backend
không chạy.

## Chạy chỉ frontend (chế độ demo, không cần backend)

```bash
npm install
npm run dev      # chạy dev server
npm run build    # build production
npm run test     # chạy unit test cho logic đối chiếu (matchEngine)
npm run lint     # kiểm tra lỗi lint
```

## Chạy đầy đủ (frontend + backend)

```bash
npm install
cp .env.example .env               # thường có thể giữ nguyên khi dev local

cd server
npm install
cp .env.example .env               # điền JWT_SECRET, GEMINI_API_KEY nếu có
cd ..

npm run dev:all   # tự chọn cổng trống cho frontend/backend và nối 2 tiến trình với nhau
```

Không có `GEMINI_API_KEY` vẫn chạy được bình thường — chỉ riêng tính năng quét ảnh thật ở trang Quét
thử sẽ báo "chưa sẵn sàng" cho tới khi bạn thêm key vào `server/.env`. Key này lấy miễn phí, không
cần thẻ thanh toán, tại [Google AI Studio](https://aistudio.google.com/apikey) — xem
`HUONG_DAN_CHAY.md` để biết chi tiết.

## Cấu trúc

- `src/data` — database JSON gốc (thành phần mỹ phẩm, thực phẩm) và danh sách lựa chọn hồ sơ
- `src/logic/matchEngine.js` — logic đối chiếu rule-based (`matchProfile`, `getRecommendations`), dùng chung cho cả frontend lẫn backend
- `src/context/ProfileContext.jsx` — state hồ sơ cơ địa, lưu localStorage, đồng bộ lên backend khi đã đăng nhập
- `src/context/AuthContext.jsx` — trạng thái đăng nhập, JWT
- `src/pages` — Trang chủ, Hồ sơ, Kết quả gợi ý, Quét thử, Lịch sử quét, Đăng nhập/Đăng ký
- `src/components` — component UI dùng chung
- `server/` — backend Express + SQLite: xác thực JWT, lưu hồ sơ/lịch sử quét, quét ảnh thật qua Gemini API (`server/src/services/geminiService.js`), rate limit + helmet bảo vệ API. Xem cấu trúc chi tiết trong `server/` và mục "Bảo mật API" ở `HUONG_DAN_CHAY.md`.

## Deploy

Frontend là SPA build bằng Vite, có sẵn `public/_redirects` (Netlify) và `vercel.json` (Vercel) để
điều hướng client-side routing. Build ra thư mục `dist/` rồi deploy lên Vercel hoặc Netlify.

Backend (`server/`) là một Node.js/Express app độc lập, cần deploy riêng lên một dịch vụ hỗ trợ
Node.js chạy liên tục (Render, Railway, Fly.io, VPS...) — không deploy được lên Vercel/Netlify dạng
static hosting như frontend.

## Ghi chú dev mode

`npm run dev:all` hiện tự dò cổng trống, ví dụ frontend có thể chạy ở `5174` còn backend ở `4001`
nếu `5173/4000` đang bận. Script sẽ tự truyền `VITE_API_BASE_URL` tương ứng cho frontend, nên không
cần tự sửa lại `.env` chỉ vì xung đột cổng local.
