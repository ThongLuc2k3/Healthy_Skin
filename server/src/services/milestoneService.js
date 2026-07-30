import db from '../db/connection.js'
import { getProfile } from './profileService.js'
import { listScanHistory } from './scanHistoryService.js'
import { getCurrentRoadmap } from './roadmapService.js'
import { getCalendar } from './checkinService.js'
import { uploadBuffer, deleteFile, extractPublicId } from './cloudinaryService.js'

const insertStmt = db.prepare(`
  INSERT INTO progress_milestones (user_id, snapshot, summary)
  VALUES (@user_id, @snapshot, @summary)
`)
const listStmt = db.prepare(
  'SELECT id, summary, created_at FROM progress_milestones WHERE user_id = ? ORDER BY created_at DESC',
)
const getByIdStmt = db.prepare('SELECT * FROM progress_milestones WHERE id = ?')
const deleteStmt = db.prepare('DELETE FROM progress_milestones WHERE id = ? AND user_id = ?')

function toMilestoneShape(row) {
  return {
    id: row.id,
    snapshot: JSON.parse(row.snapshot),
    summary: JSON.parse(row.summary || '{}'),
    createdAt: row.created_at,
  }
}

export function listMilestones(userId) {
  const rows = listStmt.all(userId)
  return rows.map((row) => ({
    id: row.id,
    summary: JSON.parse(row.summary || '{}'),
    createdAt: row.created_at,
  }))
}

export async function createMilestone(userId, file) {
  const profile = getProfile(userId)
  const scans = listScanHistory(userId)
  const roadmap = getCurrentRoadmap(userId)
  const calendar = getCalendar(userId, 30)

  // Tính toán thống kê check-in 30 ngày
  const totalDays = calendar.days.length
  const fullDays = calendar.days.filter((d) => d.status === 'full').length
  const partialDays = calendar.days.filter((d) => d.status === 'partial').length
  const completionRate = totalDays > 0 ? Math.round(((fullDays + partialDays) / totalDays) * 100) : 0

  // Tính toán thống kê scan
  const scanStats = {
    total: scans.length,
    suitable: scans.filter((s) => s.result === 'phù hợp').length,
    caution: scans.filter((s) => s.result === 'cần cân nhắc').length,
    avoid: scans.filter((s) => s.result === 'nên tránh').length,
  }

  // Tính toán thống kê roadmap
  let roadmapStats = { completedTasks: 0, totalTasks: 0, phases: [] }
  if (roadmap) {
    const allTasks = roadmap.dailyPlan.flatMap((day) => day.skincare_tasks)
    roadmapStats = {
      completedTasks: allTasks.filter((t) => t.done).length,
      totalTasks: allTasks.length,
      phases: [...new Set(roadmap.dailyPlan.map((d) => d.phase_title_vi).filter(Boolean))],
    }
  }

  // Upload ảnh milestone lên Cloudinary nếu có
  let milestonePhotoUrl = null
  if (file) {
    try {
      const result = await uploadBuffer(file.buffer, file.mimetype, { folder: 'da-duong/milestones' })
      milestonePhotoUrl = result.url
    } catch {
      // silent — vẫn tạo milestone dù upload ảnh thất bại
    }
  }

  const snapshot = {
    facePhotoUrl: profile.facePhotoUrl,
    milestonePhotoUrl,
    skinType: profile.skinType,
    diagnosedConditions: profile.diagnosedConditions,
    checkinStats: {
      totalDays,
      fullDays,
      partialDays,
      completionRate,
      streak: calendar.streak,
    },
    scanStats,
    roadmapStats,
  }

  const summary = {
    totalCheckins: fullDays + partialDays,
    completionRate,
    streak: calendar.streak,
    totalScans: scans.length,
    totalTasksDone: roadmapStats.completedTasks,
  }

  const { lastInsertRowid } = insertStmt.run({
    user_id: userId,
    snapshot: JSON.stringify(snapshot),
    summary: JSON.stringify(summary),
  })

  return toMilestoneShape(getByIdStmt.get(lastInsertRowid))
}

export function deleteMilestone(userId, milestoneId) {
  const row = getByIdStmt.get(milestoneId)
  if (!row || row.user_id !== userId) return false

  // Xoá ảnh trên Cloudinary nếu có
  try {
    const snapshot = JSON.parse(row.snapshot || '{}')
    const publicId = snapshot.milestonePhotoUrl ? extractPublicId(snapshot.milestonePhotoUrl) : null
    if (publicId) deleteFile(publicId)
  } catch {
    // silent
  }

  deleteStmt.run(milestoneId, userId)
  return true
}

export function compareMilestone(userId, milestoneId) {
  const current = getByIdStmt.get(milestoneId)
  if (!current || current.user_id !== userId) return null

  const previous = db
    .prepare(
      `SELECT * FROM progress_milestones WHERE user_id = ? AND id < ? AND id != ? ORDER BY created_at DESC LIMIT 1`,
    )
    .get(userId, milestoneId, milestoneId)

  const milestones = {
    current: toMilestoneShape(current),
    previous: previous ? toMilestoneShape(previous) : null,
  }

  // Tính diff
  const diff = {}
  if (milestones.previous) {
    const cur = milestones.current.snapshot
    const prev = milestones.previous.snapshot

    diff.facePhotoUrl = cur.facePhotoUrl !== prev.facePhotoUrl ? cur.facePhotoUrl : null
    diff.milestonePhotoUrl = cur.milestonePhotoUrl || null
    diff.skinType = cur.skinType !== prev.skinType ? { before: prev.skinType, after: cur.skinType } : null

    if (cur.checkinStats && prev.checkinStats) {
      diff.completionRate = {
        before: prev.checkinStats.completionRate,
        after: cur.checkinStats.completionRate,
        change: cur.checkinStats.completionRate - prev.checkinStats.completionRate,
      }
      diff.streak = {
        before: prev.checkinStats.streak,
        after: cur.checkinStats.streak,
        change: cur.checkinStats.streak - prev.checkinStats.streak,
      }
      diff.checkinDays = {
        before: prev.checkinStats.fullDays + prev.checkinStats.partialDays,
        after: cur.checkinStats.fullDays + cur.checkinStats.partialDays,
        change:
          cur.checkinStats.fullDays +
          cur.checkinStats.partialDays -
          (prev.checkinStats.fullDays + prev.checkinStats.partialDays),
      }
    }

    if (cur.scanStats && prev.scanStats) {
      diff.scanTotal = {
        before: prev.scanStats.total,
        after: cur.scanStats.total,
        change: cur.scanStats.total - prev.scanStats.total,
      }
      diff.scanSuitable = {
        before: prev.scanStats.suitable,
        after: cur.scanStats.suitable,
        change: cur.scanStats.suitable - prev.scanStats.suitable,
      }
    }

    if (cur.roadmapStats && prev.roadmapStats) {
      diff.tasksDone = {
        before: prev.roadmapStats.completedTasks,
        after: cur.roadmapStats.completedTasks,
        change: cur.roadmapStats.completedTasks - prev.roadmapStats.completedTasks,
      }
    }
  }

  return { ...milestones, diff }
}
