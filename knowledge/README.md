# Kho tri thức RAG TLUCS

Mỗi tài liệu có metadata `domain`, `risk_level`, `authority`, `reviewed_at`, `tags` và cây H1/H2/H3.
Pipeline chuẩn hóa truy vấn, mở rộng ý định bằng JSON, hybrid ranking và chỉ trả kết quả có confidence
từ 85% trở lên. Nếu không đạt ngưỡng, Agent phải nói chưa biết thay vì ghép nội dung gần nghĩa.

Embedding vector và reranker có thể nối vào sau khi cấu hình provider; pipeline hiện chạy nội bộ.
