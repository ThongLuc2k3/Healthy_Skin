# TLUCS

**Trusted Local University Community Space**: cộng đồng đa trường để đăng, tìm và nhận yêu cầu trong toàn bộ đời sống đại học.

HCMUS là thị trường pilot; kiến trúc hỗ trợ nhiều trường từ đầu.

## Chạy dự án

```bash
npm install
npm --prefix server install
npm run dev:all
```

- Web: `http://localhost:5173`
- API health: `http://localhost:4000/api/v1/health`

## Cấu trúc

- `src/`: web React/Vite.
- `server/`: API Node.js/Express và schema PostgreSQL.
- `TLUCS_MASTER_PLAN.md`: phạm vi, kiến trúc, luật nghiệp vụ và lộ trình MVP → pilot HCMUS.

## Nguyên tắc

- Một tài khoản vừa có thể đăng vừa nhận yêu cầu.
- Ba chế độ: miễn phí, trả phí và trao đổi.
- Không làm hộ, thi hộ, mua bán đề/đáp án hoặc chia sẻ dữ liệu trái phép.
- Tiền trả phí được giữ cho đến khi phiên hoàn tất; TLUCS thu 1% trên phần giải ngân.
