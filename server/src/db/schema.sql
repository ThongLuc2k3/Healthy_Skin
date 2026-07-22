CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS profiles (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  skin_type TEXT NOT NULL DEFAULT '',
  allergies TEXT NOT NULL DEFAULT '[]',
  conditions TEXT NOT NULL DEFAULT '[]',
  goals TEXT NOT NULL DEFAULT '[]',
  skin_type_note TEXT NOT NULL DEFAULT '',
  allergies_note TEXT NOT NULL DEFAULT '',
  conditions_note TEXT NOT NULL DEFAULT '',
  goals_note TEXT NOT NULL DEFAULT '',
  consent_given_at TEXT,
  face_photo_path TEXT,
  face_photo_mime TEXT,
  diagnosed_conditions TEXT NOT NULL DEFAULT '[]',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS skincare_ingredients (
  id TEXT PRIMARY KEY,
  name_vi TEXT NOT NULL,
  name_en TEXT,
  category TEXT NOT NULL DEFAULT 'skincare',
  flags TEXT NOT NULL DEFAULT '[]',
  conflicts_with_skin_type TEXT NOT NULL DEFAULT '[]',
  explanation_vi TEXT NOT NULL,
  source TEXT
);

CREATE TABLE IF NOT EXISTS food_items (
  id TEXT PRIMARY KEY,
  name_vi TEXT NOT NULL,
  name_en TEXT,
  category TEXT NOT NULL DEFAULT 'food',
  flags TEXT NOT NULL DEFAULT '[]',
  conflicts_with_allergy TEXT NOT NULL DEFAULT '[]',
  conflicts_with_condition TEXT NOT NULL DEFAULT '[]',
  explanation_vi TEXT NOT NULL,
  source TEXT
);

CREATE TABLE IF NOT EXISTS scan_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  matched_item_id TEXT,
  matched_item_category TEXT,
  ocr_raw_text TEXT,
  product_name TEXT,
  result TEXT,
  reason TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_scan_history_user ON scan_history(user_id);

CREATE TABLE IF NOT EXISTS roadmaps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  duration_days INTEGER NOT NULL,
  source TEXT NOT NULL DEFAULT 'auto_generated',
  status TEXT NOT NULL DEFAULT 'active',
  daily_plan TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_roadmaps_user ON roadmaps(user_id);

CREATE TABLE IF NOT EXISTS checkins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  roadmap_id INTEGER REFERENCES roadmaps(id) ON DELETE SET NULL,
  date TEXT NOT NULL,
  skincare_done INTEGER NOT NULL DEFAULT 0,
  skincare_tasks_completed TEXT NOT NULL DEFAULT '[]',
  skincare_photo_path TEXT,
  skincare_photo_mime TEXT,
  meal_logged INTEGER NOT NULL DEFAULT 0,
  meal_description TEXT NOT NULL DEFAULT '',
  meal_photo_path TEXT,
  meal_photo_mime TEXT,
  note TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_checkins_user_date ON checkins(user_id, date);

-- Dữ liệu sức khoẻ nhạy cảm (9C) — mỗi báo cáo/kết quả khám là 1 file người dùng tự tải lên,
-- KHÔNG tự động phân tích/chẩn đoán, chỉ lưu trữ và cho phép xoá vĩnh viễn bất kỳ lúc nào.
CREATE TABLE IF NOT EXISTS expert_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_mime TEXT NOT NULL,
  original_name TEXT,
  source TEXT NOT NULL DEFAULT 'user_upload',
  uploaded_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_expert_reports_user ON expert_reports(user_id);

-- 9D: dữ liệu chuyên gia là DỮ LIỆU MẪU dựng cho demo, KHÔNG phải mạng lưới đối tác
-- đã ký kết thật — verified mặc định false, chỉ đổi true nếu thật sự xác minh được.
CREATE TABLE IF NOT EXISTS experts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  clinic_name TEXT NOT NULL,
  area_vi TEXT NOT NULL,
  bio_vi TEXT NOT NULL,
  certifications TEXT NOT NULL DEFAULT '[]',
  rating_avg REAL NOT NULL DEFAULT 0,
  reviews TEXT NOT NULL DEFAULT '[]',
  available_slots TEXT NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS expert_bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expert_id TEXT NOT NULL REFERENCES experts(id),
  slot TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'booked',
  consultation_report_id INTEGER REFERENCES expert_reports(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_expert_bookings_user ON expert_bookings(user_id);

CREATE TABLE IF NOT EXISTS website_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  rating INTEGER CHECK(rating >= 1 AND rating <= 5) DEFAULT 5,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

