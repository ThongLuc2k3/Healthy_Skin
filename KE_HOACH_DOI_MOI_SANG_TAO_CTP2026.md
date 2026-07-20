# Kế hoạch bổ sung & tích hợp Đổi mới sáng tạo — Dự án DA DƯỠNG
## Đáp ứng "Thể lệ chương trình đào tạo — Thúc đẩy năng lực đổi mới sáng tạo gắn với phát triển bền vững" (2026)

> Tài liệu này để giao việc cho AI/con người thực hiện tiếp. Mỗi task có Input/Output/Cách làm rõ
> ràng để một AI khác (hoặc thành viên nhóm) có thể cầm lên làm ngay không cần hỏi lại ngữ cảnh.
>
> **Deadline nộp bài: hết ngày Chủ nhật 02/08/2026** (13 ngày kể từ 20/07/2026).
> **Nhóm**: 6 IT, 1 Luật, 2 Hóa, 1 Sinh, 2 Nông sản — 12 người.
> **Sản phẩm nền**: DA DƯỠNG — nền tảng cá nhân hóa chăm sóc da & dinh dưỡng (rule-based
> matching + quét ảnh thật qua Gemini API). Xem `README.md`, `ROADMAP.md`, `Build.md` để biết chi
> tiết kỹ thuật hiện có (đăng ký/đăng nhập JWT, hồ sơ cơ địa, quét ảnh, gợi ý, đặt lịch chuyên gia,
> check-in/streak, roadmap cá nhân hóa...).

---

## Mục lục hành động nhanh

### File AI đã tạo ngay trong repo

- `ctp2026/CHECKLIST_THUC_THI_CTP2026.md`
- `ctp2026/WS2_SBMC_DRAFT.md`
- `ctp2026/WS5_KIEM_THU_TU_DONG.md`
- `ctp2026/WS7_OUTLINE_PITCH_DECK.md`
- `ctp2026/WS8_KICH_BAN_VIDEO_90S.md`
- `ctp2026/WS10_KHUNG_VAI_TRO_DOI_NGU.md`
- `ctp2026/WS10_CAU_HOI_PHAN_BIEN.md`
- `ctp2026/WS11_CHECKLIST_NOP_BAI.md`

### 3 việc phải chốt trước khi làm tiếp

1. Điền `mã số nhóm`, danh sách 12 thành viên và đóng góp thật.
2. Quyết định phiên bản mô hình doanh thu sẽ mang đi pitch.
3. Bổ sung số liệu thị trường/đối thủ có nguồn trích dẫn cho `WS1`.

### Tình trạng thực thi hiện tại

- Đã làm xong phần AI không cần web hoặc số liệu bịa: `WS2.1`, `WS7.1`, `WS8.1`, `WS10.1`,
  `WS10.2`, `WS11.1`, tóm tắt backlog.
- Chưa làm được `WS1` và phần giá dịch vụ hiện tại của `WS6` vì phiên này không có web access.
- Chưa chạy được `npm run test`, `npm run lint`, `npm run build` vì môi trường shell hiện tại thiếu
  `node`/`npm` trong `PATH`.

---

## Prompt khởi động dùng cho AI thực thi

> Copy nguyên câu dưới đây làm prompt đầu tiên khi giao file này cho một AI khác (Claude, ChatGPT...)
> để bắt đầu thực thi:

```
Đọc file KE_HOACH_DOI_MOI_SANG_TAO_CTP2026.md trong dự án này. Đây là kế hoạch task đã được chia
theo workstream (WS1-WS11) để hoàn thiện hồ sơ dự án DA DƯỠNG nộp cho chương trình CTP 2026, mỗi
task có Input/Output/Cách làm/Ai làm (AI hay Người) rõ ràng. Hãy làm lần lượt từng task được đánh
dấu "AI" hoặc "AI ... Người xác nhận" theo đúng thứ tự workstream trong mục Timeline, dùng dữ liệu
thật có trong repo (README.md, ROADMAP.md, Build.md, src/, server/) làm input — không bịa số liệu
sản phẩm. Với mỗi task: nêu rõ đang làm task nào (ID), tạo output theo đúng định dạng đã mô tả, lưu
thành file trong dự án. Nếu gặp task cần Input chỉ người mới cung cấp được (mã số nhóm, tên thành
viên, giả định kinh doanh, số liệu khảo sát thật...), dừng lại và hỏi tôi trực tiếp thay vì tự bịa.
Bỏ qua các task được đánh dấu hoàn toàn "Người" (quay video, thiết kế slide, deploy, nộp form...) —
chỉ nhắc tôi rằng task đó cần tôi tự làm. Sau khi xong mỗi workstream, tóm tắt ngắn gọn đã tạo ra gì
và task tiếp theo là gì.
```

