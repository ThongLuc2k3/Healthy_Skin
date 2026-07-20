import db from '../db/connection.js'
import { listFoodItems } from './itemService.js'
import { getRecommendations, RESULT } from '../../../src/logic/matchEngine.js'

const DEFAULT_DURATION_DAYS = 14
const MAX_MEAL_GUIDANCE = 4
const PHASES = [
  {
    key: 'reset',
    title_vi: 'Reset nền da',
    coach_note: 'Giảm quá tải, đưa routine về trạng thái tối giản và dễ theo dõi.',
  },
  {
    key: 'stabilize',
    title_vi: 'Ổn định thói quen',
    coach_note: 'Giữ nhịp đều, bắt đầu theo dõi dấu hiệu da và phản ứng cơ thể.',
  },
  {
    key: 'improve',
    title_vi: 'Tăng tốc cải thiện',
    coach_note: 'Tinh chỉnh theo mục tiêu chính nhưng vẫn ưu tiên ổn định, không nóng vội.',
  },
  {
    key: 'maintain',
    title_vi: 'Khóa thói quen',
    coach_note: 'Củng cố điều đang hiệu quả và tạo nhịp duy trì dài hơn sau roadmap.',
  },
]

const CORE_TASK_LIBRARY = {
  cleanse_am: 'Rửa mặt buổi sáng bằng sản phẩm dịu nhẹ, không chà xát mạnh',
  sunscreen: 'Thoa kem chống nắng trước khi ra ngoài và nhắc lại nếu ở ngoài lâu',
  cleanse_pm: 'Rửa mặt buổi tối, tẩy trang kỹ nếu có chống nắng hoặc trang điểm',
  moisturize_pm: 'Dưỡng ẩm cuối ngày để giữ hàng rào bảo vệ da ổn định',
  observe_skin: 'Chụp nhanh hoặc ghi lại tình trạng da cuối ngày để theo dõi tiến triển',
  sleep_check: 'Cố gắng ngủ đúng giờ hơn hôm trước ít nhất 15-30 phút',
  water_check: 'Chia nước uống thành nhiều lần trong ngày, tránh để khát mới uống',
  pillowcase: 'Đổi khăn mặt hoặc vỏ gối sạch để giảm bí tắc và ma sát trên da',
  patch_test: 'Nếu định thêm món mới, chỉ test một vùng nhỏ trước thay vì bôi toàn mặt',
  stress_reset: 'Dành 10 phút thả lỏng, giảm stress để hạn chế ảnh hưởng lên da và giấc ngủ',
}

const SKIN_TYPE_TASKS = {
  da_dau: [
    'Theo dõi vùng chữ T vào giữa trưa, hạn chế rửa mặt quá nhiều lần vì càng dễ tăng tiết dầu',
    'Ưu tiên texture mỏng nhẹ, tránh chồng quá nhiều lớp bí da trong cùng một buổi',
  ],
  da_kho: [
    'Giảm nước quá nóng khi rửa mặt và khóa ẩm ngay sau khi da còn hơi ẩm',
    'Nếu ngồi điều hòa lâu, chú ý bổ sung dưỡng ẩm và nước uống trong ngày',
  ],
  da_hon_hop: [
    'Quan sát khác biệt giữa vùng chữ T và hai má để tránh chăm sóc cả mặt theo một kiểu',
    'Ưu tiên sản phẩm cân bằng dầu nhưng không làm khô căng hai má',
  ],
  da_nhay_cam: [
    'Giữ routine ít bước, tránh đổi nhiều sản phẩm cùng lúc hoặc dùng treatment quá nhanh',
    'Nếu da châm chích/đỏ rát, ưu tiên làm dịu và tạm dừng món nghi ngờ gây kích ứng',
  ],
}

