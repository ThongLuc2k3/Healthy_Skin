import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import bcrypt from 'bcrypt'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import config from './config/env.js'
import { seed, seedExperts } from './db/seed.js'
import { listSkincareItems } from './services/itemService.js'
import { listExperts } from './services/expertService.js'
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js'
import { generalLimiter } from './middleware/rateLimit.js'
import authRoutes from './routes/auth.routes.js'
import profileRoutes from './routes/profile.routes.js'
import itemsRoutes from './routes/items.routes.js'
import scanRoutes from './routes/scan.routes.js'
import explainRoutes from './routes/explain.routes.js'
import chatRoutes from './routes/chat.routes.js'
import roadmapRoutes from './routes/roadmap.routes.js'
import checkinRoutes from './routes/checkin.routes.js'
import expertsRoutes from './routes/experts.routes.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const clientDistPath = path.resolve(__dirname, '../../dist')
const clientIndexPath = path.join(clientDistPath, 'index.html')
const hasClientBuild = fs.existsSync(clientIndexPath)

if (listSkincareItems().length === 0) {
  const { skincareCount, foodCount } = seed()
  console.log(`[db] Đã tự động seed dữ liệu ban đầu: ${skincareCount} skincare, ${foodCount} food.`)
}

if (listExperts().length === 0) {
  const { expertsCount } = seedExperts()
  console.log(`[db] Đã tự động seed dữ liệu chuyên gia mẫu (demo): ${expertsCount} chuyên gia.`)
}

const app = express()
app.set('trust proxy', 1)

function isLoopbackOrigin(origin) {
  try {
    const url = new URL(origin)
    return ['localhost', '127.0.0.1'].includes(url.hostname)
  } catch {
    return false
  }
}

app.use(helmet())
const corsMiddleware = cors({
  origin(origin, callback) {
    // Cho phép request không có Origin (curl, healthcheck, server-to-server)
    // và nhiều cổng localhost khi Vite tự tăng port do cổng mặc định đang bận.
    if (!origin || config.corsOrigins.includes(origin) || isLoopbackOrigin(origin)) {
      callback(null, true)
      return
    }
    callback(new Error(`CORS origin không được phép: ${origin}`))
  },
})

app.use((req, res, next) => {
  const origin = req.get('origin')
  const requestOrigin = `${req.protocol}://${req.get('host')}`

  if (!origin || origin === requestOrigin) {
    next()
    return
  }

  corsMiddleware(req, res, next)
})
app.use(express.json({ limit: '50kb' }))
app.use('/api', generalLimiter)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/auth', authRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/items', itemsRoutes)
app.use('/api/scan', scanRoutes)
app.use('/api/explain', explainRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/roadmap', roadmapRoutes)
app.use('/api/checkin', checkinRoutes)
app.use('/api/experts', expertsRoutes)

if (hasClientBuild) {
  app.use(express.static(clientDistPath))

  app.get(/^(?!\/api\/).*/, (req, res, next) => {
    if (req.method !== 'GET' || path.extname(req.path) || !req.accepts('html')) {
      next()
      return
    }

    res.sendFile(clientIndexPath, (error) => {
      if (error) next(error)
    })
  })
}

app.use(notFoundHandler)
app.use(errorHandler)

app.listen(config.port, () => {
  console.log(`[server] DA DƯỠNG backend đang chạy tại http://localhost:${config.port}`)

  // "Làm nóng" bcrypt native (threadpool libuv) để request đăng ký/đăng nhập đầu tiên
  // của người dùng thật không phải gánh chi phí khởi tạo — chạy nền, không chặn gì cả.
  bcrypt.hash('warmup', 10).catch(() => { })
})
