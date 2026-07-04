import { generateContent, GeminiNotConfiguredError, GeminiRequestError } from './geminiClient.js'
import { SKIN_TYPES, ALLERGIES, CONDITIONS, GOALS } from '../../../src/data/profileOptions.js'

export { GeminiNotConfiguredError, GeminiRequestError }

const RESULT_VALUES = ['phù hợp', 'cần cân nhắc', 'nên tránh']

const SKIN_LABELS = Object.fromEntries(SKIN_TYPES.map((o) => [o.id, o.label]))
const ALLERGY_LABELS = Object.fromEntries(ALLERGIES.map((o) => [o.id, o.label]))
const CONDITION_LABELS = Object.fromEntries(CONDITIONS.map((o) => [o.id, o.label]))
const GOAL_LABELS = Object.fromEntries(GOALS.map((o) => [o.id, o.label]))

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    recognized: {
      type: 'BOOLEAN',
      description: 'true nếu nhận diện rõ một sản phẩm/thực phẩm cụ thể trong ảnh',
    },
    productName: { type: 'STRING', description: 'Tên sản phẩm hoặc thực phẩm nhận diện được' },
    result: { type: 'STRING', enum: RESULT_VALUES },
    reason: { type: 'STRING', description: 'Giải thích ngắn gọn 1-3 câu bằng tiếng Việt' },
  },
  required: ['recognized', 'productName', 'result', 'reason'],
}

export function skinLabel(skinType) {
  return SKIN_LABELS[skinType] || skinType || 'không rõ'
}

export function allergyLabels(allergies) {
  return (allergies || []).map((id) => ALLERGY_LABELS[id] || id)
}

export function conditionLabels(conditions) {
  return (conditions || []).map((id) => CONDITION_LABELS[id] || id)
}

export function goalLabels(goals) {
  return (goals || []).map((id) => GOAL_LABELS[id] || id)
}

// Gộp hồ sơ cơ địa thành đoạn văn cho prompt — bao gồm cả mô tả tự do ("Khác") nếu người dùng có
// nhập, vì đôi khi các mục có sẵn không đủ để mô tả đúng tình trạng của họ.
export function profileSummaryText(profile) {
  const allergies = allergyLabels(profile?.allergies)
  const conditions = conditionLabels(profile?.conditions)
  const goals = goalLabels(profile?.goals)

  const lines = [
    `- Loại da: ${skinLabel(profile?.skinType)}${
      profile?.skinTypeNote ? ` (mô tả thêm của người dùng: "${profile.skinTypeNote}")` : ''
    }`,
    `- Dị ứng thực phẩm: ${allergies.length ? allergies.join(', ') : 'không có'}${
      profile?.allergiesNote ? ` (mô tả thêm của người dùng: "${profile.allergiesNote}")` : ''
    }`,
    `- Bệnh lý nền liên quan dinh dưỡng: ${conditions.length ? conditions.join(', ') : 'không có'}${
      profile?.conditionsNote ? ` (mô tả thêm của người dùng: "${profile.conditionsNote}")` : ''
    }`,
    `- Mục tiêu: ${goals.length ? goals.join(', ') : 'không có'}${
      profile?.goalsNote ? ` (mô tả thêm của người dùng: "${profile.goalsNote}")` : ''
    }`,
  ]

  return lines.join('\n')
}

function buildPrompt(profile) {
  return `Bạn là trợ lý phân tích sản phẩm chăm sóc da và thực phẩm cho ứng dụng "DA DƯỠNG".

Hồ sơ cơ địa người dùng:
${profileSummaryText(profile)}

Nhiệm vụ: Nhìn ảnh được đính kèm (có thể là bảng thành phần mỹ phẩm, nhãn dinh dưỡng, hoặc một sản
phẩm/món ăn cụ thể).
1. Xác định tên sản phẩm hoặc thực phẩm trong ảnh.
2. Đối chiếu với hồ sơ cơ địa ở trên, kết luận CHÍNH XÁC một trong ba mức: "phù hợp", "cần cân nhắc",
   hoặc "nên tránh".
3. Giải thích ngắn gọn 1-3 câu bằng tiếng Việt, nêu thành phần/yếu tố cụ thể liên quan tới hồ sơ nếu có.

Nếu không nhận diện được sản phẩm/thực phẩm rõ ràng trong ảnh, đặt recognized=false và nêu lý do
trong trường reason (ví dụ: ảnh mờ, không phải mỹ phẩm/thực phẩm).`
}

export async function analyzeImage(imageBuffer, mimeType, profile) {
  const parsed = await generateContent(
    [
      { text: buildPrompt(profile) },
      { inlineData: { mimeType, data: imageBuffer.toString('base64') } },
    ],
    { responseSchema: RESPONSE_SCHEMA },
  )

  if (!RESULT_VALUES.includes(parsed.result)) {
    parsed.result = 'cần cân nhắc'
  }

  return parsed
}
