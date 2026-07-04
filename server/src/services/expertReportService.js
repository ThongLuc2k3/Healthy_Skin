import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import db from '../db/connection.js'

const UPLOAD_DIR = path.resolve('uploads/expert_reports')
fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const EXT_BY_MIME = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'application/pdf': '.pdf',
}

const insertStmt = db.prepare(`
  INSERT INTO expert_reports (user_id, file_path, file_mime, original_name, source)
  VALUES (@user_id, @file_path, @file_mime, @original_name, 'user_upload')
`)
const listStmt = db.prepare('SELECT * FROM expert_reports WHERE user_id = ? ORDER BY uploaded_at DESC')
const getByIdStmt = db.prepare('SELECT * FROM expert_reports WHERE id = ?')
const deleteStmt = db.prepare('DELETE FROM expert_reports WHERE id = ?')

function toShape(row) {
  return {
    id: row.id,
    originalName: row.original_name,
    source: row.source,
    // Đường dẫn tương đối theo quy ước apiClient (không có tiền tố /api)
    fileUrl: `/profile/expert-report/${row.id}/file`,
    uploadedAt: row.uploaded_at,
  }
}

export function addExpertReport(userId, file) {
  const ext = EXT_BY_MIME[file.mimetype] || ''
  const filename = `${crypto.randomUUID()}${ext}`
  const filePath = path.join(UPLOAD_DIR, filename)
  fs.writeFileSync(filePath, file.buffer)

  const { lastInsertRowid } = insertStmt.run({
    user_id: userId,
    file_path: filePath,
    file_mime: file.mimetype,
    original_name: file.originalname?.slice(0, 200) || null,
  })
  return toShape(getByIdStmt.get(lastInsertRowid))
}

export function listExpertReports(userId) {
  return listStmt.all(userId).map(toShape)
}

// Trả về row thô — dùng nội bộ ở route file để kiểm tra ownership + lấy path thật.
export function getExpertReportRawById(id) {
  return getByIdStmt.get(id)
}

export function deleteExpertReport(userId, id) {
  const row = getByIdStmt.get(id)
  if (!row || row.user_id !== userId) return false
  fs.unlink(row.file_path, () => {})
  deleteStmt.run(id)
  return true
}
