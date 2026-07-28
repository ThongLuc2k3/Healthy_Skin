import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { query } from '../db/connection.js'

const UPLOAD_DIR = path.resolve('uploads/checkins')
fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const EXT_BY_MIME = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
}

// Tên file ngẫu nhiên (không theo user_id/ngày) để URL ảnh không thể đoán được —
// quyền xem ảnh vẫn được kiểm tra qua ownership ở route, không dựa vào việc "khó đoán" path.
function saveFile(file) {
  const ext = EXT_BY_MIME[file.mimetype] || ''
  const filename = `${crypto.randomUUID()}${ext}`
  const filePath = path.join(UPLOAD_DIR, filename)
  fs.writeFileSync(filePath, file.buffer)
  return { path: filePath, mime: file.mimetype }
}

function deleteFileSafe(filePath) {
  if (filePath) fs.unlink(filePath, () => {})
}

function toShape(row) {
  if (!row) return null
  return {
    id: row.id,
    date: row.date,
    roadmapId: row.roadmap_id,
    skincareDone: Boolean(row.skincare_done),
    skincareTasksCompleted: JSON.parse(row.skincare_tasks_completed),
    // Đường dẫn tương đối theo quy ước apiClient (KHÔNG có tiền tố /api — apiClient tự thêm base URL)
    skincarePhotoUrl: row.skincare_photo_path ? `/checkin/photo/${row.id}/skincare` : null,
    mealLogged: Boolean(row.meal_logged),
    mealDescription: row.meal_description,
    mealPhotoUrl: row.meal_photo_path ? `/checkin/photo/${row.id}/meal` : null,
    note: row.note,
    updatedAt: row.updated_at,
  }
}

export async function upsertCheckin(
  userId,
  { date, roadmapId, skincareTasksCompleted, mealDescription, note, skincareFile, mealFile },
) {
  const { rows: existingRows } = await query(
    'SELECT * FROM checkins WHERE user_id=$1 AND date=$2',
    [userId, date],
  )
  const existing = existingRows[0]

  let skincarePhoto = existing
    ? { path: existing.skincare_photo_path, mime: existing.skincare_photo_mime }
    : { path: null, mime: null }
  if (skincareFile) {
    deleteFileSafe(existing?.skincare_photo_path)
    skincarePhoto = saveFile(skincareFile)
  }

  let mealPhoto = existing
    ? { path: existing.meal_photo_path, mime: existing.meal_photo_mime }
    : { path: null, mime: null }
  if (mealFile) {
    deleteFileSafe(existing?.meal_photo_path)
    mealPhoto = saveFile(mealFile)
  }

  const { rows } = await query(
    `INSERT INTO checkins
      (user_id,roadmap_id,date,skincare_done,skincare_tasks_completed,
       skincare_photo_path,skincare_photo_mime,meal_logged,meal_description,
       meal_photo_path,meal_photo_mime,note,updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW())
     ON CONFLICT(user_id,date) DO UPDATE SET
       roadmap_id=EXCLUDED.roadmap_id, skincare_done=EXCLUDED.skincare_done,
       skincare_tasks_completed=EXCLUDED.skincare_tasks_completed,
       skincare_photo_path=EXCLUDED.skincare_photo_path,
       skincare_photo_mime=EXCLUDED.skincare_photo_mime,
       meal_logged=EXCLUDED.meal_logged, meal_description=EXCLUDED.meal_description,
       meal_photo_path=EXCLUDED.meal_photo_path, meal_photo_mime=EXCLUDED.meal_photo_mime,
       note=EXCLUDED.note, updated_at=NOW()
     RETURNING *`,
    [userId, roadmapId || null, date, skincareTasksCompleted.length > 0,
      JSON.stringify(skincareTasksCompleted), skincarePhoto.path, skincarePhoto.mime,
      mealDescription.trim().length > 0, mealDescription, mealPhoto.path, mealPhoto.mime, note],
  )
  return toShape(rows[0])
}

export async function getCheckinByDate(userId, date) {
  const { rows } = await query('SELECT * FROM checkins WHERE user_id=$1 AND date=$2', [userId, date])
  return toShape(rows[0])
}

// Trả về row thô (không qua toShape) — dùng nội bộ ở route ảnh để kiểm tra
// user_id sở hữu + lấy đường dẫn file thật trên đĩa.
export async function getCheckinRawById(id) {
  const { rows } = await query('SELECT * FROM checkins WHERE id=$1', [id])
  return rows[0]
}

function isoDaysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

function computeStreak(rowsByDate) {
  const isComplete = (d) => {
    const r = rowsByDate.get(d)
    return Boolean(r && r.skincare_done && r.meal_logged)
  }

  const cursor = new Date()
  const todayStr = cursor.toISOString().slice(0, 10)
  // Chưa điểm danh hôm nay không làm mất streak ngay — ngày hôm nay chưa kết thúc.
  if (!isComplete(todayStr)) cursor.setDate(cursor.getDate() - 1)

  let streak = 0
  while (true) {
    const dStr = cursor.toISOString().slice(0, 10)
    if (!isComplete(dStr)) break
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export async function getCalendar(userId, days = 30) {
  const since = isoDaysAgo(days - 1)
  const { rows } = await query(
    `SELECT date::text, skincare_done, meal_logged FROM checkins
     WHERE user_id=$1 AND date >= $2 ORDER BY date ASC`,
    [userId, since],
  )
  const rowsByDate = new Map(rows.map((r) => [r.date, r]))

  const calendarDays = []
  for (let i = days - 1; i >= 0; i -= 1) {
    const dStr = isoDaysAgo(i)
    const row = rowsByDate.get(dStr)
    let status = 'none'
    if (row) {
      if (row.skincare_done && row.meal_logged) status = 'full'
      else if (row.skincare_done || row.meal_logged) status = 'partial'
    }
    calendarDays.push({ date: dStr, status })
  }

  return { days: calendarDays, streak: computeStreak(rowsByDate) }
}
