import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import bcrypt from 'bcrypt'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import config from './config/env.js'
import { initDatabase } from './db/connection.js'
import { seed, seedExperts, seedSponsoredContent, seedVenuesAndVouchers } from './db/seed.js'
import { listSkincareItems } from './services/itemService.js'
import { listExperts } from './services/expertService.js'
import { listHomepageAds } from './services/sponsoredContentService.js'
import { seedExpertAccounts } from './services/expertAccountService.js'
import { listVenues } from './services/venueService.js'
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js'
import { generalLimiter } from './middleware/rateLimit.js'
import authRoutes from './routes/auth.routes.js'
import profileRoutes from './routes/profile.routes.js'
import itemsRoutes from './routes/items.routes.js'
import scanRoutes from './routes/scan.routes.js'
import explainRoutes from './routes/explain.routes.js'
import chatRoutes from './routes/chat.routes.js'
import expertsRoutes from './routes/experts.routes.js'
import expertPortalRoutes from './routes/expertPortal.routes.js'
import reviewRoutes from './routes/review.routes.js'
import sponsoredRoutes from './routes/sponsored.routes.js'
import venuesRoutes from './routes/venues.routes.js'
import vouchersRoutes from './routes/vouchers.routes.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const clientDistPath = path.resolve(__dirname, '../../dist')
const clientIndexPath = path.join(clientDistPath, 'index.html')
const hasClientBuild = fs.existsSync(clientIndexPath)

await initDatabase()

if ((await listSkincareItems()).length === 0) {
  const { skincareCount, foodCount } = await seed()
  console.log(`[db] Đã tự động seed dữ liệu ban đầu: ${skincareCount} skincare, ${foodCount} food.`)
}

let experts = await listExperts()
if (experts.length === 0) {
  const { expertsCount } = await seedExperts()
  console.log(`[db] Đã tự động seed dữ liệu chuyên gia mẫu (demo): ${expertsCount} chuyên gia.`)
  experts = await listExperts()
}
if (experts.length > 0) {
  await seedExpertAccounts(experts.map((e) => e.id))
  console.log(`[db] Đã tự động seed tài khoản đăng nhập demo cho ${experts.length} chuyên gia (mật khẩu: demo1234).`)
}

if ((await listHomepageAds()).length === 0) {
  const { productsCount, adsCount } = await seedSponsoredContent()
  console.log(`[db] Đã tự động seed dữ liệu tiếp thị liên kết mẫu (demo): ${productsCount} sản phẩm, ${adsCount} quảng cáo.`)
}

if ((await listVenues()).length === 0) {
  const { venuesCount, servicesCount, vouchersCount } = await seedVenuesAndVouchers()
  console.log(`[db] Đã tự động seed dữ liệu Dịch Vụ Quanh Bạn (demo): ${venuesCount} trung tâm, ${servicesCount} dịch vụ, ${vouchersCount} voucher.`)
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
app.use('/api/experts', expertsRoutes)
app.use('/api/expert-portal', expertPortalRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/sponsored', sponsoredRoutes)
app.use('/api/venues', venuesRoutes)
app.use('/api/vouchers', vouchersRoutes)
app.use(express.static(path.join(process.cwd(), 'public')))
app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')))
app.use(cors())
app.use(
  '/uploads',
  (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin') 
    next()
  },
  express.static(path.join(process.cwd(), 'public/uploads'))
)

if (hasClientBuild) {
  app.use(express.static(clientDistPath))

  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api/') || path.extname(req.path) || !req.accepts('html')) {
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
  console.log(`[server] HEALTHY SKIN backend đang chạy tại http://localhost:${config.port}`)

  // "Làm nóng" bcrypt native (threadpool libuv) để request đăng ký/đăng nhập đầu tiên
  // của người dùng thật không phải gánh chi phí khởi tạo — chạy nền, không chặn gì cả.
  bcrypt.hash('warmup', 10).catch(() => { })
})
