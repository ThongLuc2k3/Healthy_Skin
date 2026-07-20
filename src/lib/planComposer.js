import { getRecommendations, RESULT } from '../logic/matchEngine'

const FOCUS_LABELS = {
  calm_skin: 'Làm dịu da và giảm kích ứng',
  acne_control: 'Kiểm soát dầu và giảm mụn',
  glow_up: 'Da sáng khỏe và đều màu hơn',
  healthy_eating: 'Ăn uống ổn định để da khỏe từ bên trong',
}

const BUDGET_LABELS = {
  lean: 'dưới 500k/tháng',
  balanced: '500k - 1.5 triệu/tháng',
  premium: 'trên 1.5 triệu/tháng',
}

const COMMITMENT_LABELS = {
  quick: '10 phút/ngày',
  steady: '20 phút/ngày',
  deep: '30 phút/ngày',
}

const FOCUS_TASKS = {
  calm_skin: [
    'Ưu tiên routine dịu nhẹ, tránh thay quá nhiều sản phẩm cùng lúc',
    'Theo dõi phản ứng da sau mỗi lần dùng sản phẩm mới trong 24 giờ',
  ],
  acne_control: [
    'Giữ da sạch nhưng không chà xát mạnh, tập trung kiểm soát dầu vùng chữ T',
    'Đổi vỏ gối hoặc khăn mặt sạch để giảm nguy cơ bí tắc và vi khuẩn tích tụ',
  ],
  glow_up: [
    'Giữ đều chống nắng và dưỡng ẩm để da sáng khỏe ổn định hơn',
    'Theo dõi độ đều màu và độ ẩm da vào cuối ngày bằng một ghi chú ngắn',
  ],
  healthy_eating: [
    'Mỗi ngày chốt trước 1 bữa ăn lành mạnh để tránh ăn theo cảm hứng',
    'Ưu tiên thực phẩm tươi, hạn chế đồ chế biến sẵn nhiều đường hoặc muối',
  ],
}

function pickTopNames(items, count = 2) {
  return items.slice(0, count).map((item) => item.name_vi)
}

function detectMentionedItems(freeText, items) {
  const normalized = freeText.trim().toLowerCase()
  if (!normalized) return []
  return items.filter((item) => normalized.includes(item.name_vi.toLowerCase()))
}

