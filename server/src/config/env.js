import 'dotenv/config'

const defaultCorsOrigins = ['http://localhost:5173', 'http://localhost:5174']
const corsOrigins = (process.env.CORS_ORIGIN || defaultCorsOrigins.join(','))
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const config = {
  port: Number(process.env.PORT) || 4000,
  jwtSecret: process.env.JWT_SECRET || 'da_duong_dev_secret_change_me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  dbPath: process.env.DB_PATH || './data/da_duong.sqlite',
  corsOrigins,
}

if (!process.env.JWT_SECRET) {
  console.warn(
    '[config] JWT_SECRET chưa được cấu hình trong .env — đang dùng giá trị mặc định KHÔNG an toàn cho production.',
  )
}

if (!config.geminiApiKey) {
  console.warn(
    '[AI] GEMINI_API_KEY chưa được cấu hình — endpoint /api/scan sẽ trả lỗi 503 cho đến khi thiết lập trong server/.env.',
  )
}

export default config
