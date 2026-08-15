# Healthy Skin

Nền tảng cá nhân hóa chăm sóc da và dinh dưỡng, ứng dụng AI để phân tích tình trạng da và đồng hành
cùng người dùng suốt lộ trình cải thiện, dựa trên một hồ sơ cá nhân dùng chung cho toàn bộ trải nghiệm.

## Tính năng

- **Hồ sơ cá nhân**: khai báo loại da, dị ứng, bệnh lý, mục tiêu chăm sóc; lưu vĩnh viễn khi có tài khoản.
- **Quét mỹ phẩm/thực phẩm**: đối chiếu rule-based dựa trên hồ sơ (`matchEngine.js`), hoặc quét ảnh
  thật qua Gemini API để đọc và suy luận trực tiếp (không giới hạn trong database sẵn có).
- **Chuyên gia**: xem danh sách, đặt lịch tư vấn với chuyên gia da liễu/dinh dưỡng.
- **Diễn đàn đánh giá**: người dùng chia sẻ trải nghiệm, đánh giá kèm ảnh.
- **Về chúng tôi**: chính sách bảo vệ thông tin cá nhân, điều khoản sử dụng, cam kết về sức khỏe và
  giới hạn trách nhiệm khi dùng AI.

Frontend luôn chạy độc lập, không bắt buộc backend. Tự chuyển về chế độ demo (localStorage + JSON
tĩnh) nếu backend không chạy.

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
cp .env.example .env               # điền DATABASE_URL, JWT_SECRET, GEMINI_API_KEY
cd ..

npm run dev:all   # tự chọn cổng trống cho frontend/backend và nối 2 tiến trình với nhau
```

Backend cần `DATABASE_URL` trỏ tới một database PostgreSQL (khuyến nghị [Neon](https://neon.tech),
free, không cần thẻ). Không có `GEMINI_API_KEY` vẫn chạy được bình thường, chỉ riêng tính năng quét
ảnh thật ở trang Quét thử sẽ báo "chưa sẵn sàng" cho tới khi bạn thêm key vào `server/.env`. Key này
lấy miễn phí tại [Google AI Studio](https://aistudio.google.com/apikey), xem `HUONG_DAN_CHAY.md` để
biết chi tiết.

## Cấu trúc

- `src/data`: database JSON gốc (thành phần mỹ phẩm, thực phẩm) và danh sách lựa chọn hồ sơ
- `src/logic/matchEngine.js`: logic đối chiếu rule-based (`matchProfile`, `getRecommendations`), dùng chung cho cả frontend lẫn backend
- `src/context/ProfileContext.jsx`: state hồ sơ cá nhân, lưu localStorage, đồng bộ lên backend khi đã đăng nhập
- `src/context/AuthContext.jsx`: trạng thái đăng nhập, JWT
- `src/pages`: Trang chủ, Hồ sơ, Quét thử, Lịch sử quét, Chuyên gia, Diễn đàn, Về chúng tôi, Đăng nhập/Đăng ký
- `src/components`: component UI dùng chung
- `server/`: backend Express + PostgreSQL. Xác thực JWT, lưu hồ sơ/lịch sử quét, quét ảnh thật qua Gemini API (`server/src/services/geminiService.js`), rate limit + helmet bảo vệ API. Chuỗi kết nối được đọc từ `DATABASE_URL`.

## Deploy

Repo đã có `render.yaml` để deploy toàn bộ ứng dụng lên **Render free bằng một web service duy nhất**.
Render sẽ build frontend vào `dist/` rồi backend Express trong `server/` phục vụ luôn SPA đó cùng API
`/api`, nên không cần cấu hình CORS giữa hai domain riêng.

Nếu muốn deploy thủ công thay vì dùng blueprint, cấu hình tương đương là:

- Build command: `npm install && npm --prefix server install && npm run build`
- Start command: `cd server && npm start`
- Root directory: thư mục gốc của repo

Khi tạo service trên Render, nhớ đặt các biến môi trường cần thiết trong dashboard, tối thiểu là
`DATABASE_URL` và `JWT_SECRET`. Nếu dùng quét ảnh thật thì thêm `GEMINI_API_KEY`.

## Ghi chú dev mode

`npm run dev:all` hiện tự dò cổng trống, ví dụ frontend có thể chạy ở `5174` còn backend ở `4001`
nếu `5173/4000` đang bận. Script sẽ tự truyền `VITE_API_BASE_URL` tương ứng cho frontend, nên không
cần tự sửa lại `.env` chỉ vì xung đột cổng local.
