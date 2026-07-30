import { query } from '../db/connection.js'
import { getProfile } from './profileService.js'
import { listScanHistory } from './scanHistoryService.js'
import { getCurrentRoadmap } from './roadmapService.js'
import { getCalendar } from './checkinService.js'
import { uploadBuffer, deleteFile, extractPublicId } from './cloudinaryService.js'

function toMilestoneShape(row) {
  return {
    id: row.id,
    snapshot: JSON.parse(row.snapshot),
    summary: JSON.parse(row.summary || '{}'),
    createdAt: row.created_at,
  }
}

export async function listMilestones(userId) {
  const { rows } = await query(
    'SELECT id, summary, created_at FROM progress_milestones WHERE user_id = $1 ORDER BY created_at DESC',
    [userId],
  )
  return rows.map((row) => ({
    id: row.id,
    summary: JSON.parse(row.summary || '{}'),
    createdAt: row.created_at,
  }))
}

export async function createMilestone(userId, file) {
  const profile = await getProfile(userId)
  const scans = await listScanHistory(userId)
  const roadmap = await getCurrentRoadmap(userId)
  const calendar = await getCalendar(userId, 30)

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

  const { rows } = await query(
    `INSERT INTO progress_milestones (user_id, snapshot, summary)
     VALUES ($1, $2, $3) RETURNING *`,
    [userId, JSON.stringify(snapshot), JSON.stringify(summary)],
  )

  return toMilestoneShape(rows[0])
}

export async function deleteMilestone(userId, milestoneId) {
  const { rows } = await query('SELECT * FROM progress_milestones WHERE id = $1', [milestoneId])
  const row = rows[0]
  if (!row || Number(row.user_id) !== Number(userId)) return false

  // Xoá ảnh trên Cloudinary nếu có
  try {
    const snapshot = JSON.parse(row.snapshot || '{}')
    const publicId = snapshot.milestonePhotoUrl ? extractPublicId(snapshot.milestonePhotoUrl) : null
    if (publicId) await deleteFile(publicId)
  } catch {
    // silent
  }

  await query('DELETE FROM progress_milestones WHERE id = $1 AND user_id = $2', [milestoneId, userId])
  return true
}

export async function compareMilestone(userId, milestoneId) {
  const { rows } = await query('SELECT * FROM progress_milestones WHERE id = $1', [milestoneId])
  const current = rows[0]
  if (!current || Number(current.user_id) !== Number(userId)) return null

  const { rows: previousRows } = await query(
    `SELECT * FROM progress_milestones WHERE user_id = $1 AND id < $2 AND id != $2
     ORDER BY created_at DESC LIMIT 1`,
    [userId, milestoneId],
  )
  const previous = previousRows[0]

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