const GOAL_TASKS = {
  giam_mun: [
    'Quan sát nốt mụn viêm mới và tránh sờ nặn để giảm nguy cơ thâm kéo dài',
    'Giữ sạch điện thoại, khẩu trang và vật chạm nhiều vào vùng da dễ nổi mụn',
  ],
  chong_lao_hoa: [
    'Ưu tiên chống nắng thật đều vì đây là bước tạo khác biệt lớn nhất cho mục tiêu chống lão hóa',
    'Khi muốn thêm treatment mạnh, chỉ tăng tần suất từ từ thay vì dùng dày ngay từ đầu',
  ],
  tang_can: [
    'Chốt trước ít nhất 1 bữa phụ lành mạnh để tránh bỏ bữa khi bận',
    'Theo dõi xem thực phẩm nào giúp đủ năng lượng mà vẫn không làm da phản ứng xấu',
  ],
  giam_can: [
    'Chuẩn bị trước 1 lựa chọn bữa nhẹ để giảm ăn theo cảm hứng vào buổi tối',
    'Ăn chậm hơn và ưu tiên thực phẩm ít chế biến để giữ nhịp giảm cân bền hơn',
  ],
  cai_thien_tieu_hoa: [
    'Ghi chú nhanh món nào làm bụng khó chịu để điều chỉnh thay vì đoán mò',
    'Ưu tiên bữa ăn đơn giản, ít dầu mỡ và đều giờ hơn trong vài ngày đầu',
  ],
  duong_am: [
    'Tập trung vào dưỡng ẩm đều sáng - tối hơn là thêm quá nhiều treatment mạnh',
    'Theo dõi cảm giác căng rít sau rửa mặt để biết hàng rào da đã ổn hơn chưa',
  ],
}

const CONDITION_TASKS = {
  tieu_duong: [
    'Ưu tiên bữa ăn ít tăng đường huyết nhanh, hạn chế nước ngọt và đồ ngọt uống kèm',
  ],
  cao_huyet_ap: [
    'Để ý lượng muối và caffeine trong ngày, nhất là khi ăn ngoài hoặc uống cà phê liên tục',
  ],
  khong_dung_nap_lactose: [
    'Rà lại đồ uống/bữa phụ có sữa để tránh khó chịu tiêu hóa làm lệch nhịp sinh hoạt',
  ],
  gut: [
    'Hạn chế nhóm nhiều purin trong giai đoạn đầu để cơ thể đỡ bị kích hoạt cơn khó chịu',
  ],
  gan_nhiem_mo: [
    'Giảm đồ chiên rán và nước ngọt trong tuần này để giữ nhịp ổn định cho gan và da',
  ],
  suy_than: [
    'Đừng tự ý dùng thực đơn cực đoan; ưu tiên ăn đều và kiểm soát đồ mặn/chế biến sẵn',
  ],
}

function uniqueTexts(lines) {
  return [...new Set(lines.filter(Boolean))]
}

function getPhaseForDay(dayIndex, durationDays) {
  const progress = dayIndex / durationDays
  if (progress <= 0.22) return PHASES[0]
  if (progress <= 0.5) return PHASES[1]
  if (progress <= 0.8) return PHASES[2]
  return PHASES[3]
}

function buildCoreTasks(profile, phase, dayIndex) {
  const tasks = []

  if (phase.key === 'reset') {
    tasks.push(CORE_TASK_LIBRARY.cleanse_am)
    tasks.push(CORE_TASK_LIBRARY.sunscreen)
    tasks.push(CORE_TASK_LIBRARY.cleanse_pm)
    tasks.push(CORE_TASK_LIBRARY.moisturize_pm)
    if (dayIndex === 1) tasks.push('Dọn lại routine hiện tại: tạm gác những món không thật sự cần trong 3 ngày đầu')
    if (dayIndex === 2) tasks.push(CORE_TASK_LIBRARY.patch_test)
    if (dayIndex === 3) tasks.push(CORE_TASK_LIBRARY.observe_skin)
  }

  if (phase.key === 'stabilize') {
    tasks.push(CORE_TASK_LIBRARY.cleanse_am)
    tasks.push(CORE_TASK_LIBRARY.sunscreen)
    tasks.push(CORE_TASK_LIBRARY.cleanse_pm)
    tasks.push(CORE_TASK_LIBRARY.moisturize_pm)
    tasks.push(CORE_TASK_LIBRARY.observe_skin)
    tasks.push(dayIndex % 2 === 0 ? CORE_TASK_LIBRARY.water_check : CORE_TASK_LIBRARY.sleep_check)
  }

  if (phase.key === 'improve') {
    tasks.push(CORE_TASK_LIBRARY.cleanse_am)
    tasks.push(CORE_TASK_LIBRARY.sunscreen)
    tasks.push(CORE_TASK_LIBRARY.cleanse_pm)
    tasks.push(CORE_TASK_LIBRARY.moisturize_pm)
    tasks.push(CORE_TASK_LIBRARY.observe_skin)
    tasks.push(dayIndex % 2 === 0 ? CORE_TASK_LIBRARY.pillowcase : CORE_TASK_LIBRARY.stress_reset)
  }

  if (phase.key === 'maintain') {
    tasks.push(CORE_TASK_LIBRARY.cleanse_am)
    tasks.push(CORE_TASK_LIBRARY.sunscreen)
    tasks.push(CORE_TASK_LIBRARY.cleanse_pm)
    tasks.push(CORE_TASK_LIBRARY.moisturize_pm)
    tasks.push('Tổng kết nhanh hôm nay: điều gì đang hợp với da và điều gì vẫn nên giảm bớt')
    tasks.push(dayIndex % 2 === 0 ? CORE_TASK_LIBRARY.water_check : CORE_TASK_LIBRARY.sleep_check)
  }

  if (profile.skinTypeNote?.trim() && phase.key !== 'reset') {
    tasks.push(`Đối chiếu thêm mô tả riêng của bạn: ${profile.skinTypeNote.trim().slice(0, 120)}`)
  }

  return tasks
}

