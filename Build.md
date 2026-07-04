# PROMPT XÂY DỰNG DA DƯỠNG — dùng cho Claude Code / AI coding agent

> Cách dùng: copy toàn bộ nội dung dưới đây, dán vào Claude Code (hoặc Cursor, v.v.). Nếu agent báo quá tải/hết ngữ cảnh, dán riêng từng PHASE một, theo đúng thứ tự — mỗi PHASE đã được viết để chạy độc lập, chỉ cần agent đọc lại code cũ trong repo trước khi tiếp tục.

---

## BỐI CẢNH DỰ ÁN (dán một lần, giữ nguyên xuyên suốt các phase)

Tôi đang xây MVP demo cho một cuộc thi đổi mới sáng tạo (CTP 2026), thời hạn 2-4 tuần. Sản phẩm tên **DA DƯỠNG** — nền tảng cá nhân hóa chăm sóc da VÀ dinh dưỡng dựa trên MỘT hồ sơ cơ địa dùng chung cho cả hai trục.

**Vấn đề giải quyết:** Người dùng không biết sản phẩm chăm sóc da hoặc thực phẩm nào phù hợp với cơ địa riêng của mình (da khô/dầu/nhạy cảm, dị ứng, bệnh lý nền). Họ hiện phải thử–sai hoặc nghe lời khuyên chung chung từ mạng xã hội.

**Nguyên tắc bắt buộc cho toàn bộ dự án:**
- Đây là DEMO chứng minh khái niệm, không phải sản phẩm hoàn chỉnh — ưu tiên chạy đúng, mượt, dễ hiểu hơn là đầy đủ tính năng
- KHÔNG dùng machine learning/AI thật cho việc đối chiếu — dùng rule-based (if/else theo cờ hiệu dữ liệu). Lý do: rủi ro thấp, chạy ổn định, đủ thuyết phục cho demo
- KHÔNG làm OCR/nhận diện ảnh thật ở giai đoạn này — phần "scan" mô phỏng bằng tìm kiếm/chọn từ danh sách có sẵn
- Database là file JSON tĩnh, khoảng 50-100 mục (thành phần mỹ phẩm + thực phẩm), KHÔNG cần kết nối API bên ngoài
- Giao diện tiếng Việt, thiết kế đơn giản, rõ ràng — ưu tiên người dùng hiểu ngay "vì sao phù hợp/không phù hợp" hơn là giao diện đẹp mắt phức tạp

---

## TÌNH TRẠNG HIỆN TẠI — ĐÃ XÂY DỰNG THÀNH CÔNG

> Tóm tắt nhanh những gì đã chạy được thật trong repo này, để không cần đọc lại từng phase bên dưới.
> Chi tiết đầy đủ (nhiệm vụ, lý do kỹ thuật) vẫn nằm ở các mục PHASE tương ứng.

### ✅ Phase 1-6 — Demo gốc (client-side, rule-based, không cần backend)
- Vite + React 19 + Tailwind CSS v4, cấu trúc `src/{components,data,logic,pages,context,hooks,lib}`
- Database tĩnh: 20 mục mỹ phẩm (`src/data/skincare_ingredients.json`) + 20 mục thực phẩm (`food_items.json`)
- `matchEngine.js` — rule-based đối chiếu hồ sơ ↔ database, có unit test (`npm run test`)
- Luồng đầy đủ: Trang chủ → khai báo hồ sơ (`ProfileForm`) → xem kết quả 3 nhóm màu (`RecommendationPage`) → quét thử tìm kiếm thủ công (`ScanDemoPage`)
- Responsive di động, cấu hình sẵn sàng deploy Vercel/Netlify (`vercel.json`, `public/_redirects`) — **chưa deploy thật**

### ✅ Phase 7 — Backend thật (ĐÃ XÂY — chủ động làm sớm hơn dự kiến, khác ghi chú gốc "chỉ làm sau vòng thi")
- Backend Node.js/Express riêng trong `server/`, chạy độc lập với frontend (`npm run dev:all` chạy song song)
- Database quan hệ: **SQLite** (`better-sqlite3`) thay vì Postgres như dự kiến ban đầu — đủ dùng cho quy mô demo, dễ nâng cấp sau. 5 bảng: `users`, `profiles`, `skincare_ingredients`, `food_items`, `scan_history`
- Tài khoản người dùng thật: đăng ký/đăng nhập/JWT (`bcrypt` native, không dùng `bcryptjs` vì quá chậm), đồng bộ hồ sơ cơ địa giữa các thiết bị
- Quét ảnh thật: đổi từ kế hoạch gốc (Google Cloud Vision, cần billing) sang **Gemini API** (Google AI Studio, free tier thật không cần thẻ) sau khi phát hiện Vision API bị chặn `BILLING_DISABLED` — Gemini vừa đọc ảnh vừa tự suy luận phù hợp/cần cân nhắc/nên tránh trực tiếp cho luồng này (không qua `matchEngine.js`)
- Lịch sử quét (`ScanHistoryPage`, `/api/scan/history`)
- Bảo mật: `helmet`, rate limit riêng cho từng nhóm endpoint (auth/scan/explain/chat), JWT secret ngẫu nhiên, xử lý lỗi async an toàn (Express 4), làm nóng `bcrypt` lúc khởi động để tránh chậm ở request đầu tiên
- Chi tiết đầy đủ + lý do quyết định kiến trúc: xem `/home/thongluc/.claude/plans/gleaming-noodling-dove.md`

### ✅ Phase 8 — Trải nghiệm AI mở rộng
Xem mục "PHASE 8" bên dưới — đã xây đủ 3 việc: khung demo trang Động lực, nút "Giải thích thêm bằng AI" ở kết quả, trợ lý chat AI nổi toàn site.

### ✅ Bổ sung sau Phase 8 (chưa có mục phase riêng)
- **Hồ sơ có lựa chọn "Khác" tự mô tả**: cả 4 mục (loại da, dị ứng, bệnh lý nền, mục tiêu) đều có tuỳ chọn "Khác" — chọn vào sẽ hiện ô nhập mô tả tự do, lưu ở backend (`profiles.skin_type_note` và tương tự), được đưa vào ngữ cảnh cho cả 3 tính năng AI (quét ảnh, giải thích, chat) qua hàm dùng chung `profileSummaryText()` trong `geminiService.js` — giúp AI hiểu đúng hơn khi người dùng không chắc mình thuộc nhóm cố định nào
- **Trang chủ** cập nhật đủ 5 thẻ tính năng (trước đó thiếu Góc truyền động lực + Trợ lý AI)
- **UX phiên đăng nhập hết hạn**: hiện thông báo rõ ràng thay vì âm thầm đăng xuất
- **Giao diện**: xử lý lề trắng thừa trên màn hình rộng — thêm nền gradient nhạt phủ toàn bộ chiều cao trang (không chỉ phần đầu)