---

## 0. Đối chiếu yêu cầu ↔ hiện trạng dự án (gap analysis)

| Yêu cầu trong Thể lệ | Hiện trạng DA DƯỠNG | Việc cần bổ sung |
| --- | --- | --- |
| SBMC — Khung mô hình kinh doanh tạo tác động xã hội | Chưa có văn bản chính thức | Soạn mới (WS2) |
| Pitch Deck ≤ 11 trang | Chưa có | Soạn mới (WS7) |
| Video ≤ 1p30 | Chưa có | Quay + dựng mới (WS8) |
| Hình ảnh sản phẩm (tùy chọn) | Có UI chạy được, chưa có ảnh chụp chỉn chu | Chụp/dựng (WS9) |
| Tiêu chí "Tính sáng tạo" | Ý tưởng đã rõ, chưa có so sánh đối thủ bằng văn bản | Nghiên cứu đối thủ (WS1) |
| Tiêu chí "Năng lực tổ chức" | Nhóm đã hình thành, chưa có phân vai trò bằng văn bản | Sơ đồ vai trò (WS10) |
| Tiêu chí "Hiệu quả kinh tế/tác động xã hội" | Chưa có số liệu tài chính/tác động | Mô hình tài chính + KPI tác động (WS6) |
| Tiêu chí "Thị trường tiềm năng" | Chưa có TAM/SAM/SOM | Nghiên cứu thị trường (WS1) |
| Tiêu chí "Ứng dụng công nghệ" | Đã có (Gemini API, rule-engine, backend thật) — cần trình bày rõ | Viết lại thành nội dung trình bày (WS7) |
| Tiêu chí "Mô hình kinh doanh tạo tác động xã hội" | Chưa rõ dòng tiền, đối tác | SBMC + tài chính (WS2, WS6) |
| Tiêu chí "Sản phẩm mẫu/prototype" | **Đã có, mạnh nhất trong các tiêu chí** — app chạy thật | Hoàn thiện, demo mượt cho video/pitch (WS5) |
| Lồng ghép SDGs / kỹ năng xanh (Giai đoạn 4) | Chưa gắn narrative | Gắn câu chuyện bền vững (WS2, mục 2.3) |
| Pháp lý dữ liệu sức khỏe cá nhân | Chưa rà soát | Rà soát tuân thủ (WS3) |

Kết luận: điểm mạnh nhất hiện tại là **prototype kỹ thuật đã chạy thật** (hiếm dự án SV có). Điểm
yếu nhất là **tài liệu hóa mô hình kinh doanh, dữ liệu thị trường/tài chính, và pháp lý** — đây là
nơi cần dồn lực trong 13 ngày.

---

## 1. Phân công theo chuyên môn (gợi ý)

| Chuyên môn | Số người | Vai trò chính trong đợt này |
| --- | --- | --- |
| IT (6) | 6 | Hoàn thiện prototype (WS5), quay demo kỹ thuật (WS8), dựng slide có yếu tố sản phẩm thật, hỗ trợ AI trích xuất số liệu từ code |
| Luật (1) | 1 | Rà soát pháp lý dữ liệu cá nhân/sức khỏe, disclaimer y tế, điều khoản sử dụng, rủi ro SBMC (WS3) |
| Hóa (2) | 2 | Thẩm định database thành phần mỹ phẩm, logic "phù hợp/cần cân nhắc/nên tránh" (WS4.1) |
| Sinh (1) | 1 | Thẩm định phân loại loại da/cơ địa, cơ sở da liễu học cho hồ sơ (WS4.2) |
| Nông sản (2) | 2 | Database thực phẩm/dinh dưỡng, gắn nguyên liệu nông sản Việt Nam → câu chuyện bền vững/SDGs (WS4.3, WS2.3) |

Mỗi workstream bên dưới đều ghi rõ **AI làm** (Claude/ChatGPT/công cụ AI khác) hay **Người làm**
(và chuyên môn nào), để bạn giao việc đúng người/đúng công cụ.

