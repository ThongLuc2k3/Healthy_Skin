-- Web đã bỏ Lộ trình/Điểm danh/Tiến độ (đi quá sâu vào tư vấn y tế), dọn bảng cũ khỏi DB dev cục bộ.
DROP TABLE IF EXISTS progress_milestones, checkins, roadmaps CASCADE;

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  terms_accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
  user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  skin_type TEXT NOT NULL DEFAULT '',
  allergies TEXT NOT NULL DEFAULT '[]',
  conditions TEXT NOT NULL DEFAULT '[]',
  goals TEXT NOT NULL DEFAULT '[]',
  skin_type_note TEXT NOT NULL DEFAULT '',
  allergies_note TEXT NOT NULL DEFAULT '',
  conditions_note TEXT NOT NULL DEFAULT '',
  goals_note TEXT NOT NULL DEFAULT '',
  consent_given_at TIMESTAMPTZ,
  face_photo_path TEXT,
  face_photo_mime TEXT,
  diagnosed_conditions TEXT NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS skincare_ingredients (
  id TEXT PRIMARY KEY, name_vi TEXT NOT NULL, name_en TEXT,
  category TEXT NOT NULL DEFAULT 'skincare', flags TEXT NOT NULL DEFAULT '[]',
  conflicts_with_skin_type TEXT NOT NULL DEFAULT '[]',
  explanation_vi TEXT NOT NULL, source TEXT
);

CREATE TABLE IF NOT EXISTS food_items (
  id TEXT PRIMARY KEY, name_vi TEXT NOT NULL, name_en TEXT,
  category TEXT NOT NULL DEFAULT 'food', flags TEXT NOT NULL DEFAULT '[]',
  conflicts_with_allergy TEXT NOT NULL DEFAULT '[]',
  conflicts_with_condition TEXT NOT NULL DEFAULT '[]',
  explanation_vi TEXT NOT NULL, source TEXT
);