### ✅ Phase 9A — Bộ máy lộ trình (Roadmap Engine) — ĐÃ XÂY
- Bảng `roadmaps` (SQLite): `user_id`, `duration_days`, `source`, `status`, `daily_plan` (JSON), `created_at`
- `server/src/services/roadmapService.js`: `generateRoadmap`/`createRoadmap` sinh lộ trình 14 ngày từ hồ sơ — việc chăm sóc da cố định mỗi ngày (`BASE_SKINCARE_TASKS`) + gợi ý dinh dưỡng cá nhân hoá bằng cách tái dùng thẳng `matchEngine.js`/`getRecommendations` (KHÔNG gọi Gemini, rule-based như cam kết trong đặc tả 9A). Tạo lộ trình mới sẽ lưu trữ (archive) lộ trình cũ, không xoá.
- API: `POST /api/roadmap/generate`, `GET /api/roadmap/current`, `PATCH /api/roadmap/:id/task/:taskId` (đánh dấu hoàn thành việc chăm sóc da theo ngày) — đều yêu cầu JWT
- `RoadmapPage.jsx` (route `/roadmap`, có trong `NavBar`): hiển thị dạng danh sách thẻ theo từng ngày, mỗi ngày có checklist chăm sóc da (tick optimistic, tự khôi phục nếu lỗi mạng) + khối "Dinh dưỡng cần lưu ý" cá nhân hoá; có màn hình chờ khi chưa có hồ sơ/chưa đăng nhập/chưa có lộ trình
- Đã kiểm thử: curl toàn bộ API (validate thiếu hồ sơ, sinh lộ trình đúng theo dị ứng/bệnh lý thật, GET/PATCH, lỗi 404 khi task sai, archive khi tạo lại) + Playwright trình duyệt thật (đăng ký → set hồ sơ → vào `/roadmap` → tạo lộ trình → tick việc → tải lại trang xác nhận lưu đúng) — `npm run build`/`test`/`lint` đều pass

### ✅ Phase 9B — Điểm danh hằng ngày có ảnh (Daily check-in) — ĐÃ XÂY
- Bảng `checkins` (SQLite): `user_id` + `date` là UNIQUE (điểm danh lại trong ngày = cập nhật, không tạo bản ghi mới), lưu `skincare_tasks_completed` (JSON), `meal_description`, `note`, đường dẫn + mime của 2 ảnh tuỳ chọn (skincare, bữa ăn)
- `server/src/services/checkinService.js`: upsert theo ngày, tự xoá ảnh cũ trên đĩa khi có ảnh mới thay thế (tránh rác file), tính streak (số ngày liên tiếp điểm danh đủ cả 2 khối — hôm nay chưa điểm danh không bị tính là mất streak ngay vì ngày chưa kết thúc)
- API: `POST /api/checkin` (multipart, ảnh tuỳ chọn — KHÔNG bắt buộc phải có ảnh mới điểm danh được), `GET /api/checkin/today`, `GET /api/checkin/calendar?days=`
- **Bảo mật ảnh điểm danh**: không dùng `express.static` công khai (ảnh có thể là khuôn mặt/bữa ăn riêng tư) — ảnh phục vụ qua `GET /api/checkin/photo/:id/:field` có JWT + kiểm tra đúng chủ sở hữu (đã kiểm thử: không có token → 401, token của người khác → 404 thay vì lộ dữ liệu), tên file lưu trên đĩa là UUID ngẫu nhiên chứ không theo `user_id`/ngày dễ đoán
- Frontend: `CheckInPage` (`/checkin`) — checklist skincare theo đúng lộ trình hôm nay (từ 9A) + textarea bữa ăn + 2 nút thêm ảnh tuỳ chọn, tự nhận lại dữ liệu đã điểm danh nếu vào lại trong ngày; `StreakCalendarPage` (`/streak`) — lưới 30 ngày tô màu theo trạng thái (đủ/thiếu một phần/chưa điểm danh) + số streak hiện tại. Vì ảnh yêu cầu xác thực, `<img>` thường không gửi được header — component `AuthedImage` tự fetch ảnh kèm token rồi hiển thị qua object URL
- Đã kiểm thử: curl toàn bộ API (upsert không tạo trùng bản ghi, giữ ảnh cũ nếu không gửi ảnh mới, xoá ảnh cũ khi có ảnh mới, chặn truy cập ảnh không có quyền) + Playwright trình duyệt thật (điểm danh có ảnh, tải lại trang xác nhận lưu đúng kể cả ảnh preview tải được, xem lịch streak hiển thị đúng màu/ đúng số ngày) — `npm run build`/`test`/`lint` đều pass

### ✅ Phase 9C — Hồ sơ mở rộng: ảnh khuôn mặt + bệnh lý da liễu — ĐÃ XÂY
- **Consent trước tiên**: cột `profiles.consent_given_at` — mọi API upload ảnh khuôn mặt/báo cáo khám đều bị chặn (403) cho tới khi người dùng bấm "Tôi đồng ý" ở màn hình giải thích rõ mục đích + quyền xoá, hiển thị ngay trong `ProfileForm` (chỉ hiện khi đã đăng nhập — tính năng này cần backend nên không áp dụng cho hồ sơ offline)
- Ảnh khuôn mặt: cột `face_photo_path`/`face_photo_mime` trên `profiles` (1 ảnh/người dùng, ghi đè + tự xoá file cũ khi đổi ảnh). API: `POST/DELETE/GET /api/profile/face-photo`
- Bệnh lý đã chẩn đoán: cột `diagnosed_conditions` (JSON, multi-entry: tên bệnh + thời gian + ghi chú) qua `PUT /api/profile/diagnosed-conditions`, tách khỏi `PUT /api/profile` cơ bản nên không bị ghi đè mất khi lưu hồ sơ da/dị ứng thường
- Báo cáo/kết quả khám: bảng riêng `expert_reports` (chấp nhận ảnh hoặc PDF), API `POST /api/profile/expert-report`, `GET /api/profile/expert-reports`, `DELETE /api/profile/expert-report/:id` — xoá vĩnh viễn cả file trên đĩa
- **Bảo mật**: cùng mô hình như ảnh điểm danh (9B) — phục vụ qua route có JWT + kiểm tra đúng chủ sở hữu, tên file trên đĩa là UUID ngẫu nhiên, không dùng `express.static` công khai
- **Không suy diễn chẩn đoán**: giao diện luôn ghi rõ "chỉ mang tính tham khảo, KHÔNG phải chẩn đoán y khoa, không thay thế tư vấn bác sĩ" ở màn hình consent lẫn khu vực nhập bệnh lý/báo cáo
- Component mới: `ExtendedProfileSection.jsx` (gắn vào cuối `ProfileForm`, chỉ hiện khi đã đăng nhập)
- **Phạm vi cắt bớt có chủ đích**: KHÔNG làm phần "dùng Gemini trích xuất báo cáo rồi tự sinh lại lộ trình (source: expert_adjusted)" — đặc tả gốc ghi rõ đây là phần "có thể làm nếu còn dư thời gian", không nằm trong tiêu chí hoàn thành bắt buộc của 9C (giống cách 9B đã bỏ qua việc AI tự phân tích ảnh bữa ăn)
- Đã kiểm thử: curl toàn bộ API (chặn 403 khi chưa đồng ý, hoạt động sau khi đồng ý, xoá ảnh cũ khi đổi ảnh, từ chối định dạng file lạ, 401/404 khi truy cập ảnh/báo cáo không đúng quyền) + Playwright trình duyệt thật (đồng ý → tải ảnh khuôn mặt → khai bệnh lý → tải báo cáo → tải lại trang xác nhận còn nguyên → xoá ảnh/báo cáo thành công) — `npm run build`/`test`/`lint` đều pass