---

## 2. Timeline tổng (20/07 → 02/08/2026)

| Ngày | Việc trọng tâm |
| --- | --- |
| 20–21/07 (D1-2) | WS1 (thị trường), WS2 (SBMC draft) — AI làm trước, người review |
| 21–24/07 (D2-5) | WS3 (pháp lý), WS4 (thẩm định khoa học), WS5 (hoàn thiện prototype) song song |
| 24–27/07 (D5-8) | WS6 (tài chính), WS7 (pitch deck), WS10 (vai trò nhóm) |
| 27–30/07 (D8-11) | WS8 (video), WS9 (hình ảnh) |
| 30/07–01/08 (D11-13) | Tập dượt thuyết trình, chỉnh sửa toàn bộ, kiểm tra định dạng file |
| 02/08 (Chủ nhật) | Nộp bài qua Google Form trước 23:59 |

---

## WS1 — Nghiên cứu thị trường & đối thủ cạnh tranh
*Phục vụ tiêu chí "Thị trường tiềm năng" và "Tính sáng tạo"*

| ID | Việc | Input | Output | Cách làm | Ai làm |
| --- | --- | --- | --- | --- | --- |
| 1.1 | Xác định TAM/SAM/SOM | Số liệu dân số Việt Nam 18-35 tuổi quan tâm chăm sóc da; báo cáo thị trường mỹ phẩm/dinh dưỡng VN (Q&Me, Statista, Euromonitor nếu có) | 1 slide + bảng số liệu TAM/SAM/SOM có nguồn trích dẫn | AI tìm kiếm web (WebSearch) các báo cáo công khai về quy mô thị trường mỹ phẩm/skincare VN, tính toán phễu: TAM = tổng người dùng smartphone quan tâm làm đẹp; SAM = người có nhu cầu cá nhân hóa; SOM = mục tiêu 12-24 tháng đầu. Ghi rõ giả định. | **AI** (cần internet access) — người kiểm tra lại số liệu trước khi đưa vào pitch |
| 1.2 | Phân tích đối thủ cạnh tranh | Tên các app/sản phẩm tương tự đã biết (vd: YouCam, app tư vấn da liễu online, Cocolux, Hasaki...) | Bảng so sánh 5-8 tiêu chí (cá nhân hóa, quét ảnh AI, tích hợp dinh dưỡng, giá, dữ liệu VN...) × 4-6 đối thủ, kèm 1 câu "lợi thế khác biệt của DA DƯỠNG" | AI tra cứu web mô tả tính năng công khai của từng đối thủ, tự lập bảng so sánh; đánh dấu ô nào DA DƯỠNG vượt trội (VD: **kết hợp da + dinh dưỡng trong 1 hồ sơ duy nhất** — điểm không đối thủ nào có) | **AI**, người xác nhận tính chính xác thông tin đối thủ |
| 1.3 | Khảo sát nhanh nhu cầu người dùng (nếu kịp) | Bảng câu hỏi Google Form ngắn (5-7 câu) gửi 30-50 người quen | Số liệu % người gặp khó khăn chọn sản phẩm da/thực phẩm phù hợp cơ địa | AI soạn bộ câu hỏi khảo sát; **người thật phân phối khảo sát và thu thập phản hồi** (không thể tự động hóa việc mời người trả lời) | **Người** thực hiện phân phối; AI soạn câu hỏi + phân tích kết quả sau khi có dữ liệu |

---

## WS2 — Khung mô hình kinh doanh tạo tác động xã hội (SBMC)
*Tài liệu bắt buộc #1 — file `Mã số nhóm_SBMC`*

