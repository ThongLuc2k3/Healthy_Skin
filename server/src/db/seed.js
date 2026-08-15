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
          (id,name,specialty,clinic_name,area_vi,bio_vi,certifications,rating_avg,reviews,available_slots,consultation_fee_vnd)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         ON CONFLICT(id) DO UPDATE SET name=EXCLUDED.name,specialty=EXCLUDED.specialty,
           clinic_name=EXCLUDED.clinic_name,area_vi=EXCLUDED.area_vi,bio_vi=EXCLUDED.bio_vi,
           certifications=EXCLUDED.certifications,rating_avg=EXCLUDED.rating_avg,
           reviews=EXCLUDED.reviews,available_slots=EXCLUDED.available_slots,
           consultation_fee_vnd=EXCLUDED.consultation_fee_vnd`,
        [item.id, item.name, item.specialty, item.clinic_name, item.area_vi, item.bio_vi,
          JSON.stringify(item.certifications ?? []), item.rating_avg ?? 0,
          JSON.stringify(item.reviews ?? []), JSON.stringify(item.available_slots ?? []),
          item.consultation_fee_vnd ?? 0],
      )
    }
  })
  return { expertsCount: experts.length }
}

export async function seedSponsoredContent() {
  const products = loadServerJson('sponsored_products.json')
  const ads = loadServerJson('homepage_ads.json')
  await transaction(async (client) => {
    for (const item of products) {
      await client.query(
        `INSERT INTO sponsored_products (id,name,brand,matched_item_id,price_vnd,affiliate_url,sponsor_name)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT(id) DO UPDATE SET name=EXCLUDED.name,brand=EXCLUDED.brand,
           matched_item_id=EXCLUDED.matched_item_id,price_vnd=EXCLUDED.price_vnd,
           affiliate_url=EXCLUDED.affiliate_url,sponsor_name=EXCLUDED.sponsor_name`,
        [item.id, item.name, item.brand ?? null, item.matched_item_id ?? null,
          item.price_vnd ?? null, item.affiliate_url, item.sponsor_name],
      )
    }
    for (const ad of ads) {
      await client.query(
        `INSERT INTO homepage_ads (sponsor_name,image_url,link_url,priority) VALUES ($1,$2,$3,$4)`,
        [ad.sponsor_name, ad.image_url, ad.link_url, ad.priority ?? 0],
      )
    }
  })
  return { productsCount: products.length, adsCount: ads.length }
}

export async function seedVenuesAndVouchers() {
  const venues = loadServerJson('partner_venues.json')
  const vouchers = loadServerJson('vouchers.json')
  let servicesCount = 0

  await transaction(async (client) => {
    for (const venue of venues) {
      await client.query(
        `INSERT INTO partner_venues (id,name,category,address_vi,area_vi,description_vi,cover_image_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT(id) DO UPDATE SET name=EXCLUDED.name,category=EXCLUDED.category,
           address_vi=EXCLUDED.address_vi,area_vi=EXCLUDED.area_vi,
           description_vi=EXCLUDED.description_vi,cover_image_url=EXCLUDED.cover_image_url`,
        [venue.id, venue.name, venue.category, venue.address_vi, venue.area_vi,
          venue.description_vi, venue.cover_image_url ?? null],
      )

      const { rows: existing } = await client.query(
        'SELECT id FROM partner_services WHERE venue_id = $1', [venue.id],
      )
      if (existing.length === 0) {
        for (const service of venue.services ?? []) {
          await client.query(
            `INSERT INTO partner_services (venue_id,name_vi,price_vnd,duration_minutes)
             VALUES ($1,$2,$3,$4)`,
            [venue.id, service.name_vi, service.price_vnd, service.duration_minutes ?? null],
          )
          servicesCount += 1
        }
      }
    }

    for (const v of vouchers) {
      await client.query(
        `INSERT INTO vouchers (id,title_vi,discount_type,discount_value,venue_id,points_cost,source)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT(id) DO UPDATE SET title_vi=EXCLUDED.title_vi,discount_type=EXCLUDED.discount_type,
           discount_value=EXCLUDED.discount_value,venue_id=EXCLUDED.venue_id,
           points_cost=EXCLUDED.points_cost,source=EXCLUDED.source`,
        [v.id, v.title_vi, v.discount_type, v.discount_value, v.venue_id ?? null,
          v.points_cost ?? 0, v.source ?? 'points'],
      )
    }
  })

  return { venuesCount: venues.length, servicesCount, vouchersCount: vouchers.length }
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