### ✅ Phase 9D — Kết nối chuyên gia (marketplace demo) — ĐÃ XÂY
- **Lưu ý quan trọng khi làm**: đặc tả gốc ghi "mở rộng schema experts (đã có từ Phase 8A)" nhưng Phase 8A đó KHÔNG hề tồn tại trong code — đã xây toàn bộ từ đầu (bảng `experts` + `expert_bookings`, seed data, service, route), không phải "mở rộng" gì cả
- Dữ liệu 4 chuyên gia mẫu ở `server/src/data/experts.json`, seed riêng biệt lúc khởi động (không phụ thuộc điều kiện seed skincare/food) — mọi `certifications[].verified` đều mặc định `false` đúng như đặc tả yêu cầu ("chỉ đổi true nếu thật sự xác minh được")
- API công khai (không cần đăng nhập, giống `items.routes.js`): `GET /api/experts` (lọc theo `?area=`), `GET /api/experts/areas`, `GET /api/experts/:id`
- Đặt lịch (demo, không thanh toán/video call thật): `POST /api/experts/:id/book`, `GET /api/experts/bookings/mine`, `GET /api/experts/bookings/:id` (JWT + kiểm tra đúng chủ sở hữu)
- **Đóng vòng lặp với 9C**: `PATCH /api/experts/bookings/:id/link-report` liên kết một báo cáo đã tải lên qua `POST /api/profile/expert-report` (tái dùng nguyên endpoint 9C, không viết lại logic upload) vào lịch hẹn — booking tự chuyển trạng thái `completed` khi có báo cáo đính kèm
- Frontend: `ExpertListPage` (`/experts`, có banner cảnh báo rõ "dữ liệu mẫu cho demo" + lọc khu vực), `ExpertDetailPage` (`/experts/:id`, bio/chứng chỉ có nhãn xác thực/chưa xác thực/đánh giá/chọn giờ đặt lịch), `BookingDetailPage` (`/my-bookings/:id`, nút "Tải lên kết quả tư vấn" gọi thẳng luồng 9C rồi tự liên kết vào lịch hẹn)
- Đã kiểm thử: curl toàn bộ API (đặt lịch sai giờ bị từ chối, xem lịch hẹn của người khác bị chặn 404, liên kết báo cáo của người khác bị từ chối) + Playwright trình duyệt thật (duyệt danh sách → lọc khu vực → xem chi tiết → đặt lịch → bị chặn tải báo cáo vì chưa đồng ý (9C) → đồng ý → tải báo cáo → lịch hẹn chuyển "hoàn tất") — `npm run build`/`test`/`lint` đều pass

### ✅ Phase 9E — Tự thiết kế lộ trình (Custom roadmap) — ĐÃ XÂY
- Tái dùng đúng bảng `roadmaps` (9A), không tạo bảng mới — `roadmapService.js` tách hàm `saveNewRoadmap()` dùng chung cho cả lộ trình tự sinh (`source: auto_generated`) và tự thiết kế (`source: user_custom`), nên `RoadmapPage`/`CheckInPage` hiển thị & tick việc trên lộ trình tự thiết kế mà không cần sửa gì thêm
- API: `POST /api/roadmap/custom` (body: `goal`, `durationDays`, `tasks[]` tự gõ không giới hạn theo database)
- **Cảnh báo mềm, không chặn**: `CustomRoadmapPage` tự chạy `getRecommendations()`/`matchEngine.js` (y hệt logic ở trang Kết quả, hoàn toàn phía client — không cần endpoint validate riêng) để so khớp từng việc tự nhập với danh sách "nên tránh" theo hồ sơ; nếu trùng, hiện dòng cảnh báo màu vàng ngay dưới ô nhập kèm lý do, KHÔNG chặn lưu
- Từ `RoadmapPage` có link 2 chiều rõ ràng giữa "dùng lộ trình tự sinh" và "tự thiết kế lộ trình riêng" — đúng yêu cầu "2 lựa chọn song song"
- Đã kiểm thử: curl (tasks rỗng bị từ chối 400, lộ trình tuỳ chỉnh sinh đúng số ngày/nội dung, `GET /roadmap/current` trả đúng lộ trình mới nhất, tick việc qua endpoint 9A vẫn hoạt động) + Playwright trình duyệt thật (nhập việc trùng "Dầu dừa" khi hồ sơ da dầu → cảnh báo mềm hiện đúng → vẫn lưu được → `/roadmap` hiển thị đúng 5 ngày với việc tự nhập) — `npm run build`/`test`/`lint` đều pass

**Toàn bộ Phase 9 (9A-9E) đã hoàn thành.**

---

## PHASE 1 — Khung dự án + Database

**Nhiệm vụ:**
1. Khởi tạo dự án React (dùng Vite), cấu trúc thư mục rõ ràng: `src/components`, `src/data`, `src/logic`, `src/pages`
2. Tạo file `src/data/skincare_ingredients.json` với schema:
```json
{
  "id": "coconut_oil",
  "name_vi": "Dầu dừa (Coconut Oil)",
  "category": "skincare",
  "flags": ["comedogenic_high"],
  "conflicts_with_skin_type": ["da_dau", "da_mun"],
  "explanation_vi": "Thuộc nhóm dầu gây bít tắc lỗ chân lông, dễ gây mụn dù mang tiếng tự nhiên."
}
```
3. Tạo file `src/data/food_items.json` với schema tương tự nhưng field `conflicts_with_allergy` và `conflicts_with_condition` thay vì `conflicts_with_skin_type`
4. Điền sẵn 15-20 mục mỹ phẩm và 15-20 mục thực phẩm phổ biến (tôi sẽ cung cấp danh sách nguồn — nếu chưa có, tạm dùng dữ liệu ví dụ hợp lý và đánh dấu `"source": "placeholder — cần xác minh"` để tôi biết chỗ nào cần thay bằng dữ liệu thật)
5. Setup Tailwind CSS cho styling