export function buildPersonalizedPlan(profile, preferences, skincareItems, foodItems) {
  const skincareResults = getRecommendations(profile, skincareItems)
  const foodResults = getRecommendations(profile, foodItems)

  const suitableSkincare = skincareResults[RESULT.SUITABLE]
  const avoidSkincare = skincareResults[RESULT.AVOID]
  const cautionSkincare = skincareResults[RESULT.CAUTION]
  const suitableFood = foodResults[RESULT.SUITABLE]
  const avoidFood = foodResults[RESULT.AVOID]
  const cautionFood = foodResults[RESULT.CAUTION]

  const focusLabel = FOCUS_LABELS[preferences.focusArea] ?? 'Cải thiện làn da và thói quen'
  const budgetLabel = BUDGET_LABELS[preferences.monthlyBudget] ?? 'ngân sách linh hoạt'
  const commitmentLabel = COMMITMENT_LABELS[preferences.commitment] ?? '20 phút/ngày'

  const currentProductWarnings = detectMentionedItems(preferences.currentProducts, avoidSkincare)
  const currentFoodWarnings = detectMentionedItems(preferences.currentFoods, avoidFood)

  const baseTasks = [...(FOCUS_TASKS[preferences.focusArea] ?? FOCUS_TASKS.calm_skin)]

  const routineTask =
    preferences.commitment === 'quick'
      ? 'Giữ routine tối giản: rửa mặt dịu nhẹ, dưỡng ẩm và chống nắng mỗi ngày'
      : preferences.commitment === 'deep'
        ? 'Duy trì routine đủ bước nhưng chỉ thay đổi 1 chi tiết nhỏ mỗi tuần để da kịp thích nghi'
        : 'Giữ routine ổn định sáng - tối, không bỏ chống nắng và dưỡng ẩm'

  const budgetTask =
    preferences.monthlyBudget === 'lean'
      ? 'Ưu tiên mua ít món nhưng dùng đều: làm sạch dịu nhẹ, dưỡng ẩm, chống nắng trước khi nghĩ tới sản phẩm nâng cao'
      : preferences.monthlyBudget === 'premium'
        ? 'Nếu muốn nâng cấp routine, chỉ thêm tối đa 1 sản phẩm treatment mới và theo dõi phản ứng da'
        : 'Cân đối ngân sách theo nhóm: sản phẩm nền tảng trước, treatment sau'

  const skincareSuggestionNames = pickTopNames(suitableSkincare, 2)
  const foodSuggestionNames = pickTopNames(suitableFood, 2)
  const cautionFoodNames = pickTopNames(avoidFood.length > 0 ? avoidFood : cautionFood, 2)
  const cautionSkincareNames = pickTopNames(avoidSkincare.length > 0 ? avoidSkincare : cautionSkincare, 2)

  const adjustmentTasks = []

  if (currentProductWarnings.length > 0) {
    adjustmentTasks.push(
      `Tạm dừng hoặc giảm tần suất ${currentProductWarnings[0].name_vi} để xem da có bớt kích ứng/bí tắc không`,
    )
  } else if (cautionSkincareNames.length > 0) {
    adjustmentTasks.push(`Rà lại các sản phẩm đang dùng, hạn chế nhóm như ${cautionSkincareNames.join(', ')}`)
  }

  if (currentFoodWarnings.length > 0) {
    adjustmentTasks.push(
      `Giảm ngay ${currentFoodWarnings[0].name_vi} trong tuần đầu để quan sát phản ứng cơ thể và làn da`,
    )
  } else if (cautionFoodNames.length > 0) {
    adjustmentTasks.push(`Trong bữa ăn hằng ngày, hạn chế nhóm ${cautionFoodNames.join(', ')}`)
  }

  if (foodSuggestionNames.length > 0) {
    adjustmentTasks.push(`Cố gắng chèn vào thực đơn 1-2 lựa chọn phù hợp như ${foodSuggestionNames.join(', ')}`)
  }

  if (skincareSuggestionNames.length > 0) {
    adjustmentTasks.push(`Nếu cần thay thế sản phẩm, ưu tiên nhóm phù hợp như ${skincareSuggestionNames.join(', ')}`)
  }

  if (preferences.notes.trim()) {
    adjustmentTasks.push(`Mỗi tối ghi nhanh 1 dòng về mục tiêu riêng: ${preferences.notes.trim().slice(0, 120)}`)
  } else {
    adjustmentTasks.push('Mỗi tối chấm nhanh da hôm nay theo thang 1-5 để thấy tiến triển rõ hơn')
  }

  const tasks = [...baseTasks, routineTask, budgetTask, ...adjustmentTasks]
    .filter(Boolean)
    .slice(0, 7)

  const goal = `${focusLabel} trong ${preferences.durationDays} ngày, theo nhịp ${commitmentLabel}, ngân sách ${budgetLabel}`

  const summary = {
    focusLabel,
    budgetLabel,
    commitmentLabel,
    durationDays: preferences.durationDays,
    productHeadline: skincareSuggestionNames.length > 0 ? skincareSuggestionNames.join(' • ') : 'Routine tối giản, ổn định',
    mealHeadline: foodSuggestionNames.length > 0 ? foodSuggestionNames.join(' • ') : 'Ăn sạch, đều bữa, ít chế biến',
    watchouts: [...cautionSkincareNames, ...cautionFoodNames].slice(0, 3),
  }

  return { goal, tasks, summary }
}
