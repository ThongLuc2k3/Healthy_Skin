import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import db from '../db/connection.js'

const FACE_PHOTO_DIR = path.resolve('uploads/face_photos')
fs.mkdirSync(FACE_PHOTO_DIR, { recursive: true })

const EXT_BY_MIME = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
}

const getStmt = db.prepare('SELECT * FROM profiles WHERE user_id = ?')
const upsertStmt = db.prepare(`
  INSERT INTO profiles (
    user_id, skin_type, allergies, conditions, goals,
    skin_type_note, allergies_note, conditions_note, goals_note, updated_at
  )
  VALUES (
    @user_id, @skin_type, @allergies, @conditions, @goals,
    @skin_type_note, @allergies_note, @conditions_note, @goals_note, datetime('now')
  )
  ON CONFLICT(user_id) DO UPDATE SET
    skin_type = excluded.skin_type,
    allergies = excluded.allergies,
    conditions = excluded.conditions,
    goals = excluded.goals,
    skin_type_note = excluded.skin_type_note,
    allergies_note = excluded.allergies_note,
    conditions_note = excluded.conditions_note,
    goals_note = excluded.goals_note,
    updated_at = excluded.updated_at
`)

const setConsentStmt = db.prepare(`
  INSERT INTO profiles (user_id, consent_given_at)
  VALUES (?, datetime('now'))
  ON CONFLICT(user_id) DO UPDATE SET consent_given_at = datetime('now')
`)

const setFacePhotoStmt = db.prepare(`
  INSERT INTO profiles (user_id, face_photo_path, face_photo_mime)
  VALUES (@user_id, @face_photo_path, @face_photo_mime)
  ON CONFLICT(user_id) DO UPDATE SET
    face_photo_path = excluded.face_photo_path,
    face_photo_mime = excluded.face_photo_mime
`)

const clearFacePhotoStmt = db.prepare(
  'UPDATE profiles SET face_photo_path = NULL, face_photo_mime = NULL WHERE user_id = ?',
)

const setDiagnosedConditionsStmt = db.prepare(`
  INSERT INTO profiles (user_id, diagnosed_conditions)
  VALUES (@user_id, @diagnosed_conditions)
  ON CONFLICT(user_id) DO UPDATE SET diagnosed_conditions = excluded.diagnosed_conditions
`)

function toProfileShape(row) {
  if (!row) {
    return {
      skinType: '',
      allergies: [],
      conditions: [],
      goals: [],
      skinTypeNote: '',
      allergiesNote: '',
      conditionsNote: '',
      goalsNote: '',
      consentGivenAt: null,
      facePhotoUrl: null,
      diagnosedConditions: [],
    }
  }
  return {
    skinType: row.skin_type,
    allergies: JSON.parse(row.allergies),
    conditions: JSON.parse(row.conditions),
    goals: JSON.parse(row.goals),
    skinTypeNote: row.skin_type_note ?? '',
    allergiesNote: row.allergies_note ?? '',
    conditionsNote: row.conditions_note ?? '',
    goalsNote: row.goals_note ?? '',
    consentGivenAt: row.consent_given_at ?? null,
    // Đường dẫn tương đối theo quy ước apiClient (không có tiền tố /api)
    facePhotoUrl: row.face_photo_path ? '/profile/face-photo' : null,
    diagnosedConditions: JSON.parse(row.diagnosed_conditions || '[]'),
  }
}

export function getProfile(userId) {
  return toProfileShape(getStmt.get(userId))
}

export function saveProfile(userId, profile) {
  upsertStmt.run({
    user_id: userId,
    skin_type: profile.skinType ?? '',
    allergies: JSON.stringify(profile.allergies ?? []),
    conditions: JSON.stringify(profile.conditions ?? []),
    goals: JSON.stringify(profile.goals ?? []),
    skin_type_note: profile.skinTypeNote ?? '',
    allergies_note: profile.allergiesNote ?? '',
    conditions_note: profile.conditionsNote ?? '',
    goals_note: profile.goalsNote ?? '',
  })
  return getProfile(userId)
}

export function hasGivenConsent(userId) {
  const row = getStmt.get(userId)
  return Boolean(row?.consent_given_at)
}

export function giveConsent(userId) {
  setConsentStmt.run(userId)
  return getProfile(userId)
}

export function setFacePhoto(userId, file) {
  const row = getStmt.get(userId)
  const ext = EXT_BY_MIME[file.mimetype] || ''
  const filename = `${crypto.randomUUID()}${ext}`
  const filePath = path.join(FACE_PHOTO_DIR, filename)
  fs.writeFileSync(filePath, file.buffer)

  if (row?.face_photo_path) {
    fs.unlink(row.face_photo_path, () => {})
  }

  setFacePhotoStmt.run({ user_id: userId, face_photo_path: filePath, face_photo_mime: file.mimetype })
  return getProfile(userId)
}

export function deleteFacePhoto(userId) {
  const row = getStmt.get(userId)
  if (row?.face_photo_path) {
    fs.unlink(row.face_photo_path, () => {})
  }
  clearFacePhotoStmt.run(userId)
  return getProfile(userId)
}

// Trả về đường dẫn + mime thô trên đĩa — dùng nội bộ ở route ảnh, không qua toProfileShape.
export function getFacePhotoFile(userId) {
  const row = getStmt.get(userId)
  if (!row?.face_photo_path) return null
  return { path: row.face_photo_path, mime: row.face_photo_mime }
}

const MAX_DIAGNOSED_CONDITIONS = 20

export function setDiagnosedConditions(userId, diagnosedConditions) {
  const sanitized = diagnosedConditions.slice(0, MAX_DIAGNOSED_CONDITIONS).map((entry) => ({
    name_vi: typeof entry.name_vi === 'string' ? entry.name_vi.slice(0, 200) : '',
    diagnosed_date: typeof entry.diagnosed_date === 'string' ? entry.diagnosed_date.slice(0, 20) : '',
    note: typeof entry.note === 'string' ? entry.note.slice(0, 500) : '',
  }))

  setDiagnosedConditionsStmt.run({
    user_id: userId,
    diagnosed_conditions: JSON.stringify(sanitized),
  })
  return getProfile(userId)
}
