import db from '../db/connection.js'
import { listFoodItems } from './itemService.js'
import { getRecommendations, RESULT } from '../../../src/logic/matchEngine.js'

const DEFAULT_DURATION_DAYS = 14
const MAX_MEAL_GUIDANCE = 4

const BASE_SKINCARE_TASKS = [
  { key: 'wash_am', label_vi: 'Rửa mặt buổi sáng bằng sữa rửa mặt dịu nhẹ' },
  { key: 'sunscreen', label_vi: 'Thoa kem chống nắng trước khi ra ngoài' },
  { key: 'wash_pm', label_vi: 'Rửa mặt buổi tối, tẩy trang kỹ nếu có trang điểm' },
  { key: 'moisturize', label_vi: 'Dưỡng ẩm trước khi đi ngủ' },
]

// Sinh lộ trình hoàn toàn rule-based (KHÔNG gọi Gemini), tái sử dụng đúng matchEngine.js
// đã dùng cho trang Kết quả — đảm bảo lộ trình nhất quán với logic đối chiếu hiện có.
function buildMealGuidance(profile) {
  const foodResults = getRecommendations(profile, listFoodItems())
  const avoidMessages = foodResults[RESULT.AVOID].map((item) => `Tránh ${item.name_vi} — ${item.reason}`)
  const cautionMessages = foodResults[RESULT.CAUTION].map(
    (item) => `Cân nhắc kỹ ${item.name_vi} — ${item.reason}`,
  )
  const combined = [...avoidMessages, ...cautionMessages]

  return combined.length > 0
    ? combined.slice(0, MAX_MEAL_GUIDANCE)
    : ['Chưa phát hiện thực phẩm nào cần đặc biệt lưu ý — duy trì chế độ ăn cân bằng.']
}

function buildDailyPlan(profile, durationDays) {
  const mealGuidance = buildMealGuidance(profile)
  const today = new Date()
  const dailyPlan = []

  for (let i = 0; i < durationDays; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)

    dailyPlan.push({
      day_index: i + 1,
      date: date.toISOString().slice(0, 10),
      skincare_tasks: BASE_SKINCARE_TASKS.map((task) => ({
        id: `d${i + 1}_${task.key}`,
        label_vi: task.label_vi,
        done: false,
      })),
      meal_guidance: mealGuidance,
    })
  }

  return dailyPlan
}

// 9E: lộ trình tự thiết kế — cùng "việc mỗi ngày" áp dụng cho mọi ngày trong lộ trình,
// tái dùng đúng field skincare_tasks/meal_guidance để RoadmapPage/CheckInPage hiển thị
// được luôn mà không cần sửa gì (chỉ khác ở "source": "user_custom").
function buildCustomDailyPlan(durationDays, goal, tasks) {
  const today = new Date()
  const dailyPlan = []
  const mealGuidance = goal ? [`Mục tiêu tự đặt: ${goal}`] : []

  for (let i = 0; i < durationDays; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)

    dailyPlan.push({
      day_index: i + 1,
      date: date.toISOString().slice(0, 10),
      skincare_tasks: tasks.map((label, idx) => ({
        id: `d${i + 1}_custom_${idx}`,
        label_vi: label,
        done: false,
      })),
      meal_guidance: mealGuidance,
    })
  }

  return dailyPlan
}

const insertStmt = db.prepare(`
  INSERT INTO roadmaps (user_id, duration_days, source, status, daily_plan)
  VALUES (@user_id, @duration_days, @source, 'active', @daily_plan)
`)
const archiveActiveStmt = db.prepare(`UPDATE roadmaps SET status = 'archived' WHERE user_id = ? AND status = 'active'`)
const getActiveStmt = db.prepare(
  `SELECT * FROM roadmaps WHERE user_id = ? AND status = 'active' ORDER BY created_at DESC LIMIT 1`,
)
const getByIdStmt = db.prepare('SELECT * FROM roadmaps WHERE id = ?')
const updatePlanStmt = db.prepare('UPDATE roadmaps SET daily_plan = ? WHERE id = ?')

function toRoadmapShape(row) {
  if (!row) return null
  return {
    id: row.id,
    durationDays: row.duration_days,
    source: row.source,
    status: row.status,
    dailyPlan: JSON.parse(row.daily_plan),
    createdAt: row.created_at,
  }
}

function saveNewRoadmap(userId, durationDays, source, dailyPlan) {
  const id = db.transaction(() => {
    archiveActiveStmt.run(userId)
    const { lastInsertRowid } = insertStmt.run({
      user_id: userId,
      duration_days: durationDays,
      source,
      daily_plan: JSON.stringify(dailyPlan),
    })
    return lastInsertRowid
  })()

  return toRoadmapShape(getByIdStmt.get(id))
}

export function createRoadmap(userId, profile, durationDays = DEFAULT_DURATION_DAYS) {
  const dailyPlan = buildDailyPlan(profile, durationDays)
  return saveNewRoadmap(userId, durationDays, 'auto_generated', dailyPlan)
}

export function createCustomRoadmap(userId, { goal, durationDays = DEFAULT_DURATION_DAYS, tasks }) {
  const dailyPlan = buildCustomDailyPlan(durationDays, goal, tasks)
  return saveNewRoadmap(userId, durationDays, 'user_custom', dailyPlan)
}

export function getCurrentRoadmap(userId) {
  return toRoadmapShape(getActiveStmt.get(userId))
}

export function setTaskDone(userId, roadmapId, taskId, done) {
  const row = getByIdStmt.get(roadmapId)
  if (!row || row.user_id !== userId) return null

  const dailyPlan = JSON.parse(row.daily_plan)
  const task = dailyPlan.flatMap((day) => day.skincare_tasks).find((t) => t.id === taskId)
  if (!task) return null

  task.done = Boolean(done)
  updatePlanStmt.run(JSON.stringify(dailyPlan), roadmapId)
  return toRoadmapShape(getByIdStmt.get(roadmapId))
}