function pickContextTask(lines, dayIndex, fallback) {
  if (!lines || lines.length === 0) return fallback
  return lines[(dayIndex - 1) % lines.length]
}

function buildSkincareTasks(profile, dayIndex, durationDays) {
  const phase = getPhaseForDay(dayIndex, durationDays)
  const tasks = buildCoreTasks(profile, phase, dayIndex)
  const skinTypeTasks = SKIN_TYPE_TASKS[profile.skinType] ?? []
  const goalTasks = (profile.goals ?? []).flatMap((goal) => GOAL_TASKS[goal] ?? [])
  const conditionTasks = (profile.conditions ?? []).flatMap((condition) => CONDITION_TASKS[condition] ?? [])

  tasks.push(pickContextTask(skinTypeTasks, dayIndex, 'Giữ routine nhẹ nhàng và ổn định, không thay đổi quá nhanh'))
  tasks.push(
    pickContextTask(
      goalTasks,
      dayIndex,
      'Chọn 1 thay đổi nhỏ nhưng làm thật đều hôm nay thay vì ôm quá nhiều mục tiêu cùng lúc',
    ),
  )

  if (conditionTasks.length > 0) {
    tasks.push(pickContextTask(conditionTasks, dayIndex, null))
  }

  if (profile.goalsNote?.trim() && phase.key === 'improve') {
    tasks.push(`Nhắc lại mục tiêu riêng: ${profile.goalsNote.trim().slice(0, 120)}`)
  }

  return uniqueTexts(tasks).slice(0, 7).map((label, idx) => ({
    id: `d${dayIndex}_${phase.key}_${idx + 1}`,
    label_vi: label,
    done: false,
  }))
}

// Sinh lộ trình hoàn toàn rule-based (KHÔNG gọi Gemini), tái sử dụng đúng matchEngine.js
// đã dùng cho trang Kết quả — đảm bảo lộ trình nhất quán với logic đối chiếu hiện có.
function buildMealGuidanceBase(profile) {
  const foodResults = getRecommendations(profile, listFoodItems())
  const avoidMessages = foodResults[RESULT.AVOID].map((item) => `Tránh ${item.name_vi} — ${item.reason}`)
  const cautionMessages = foodResults[RESULT.CAUTION].map(
    (item) => `Cân nhắc kỹ ${item.name_vi} — ${item.reason}`,
  )
  const combined = [...avoidMessages, ...cautionMessages]

  return combined.length > 0
    ? combined.slice(0, MAX_MEAL_GUIDANCE)
    : ['Chưa phát hiện thực phẩm nào cần đặc biệt lưu ý — duy trì chế độ ăn cân bằng.']
}

