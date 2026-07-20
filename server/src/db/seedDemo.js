import fs from 'node:fs'
import bcrypt from 'bcrypt'
import db from './connection.js'
import { seed, seedExperts } from './seed.js'
import { saveProfile, giveConsent, setDiagnosedConditions } from '../services/profileService.js'
import { createRoadmap, getCurrentRoadmap, setTaskDone, createCustomRoadmap } from '../services/roadmapService.js'
import { upsertCheckin } from '../services/checkinService.js'
import { addExpertReport } from '../services/expertReportService.js'
import { createBooking, linkReportToBooking } from '../services/bookingService.js'

const SALT_ROUNDS = 10
const DEMO_PASSWORD = 'Demo123!@#'

const DEMO_USERS = [
  {
    email: 'demo.main@da-duong.local',
    password: DEMO_PASSWORD,
    profile: {
      skinType: 'da_dau',
      allergies: ['hai_san'],
      conditions: ['cao_huyet_ap'],
      goals: ['giam_mun', 'duong_am'],
      skinTypeNote: '',
      allergiesNote: 'Hay bi ngua va noi man do khi an tom, cua.',
      conditionsNote: 'Dang uu tien che do an it muoi va giam caffeine.',
      goalsNote: 'Muon giam mun vung T va giu da do bong dau hon.',
    },
    diagnosedConditions: [
      {
        name_vi: 'Mun viem muc do nhe',
        diagnosed_date: '2026-07-05',
        note: 'Da tung duoc khuyen nghi uu tien routine diu nhe va chong nang deu.',
      },
    ],
  },
  {
    email: 'demo.alt@da-duong.local',
    password: DEMO_PASSWORD,
    profile: {
      skinType: 'da_nhay_cam',
      allergies: ['sua'],
      conditions: ['khong_dung_nap_lactose'],
      goals: ['chong_lao_hoa', 'cai_thien_tieu_hoa'],
      skinTypeNote: '',
      allergiesNote: 'Khong hop sua tuoi va sua chua co lactose.',
      conditionsNote: '',
      goalsNote: 'Can routine diu nhe va an uong de tieu hoa on dinh hon.',
    },
    diagnosedConditions: [],
  },
]

const findUserByEmailStmt = db.prepare('SELECT id FROM users WHERE email = ?')
const insertUserStmt = db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)')
const updatePasswordStmt = db.prepare('UPDATE users SET password_hash = ? WHERE id = ?')
const listFilePathsStmt = {
  checkins: db.prepare(
    'SELECT skincare_photo_path, meal_photo_path FROM checkins WHERE user_id = ? AND (skincare_photo_path IS NOT NULL OR meal_photo_path IS NOT NULL)',
  ),
  reports: db.prepare('SELECT file_path FROM expert_reports WHERE user_id = ?'),
  face: db.prepare('SELECT face_photo_path FROM profiles WHERE user_id = ? AND face_photo_path IS NOT NULL'),
}
const deleteForUserStmt = {
  bookings: db.prepare('DELETE FROM expert_bookings WHERE user_id = ?'),
  reports: db.prepare('DELETE FROM expert_reports WHERE user_id = ?'),
  checkins: db.prepare('DELETE FROM checkins WHERE user_id = ?'),
  scans: db.prepare('DELETE FROM scan_history WHERE user_id = ?'),
  roadmaps: db.prepare('DELETE FROM roadmaps WHERE user_id = ?'),
  profile: db.prepare('DELETE FROM profiles WHERE user_id = ?'),
}

function isoDateOffset(daysOffset) {
  const date = new Date()
  date.setDate(date.getDate() + daysOffset)
  return date.toISOString().slice(0, 10)
}

function sqliteDateTimeOffset(daysOffset, hours = 9, minutes = 0) {
  const date = new Date()
  date.setDate(date.getDate() + daysOffset)
  date.setHours(hours, minutes, 0, 0)
  return date.toISOString().slice(0, 19).replace('T', ' ')
}

function deleteFileSafe(filePath) {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
  }
}

function cleanupUserData(userId) {
  const checkinFiles = listFilePathsStmt.checkins.all(userId)
  for (const row of checkinFiles) {
    deleteFileSafe(row.skincare_photo_path)
    deleteFileSafe(row.meal_photo_path)
  }

  const reportFiles = listFilePathsStmt.reports.all(userId)
  for (const row of reportFiles) {
    deleteFileSafe(row.file_path)
  }

  const facePhoto = listFilePathsStmt.face.get(userId)
  deleteFileSafe(facePhoto?.face_photo_path)

  deleteForUserStmt.bookings.run(userId)
  deleteForUserStmt.reports.run(userId)
  deleteForUserStmt.checkins.run(userId)
  deleteForUserStmt.scans.run(userId)
  deleteForUserStmt.roadmaps.run(userId)
  deleteForUserStmt.profile.run(userId)
}