| ID | Việc | Input | Output | Cách làm | Ai làm |
| --- | --- | --- | --- | --- | --- |
| 2.1 | Soạn draft đầy đủ khung SBMC | README.md, ROADMAP.md, Build.md (mô tả sản phẩm); kết quả WS1 (thị trường/đối thủ) | Văn bản SBMC đầy đủ các ô: Vấn đề xã hội, Đối tượng thụ hưởng, Giải pháp giá trị, Kênh phân phối, Quan hệ khách hàng, Nguồn thu, Cơ cấu chi phí, Đối tác chính, Hoạt động chính, Nguồn lực chính, **Tác động xã hội & đo lường tác động** | AI đọc tài liệu kỹ thuật hiện có, tự ánh xạ vào từng ô khung SBMC theo mẫu chuẩn (Ashoka/Yunus Social Business Canvas hoặc mẫu do BTC cấp — hỏi BTC nếu có file mẫu riêng). Vấn đề xã hội gợi ý: người tiêu dùng chọn sai sản phẩm da/thực phẩm do thiếu hiểu biết cơ địa → lãng phí tiền, tác dụng phụ, rác thải mỹ phẩm dùng dở. | **AI** viết draft đầy đủ; **người (leader/luật)** review tính logic & rủi ro pháp lý ở ô nguồn thu |
| 2.2 | Định lượng chỉ số tác động xã hội (Impact KPI) | Draft SBMC ở 2.1 | 3-5 chỉ số đo lường được (VD: % giảm sản phẩm mua sai/lãng phí, số người tiếp cận tư vấn miễn phí/tháng, số nông sản Việt được giới thiệu qua nền tảng) | AI đề xuất KPI dựa trên logic sản phẩm; **người (nông sản + sinh)** xác nhận tính khả thi đo lường thực tế | **AI đề xuất, người xác nhận** |
| 2.3 | Gắn câu chuyện phát triển bền vững/SDGs | Nội dung Giai đoạn 4 trong Thể lệ (SDGs, kỹ năng xanh) | Đoạn văn 150-200 từ nêu rõ DA DƯỠNG liên quan SDG nào (gợi ý: SDG 3 - Sức khỏe tốt; SDG 12 - Tiêu dùng có trách nhiệm, giảm lãng phí mỹ phẩm/thực phẩm mua sai; SDG 2/8 - hỗ trợ đầu ra nông sản Việt qua gợi ý dinh dưỡng) | AI soạn đoạn văn liên kết SDGs cụ thể với tính năng sản phẩm thật (không chung chung); người (nông sản) góp ý phần liên quan nông sản Việt | **AI** soạn, **người (nông sản)** duyệt phần nông sản |
| 2.4 | Đặt tên file đúng chuẩn | Mã số nhóm (BTC cấp) | File `[Mã số nhóm]_SBMC.pdf` hoặc theo định dạng BTC yêu cầu | Đổi tên file sau khi có mã số nhóm chính thức | **Người** (chỉ cần biết mã số nhóm, thao tác 1 phút) |

---

## WS3 — Pháp lý & tuân thủ dữ liệu
*Không phải tài liệu bắt buộc, nhưng ảnh hưởng "Năng lực tổ chức" và rủi ro bị hỏi khó khi thuyết trình*

| ID | Việc | Input | Output | Cách làm | Ai làm |
| --- | --- | --- | --- | --- | --- |
| 3.1 | Rà soát tuân thủ dữ liệu cá nhân/sức khỏe | Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân VN; luồng thu thập hồ sơ cơ địa + ảnh khuôn mặt trong sản phẩm (`server/uploads/face_photos`) | Checklist tuân thủ (đồng ý thu thập dữ liệu, lưu trữ ảnh mặt, quyền xóa dữ liệu người dùng, mã hóa) + danh sách rủi ro cần khắc phục | AI tóm tắt yêu cầu Nghị định 13 liên quan dữ liệu sinh trắc học/sức khỏe, đối chiếu với luồng hiện tại của app (ai xem review code/luồng thực tế); **người (Luật)** đưa ra kết luận cuối và văn bản chính thức vì đây là nhận định pháp lý cần chịu trách nhiệm | AI soạn checklist, **Người (Luật) kết luận & chịu trách nhiệm nội dung pháp lý** |
| 3.2 | Soạn disclaimer y tế/dinh dưỡng | Tính năng gợi ý da/thực phẩm hiện tại không thay thế tư vấn bác sĩ | Đoạn disclaimer ngắn dùng trong app, pitch deck, video ("Không thay thế chẩn đoán y khoa...") | AI soạn 2-3 phương án disclaimer; người (Luật + Sinh) chọn và tinh chỉnh câu chữ | **AI soạn, Người (Luật) chốt** |
| 3.3 | Rà soát rủi ro pháp lý trong mô hình doanh thu (SBMC) | Draft SBMC (WS2) | Ghi chú rủi ro (VD: affiliate với nhãn hàng cần công bố quảng cáo, thu phí dịch vụ tư vấn cần rõ trách nhiệm) | Người (Luật) đọc SBMC, đối chiếu quy định quảng cáo/thương mại điện tử VN | **Người (Luật)** — cần kiến thức luật thực tế, AI không đủ tin cậy để tự quyết |