CREATE TABLE IF NOT EXISTS scan_history (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  matched_item_id TEXT, matched_item_category TEXT, ocr_raw_text TEXT,
  product_name TEXT, result TEXT, reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_scan_history_user ON scan_history(user_id);

CREATE TABLE IF NOT EXISTS expert_reports (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL, file_mime TEXT NOT NULL, original_name TEXT,
  source TEXT NOT NULL DEFAULT 'user_upload',
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_expert_reports_user ON expert_reports(user_id);

CREATE TABLE IF NOT EXISTS experts (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, specialty TEXT NOT NULL,
  clinic_name TEXT NOT NULL, area_vi TEXT NOT NULL, bio_vi TEXT NOT NULL,
  certifications TEXT NOT NULL DEFAULT '[]', rating_avg REAL NOT NULL DEFAULT 0,
  reviews TEXT NOT NULL DEFAULT '[]', available_slots TEXT NOT NULL DEFAULT '[]',
  consultation_fee_vnd INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE experts ADD COLUMN IF NOT EXISTS consultation_fee_vnd INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS expert_bookings (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expert_id TEXT NOT NULL REFERENCES experts(id), slot TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'booked',
  consultation_report_id BIGINT REFERENCES expert_reports(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_expert_bookings_user ON expert_bookings(user_id);

-- Tài khoản đăng nhập demo cho chuyên gia (mật khẩu seed cố định, xem seedExpertAccounts) —
-- để bác sĩ có thể xem hồ sơ đã gửi và nhắn tin với người dùng qua Expert Dashboard.
CREATE TABLE IF NOT EXISTS expert_accounts (
  id BIGSERIAL PRIMARY KEY,
  expert_id TEXT NOT NULL REFERENCES experts(id),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Mỗi lịch hẹn mở một thread tư vấn — profile_snapshot lưu lại hồ sơ cá nhân tại thời điểm người
-- dùng đồng ý gửi cho chuyên gia xem trước, không đồng bộ theo hồ sơ mới nhất về sau.
CREATE TABLE IF NOT EXISTS consultation_threads (
  id BIGSERIAL PRIMARY KEY,
  booking_id BIGINT NOT NULL UNIQUE REFERENCES expert_bookings(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending_review',
  profile_snapshot TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS consultation_messages (
  id BIGSERIAL PRIMARY KEY,
  thread_id BIGINT NOT NULL REFERENCES consultation_threads(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL,
  text TEXT,
  image_path TEXT,
  image_mime TEXT,
  recommended_product_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_consultation_messages_thread ON consultation_messages(thread_id);

-- Gói Trợ Lý + ví nạp tiền (demo, không tích hợp cổng thanh toán thật). balance_vnd và
-- loyalty_points chỉ là số đếm nội bộ, nạp/trừ qua route mock trong chat.routes.js.
CREATE TABLE IF NOT EXISTS user_wallets (
  user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  balance_vnd INTEGER NOT NULL DEFAULT 0,
  loyalty_points INTEGER NOT NULL DEFAULT 0,
  plan_id TEXT NOT NULL DEFAULT 'free',
  purchased_questions_remaining INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_usage_log (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  question_count INTEGER NOT NULL DEFAULT 0,
  charged_vnd INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, date)
);

-- Catalog sản phẩm tiếp thị liên kết (demo) — dùng để gợi ý "sản phẩm liên quan/tốt hơn" ở trang
-- Quét sản phẩm và trong luồng tư vấn chuyên gia. Chưa có đối tác thật, seed vài mục demo có nhãn rõ.
CREATE TABLE IF NOT EXISTS sponsored_products (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, brand TEXT,
  matched_item_id TEXT, price_vnd INTEGER, affiliate_url TEXT NOT NULL,
  sponsor_name TEXT NOT NULL, active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Dải quảng cáo "Nhà bán hàng uy tín" trên trang chủ (demo), luôn gắn nhãn Quảng cáo/Liên kết tiếp thị.
CREATE TABLE IF NOT EXISTS homepage_ads (
  id BIGSERIAL PRIMARY KEY,
  sponsor_name TEXT NOT NULL, image_url TEXT NOT NULL, link_url TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE, priority INTEGER NOT NULL DEFAULT 0
);

-- Tab "Dịch Vụ Quanh Bạn": đặt dịch vụ tại trung tâm đối tác (spa, phòng khám, gym...), giá cố định
-- do chính trung tâm niêm yết, web chỉ là trung gian và ăn hoa hồng (demo, không phải đối tác thật).
CREATE TABLE IF NOT EXISTS partner_venues (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL,
  address_vi TEXT NOT NULL, area_vi TEXT NOT NULL,
  description_vi TEXT NOT NULL, cover_image_url TEXT
);

CREATE TABLE IF NOT EXISTS partner_services (
  id BIGSERIAL PRIMARY KEY,
  venue_id TEXT NOT NULL REFERENCES partner_venues(id) ON DELETE CASCADE,
  name_vi TEXT NOT NULL, price_vnd INTEGER NOT NULL, duration_minutes INTEGER
);

-- Kho voucher: mỗi voucher là một "mẫu" giảm giá; user_vouchers ghi nhận ai đang sở hữu bản nào,
-- lấy được qua đổi điểm tích luỹ / chơi minigame Skin Lab / mua Gói Trợ Lý (xem obtained_via).
CREATE TABLE IF NOT EXISTS vouchers (
  id TEXT PRIMARY KEY, title_vi TEXT NOT NULL, discount_type TEXT NOT NULL,
  discount_value INTEGER NOT NULL, venue_id TEXT REFERENCES partner_venues(id),
  points_cost INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'points'
);

CREATE TABLE IF NOT EXISTS user_vouchers (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  voucher_id TEXT NOT NULL REFERENCES vouchers(id),
  obtained_via TEXT NOT NULL,
  used_at TIMESTAMPTZ,
  obtained_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_user_vouchers_user ON user_vouchers(user_id);

CREATE TABLE IF NOT EXISTS venue_bookings (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_id BIGINT NOT NULL REFERENCES partner_services(id),
  user_voucher_id BIGINT REFERENCES user_vouchers(id),
  scheduled_at TIMESTAMPTZ NOT NULL, final_price_vnd INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_payment',
  invoice_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_venue_bookings_user ON venue_bookings(user_id);

CREATE TABLE IF NOT EXISTS website_reviews (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  rating INTEGER CHECK(rating >= 1 AND rating <= 5) DEFAULT 5,
  title TEXT NOT NULL, content TEXT NOT NULL, image_path TEXT, image_mime TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