async function upsertDemoUser(email, password) {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
  const existing = findUserByEmailStmt.get(email)

  if (existing) {
    updatePasswordStmt.run(passwordHash, existing.id)
    return existing.id
  }

  const { lastInsertRowid } = insertUserStmt.run(email, passwordHash)
  return Number(lastInsertRowid)
}

function createSimplePdfBuffer(lines) {
  const escapedLines = lines.map((line) =>
    line.replaceAll('\\', '\\\\').replaceAll('(', '\\(').replaceAll(')', '\\)'),
  )
  const content = [
    'BT',
    '/F1 12 Tf',
    '36 760 Td',
    ...escapedLines.flatMap((line, index) => (index === 0 ? [`(${line}) Tj`] : ['0 -18 Td', `(${line}) Tj`])),
    'ET',
  ].join('\n')

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${Buffer.byteLength(content, 'utf8')} >>\nstream\n${content}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ]

  let pdf = '%PDF-1.4\n'
  const offsets = [0]

  for (let i = 0; i < objects.length; i += 1) {
    offsets.push(Buffer.byteLength(pdf, 'utf8'))
    pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`
  }

  const xrefOffset = Buffer.byteLength(pdf, 'utf8')
  pdf += `xref\n0 ${objects.length + 1}\n`
  pdf += '0000000000 65535 f \n'
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`

  return Buffer.from(pdf, 'utf8')
}

function seedScans(userId) {
  const insertScanStmt = db.prepare(`
    INSERT INTO scan_history (
      user_id, matched_item_id, matched_item_category, ocr_raw_text, product_name, result, reason, created_at
    )
    VALUES (
      @user_id, @matched_item_id, @matched_item_category, @ocr_raw_text, @product_name, @result, @reason, @created_at
    )
  `)

  const entries = [
    {
      matched_item_id: 'niacinamide',
      matched_item_category: 'skincare',
      ocr_raw_text: 'Serum Niacinamide 10% + Zinc',
      product_name: 'Serum Niacinamide 10%',
      result: 'phù hợp',
      reason: 'Thanh phan lanh tinh, co the ho tro giam dau thua va cuong co hang rao bao ve da.',
      created_at: sqliteDateTimeOffset(-3, 20, 15),
    },
    {
      matched_item_id: 'coconut_oil',
      matched_item_category: 'skincare',
      ocr_raw_text: 'Cold Pressed Coconut Oil',
      product_name: 'Dau dua ep lanh',
      result: 'nên tránh',
      reason: 'De gay bit tac lo chan long cao o da dau/da hon hop, khong phu hop voi ho so demo chinh.',
      created_at: sqliteDateTimeOffset(-2, 8, 45),
    },
    {
      matched_item_id: 'ca_phe',
      matched_item_category: 'food',
      ocr_raw_text: 'Ca phe den da',
      product_name: 'Ca phe den',
      result: 'nên tránh',
      reason: 'Caffeine co the lam tang huyet ap tam thoi, nguoi cao huyet ap nen han che.',
      created_at: sqliteDateTimeOffset(-1, 15, 30),
    },
    {
      matched_item_id: null,
      matched_item_category: null,
      ocr_raw_text: 'Mat na cap am chiet xuat rau ma',
      product_name: 'Mat na rau ma',
      result: 'cần cân nhắc',
      reason: 'Ket qua nay mo phong luong AI quet anh that: can kiem tra them bang thanh phan day du va tan suat su dung.',
      created_at: sqliteDateTimeOffset(0, 9, 10),
    },
  ]

  for (const entry of entries) {
    insertScanStmt.run({ user_id: userId, ...entry })
  }
}

