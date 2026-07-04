import db from '../db/connection.js'

const allStmt = db.prepare('SELECT * FROM experts')
const getByIdStmt = db.prepare('SELECT * FROM experts WHERE id = ?')

function toShape(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    specialty: row.specialty,
    clinic_name: row.clinic_name,
    area_vi: row.area_vi,
    bio_vi: row.bio_vi,
    certifications: JSON.parse(row.certifications),
    rating_avg: row.rating_avg,
    reviews: JSON.parse(row.reviews),
    available_slots: JSON.parse(row.available_slots),
  }
}

export function listExperts(area) {
  const experts = allStmt.all().map(toShape)
  if (!area) return experts
  return experts.filter((e) => e.area_vi === area)
}

export function listAreas() {
  const experts = allStmt.all().map(toShape)
  return [...new Set(experts.map((e) => e.area_vi))]
}

export function getExpertById(id) {
  return toShape(getByIdStmt.get(id))
}