---

## WS4 — Thẩm định khoa học nền tảng dữ liệu sản phẩm
*Phục vụ "Tính sáng tạo" (độ tin cậy vượt đối thủ) và chất lượng "Sản phẩm mẫu"*

### 4.1 — Hóa mỹ phẩm (phụ trách: 2 Hóa)

| ID | Việc | Input | Output | Cách làm | Ai làm |
| --- | --- | --- | --- | --- | --- |
| 4.1.1 | Kiểm tra logic phân loại "phù hợp/cần cân nhắc/nên tránh" | `src/data/skincare_ingredients.json`, `src/logic/matchEngine.js` | Danh sách các thành phần bị gán sai mức độ (nếu có) + đề xuất bổ sung thành phần phổ biến còn thiếu | AI liệt kê toàn bộ thành phần hiện có trong file JSON thành bảng dễ đọc; **người (Hóa)** đối chiếu kiến thức hóa mỹ phẩm thật (tương tác thành phần, nồng độ, độ pH) để xác nhận/sửa | AI trích xuất & trình bày dữ liệu, **Người (Hóa) thẩm định chuyên môn** |
| 4.1.2 | Viết đoạn giải thích khoa học cho pitch/video | Kết quả 4.1.1 | Đoạn 100-150 từ giải thích cơ sở khoa học đằng sau việc đối chiếu thành phần (để tăng độ tin cậy khi thuyết trình) | AI soạn dựa trên input người (Hóa) cung cấp | **Người (Hóa) cung cấp kiến thức, AI viết văn bản trình bày** |

### 4.2 — Da liễu/sinh học da (phụ trách: 1 Sinh)

| ID | Việc | Input | Output | Cách làm | Ai làm |
| --- | --- | --- | --- | --- | --- |
| 4.2.1 | Thẩm định các trường phân loại hồ sơ cơ địa | `src/data/profileOptions.js` | Xác nhận/đề xuất chỉnh các loại da, tình trạng da, cơ địa hiện có đã đúng chuẩn da liễu học phổ thông chưa | AI liệt kê các option hiện có thành bảng; **người (Sinh)** đối chiếu kiến thức sinh học da (loại da dầu/khô/hỗn hợp, các vấn đề da phổ biến) | AI trình bày dữ liệu, **Người (Sinh) thẩm định** |
| 4.2.2 | Viết luận điểm khoa học hỗ trợ "sáng tạo" trong pitch | Kết quả 4.2.1 | Đoạn văn ngắn nêu cơ sở khoa học của việc dùng "hồ sơ cơ địa dùng chung" cho cả da và dinh dưỡng (điểm khác biệt cốt lõi của DA DƯỠNG) | AI viết dựa trên góp ý người (Sinh) | **Người (Sinh) cung cấp luận điểm, AI viết văn bản** |

### 4.3 — Dinh dưỡng & nông sản (phụ trách: 2 Nông sản)

| ID | Việc | Input | Output | Cách làm | Ai làm |
| --- | --- | --- | --- | --- | --- |
| 4.3.1 | Kiểm tra & mở rộng database thực phẩm | `src/data/food_items.json` | Danh sách thực phẩm hiện có + đề xuất bổ sung thực phẩm/nông sản Việt Nam đặc trưng (rau củ quả theo mùa, đặc sản vùng miền) gắn với lợi ích cơ địa cụ thể | AI trích xuất danh sách hiện có; **người (Nông sản)** đề xuất bổ sung thực phẩm/nông sản Việt dựa kiến thức chuyên ngành, AI hỗ trợ soạn mô tả dinh dưỡng chuẩn hóa theo format JSON có sẵn | AI trích xuất & định dạng, **Người (Nông sản) đề xuất nội dung chuyên môn** |
| 4.3.2 | Xây câu chuyện "ứng dụng công nghệ hỗ trợ đầu ra nông sản Việt" | Kết quả 4.3.1, WS2.3 | Đoạn 100 từ cho pitch/SBMC: DA DƯỠNG giúp người dùng biết nông sản Việt phù hợp cơ địa mình → tăng nhận diện, hỗ trợ tiêu thụ nông sản trong nước | AI soạn dựa trên góp ý người (Nông sản) | **Người (Nông sản) cung cấp góc nhìn, AI viết văn bản** |

