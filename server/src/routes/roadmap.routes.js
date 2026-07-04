import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { getProfile } from '../services/profileService.js'
import { createRoadmap, createCustomRoadmap, getCurrentRoadmap, setTaskDone } from '../services/roadmapService.js'

const router = Router()

const MAX_DURATION_DAYS = 60

function sanitizeDurationDays(value) {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return undefined
  return Math.min(Math.round(n), MAX_DURATION_DAYS)
}

router.post('/generate', requireAuth, (req, res) => {
  const profile = getProfile(req.userId)
  if (!profile.skinType) {
    return res.status(400).json({ error: 'Vui lòng khai báo hồ sơ cơ địa trước khi tạo lộ trình.' })
  }

  const durationDays = sanitizeDurationDays(req.body?.durationDays)
  const roadmap = createRoadmap(req.userId, profile, durationDays)
  res.status(201).json(roadmap)
})

router.get('/current', requireAuth, (req, res) => {
  const roadmap = getCurrentRoadmap(req.userId)
  if (!roadmap) {
    return res.status(404).json({ error: 'Chưa có lộ trình nào đang hoạt động.' })
  }
  res.json(roadmap)
})

const MAX_CUSTOM_TASKS = 20
const MAX_TASK_LENGTH = 200
const MAX_GOAL_LENGTH = 200

// 9E: người dùng bỏ qua lộ trình tự sinh (9A), tự nhập việc muốn làm mỗi ngày —
// KHÔNG validate chặn cứng với matchEngine, việc cảnh báo mềm được xử lý ở frontend
// (dùng chính matchEngine.js để không lặp logic đối chiếu ở 2 nơi).
router.post('/custom', requireAuth, (req, res) => {
  const { goal, tasks } = req.body ?? {}
  const durationDays = sanitizeDurationDays(req.body?.durationDays) ?? 14

  if (!Array.isArray(tasks)) {
    return res.status(400).json({ error: 'Danh sách việc không hợp lệ.' })
  }
  const cleanTasks = tasks
    .filter((t) => typeof t === 'string')
    .map((t) => t.trim().slice(0, MAX_TASK_LENGTH))
    .filter((t) => t.length > 0)
    .slice(0, MAX_CUSTOM_TASKS)

  if (cleanTasks.length === 0) {
    return res.status(400).json({ error: 'Vui lòng nhập ít nhất một việc muốn làm mỗi ngày.' })
  }

  const roadmap = createCustomRoadmap(req.userId, {
    goal: typeof goal === 'string' ? goal.trim().slice(0, MAX_GOAL_LENGTH) : '',
    durationDays,
    tasks: cleanTasks,
  })
  res.status(201).json(roadmap)
})

router.patch('/:id/task/:taskId', requireAuth, (req, res) => {
  const roadmapId = Number(req.params.id)
  const done = req.body?.done !== false

  const roadmap = setTaskDone(req.userId, roadmapId, req.params.taskId, done)
  if (!roadmap) {
    return res.status(404).json({ error: 'Không tìm thấy lộ trình hoặc công việc tương ứng.' })
  }
  res.json(roadmap)
})

export default router