function buildPhaseMealGuidance(profile, phase, dayIndex) {
  const guidance = []
  const base = buildMealGuidanceBase(profile)

  if (phase.key === 'reset') {
    guidance.push('Ưu tiên bữa ăn đơn giản, ít chế biến để dễ quan sát phản ứng da và cơ thể trong vài ngày đầu.')
  }
  if (phase.key === 'stabilize') {
    guidance.push('Giữ giờ ăn đều hơn và cố định ít nhất một bữa lành mạnh trong ngày.')
  }
  if (phase.key === 'improve') {
    guidance.push('Bắt đầu thay thế một món hay ăn bằng lựa chọn phù hợp hơn, nhưng chỉ đổi từng chút một.')
  }
  if (phase.key === 'maintain') {
    guidance.push('Tổng kết xem nhóm thực phẩm nào đang giúp bạn giữ nhịp tốt để duy trì sau roadmap.')
  }

  if ((profile.goals ?? []).includes('giam_can')) {
    guidance.push(dayIndex % 2 === 0 ? 'Ăn chậm hơn trong ít nhất một bữa để kiểm soát khẩu phần dễ hơn.' : 'Chuẩn bị trước bữa phụ nhẹ để tránh ăn bù vào cuối ngày.')
  }
  if ((profile.goals ?? []).includes('tang_can')) {
    guidance.push(dayIndex % 2 === 0 ? 'Đừng bỏ bữa phụ; ưu tiên thêm món đủ năng lượng nhưng vẫn hợp cơ địa.' : 'Chuẩn bị trước một lựa chọn bữa phụ để tránh thiếu năng lượng khi bận.')
  }
  if ((profile.goals ?? []).includes('cai_thien_tieu_hoa')) {
    guidance.push('Ưu tiên món dễ tiêu và ghi lại món nào làm bụng khó chịu để điều chỉnh dần.')
  }

  if (profile.conditionsNote?.trim()) {
    guidance.push(`Lưu ý thêm từ hồ sơ bệnh lý: ${profile.conditionsNote.trim().slice(0, 120)}`)
  }

  return uniqueTexts([...guidance, ...base]).slice(0, MAX_MEAL_GUIDANCE)
}

function buildDailyPlan(profile, durationDays) {
  const today = new Date()
  const dailyPlan = []

  for (let i = 0; i < durationDays; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    const dayIndex = i + 1
    const phase = getPhaseForDay(dayIndex, durationDays)

    dailyPlan.push({
      day_index: dayIndex,
      date: date.toISOString().slice(0, 10),
      phase_key: phase.key,
      phase_title_vi: phase.title_vi,
      coach_note: phase.coach_note,
      skincare_tasks: buildSkincareTasks(profile, dayIndex, durationDays),
      meal_guidance: buildPhaseMealGuidance(profile, phase, dayIndex),
    })
  }

  return dailyPlan
}

// 9E: lộ trình tự thiết kế — cùng "việc mỗi ngày" áp dụng cho mọi ngày trong lộ trình,
// tái dùng đúng field skincare_tasks/meal_guidance để RoadmapPage/CheckInPage hiển thị
// được luôn mà không cần sửa gì (chỉ khác ở "source": "user_custom").
function buildCustomDailyPlan(durationDays, goal, tasks) {
  const today = new Date()
  const dailyPlan = []
  const mealGuidance = goal ? [`Mục tiêu tự đặt: ${goal}`] : []

  for (let i = 0; i < durationDays; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)

    dailyPlan.push({
      day_index: i + 1,
      date: date.toISOString().slice(0, 10),
      skincare_tasks: tasks.map((label, idx) => ({
        id: `d${i + 1}_custom_${idx}`,
        label_vi: label,
        done: false,
      })),
      meal_guidance: mealGuidance,
    })
  }

  return dailyPlan
}

const insertStmt = db.prepare(`
  INSERT INTO roadmaps (user_id, duration_days, source, status, daily_plan)
  VALUES (@user_id, @duration_days, @source, 'active', @daily_plan)
`)
const archiveActiveStmt = db.prepare(`UPDATE roadmaps SET status = 'archived' WHERE user_id = ? AND status = 'active'`)
const getActiveStmt = db.prepare(
  `SELECT * FROM roadmaps WHERE user_id = ? AND status = 'active' ORDER BY created_at DESC LIMIT 1`,
)
const getByIdStmt = db.prepare('SELECT * FROM roadmaps WHERE id = ?')
const updatePlanStmt = db.prepare('UPDATE roadmaps SET daily_plan = ? WHERE id = ?')