function seedRoadmapAndCheckins(userId, profile) {
  const roadmap = createRoadmap(userId, profile, 14)
  const currentRoadmap = getCurrentRoadmap(userId) ?? roadmap
  const todayPlan = currentRoadmap.dailyPlan[0]
  const allTodayTaskIds = todayPlan.skincare_tasks.map((task) => task.id)

  for (const taskId of allTodayTaskIds) {
    setTaskDone(userId, currentRoadmap.id, taskId, true)
  }

  const fullTaskIds = ['wash_am', 'sunscreen', 'wash_pm', 'moisturize']
  const partialTaskIds = ['wash_am', 'sunscreen']

  for (let daysAgo = 5; daysAgo >= 1; daysAgo -= 1) {
    upsertCheckin(userId, {
      date: isoDateOffset(-daysAgo),
      roadmapId: currentRoadmap.id,
      skincareTasksCompleted: fullTaskIds,
      mealDescription: `Bua an demo ngay ${isoDateOffset(-daysAgo)}: com ga, rau luoc, trai cay it duong.`,
      note: 'Da duy tri routine va uong du nuoc.',
      skincareFile: null,
      mealFile: null,
    })
  }

  upsertCheckin(userId, {
    date: isoDateOffset(-6),
    roadmapId: currentRoadmap.id,
    skincareTasksCompleted: partialTaskIds,
    mealDescription: 'An trua nhanh ngoai quan, da giam mon chien ran.',
    note: 'Ban ngay hoi ban, bo lo buoc duong am toi.',
    skincareFile: null,
    mealFile: null,
  })

  upsertCheckin(userId, {
    date: isoDateOffset(-7),
    roadmapId: currentRoadmap.id,
    skincareTasksCompleted: [],
    mealDescription: 'Sinh to khoai lang va sua hat.',
    note: 'Chi kip ghi bua an, chua skincare day du.',
    skincareFile: null,
    mealFile: null,
  })

  upsertCheckin(userId, {
    date: isoDateOffset(0),
    roadmapId: currentRoadmap.id,
    skincareTasksCompleted: allTodayTaskIds,
    mealDescription: 'Com ga ap chao, rau cai xanh, gao lut va nuoc loc.',
    note: 'Da hoan thanh du routine buoi sang va buoi toi.',
    skincareFile: null,
    mealFile: null,
  })

  return currentRoadmap
}

function seedBookingsWithReport(userId) {
  const upcomingBooking = createBooking(userId, 'bs_nguyen_van_a', 'Thứ 7 - 09:00')
  const completedBooking = createBooking(userId, 'bs_le_van_c', 'Thứ 3 - 09:00')

  const report = addExpertReport(userId, {
    mimetype: 'application/pdf',
    originalname: 'bao-cao-tu-van-demo.pdf',
    buffer: createSimplePdfBuffer([
      'Bao cao tu van demo - DA DUONG',
      'Nguoi dung: demo.main@da-duong.local',
      'Tom tat: uu tien routine diu nhe, giam caffeine, tang rau xanh va ngu ngu som.',
    ]),
  })

  const completedLinked = completedBooking ? linkReportToBooking(userId, completedBooking.id, report.id) : null

  return {
    upcomingBookingId: upcomingBooking?.id ?? null,
    completedBookingId: completedLinked?.id ?? completedBooking?.id ?? null,
    reportId: report.id,
  }
}

async function seedMainDemoUser(userId, demoUser) {
  saveProfile(userId, demoUser.profile)
  giveConsent(userId)
  setDiagnosedConditions(userId, demoUser.diagnosedConditions)
  const roadmap = seedRoadmapAndCheckins(userId, demoUser.profile)
  seedScans(userId)
  const bookings = seedBookingsWithReport(userId)

  return {
    roadmapId: roadmap.id,
    bookingIds: bookings,
  }
}

function seedAltDemoUser(userId, demoUser) {
  saveProfile(userId, demoUser.profile)
  createCustomRoadmap(userId, {
    goal: 'Routine diu nhe 7 ngay cho da nhay cam va tieu hoa on dinh',
    durationDays: 7,
    tasks: [
      'Rua mat bang sua rua mat diu nhe, khong huong lieu',
      'Thoa kem duong am co ceramide sau moi lan rua mat',
      'Ghi lai bua an va tranh sua tuoi neu thay kho tieu',
    ],
  })
}

async function main() {
  seed()
  seedExperts()

  const seededUsers = []

  for (const demoUser of DEMO_USERS) {
    const userId = await upsertDemoUser(demoUser.email, demoUser.password)
    cleanupUserData(userId)

    if (demoUser.email === 'demo.main@da-duong.local') {
      const mainData = await seedMainDemoUser(userId, demoUser)
      seededUsers.push({
        email: demoUser.email,
        password: demoUser.password,
        userId,
        roadmapId: mainData.roadmapId,
        completedBookingId: mainData.bookingIds.completedBookingId,
        upcomingBookingId: mainData.bookingIds.upcomingBookingId,
      })
      continue
    }

    seedAltDemoUser(userId, demoUser)
    seededUsers.push({
      email: demoUser.email,
      password: demoUser.password,
      userId,
      roadmapId: getCurrentRoadmap(userId)?.id ?? null,
      completedBookingId: null,
      upcomingBookingId: null,
    })
  }

  console.log('Seed demo hoan tat.')
  console.log(`Ngay seed: ${isoDateOffset(0)}`)
  console.table(
    seededUsers.map((user) => ({
      email: user.email,
      password: user.password,
      userId: user.userId,
      roadmapId: user.roadmapId,
      completedBookingId: user.completedBookingId,
      upcomingBookingId: user.upcomingBookingId,
    })),
  )
}

main().catch((error) => {
  console.error('Seed demo that bai:', error)
  process.exitCode = 1
})