**Kết quả cần có sau Phase 1:** Dự án chạy được bằng `npm run dev`, có 2 file database mẫu, chưa cần giao diện.

---

## PHASE 2 — Form hồ sơ cơ địa (Vòng 1, phần nhập liệu)

**Nhiệm vụ:**
1. Tạo trang `ProfileForm` cho phép người dùng khai báo:
   - Loại da: da dầu / da khô / da hỗn hợp / da nhạy cảm (chọn 1)
   - Dị ứng thực phẩm: multi-select (hải sản, đậu phộng, sữa, gluten, v.v. — tự đề xuất danh sách phổ biến ở VN)
   - Bệnh lý nền liên quan dinh dưỡng: multi-select (tiểu đường, cao huyết áp, không dung nạp lactose, v.v.)
   - Mục tiêu: multi-select (giảm mụn, chống lão hóa, tăng cân lành mạnh, giảm cân, v.v.)
2. Lưu hồ sơ vào state (React Context hoặc đơn giản là useState ở component cha) — KHÔNG cần backend/database thật cho demo, lưu local là đủ
3. Validate: bắt buộc chọn loại da trước khi submit

**Kết quả cần có sau Phase 2:** Form hoạt động, submit được, dữ liệu hồ sơ hiển thị ra console.log để kiểm tra.

---

## PHASE 3 — Logic đối chiếu (rule-matching engine)

**Nhiệm vụ:**
1. Tạo file `src/logic/matchEngine.js` với hàm `matchProfile(profile, item)`:
   - Input: hồ sơ người dùng (từ Phase 2) + 1 item từ database (từ Phase 1)
   - Output: `{ result: "phù hợp" | "cần cân nhắc" | "nên tránh", reason: "..." }`
   - Logic: nếu `item.conflicts_with_skin_type` chứa loại da của người dùng → "nên tránh", kèm `item.explanation_vi` làm lý do. Tương tự cho dị ứng/bệnh lý nền. Nếu không xung đột gì → "phù hợp"
2. Viết hàm `getRecommendations(profile, database)`: chạy `matchProfile` cho toàn bộ database, trả về danh sách đã phân loại theo 3 nhóm kết quả
3. Viết unit test đơn giản (không cần framework phức tạp, có thể chỉ là vài `console.assert`) để tôi kiểm tra logic đúng trước khi lên giao diện

**Kết quả cần có sau Phase 3:** Chạy thử với 2-3 hồ sơ mẫu, ra kết quả đúng logic mong đợi, in ra console để tôi xác nhận.

---

## PHASE 4 — Trang kết quả gợi ý (Vòng 1, phần hiển thị)

**Nhiệm vụ:**
1. Tạo trang `RecommendationPage` nhận hồ sơ từ Phase 2, chạy qua `getRecommendations` (Phase 3), hiển thị:
   - Chia 2 cột hoặc 2 tab: "Chăm sóc da" và "Dinh dưỡng"
   - Mỗi cột chia 3 nhóm: Phù hợp (xanh) / Cần cân nhắc (vàng) / Nên tránh (đỏ), có icon phân biệt
   - Mỗi item hiển thị tên + lý do ngắn gọn khi bấm vào (accordion hoặc modal)
2. Thêm nút "Quay lại chỉnh hồ sơ"

**Kết quả cần có sau Phase 4:** Luồng đầy đủ Vòng 1 chạy được từ đầu đến cuối: nhập hồ sơ → xem kết quả.

---

## PHASE 5 — Trang "Scan demo" (Vòng 2, phiên bản giới hạn)

**Nhiệm vụ:**
1. Tạo trang `ScanDemoPage`: thay vì chụp ảnh thật, dùng ô tìm kiếm/dropdown để người dùng chọn 1 sản phẩm hoặc thực phẩm có sẵn trong database
2. Sau khi chọn, chạy `matchProfile` với hồ sơ đã lưu (từ Phase 2), hiển thị kết quả giống định dạng ở Phase 4 nhưng chỉ cho 1 item
3. Ghi chú nhỏ trên giao diện: "Phiên bản demo — quét ảnh thật là hướng phát triển tiếp theo" (để minh bạch với giám khảo, không gây hiểu lầm là đã có OCR)

**Kết quả cần có sau Phase 5:** Có đủ 2/3 vòng tính năng chạy demo được, sẵn sàng quay video/thuyết trình trực tiếp.

---

## PHASE 6 — Hoàn thiện & polish (làm sau cùng nếu còn thời gian)

**Nhiệm vụ:**
1. Responsive cơ bản cho di động
2. Trang chủ giới thiệu ngắn gọn (logo, tagline "Đúng da, đúng dưỡng chất — Từ trong ra ngoài", nút bắt đầu)
3. Deploy lên Vercel/Netlify, trả về link demo
4. Rà lỗi console, xử lý trường hợp hồ sơ trống/database thiếu dữ liệu


---
PHASE 7 TRỞ ĐI — Tầm nhìn đầy đủ (nguyên văn ghi chú gốc: CHỈ làm sau khi qua vòng thi, không đưa vào demo)

> **Cập nhật thực tế:** nhóm đã chủ động làm phần lớn "Nhóm 1" bên dưới ngay trong giai đoạn demo
> (khác với ghi chú gốc) — xem mục "TÌNH TRẠNG HIỆN TẠI" ở đầu file để biết chính xác cái gì đã xây,
> cái gì vẫn chỉ là ý tưởng (Nhóm 2, 3, 4 dưới đây hầu như vẫn chưa làm).


Phần này KHÔNG dán cho agent làm ngay. Đây là bản đồ tính năng đầy đủ để nhóm tham khảo khi phát triển sản phẩm thật sau CTP, tránh quên mất định hướng ban đầu.



Nhóm 1 — Nâng cấp lõi kỹ thuật