function toRoadmapShape(row) {
  if (!row) return null
  return {
    id: row.id,
    durationDays: row.duration_days,
    source: row.source,
    status: row.status,
    dailyPlan: JSON.parse(row.daily_plan),
    createdAt: row.created_at,
  }
}

function saveNewRoadmap(userId, durationDays, source, dailyPlan) {
  const id = db.transaction(() => {
    archiveActiveStmt.run(userId)
    const { lastInsertRowid } = insertStmt.run({
      user_id: userId,
      duration_days: durationDays,
      source,
      daily_plan: JSON.stringify(dailyPlan),
    })
    return lastInsertRowid
  })()

  return toRoadmapShape(getByIdStmt.get(id))
}

export function createRoadmap(userId, profile, durationDays = DEFAULT_DURATION_DAYS) {
  const dailyPlan = buildDailyPlan(profile, durationDays)
  return saveNewRoadmap(userId, durationDays, 'auto_generated', dailyPlan)
}

export function createCustomRoadmap(userId, { goal, durationDays = DEFAULT_DURATION_DAYS, tasks }) {
  const dailyPlan = buildCustomDailyPlan(durationDays, goal, tasks)
  return saveNewRoadmap(userId, durationDays, 'user_custom', dailyPlan)
}

export function getCurrentRoadmap(userId) {
  return toRoadmapShape(getActiveStmt.get(userId))
}

export function setTaskDone(userId, roadmapId, taskId, done) {
  const row = getByIdStmt.get(roadmapId)
  if (!row || row.user_id !== userId) return null

  const dailyPlan = JSON.parse(row.daily_plan)
  const task = dailyPlan.flatMap((day) => day.skincare_tasks).find((t) => t.id === taskId)
  if (!task) return null

  task.done = Boolean(done)
  updatePlanStmt.run(JSON.stringify(dailyPlan), roadmapId)
  return toRoadmapShape(getByIdStmt.get(roadmapId))
}

function buildFeedbackSentence(todayPlan, completedTaskIds, mealDescription) {
  const completed = new Set(completedTaskIds)
  const missedTasks = todayPlan.skincare_tasks.filter((task) => !completed.has(task.id))
  const missedLabels = missedTasks.map((task) => task.label_vi.toLowerCase())
  const feedback = []
  let adaptiveTask = null

  const missedSunscreen = missedLabels.some((label) => label.includes('chống nắng'))
  const missedMoisturize = missedLabels.some((label) => label.includes('dưỡng ẩm'))
  const missedObserve = missedLabels.some(
    (label) => label.includes('theo dõi') || label.includes('ghi lại') || label.includes('chụp nhanh'),
  )
  const missedSleep = missedLabels.some((label) => label.includes('ngủ đúng giờ'))
  const missedWater = missedLabels.some((label) => label.includes('nước uống') || label.includes('uống'))
  const mealLogged = mealDescription.trim().length > 0

  if (missedSunscreen) {
    feedback.push('Hôm qua bạn bỏ chống nắng; hôm nay ưu tiên khóa lại bước này trước khi nghĩ tới treatment khác.')
    adaptiveTask = 'Ưu tiên hoàn thành chống nắng thật sớm trong ngày và nhắc lại nếu ra ngoài lâu'
  }

  if (!adaptiveTask && missedMoisturize) {
    feedback.push('Hôm qua bạn bỏ dưỡng ẩm; hôm nay tập trung phục hồi hàng rào da trước khi thêm bước mới.')
    adaptiveTask = 'Đặt mục tiêu hoàn thành dưỡng ẩm tối nay ngay sau khi làm sạch da'
  }

  if (!adaptiveTask && missedObserve) {
    feedback.push('Hôm qua bạn chưa ghi nhận phản ứng da; hôm nay cố gắng chụp nhanh hoặc ghi 1 dòng để thấy tiến triển rõ hơn.')
    adaptiveTask = 'Cuối ngày chụp nhanh hoặc ghi lại tình trạng da trước khi ngủ'
  }

  if (!adaptiveTask && !mealLogged) {
    feedback.push('Hôm qua bạn chưa ghi bữa ăn; hôm nay ưu tiên chốt ít nhất một bữa để nhìn rõ liên hệ giữa ăn uống và làn da.')
    adaptiveTask = 'Sau bữa chính đầu tiên, ghi ngay món đã ăn để không bỏ sót phần dinh dưỡng'
  }

  if (!adaptiveTask && missedSleep) {
    feedback.push('Hôm qua bạn chưa giữ nhịp nghỉ ngơi như kế hoạch; hôm nay hãy kéo giờ ngủ sớm hơn một chút.')
    adaptiveTask = 'Tắt màn hình sớm hơn 15 phút và cố gắng đi ngủ đúng khung giờ dự định'
  }

  if (!adaptiveTask && missedWater) {
    feedback.push('Hôm qua nhịp uống nước chưa tốt; hôm nay ưu tiên chia nước thành nhiều lần nhỏ trong ngày.')
    adaptiveTask = 'Đặt mốc uống nước trước buổi trưa và trước buổi tối để không dồn cuối ngày'
  }

  if (!adaptiveTask && missedTasks.length === 0 && mealLogged) {
    feedback.push('Hôm qua bạn giữ nhịp rất tốt; hôm nay tiếp tục khóa thói quen này để biến nó thành phản xạ tự nhiên.')
    adaptiveTask = 'Giữ nguyên nhịp tốt hôm qua và hoàn thành checklist trước 22:00'
  }

  if (feedback.length === 0 && missedTasks.length > 0) {
    feedback.push(`Hôm qua bạn còn bỏ sót ${missedTasks.length} việc; hôm nay chỉ cần khóa lại một bước quan trọng trước để lấy đà.`)
    adaptiveTask = `Hoàn thành sớm một trong các việc hôm qua còn bỏ dở: ${missedTasks[0].label_vi}`
  }

  return {
    feedbackText: feedback.join(' '),
    adaptiveTask,
  }
}