---

## WS5 — Hoàn thiện prototype kỹ thuật (phụ trách: 6 IT)
*Phục vụ trực tiếp tiêu chí "Sản phẩm mẫu/prototype" và "Ứng dụng công nghệ" — đây là thế mạnh có sẵn, ưu tiên làm mượt để quay video/demo trực tiếp*

| ID | Việc | Input | Output | Cách làm | Ai làm |
| --- | --- | --- | --- | --- | --- |
| 5.1 | Kiểm thử toàn bộ luồng người dùng chính | App hiện tại (`npm run dev:all`) | Danh sách bug/lỗi UI cần sửa trước khi quay demo | Chạy thử toàn bộ luồng: đăng ký → tạo hồ sơ → quét ảnh (Gemini) → xem gợi ý → đặt lịch chuyên gia → check-in. AI (Claude Code) có thể tự động rà lỗi console/log, chạy `npm run test`, `npm run lint`; **người (IT)** thao tác tay trên UI để phát hiện lỗi UX mà test tự động không bắt được | **AI** chạy test/lint tự động, **Người (IT)** kiểm thử UX thủ công |
| 5.2 | Sửa bug ưu tiên cao trước ngày quay video | Danh sách bug từ 5.1 | Code đã sửa, đã test lại | AI (Claude Code) có thể tự sửa các lỗi logic/code rõ ràng; **người (IT)** review và merge, quyết định lỗi nào bỏ qua vì hết thời gian | **AI sửa, Người (IT) review/merge** |
| 5.3 | Chuẩn bị dữ liệu demo "đẹp" (seed data) | Database hiện tại (SQLite) | Vài tài khoản demo có hồ sơ đầy đủ, lịch sử scan, streak đẹp để quay video không bị màn hình trống | AI viết script seed dữ liệu mẫu; **người (IT)** chạy và kiểm tra hiển thị | **AI viết script, Người (IT) chạy & xác nhận** |
| 5.4 | Kiểm tra deploy bản demo online (nếu cần link truy cập cho giám khảo) | `vercel.json`, cấu hình hiện tại | Link demo public chạy ổn định (frontend Vercel/Netlify + backend Render/Railway) | AI hỗ trợ viết hướng dẫn deploy dựa `HUONG_DAN_CHAY.md`; **người (IT)** thực hiện deploy thật (cần tài khoản, thao tác ngoài code) | **Người (IT) thực hiện**, AI hỗ trợ hướng dẫn |

---

## WS6 — Tài chính & hiệu quả kinh tế
*Phục vụ tiêu chí "Hiệu quả kinh tế hoặc tác động xã hội"*

| ID | Việc | Input | Output | Cách làm | Ai làm |
| --- | --- | --- | --- | --- | --- |
| 6.1 | Dự phóng doanh thu 3 kịch bản (thấp/vừa/cao) | Kết quả WS1 (TAM/SAM/SOM), mô hình nguồn thu trong SBMC (WS2) | Bảng dự phóng doanh thu 12-24 tháng, giả định rõ ràng (số user, tỷ lệ chuyển đổi freemium→trả phí, giá affiliate...) | AI xây dựng mô hình Excel/bảng tính đơn giản dựa giả định hợp lý có trích dẫn nguồn; **người (leader nhóm)** xác nhận giả định có thực tế không | **AI dựng mô hình, Người xác nhận giả định** |
| 6.2 | Ước tính chi phí vận hành | Chi phí Gemini API, hosting, nhân sự cơ bản | Bảng chi phí ước tính hàng tháng | AI ước tính dựa giá công khai (Gemini API pricing, Render/Vercel free tier giới hạn) | **AI** (có thể WebSearch giá dịch vụ hiện tại) |
| 6.3 | Tổng hợp thành 1-2 slide tài chính cho pitch deck | Kết quả 6.1, 6.2 | Slide "Mô hình tài chính" súc tích | AI tổng hợp thành dạng trình bày trực quan (bảng/số liệu chính) | **AI** |

---

## WS7 — Pitch Deck (≤ 11 trang)
*Tài liệu bắt buộc #2 — file `Mã số nhóm_Pitch Deck`*