[x] ĐÃ XÂY — OCR/nhận diện ảnh thật (đổi sang Gemini API thay vì Google Vision như dự kiến — xem "TÌNH TRẠNG HIỆN TẠI")
[x] ĐÃ XÂY — Backend thật (Node.js/Express), database quan hệ (SQLite thay vì Postgres như dự kiến)
[x] ĐÃ XÂY — Tài khoản người dùng: đăng ký/đăng nhập, lưu hồ sơ cơ địa vĩnh viễn, lịch sử scan
[ ] CHƯA — Nâng cấp matching engine: từ rule-based sang có trọng số/xếp hạng mức độ phù hợp (không chỉ 3 nhóm cứng), có thể cân nhắc ML khi đã đủ dữ liệu người dùng thật. Lưu ý: riêng luồng "Quét ảnh thật" đã dùng AI suy luận trực tiếp (Phase 7/8), nhưng `matchEngine.js` dùng cho trang Kết quả + tìm kiếm thủ công vẫn 100% rule-based như thiết kế gốc, chưa có trọng số/xếp hạng.


Nhóm 2 — Vòng 3: Cộng đồng


Hồ sơ cơ địa ẩn danh hóa để nhóm người dùng tương đồng có thể xem review của nhau
Hệ thống kiểm duyệt nội dung bởi bác sĩ da liễu + chuyên gia dinh dưỡng thật
Tính năng phân biệt hàng thật–giả (cần nghiên cứu riêng, độ khó cao)


Nhóm 3 — Kinh doanh & mở rộng


Mô hình freemium: giới hạn số lượt scan/tháng cho tài khoản miễn phí
Affiliate: gắn link mua hàng qua đối tác TMĐT đã xác nhận "phù hợp"
Dashboard B2B: insight ẩn danh cho nhãn hàng (xu hướng cơ địa, thành phần bị tránh nhiều)
Mở rộng cho nam giới: nội dung/database riêng biệt cho nhu cầu da nam giới (thị trường ngách đang tăng, xem Slide 5 bản chiến lược)


Nhóm 4 — Nền tảng đa thiết bị


Chuyển web app sang PWA (Progressive Web App) để cài vào màn hình chính điện thoại mà không cần app store
Nếu cần app thật trên store: dùng lại logic đã có, viết lại giao diện bằng React Native

---

## PHASE 8 — Trải nghiệm AI mở rộng (đã xây dựng, tiếp nối Phase 7)

> Khác với Phase 7 (chỉ là roadmap tham khảo), Phase 8 là các tính năng **đã được yêu cầu và xây dựng
> thật** trong lúc backend/Gemini API của Phase 7 đã sẵn sàng — không phải danh sách chờ.

**Bối cảnh:** Sau khi có backend + Gemini API (Phase 7), người dùng muốn tận dụng AI nhiều hơn ở các
điểm chạm khác trong app, đồng thời bổ sung một khu vực nội dung mang tính giữ chân/tạo động lực.

**Nhiệm vụ 1 — Khung demo nội dung truyền động lực:**
- Trang `MotivationPage` (`/motivation`), nội dung dạng thẻ theo 3 nhóm: Routine chăm sóc da, Giảm cân
  lành mạnh, Dinh dưỡng & động lực (`src/data/motivationContent.js`)
- Mỗi thẻ dẫn tới kết quả tìm kiếm YouTube liên quan (không gắn cứng video ID cụ thể vì chưa có nội
  dung thật do đội biên tập cung cấp) — đúng tinh thần "khung demo", chưa phải sản phẩm hoàn chỉnh
- **Việc còn lại khi có nội dung thật:** thay `youtubeSearchUrl(...)` bằng video ID/embed thật, có thể
  thêm lọc theo mục tiêu người dùng đã khai báo ở hồ sơ (`profile.goals`)

**Nhiệm vụ 2 — AI giải thích thêm khi nhấn vào kết quả:**
- Backend: `POST /api/explain` (`server/src/routes/explain.routes.js`, `explainService.js`) — nhận tên
  sản phẩm/thực phẩm + kết quả/lý do rule-based + hồ sơ cơ địa, gọi Gemini để giải thích sâu hơn (cơ
  chế, mẹo dùng/thay thế), không yêu cầu đăng nhập nhưng có rate limit riêng
  (`server/src/middleware/rateLimit.js` → `explainLimiter`, 20 lần/15 phút/tài khoản hoặc IP)
- Frontend: component dùng chung `ExplainButton` (`src/components/ExplainButton.jsx`), gắn vào
  `ResultAccordionItem` (trang Kết quả) và `ResultCard` (trang Quét thử) — bấm "Giải thích thêm bằng
  AI" sẽ gọi API và hiển thị đoạn giải thích ngay dưới lý do rule-based gốc

**Nhiệm vụ 3 — Trợ lý chat AI nổi toàn site ("sticker AI"):**
- Backend: `POST /api/chat` (`server/src/routes/chat.routes.js`, `chatService.js`) — nhận lịch sử hội
  thoại (tối đa 20 tin nhắn gần nhất) + context (trang hiện tại, hồ sơ cơ địa), dùng `systemInstruction`
  của Gemini để trợ lý luôn bám sát vai trò + hồ sơ người dùng; rate limit riêng (`chatLimiter`, 30
  lần/15 phút/tài khoản hoặc IP)
- Frontend: `ChatWidget` (`src/components/ChatWidget.jsx`) — nút tròn nổi góc dưới phải, mount toàn cục
  ở `App.jsx` nên xuất hiện trên mọi trang; bấm mở ra khung chat, gửi câu hỏi kèm context trang/hồ sơ
  hiện tại, giữ lịch sử hội thoại trong state (chưa lưu DB — mất khi tải lại trang)

**Kiến trúc dùng chung cho cả 3 endpoint AI mới:** `server/src/services/geminiClient.js` — hàm
`generateContent` (single-turn, hỗ trợ `responseSchema` ép JSON) và `generateChatReply` (multi-turn có
`systemInstruction`), có timeout 30s cho mọi lệnh gọi Gemini để tránh treo request.

**Nguyên tắc giữ nguyên:** `matchEngine.js` (rule-based) vẫn là nguồn quyết định chính cho trang Kết
quả và tìm kiếm thủ công — AI chỉ đóng vai trò *giải thích thêm*, không thay thế logic đối chiếu, trừ
riêng luồng "Quét ảnh thật" (Phase 7) vốn đã dùng AI suy luận trực tiếp theo lựa chọn của người dùng.

**Kết quả cần có sau Phase 8:** 3 tính năng trên chạy được với Gemini API key đã cấu hình, đều có rate
limit riêng để bảo vệ quota chung; khung demo nội dung động lực hiển thị được dù chưa có video thật.

---

## PHASE 9 (Ý TƯỞNG — CHƯA XÂY) — "Huấn luyện viên khắt khe" theo dõi hằng ngày

> Ghi lại theo yêu cầu, KHÔNG dán cho agent làm ngay — cần chốt phạm vi cụ thể với người dùng trước
> (đã hỏi nhưng chưa có phản hồi tại thời điểm ghi chú này).

