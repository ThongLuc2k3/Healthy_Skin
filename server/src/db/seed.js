import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { initDatabase, transaction, closeDatabase } from './connection.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const frontendDataDir = join(__dirname, '..', '..', '..', 'src', 'data')
const serverDataDir = join(__dirname, '..', 'data')
const loadJson = (name) => JSON.parse(readFileSync(join(frontendDataDir, name), 'utf8'))
const loadServerJson = (name) => JSON.parse(readFileSync(join(serverDataDir, name), 'utf8'))

export async function seedExperts() {
  const experts = loadServerJson('experts.json')
  await transaction(async (client) => {
    for (const item of experts) {
      await client.query(
        `INSERT INTO experts
          (id,name,specialty,clinic_name,area_vi,bio_vi,certifications,rating_avg,reviews,available_slots)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         ON CONFLICT(id) DO UPDATE SET name=EXCLUDED.name,specialty=EXCLUDED.specialty,
           clinic_name=EXCLUDED.clinic_name,area_vi=EXCLUDED.area_vi,bio_vi=EXCLUDED.bio_vi,
           certifications=EXCLUDED.certifications,rating_avg=EXCLUDED.rating_avg,
           reviews=EXCLUDED.reviews,available_slots=EXCLUDED.available_slots`,
        [item.id, item.name, item.specialty, item.clinic_name, item.area_vi, item.bio_vi,
          JSON.stringify(item.certifications ?? []), item.rating_avg ?? 0,
          JSON.stringify(item.reviews ?? []), JSON.stringify(item.available_slots ?? [])],
      )
    }
  })
  return { expertsCount: experts.length }
}

export async function seed() {
  const skincare = loadJson('skincare_ingredients.json')
  const food = loadJson('food_items.json')
  await transaction(async (client) => {
    for (const item of skincare) {
      await client.query(
        `INSERT INTO skincare_ingredients
          (id,name_vi,category,flags,conflicts_with_skin_type,explanation_vi,source)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT(id) DO UPDATE SET name_vi=EXCLUDED.name_vi,category=EXCLUDED.category,
           flags=EXCLUDED.flags,conflicts_with_skin_type=EXCLUDED.conflicts_with_skin_type,
           explanation_vi=EXCLUDED.explanation_vi,source=EXCLUDED.source`,
        [item.id, item.name_vi, item.category, JSON.stringify(item.flags ?? []),
          JSON.stringify(item.conflicts_with_skin_type ?? []), item.explanation_vi, item.source ?? null],
      )
    }
    for (const item of food) {
      await client.query(
        `INSERT INTO food_items
          (id,name_vi,category,flags,conflicts_with_allergy,conflicts_with_condition,explanation_vi,source)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT(id) DO UPDATE SET name_vi=EXCLUDED.name_vi,category=EXCLUDED.category,
           flags=EXCLUDED.flags,conflicts_with_allergy=EXCLUDED.conflicts_with_allergy,
           conflicts_with_condition=EXCLUDED.conflicts_with_condition,
           explanation_vi=EXCLUDED.explanation_vi,source=EXCLUDED.source`,
        [item.id, item.name_vi, item.category, JSON.stringify(item.flags ?? []),
          JSON.stringify(item.conflicts_with_allergy ?? []),
          JSON.stringify(item.conflicts_with_condition ?? []), item.explanation_vi, item.source ?? null],
      )
    }
  })
  return { skincareCount: skincare.length, foodCount: food.length }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    await initDatabase()
    const counts = await seed()
    const expertCounts = await seedExperts()
    console.log(`Seed hoàn tất: ${counts.skincareCount} skincare, ${counts.foodCount} food, ${expertCounts.expertsCount} chuyên gia.`)
  } finally {
    await closeDatabase()
  }
}