| ID | Việc | Input | Output | Cách làm | Ai làm |
| --- | --- | --- | --- | --- | --- |
| 7.1 | Lên cấu trúc 11 trang | Toàn bộ kết quả WS1, WS2, WS4, WS5, WS6 | Outline 11 trang: (1) Vấn đề, (2) Giải pháp, (3) Demo sản phẩm/công nghệ, (4) Điểm khác biệt & sáng tạo, (5) Thị trường, (6) Mô hình kinh doanh (SBMC rút gọn), (7) Tác động xã hội & SDGs, (8) Tài chính, (9) Đối thủ cạnh tranh, (10) Đội ngũ, (11) Kêu gọi/tầm nhìn | AI tổng hợp tất cả nội dung workstream trước thành outline súc tích, đúng giới hạn 11 trang | **AI** tổng hợp draft đầy đủ |
| 7.2 | Thiết kế slide trực quan | Outline 7.1, ảnh sản phẩm (WS9) | File slide hoàn chỉnh (PowerPoint/Canva/Google Slides) | AI viết nội dung text từng slide chi tiết + gợi ý bố cục; **người (IT/thiết kế)** thao tác thiết kế trực quan trong Canva/PowerPoint (AI không thao tác trực tiếp phần mềm thiết kế) | **AI viết nội dung, Người thiết kế trình bày** |
| 7.3 | Rà soát tổng thể & giới hạn trang | Slide hoàn chỉnh | Bản final ≤ 11 trang, nhất quán văn phong | AI kiểm tra logic/tính nhất quán nội dung; **người (leader)** duyệt cuối trước khi xuất file | **AI rà soát, Người duyệt cuối** |

---

## WS8 — Video giới thiệu (≤ 1 phút 30 giây)
*Tài liệu bắt buộc #3 — file `Mã số nhóm_Video`*

| ID | Việc | Input | Output | Cách làm | Ai làm |
| --- | --- | --- | --- | --- | --- |
| 8.1 | Viết kịch bản video | Nội dung pitch (WS7), demo app hoàn thiện (WS5) | Kịch bản chi tiết theo giây (0-15s: vấn đề, 15-45s: demo sản phẩm quét ảnh + gợi ý, 45-70s: tác động xã hội, 70-90s: kêu gọi) | AI viết kịch bản khớp đúng 90 giây, kèm gợi ý hình ảnh/voice-over từng đoạn | **AI** viết kịch bản |
| 8.2 | Quay màn hình demo sản phẩm | App chạy thật (kết quả WS5) | File quay màn hình các thao tác chính (đăng ký, quét ảnh, xem gợi ý) | Dùng phần mềm quay màn hình (OBS/Loom) thao tác trực tiếp trên app | **Người (IT)** — cần thao tác tay thật trên máy |
| 8.3 | Quay/dựng phần con người (đội ngũ, giới thiệu) nếu có | Kịch bản 8.1 | Đoạn video có người thật xuất hiện (nếu kịch bản yêu cầu) | Quay bằng điện thoại/máy quay | **Người** — không thể AI hóa |
| 8.4 | Dựng video hoàn chỉnh + phụ đề + nhạc nền | Footage từ 8.2, 8.3 | Video hoàn chỉnh ≤ 1p30, có phụ đề | Dùng CapCut/Premiere ghép nối theo kịch bản; AI có thể hỗ trợ viết phụ đề chính xác từng dòng theo timing | **Người dựng, AI hỗ trợ viết phụ đề/thoại** |

---

## WS9 — Hình ảnh sản phẩm (tùy chọn)

| ID | Việc | Input | Output | Cách làm | Ai làm |
| --- | --- | --- | --- | --- | --- |
| 9.1 | Chụp/chọn ảnh chụp màn hình đẹp nhất | App demo (WS5) | 4-6 ảnh chụp màn hình chất lượng cao các trang chính (Hồ sơ, Quét ảnh, Kết quả gợi ý, Roadmap) | Người (IT) chụp màn hình ở màn hình lớn/responsive đẹp; AI hỗ trợ chọn trang nào nên chụp để nổi bật tính năng khác biệt | **Người (IT) chụp, AI gợi ý lựa chọn nội dung** |
| 9.2 | Dàn trang trình bày ảnh sản phẩm (nếu BTC cần file ảnh trình bày, không phải screenshot thô) | Ảnh từ 9.1 | 1 trang trình bày ảnh sản phẩm dạng mockup (điện thoại/laptop khung) | Dùng Canva/Figma mockup | **Người** thao tác thiết kế |