**Ý tưởng gốc:** Cơ chế "mở khóa" hằng ngày — mỗi ngày người dùng cần chụp ảnh làm bằng chứng (đã
skincare, đã ăn gì, và cả ảnh khuôn mặt để theo dõi tiến triển da) để AI phân tích và đánh giá lại
kế hoạch điều độ, với giọng điệu như một huấn luyện viên nghiêm khắc (không chỉ khen, có nhắc
nhở/phê bình khi lệch kế hoạch). Kế hoạch chia theo ngày/tuần/tháng, có tính "bắt buộc" điểm danh.

**Bổ sung (lần cập nhật thứ 2):**
- Ảnh khuôn mặt định kỳ để AI so sánh tiến triển da theo thời gian — cần cân nhắc kỹ vì đây là dữ
  liệu sinh trắc học/nhạy cảm, khác hẳn mức độ nhạy cảm của ảnh sản phẩm/món ăn hiện tại. Cần: chính
  sách lưu trữ & xoá rõ ràng, mã hoá khi lưu, cho phép người dùng xoá toàn bộ ảnh bất kỳ lúc nào,
  và làm rõ với người dùng ngay từ đầu (consent) trước khi bật tính năng này.
- "Lưu trữ thông tin lâm sàng" — nếu làm thật cần phân biệt rõ đây là dữ liệu sức khoẻ cá nhân
  (không phải chẩn đoán y khoa), tránh để người dùng hiểu nhầm app thay thế được bác sĩ.
- Kết nối chuyên gia tư vấn online 1-1 (bác sĩ da liễu/chuyên gia dinh dưỡng thật) — đây là tính
  năng marketplace/booking hoàn toàn mới (lịch hẹn, thanh toán, video call, hồ sơ chuyên gia được
  xác thực) — độ phức tạp tương đương một sản phẩm phụ riêng, không phải một tính năng nhỏ.

**Các câu hỏi cần chốt trước khi thiết kế (vẫn chưa có câu trả lời):**
1. Phạm vi ban đầu: chỉ làm khung demo 1 trang check-in đơn giản (up ảnh, AI nhận xét ngay trong
   ngày), hay làm đầy đủ (streak, nhắc nhở/thông báo, đánh giá xu hướng nhiều ngày)?
2. Cơ chế "mở khóa" cụ thể là gì — chặn không cho xem trang Kết quả/Quét thử nếu chưa check-in hôm
   nay? Hay chỉ là gamification nhẹ (huy hiệu, streak counter) không chặn tính năng khác?
3. Nhắc nhở hằng ngày cần thông báo đẩy (push notification) — yêu cầu chuyển app sang PWA trước
   (xem Nhóm 4, Phase 7) vì trình duyệt thường không cho phép notification nếu chưa cài như PWA.
4. Ảnh bằng chứng (đặc biệt ảnh khuôn mặt) có cần lưu trữ lâu dài không, hay chỉ xử lý xong rồi xoá?
   Hiện tại app CHƯA lưu bất kỳ ảnh nào (chỉ xử lý qua Gemini rồi bỏ) — đây là thay đổi lớn về
   kiến trúc lưu trữ + bảo mật nếu cần giữ ảnh lâu dài.
5. Giọng điệu "khắt khe" cụ thể tới mức nào — cần ví dụ thực tế để prompt AI đúng tông giọng mong muốn.
6. Kết nối chuyên gia 1-1: có thật sự cần trong phạm vi demo CTP không, hay chỉ là roadmap dài hạn?
   Nếu làm thật cần: xác thực chuyên gia, lịch hẹn, thanh toán, video call — nên tách thành dự án
   con riêng thay vì làm chung với "huấn luyện viên AI".

**Liên quan tới:** `ROADMAP.md` Nhóm 2 (Cộng đồng — kiểm duyệt bởi chuyên gia thật, đúng là nơi tính
năng "chuyên gia 1-1" nên thuộc về) và Nhóm 4 (PWA) — tính năng nhắc nhở hằng ngày phụ thuộc PWA để
có thông báo đẩy hoạt động ổn định trên di động.

---

## LƯU Ý KHI DÙNG PROMPT NÀY

- Dán PHASE 1 trước, đợi agent hoàn thành, kiểm tra kết quả rồi mới dán PHASE 2, cứ thế tiếp tục — tránh dán hết 1 lần dễ khiến agent bỏ sót bước hoặc lẫn lộn phạm vi
- Trước mỗi phase mới, nói với agent: "Đọc lại code hiện tại trong repo trước khi làm tiếp" để đảm bảo tính nhất quán
- Nếu agent tự ý thêm tính năng ngoài phạm vi (ví dụ tự làm OCR thật, tự thêm backend phức tạp) — nhắc lại đúng nguyên tắc ở phần Bối cảnh dự án


PHASE 9 — Lộ trình cá nhân hoá, điểm danh hằng ngày, hồ sơ mở rộng & kết nối chuyên gia

(Đặc tả đầy đủ — thay thế mục "PHASE 9 (Ý TƯỞNG — CHƯA XÂY)" trong file prompt gốc)


Dán đoạn này thay cho placeholder Phase 9 cũ. Vẫn áp dụng nguyên tắc ở "LƯU Ý KHI DÙNG PROMPT": dán từng sub-phase (9A → 9E) một, không dán hết một lần, và nhắc agent đọc lại code hiện tại (đặc biệt matchEngine.js, geminiClient.js, schema database ở server/) trước mỗi sub-phase.




⚠️ Cảnh báo phạm vi (đọc trước khi làm): Cụm 9C (ảnh khuôn mặt + hồ sơ bệnh lý) và 9D (marketplace chuyên gia) là hai hạng mục có độ phức tạp tương đương một sản phẩm riêng — không phải "thêm tính năng nhỏ". Nếu đang chạy đua deadline CTP, ưu tiên làm 9A + 9B trước (đây là phần thể hiện rõ nhất "tác động hành vi" mà tiêu chí xã hội của CTP đánh giá cao), rồi mới tới 9C/9D nếu còn thời gian. 9D đặc biệt rủi ro nếu trình bày sai — "chuyên gia gần bạn" và "chứng chỉ uy tín" là DEMO, không phải mạng lưới đối tác thật; nói sai với giám khảo có thể bị xem là cường điệu sản phẩm.




9A — Bộ máy lộ trình (Roadmap Engine)

Mục tiêu: Sau khi người dùng hoàn thành hồ sơ cơ địa (Phase 2) và xem kết quả gợi ý lần đầu (Phase 3-4), hệ thống tự tạo một lộ trình theo dõi nhiều ngày/tuần, thay vì chỉ trả kết quả tĩnh một lần.

