import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import db from './connection.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const frontendDataDir = join(__dirname, '..', '..', '..', 'src', 'data')
const serverDataDir = join(__dirname, '..', 'data')

function loadJson(fileName) {
  return JSON.parse(readFileSync(join(frontendDataDir, fileName), 'utf-8'))
}

function loadServerJson(fileName) {
  return JSON.parse(readFileSync(join(serverDataDir, fileName), 'utf-8'))
}

const upsertSkincare = db.prepare(`
  INSERT INTO skincare_ingredients (id, name_vi, category, flags, conflicts_with_skin_type, explanation_vi, source)
  VALUES (@id, @name_vi, @category, @flags, @conflicts_with_skin_type, @explanation_vi, @source)
  ON CONFLICT(id) DO UPDATE SET
    name_vi = excluded.name_vi,
    category = excluded.category,
    flags = excluded.flags,
    conflicts_with_skin_type = excluded.conflicts_with_skin_type,
    explanation_vi = excluded.explanation_vi,
    source = excluded.source
`)

const upsertFood = db.prepare(`
  INSERT INTO food_items (id, name_vi, category, flags, conflicts_with_allergy, conflicts_with_condition, explanation_vi, source)
  VALUES (@id, @name_vi, @category, @flags, @conflicts_with_allergy, @conflicts_with_condition, @explanation_vi, @source)
  ON CONFLICT(id) DO UPDATE SET
    name_vi = excluded.name_vi,
    category = excluded.category,
    flags = excluded.flags,
    conflicts_with_allergy = excluded.conflicts_with_allergy,
    conflicts_with_condition = excluded.conflicts_with_condition,
    explanation_vi = excluded.explanation_vi,
    source = excluded.source
`)

const upsertExpert = db.prepare(`
  INSERT INTO experts (id, name, specialty, clinic_name, area_vi, bio_vi, certifications, rating_avg, reviews, available_slots)
  VALUES (@id, @name, @specialty, @clinic_name, @area_vi, @bio_vi, @certifications, @rating_avg, @reviews, @available_slots)
  ON CONFLICT(id) DO UPDATE SET
    name = excluded.name,
    specialty = excluded.specialty,
    clinic_name = excluded.clinic_name,
    area_vi = excluded.area_vi,
    bio_vi = excluded.bio_vi,
    certifications = excluded.certifications,
    rating_avg = excluded.rating_avg,
    reviews = excluded.reviews,
    available_slots = excluded.available_slots
`)

// Dữ liệu chuyên gia là DỮ LIỆU MẪU cho demo (9D) — seed riêng, không phụ thuộc
// vào điều kiện seed skincare/food vì đây là bảng độc lập được thêm sau.
export function seedExperts() {
  const experts = loadServerJson('experts.json')
  const insertAll = db.transaction((items) => {
    for (const item of items) {
      upsertExpert.run({
        id: item.id,
        name: item.name,
        specialty: item.specialty,
        clinic_name: item.clinic_name,
        area_vi: item.area_vi,
        bio_vi: item.bio_vi,
        certifications: JSON.stringify(item.certifications ?? []),
        rating_avg: item.rating_avg ?? 0,
        reviews: JSON.stringify(item.reviews ?? []),
        available_slots: JSON.stringify(item.available_slots ?? []),
      })
    }
  })
  insertAll(experts)
  return { expertsCount: experts.length }
}

export function seed() {
  const skincare = loadJson('skincare_ingredients.json')
  const food = loadJson('food_items.json')

  const insertAllSkincare = db.transaction((items) => {
    for (const item of items) {
      upsertSkincare.run({
        id: item.id,
        name_vi: item.name_vi,
        category: item.category,
        flags: JSON.stringify(item.flags ?? []),
        conflicts_with_skin_type: JSON.stringify(item.conflicts_with_skin_type ?? []),
        explanation_vi: item.explanation_vi,
        source: item.source ?? null,
      })
    }
  })

  const insertAllFood = db.transaction((items) => {
    for (const item of items) {
      upsertFood.run({
        id: item.id,
        name_vi: item.name_vi,
        category: item.category,
        flags: JSON.stringify(item.flags ?? []),
        conflicts_with_allergy: JSON.stringify(item.conflicts_with_allergy ?? []),
        conflicts_with_condition: JSON.stringify(item.conflicts_with_condition ?? []),
        explanation_vi: item.explanation_vi,
        source: item.source ?? null,
      })
    }
  })

  insertAllSkincare(skincare)
  insertAllFood(food)

  return { skincareCount: skincare.length, foodCount: food.length }
}

const isMainModule = process.argv[1] === fileURLToPath(import.meta.url)
if (isMainModule) {
  const { skincareCount, foodCount } = seed()
  console.log(`Seed hoàn tất: ${skincareCount} skincare, ${foodCount} food.`)
}
