# Task & Deadline — 21/07

> Hôm nay là **21/07**, đúng ngày trong tên file này — nếu đây là hạn chót thì ưu tiên chốt các mục "Hồ sơ dự thi" ở phần 2 trước, vì các file đó (SBMC, Pitch Deck, Video) thường phải nộp đúng giờ cho ban tổ chức, còn phần sản phẩm (phần 1) có thể tiếp tục hoàn thiện sau.

---

## 1. Việc cần làm cho sản phẩm (web app)

| # | Việc | Người phụ trách | Mô tả | Gợi ý cách làm / tham khảo |
|---|------|------------------|-------|-----------------------------|
| 1 | Đẩy web lên HTTPS (deploy) | **Quỳnh** | Đưa bản chạy thật lên internet, có domain HTTPS công khai để mọi người truy cập được | Frontend: `npm run build` → deploy thư mục `dist/` lên **Vercel** hoặc **Netlify** (repo đã có sẵn `vercel.json` và `public/_redirects` để xử lý routing). Backend (`server/`) phải deploy **riêng** vì cần chạy liên tục — dùng Render, Railway hoặc Fly.io, không deploy được lên Vercel/Netlify dạng static. Chi tiết xem mục "Deploy" trong `README.md` và `HUONG_DAN_CHAY.md`. |
| 2 | Theo dõi sự thay đổi theo thời gian | **Hải** | Sau một khoảng thời gian điểm danh/theo dõi (vd 30 ngày hoặc theo tháng), người dùng có thể bấm 1 nút để xem lại mình đã thay đổi thế nào — có thể đặt ở tab "Lộ trình" hoặc hiện nút này sau khi đủ dữ liệu | Cần: (1) lưu lịch sử theo mốc thời gian, (2) so sánh dữ liệu giữa 2 mốc, (3) hiển thị (biểu đồ trước/sau, hoặc danh sách thay đổi). Có thể tận dụng dữ liệu lịch sử quét đã có ở backend (`server/`) và trang lịch sử trong `src/pages`. |
| 3 | Cơ sở dữ liệu | **Phát** | Mở rộng/duy trì database (thành phần mỹ phẩm, thực phẩm, danh sách lựa chọn hồ sơ...) | Database gốc (rule-based, dùng chung frontend/backend) nằm ở `src/data`. Phần lưu trữ người dùng thật (tài khoản, lịch sử quét) là SQLite trong `server/`. |
| 4 | Đề xuất & đánh giá ý tưởng mở rộng hệ sinh thái | **Khôn** (đề xuất) → **Khang** (đánh giá khả thi & thực hiện) | Góp ý, đề xuất ý tưởng mới cho sản phẩm | Ý tưởng đang có sẵn để tham khảo: ví điện tử nạp tiền đổi xu, dùng xu để liên hệ/thuê chuyên gia đang online nhằm xác nhận lại lộ trình hoặc kết quả vừa quét (AI chỉ đưa gợi ý, chuyên gia mới là bên đáng tin cậy hơn để quyết định), và một tab thông tin người dùng còn thiếu. Quy trình: Khôn đưa ý tưởng → Khang xem tính khả thi → nếu khả thi thì **Khang trực tiếp thực hiện**, hoặc nếu không đủ thời gian/nhân lực thì **nhờ hỗ trợ từ thành viên đội IT đang rảnh việc** (ưu tiên người không đang kẹt ở việc #1-3, #5) trước khi đưa vào roadmap. |
| 5 | Frontend "có hồn" của Healthy Skin | **Huỳnh Phúc** | Làm cho giao diện có bản sắc riêng, không chỉ là UI chức năng thuần túy | Xem `src/components`, `src/pages`; dự án đang dùng TailwindCSS (`package.json`) nên có thể tận dụng design token/theme sẵn có thay vì viết CSS rời rạc. |

---

## 2. Hồ sơ dự thi / bài tập (buổi học thứ 4)

### a) Khung mô hình kinh doanh xã hội (SBMC) — **Quỳnh (meo)**
- Đặt tên file: `Mã số nhóm_SBMC`
- Nội dung cần có:
  - Cấu trúc đầy đủ của khung mô hình kinh doanh tạo tác động xã hội
  - Lồng ghép rõ yếu tố **tác động của dự án đối với người thụ hưởng** (không chỉ là mô hình kinh doanh thông thường)
- Tham khảo: tài liệu buổi học thứ 4 — "Khung mô hình kinh doanh tạo tác động xã hội" (phần hướng dẫn bố cục & cách điền khung).

### b) Bài thuyết trình (Pitch Deck) — **Thúy Liễu**
- Tối đa **11 trang**
- Đặt tên file: `Mã số nhóm_Pitch Deck`
- Gợi ý: làm bằng Canva (mẫu Pitch Deck có sẵn), giữ đúng cấu trúc pitch chuẩn (vấn đề → giải pháp → thị trường → mô hình → tác động xã hội → đội ngũ...).

### c) Video giới thiệu sản phẩm — **Như**
- Tối đa **1 phút 30 giây**
- Đặt tên file: `Mã số nhóm_Video`
- ⚠️ Cần chốt trước khi quay: tỉ lệ khung hình **9:16** (dọc, phù hợp mobile/story) hay **16:9** (ngang, phù hợp trình chiếu)? Hỏi lại ban tổ chức hoặc format nộp bài để quyết định.

### d) (Tuỳ chọn) Hình ảnh sản phẩm mẫu tại Diễn đàn — **Linh**

### e) Trang "Về chúng tôi" — **Tiên**
Nội dung cần truyền tải:
- Chính sách bảo vệ thông tin người dùng
- Các quy định liên quan đến an toàn sức khỏe mà dự án tuân theo
- Một dạng "thỏa thuận" giữa người dùng và web khi bắt đầu theo lộ trình: web chỉ đóng vai trò **hướng dẫn**, người dùng có thể **kiểm tra lại hoặc kết nối chuyên gia** để xác nhận lộ trình, và **quyết định cuối cùng luôn thuộc về người dùng**
- Tham khảo: có thể dựa theo cấu trúc Privacy Policy / Terms of Service mẫu (điều khoản sử dụng, miễn trừ trách nhiệm y tế/"medical disclaimer") rồi viết lại bằng giọng văn thân thiện, dễ hiểu.

---

## 3. Git Workflow (để cả nhóm làm việc chung không đụng code nhau)

Repo: `https://github.com/ThongLuc2k3/Healthy_Skin` — branch `main` là nhánh chính, luôn phải chạy được (build + test không lỗi).

### Quy tắc chung
- **Không commit thẳng vào `main`.** Mọi thay đổi đi qua nhánh riêng + Pull Request (PR).
- Mỗi người/mỗi việc (bảng ở mục 1) làm trên **1 nhánh riêng**.
- Trước khi bắt đầu code mỗi ngày: kéo code mới nhất về.
- Không commit file nhạy cảm (`.env`, key, credential) — repo đã có `.gitignore` chặn sẵn các file này, nhưng vẫn nên kiểm tra `git status` trước khi commit.

### Đặt tên nhánh
```
feature/ten-tinh-nang     # tính năng mới, vd: feature/theo-doi-thay-doi
fix/mo-ta-loi             # sửa lỗi, vd: fix/loi-dang-nhap
chore/mo-ta               # việc linh tinh không phải feature/fix (docs, config...)
```

### Quy tắc commit message
Dùng dạng ngắn gọn kiểu `loại: mô tả`:
```
feat: thêm nút xem lại thay đổi sau 30 ngày
fix: sửa lỗi không lưu lịch sử quét
docs: cập nhật hướng dẫn deploy
chore: dọn dependency không dùng
```

### Quy trình làm việc từng bước
```bash
# 1. Cập nhật main mới nhất
git checkout main
git pull origin main

# 2. Tạo nhánh mới cho việc đang làm
git checkout -b feature/ten-tinh-nang

# 3. Code, rồi commit theo từng phần nhỏ, có ý nghĩa
git add <file cụ thể>      # tránh git add . nếu không chắc thay đổi gì
git commit -m "feat: mo ta ngan gon"

# 4. Đẩy nhánh lên GitHub
git push -u origin feature/ten-tinh-nang

# 5. Mở Pull Request trên GitHub: feature/ten-tinh-nang -> main
#    - Mô tả ngắn: làm gì, tại sao, cách test thử
#    - Nếu có thể, nhờ 1 người khác trong nhóm review trước khi merge

# 6. Sau khi được duyệt: merge PR trên GitHub (Squash and merge cho gọn lịch sử)

# 7. Về máy, dọn lại
git checkout main
git pull origin main
git branch -d feature/ten-tinh-nang
```

### Khi có conflict
```bash
git checkout feature/ten-tinh-nang
git pull origin main         # hoặc: git merge main
# sửa conflict trong file (đoạn <<<<<<< ======= >>>>>>>)
git add <file đã sửa>
git commit
git push
```

### Trước khi mở PR, tự kiểm tra
```bash
npm run lint     # kiểm tra lỗi lint
npm run test     # chạy unit test (matchEngine)
npm run build    # đảm bảo build không lỗi
```