Nhiệm vụ:


Tạo schema lộ trình, lưu ở backend (bảng mới roadmaps trong SQLite, liên kết user_id):


json{
  "id": "roadmap_001",
  "user_id": "...",
  "created_at": "2026-07-04",
  "duration_days": 28,
  "source": "auto_generated",
  "status": "active",
  "daily_plan": [
    {
      "day_index": 1,
      "date": "2026-07-04",
      "skincare_tasks": [
        { "id": "task_1", "label_vi": "Rửa mặt sáng bằng sữa rửa mặt dịu nhẹ", "done": false },
        { "id": "task_2", "label_vi": "Thoa kem chống nắng trước khi ra ngoài", "done": false }
      ],
      "meal_guidance": [
        "Ưu tiên thực phẩm giàu vitamin C (cam, ổi)",
        "Tránh sữa bò — đã khai báo dị ứng lactose"
      ]
    }
  ]
}


Viết hàm generateRoadmap(profile, matchResults) trong server/src/services/roadmapService.js: dùng lại kết quả từ matchEngine.js (nhóm "nên tránh"/"cần cân nhắc") để sinh ra meal_guidance và skincare_tasks theo rule đơn giản — KHÔNG cần gọi Gemini cho bước sinh lộ trình ban đầu, chỉ dùng rule-based để đảm bảo nhất quán với logic đối chiếu đã có
API: POST /api/roadmap/generate (tạo mới), GET /api/roadmap/current (lấy lộ trình đang hoạt động), PATCH /api/roadmap/:id/task/:taskId (đánh dấu hoàn thành 1 task)
Trang RoadmapPage: hiển thị dạng lịch/timeline theo ngày, mỗi ngày show các task skincare + gợi ý bữa ăn, có thể tick hoàn thành trực tiếp


Kết quả cần có sau 9A: Sau khi làm hồ sơ, người dùng có ngay một lộ trình 2-4 tuần cụ thể theo ngày, không chỉ là danh sách gợi ý tĩnh.


9B — Điểm danh hằng ngày bắt buộc (Daily check-in có ảnh)

Mục tiêu: Mỗi ngày, người dùng "điểm danh" 2 việc: đã skincare gì hôm nay, đã ăn gì hôm nay — có thể kèm ảnh minh chứng.

Nhiệm vụ:


Mở rộng bảng checkins (SQLite), schema:


json{
  "id": "checkin_001",
  "user_id": "...",
  "date": "2026-07-04",
  "roadmap_id": "roadmap_001",
  "skincare_done": true,
  "skincare_tasks_completed": ["task_1", "task_2"],
  "skincare_photo_url": "optional, có thể null",
  "meal_logged": true,
  "meal_description": "Cơm gà, rau luộc, canh chua",
  "meal_photo_url": "optional, có thể null",
  "note": ""
}


Trang CheckInPage (/checkin): 2 khối rõ ràng —

Khối Skincare: tick các task trong daily_plan hôm nay đã làm + nút "Thêm ảnh" (tuỳ chọn, không bắt buộc phải có ảnh mới điểm danh được — bắt buộc ảnh ngay từ đầu dễ khiến người dùng bỏ app giữa chừng)
Khối Bữa ăn: ô nhập món đã ăn (text) + nút "Thêm ảnh" (tuỳ chọn)



API: POST /api/checkin (tạo/cập nhật điểm danh của ngày hôm nay — mỗi ngày chỉ 1 bản ghi, gọi lại là update)
Ảnh: lưu ở thư mục server/uploads/checkins/{user_id}/{date}/, KHÔNG cần AI phân tích ảnh tự động ở giai đoạn demo (tận dụng Gemini đã có ở Phase 7/8 CHỈ khi còn dư thời gian — ví dụ mô tả sơ bộ món ăn trong ảnh, gắn cờ "tính năng thử nghiệm" rõ ràng)
Trang StreakCalendarPage: lịch dạng calendar, mỗi ngày tô màu theo trạng thái (đã điểm danh đủ / điểm danh thiếu 1 khối / chưa điểm danh), hiển thị streak hiện tại (số ngày liên tiếp)


Về cơ chế "bắt buộc": Khuyến nghị KHÔNG chặn cứng các trang khác nếu chưa điểm danh (gamification nhẹ — nhắc nhở, hiển thị streak bị đứt — thuyết phục hơn là khoá tính năng, vốn dễ gây khó chịu và không phù hợp bản chất một app sức khoẻ demo ngắn hạn).

Kết quả cần có sau 9B: Luồng điểm danh chạy được hằng ngày, có lịch theo dõi streak, đủ để demo trực tiếp 2-3 ngày liên tiếp trước khi thuyết trình.


9C — Hồ sơ mở rộng: ảnh khuôn mặt + thông tin bệnh lý da liễu


⚠️ Đây là dữ liệu sinh trắc học và dữ liệu sức khoẻ — mức độ nhạy cảm cao hơn hẳn dữ liệu đã xử lý ở các phase trước. Trước khi bật tính năng này, cần có ít nhất: (1) màn hình xin sự đồng ý (consent) rõ ràng, giải thích mục đích sử dụng, (2) nút cho phép người dùng xoá toàn bộ ảnh/hồ sơ bệnh lý bất kỳ lúc nào, (3) không hiển thị hoặc suy diễn thành "chẩn đoán y khoa" ở bất kỳ đâu trong giao diện — chỉ là "thông tin tham khảo, không thay thế tư vấn bác sĩ".



Nhiệm vụ:


Mở rộng bảng profiles, thêm field:


json{
  "face_photo_url": "optional, null nếu chưa upload",
  "diagnosed_conditions": [
    { "name_vi": "Viêm da cơ địa", "diagnosed_date": "2025-03", "note": "Bác sĩ BV Da liễu TP.HCM chẩn đoán" }
  ],
  "expert_report_files": [
    { "file_url": "...", "uploaded_at": "...", "source": "expert_consult_001" }
  ],
  "consent_given_at": "2026-07-04T10:00:00Z"
}


Trang ProfileForm (mở rộng từ Phase 2): thêm mục "Ảnh khuôn mặt" (upload, có màn hình consent riêng trước khi cho upload lần đầu), mục "Bệnh lý da liễu đã được chẩn đoán" (nhập tên bệnh + thời gian + ghi chú, multi-entry), mục "Tải lên báo cáo/kết quả khám" (chấp nhận PDF hoặc ảnh)
API: POST /api/profile/consent (ghi nhận đồng ý trước khi các API upload ảnh/hồ sơ khác hoạt động), POST /api/profile/face-photo, POST /api/profile/expert-report, DELETE /api/profile/face-photo và DELETE /api/profile/expert-report/:id (xoá vĩnh viễn theo yêu cầu)
Khi có expert_report_files mới, gọi lại generateRoadmap() (từ 9A) với ngữ cảnh bổ sung — có thể dùng Gemini để trích xuất thông tin chính từ file báo cáo (nếu là ảnh/PDF text) rồi đưa vào input sinh lộ trình, đánh dấu "source": "expert_adjusted" để phân biệt với lộ trình tự sinh ban đầu


