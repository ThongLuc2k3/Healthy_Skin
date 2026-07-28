import { fileURLToPath } from 'node:url'
import { initDatabase, closeDatabase } from './connection.js'
import { seed, seedExperts } from './seed.js'
import { createUser, findUserByEmail } from '../services/userService.js'
import { saveProfile, giveConsent } from '../services/profileService.js'

const DEMO_EMAIL = process.env.DEMO_EMAIL || 'demo@daduong.local'
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'Demo123!'

async function seedDemo() {
  await initDatabase()
  await seed()
  await seedExperts()

  let user = await findUserByEmail(DEMO_EMAIL)
  if (!user) user = await createUser(DEMO_EMAIL, DEMO_PASSWORD)

  await saveProfile(user.id, {
    skinType: 'da_hon_hop',
    allergies: [],
    conditions: [],
    goals: ['duong_am', 'giam_mun'],
    skinTypeNote: 'Dữ liệu mẫu phục vụ trình diễn.',
    allergiesNote: '',
    conditionsNote: '',
    goalsNote: 'Duy trì routine ổn định và theo dõi phản ứng da.',
  })
  await giveConsent(user.id)

  return user
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const user = await seedDemo()
    console.log(`[seed:demo] Hoàn tất tài khoản ${user.email}.`)
    console.log(`[seed:demo] Mật khẩu: ${DEMO_PASSWORD}`)
  } finally {
    await closeDatabase()
  }
}

export default seedDemo