---

## WS10 — Vai trò đội ngũ & năng lực tổ chức
*Phục vụ tiêu chí "Năng lực tổ chức thực hiện" và Giai đoạn 5 (báo cáo/thuyết trình)*

| ID | Việc | Input | Output | Cách làm | Ai làm |
| --- | --- | --- | --- | --- | --- |
| 10.1 | Lập sơ đồ vai trò & phân công 12 thành viên | Danh sách 12 người theo chuyên môn | 1 slide/bảng: tên - chuyên môn - vai trò trong dự án - đóng góp cụ thể | AI dựng khung bảng chuẩn; **người (leader)** điền tên thật và mô tả đóng góp thực tế | **AI dựng khung, Người điền nội dung thật** |
| 10.2 | Chuẩn bị nội dung trả lời câu hỏi phản biện (Giai đoạn 3, mục 9) | Toàn bộ SBMC, pitch deck | Danh sách 15-20 câu hỏi giám khảo/doanh nhân có thể hỏi kèm gợi ý trả lời (về pháp lý, tài chính, kỹ thuật, khoa học) | AI tự sinh câu hỏi phản biện dựa các điểm yếu/rủi ro đã nêu trong tài liệu (đặc biệt pháp lý WS3, tài chính WS6); người từng chuyên môn chuẩn bị câu trả lời phần của mình | **AI sinh câu hỏi, Người (từng chuyên môn) chuẩn bị trả lời** |
| 10.3 | Tập dượt thuyết trình | Pitch deck + video hoàn chỉnh | Buổi tập dượt nội bộ, ghi nhận góp ý chỉnh sửa | Cần người thật thuyết trình, canh giờ, nhận phản hồi trực tiếp | **Người** — không thể AI hóa |

---

## WS11 — Tổng hợp & nộp bài

| ID | Việc | Input | Output | Cách làm | Ai làm |
| --- | --- | --- | --- | --- | --- |
| 11.1 | Kiểm tra định dạng & tên file theo đúng cú pháp BTC | Toàn bộ file: SBMC, Pitch Deck, Video, (ảnh) | Checklist: `[Mã nhóm]_SBMC`, `[Mã nhóm]_Pitch Deck` (≤11 trang), `[Mã nhóm]_Video` (≤1p30) | AI lập checklist kiểm tra tự động (đếm số trang, độ dài video); người xác nhận từng file đạt chuẩn | **AI kiểm tra định dạng, Người xác nhận cuối** |
| 11.2 | Nộp bài qua Google Form | Link form trong Thể lệ | Xác nhận đã nộp trước 23:59 02/08/2026 | Truy cập form, upload file | **Người** — cần tài khoản/thao tác nộp thật |

---

## Tóm tắt: việc AI có thể tự làm ngay (không cần chờ input người)

- WS1.1, 1.2 — nghiên cứu thị trường & đối thủ (cần quyền truy cập web)
- WS2.1 — draft đầy đủ khung SBMC
- WS5.1 (phần chạy test/lint tự động), 5.3 (viết script seed data)
- WS6 — toàn bộ mô hình tài chính draft
- WS7.1 — outline pitch deck 11 trang
- WS8.1 — kịch bản video theo giây
- WS10.1 (khung bảng), 10.2 — sinh câu hỏi phản biện

## Việc bắt buộc phải người thật làm (AI không thể thay thế)

- Mọi thẩm định chuyên môn cần chịu trách nhiệm: pháp lý (WS3), hóa mỹ phẩm (4.1.1), da liễu (4.2.1),
  nông sản (4.3.1) — AI chỉ hỗ trợ trình bày, không tự quyết định đúng/sai chuyên môn
- Quay video có người xuất hiện, thao tác tay trên UI (WS8.2, 8.3)
- Thiết kế trực quan slide/mockup trong phần mềm thiết kế (WS7.2, 9.2)
- Deploy thật, tập dượt thuyết trình, nộp bài qua form (WS5.4, 10.3, 11.2)
- Khảo sát người dùng thật (WS1.3)
- Điền tên/mã số nhóm thật, quyết định giả định kinh doanh cuối cùng