function upsertAdaptiveTask(nextDay, adaptiveTask, sourceDate) {
  if (!adaptiveTask) return
  const taskId = `feedback_${sourceDate}`
  const existingIndex = nextDay.skincare_tasks.findIndex((task) => task.id === taskId)

  if (existingIndex >= 0) {
    nextDay.skincare_tasks[existingIndex].label_vi = adaptiveTask
    return
  }

  nextDay.skincare_tasks.unshift({
    id: taskId,
    label_vi: adaptiveTask,
    done: false,
  })
  nextDay.skincare_tasks = nextDay.skincare_tasks.slice(0, 8)
}

export function applyCheckinFeedback(userId, roadmapId, date, skincareTasksCompleted, mealDescription) {
  const row = getByIdStmt.get(roadmapId)
  if (!row || row.user_id !== userId) return null

  const dailyPlan = JSON.parse(row.daily_plan)
  const todayIndex = dailyPlan.findIndex((day) => day.date === date)
  if (todayIndex < 0) return null

  const nextDay = dailyPlan[todayIndex + 1]
  if (!nextDay) return null

  const todayPlan = dailyPlan[todayIndex]
  const { feedbackText, adaptiveTask } = buildFeedbackSentence(
    todayPlan,
    skincareTasksCompleted,
    mealDescription,
  )

  if (!feedbackText && !adaptiveTask) return null

  const baseCoachNote = nextDay.coach_note || ''
  const adaptivePrefix = 'Điều chỉnh từ check-in hôm qua:'
  const cleanedCoachNote = baseCoachNote
    .split(adaptivePrefix)[0]
    .trim()

  nextDay.coach_note = feedbackText
    ? `${cleanedCoachNote}${cleanedCoachNote ? ' ' : ''}${adaptivePrefix} ${feedbackText}`.trim()
    : cleanedCoachNote

  upsertAdaptiveTask(nextDay, adaptiveTask, date)

  updatePlanStmt.run(JSON.stringify(dailyPlan), roadmapId)
  return {
    roadmap: toRoadmapShape(getByIdStmt.get(roadmapId)),
    preview: {
      nextDate: nextDay.date,
      phaseKey: nextDay.phase_key ?? null,
      phaseTitle: nextDay.phase_title_vi ?? null,
      feedbackText,
      adaptiveTask,
    },
  }
}