Kết quả cần có sau 9C: Hồ sơ người dùng có thể lưu ảnh, bệnh lý đã chẩn đoán, và file bác sĩ cung cấp — có đầy đủ consent + khả năng xoá, không suy diễn chẩn đoán.


9D — Kết nối chuyên gia (marketplace tư vấn 1-1, phiên bản demo)


⚠️ Nhắc lại: toàn bộ danh sách chuyên gia, feedback, chứng chỉ trong mục này là dữ liệu mẫu dựng cho demo, không phải mạng lưới đối tác đã ký kết thật. Khi thuyết trình, PHẢI nói rõ điều này nếu giám khảo hỏi — đừng để slide/demo ngầm khẳng định đã có đối tác y tế thật khi chưa có.



Nhiệm vụ:


Mở rộng schema experts (đã có từ Phase 8A), thêm field:


json{
  "id": "bs_nguyen_van_a",
  "name": "BS. Nguyễn Văn A",
  "specialty": "Da liễu",
  "clinic_name": "Phòng khám Da liễu ABC",
  "area_vi": "Quận 1, TP.HCM",
  "bio_vi": "10 năm kinh nghiệm điều trị da mụn, da nhạy cảm.",
  "certifications": [
    { "title_vi": "Chứng chỉ hành nghề Da liễu", "image_url": "placeholder", "verified": false }
  ],
  "rating_avg": 4.6,
  "reviews": [
    { "user_display": "Người dùng ẩn danh", "rating": 5, "comment_vi": "Tư vấn kỹ, dễ hiểu." }
  ],
  "available_slots": ["Thứ 3 - 14:00", "Thứ 5 - 16:00"]
}

Trường "verified": false mặc định — đây là điểm minh bạch quan trọng: chỉ đổi thành true nếu nhóm thật sự xác minh được chứng chỉ, không tự ý đánh dấu đã xác thực.


Trang ExpertListPage (nâng cấp từ Phase 8A): filter theo khu vực (demo bằng dropdown chọn quận/huyện, KHÔNG cần GPS thật), mỗi card hiển thị ảnh, tên, chuyên môn, khu vực, rating trung bình, số lượng review, nhãn "Chưa xác thực chứng chỉ" nếu verified: false
Trang ExpertDetailPage: xem đầy đủ bio, toàn bộ review, phóng to ảnh chứng chỉ, chọn khung giờ và đặt lịch demo (giữ nguyên luồng đơn giản đã có ở Phase 8A — không cần thanh toán/video call thật)
Sau khi đặt lịch (mô phỏng đã tư vấn xong), liên kết trực tiếp tới luồng ở 9C mục 3: nút "Tải lên kết quả tư vấn" ngay trên trang chi tiết lịch hẹn, để đóng vòng lặp: đặt lịch → (giả lập tư vấn) → upload báo cáo → lộ trình được cập nhật


Kết quả cần có sau 9D: Luồng duyệt chuyên gia → xem đánh giá/chứng chỉ → đặt lịch → upload báo cáo sau tư vấn chạy trọn vẹn, đủ để demo toàn bộ vòng lặp "khám thật bổ sung ngữ cảnh cho app".


9E — Tự đặt lộ trình riêng (Custom roadmap)

Nhiệm vụ:


Trang CustomRoadmapPage: cho phép người dùng bỏ qua lộ trình tự sinh (9A), tự nhập: mục tiêu chính, số ngày mong muốn, danh sách việc muốn làm mỗi ngày (tự gõ, không giới hạn theo database)
Khi lưu, chạy validate nhẹ bằng matchEngine.js: nếu việc người dùng tự nhập trùng với item bị gắn cờ "nên tránh" theo hồ sơ (ví dụ tự thêm "dùng kem có dầu dừa" trong khi da dầu) → hiện cảnh báo mềm, KHÔNG chặn, chỉ nhắc: "Mục này có thể không phù hợp với hồ sơ da dầu của bạn — vẫn muốn thêm vào lộ trình?"
Lưu với "source": "user_custom" trong bảng roadmaps (9A)


Kết quả cần có sau 9E: Người dùng có 2 lựa chọn song song — dùng lộ trình hệ thống tự sinh, hoặc tự thiết kế và vẫn được cảnh báo nhẹ nếu có xung đột với hồ sơ.


Tính năng tiện ích bổ sung (tuỳ chọn, làm nếu còn dư thời gian sau 9A-9E)


Xuất báo cáo lộ trình + lịch sử điểm danh dạng PDF — để người dùng mang theo khi đi khám bác sĩ thật (đảo chiều luồng dữ liệu: từ app ra bác sĩ, bổ trợ cho luồng 9D đang đi từ bác sĩ vào app)
Nhắc nhở điểm danh hằng ngày — cần chuyển app sang PWA trước (đã ghi ở Phase 7, Nhóm 4) vì trình duyệt thường chặn notification nếu app chưa được cài như PWA
Chia sẻ lộ trình với người thân/bạn bè (tuỳ chọn bật/tắt) — tăng động lực duy trì, không bắt buộc
Biểu đồ so sánh ảnh khuôn mặt trước/sau theo mốc thời gian — CHỈ làm nếu 9C đã có đầy đủ consent + cơ chế xoá, vì đây là tính năng nhạy cảm nhất trong toàn bộ Phase 9



Ghi chú áp dụng chung cho Phase 9


Giữ nguyên nguyên tắc gốc: matchEngine.js (rule-based) vẫn là nguồn quyết định chính; Gemini chỉ hỗ trợ giải thích/trích xuất thông tin, không tự ý "chẩn đoán"
Mọi màn hình liên quan ảnh khuôn mặt/bệnh lý/báo cáo bác sĩ đều phải có dòng chữ rõ ràng: "Thông tin tham khảo, không thay thế tư vấn y tế chuyên môn"
Nếu thời gian không đủ làm hết 9A-9E, thứ tự ưu tiên đề xuất: 9A → 9B → 9E → 9D → 9C (lộ trình + điểm danh là phần thể hiện tác động hành vi rõ nhất cho tiêu chí CTP; 9C nhạy cảm nhất nên để cuối, chỉ làm nếu chắc chắn xử lý được phần consent/bảo mật đàng hoàng)