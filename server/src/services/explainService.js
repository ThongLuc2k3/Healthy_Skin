import { generateContent } from './geminiClient.js'
import { profileSummaryText } from './geminiService.js'

const MAX_INPUT_LENGTH = 300

function truncate(text) {
  if (typeof text !== 'string') return ''
  return text.length > MAX_INPUT_LENGTH ? text.slice(0, MAX_INPUT_LENGTH) : text
}

function buildPrompt({ nameVi, category, result, reason, profile }) {
  const categoryLabel = category === 'food' ? 'thực phẩm' : 'sản phẩm chăm sóc da'

  return `Bạn là trợ lý giải thích chuyên sâu cho ứng dụng "DA DƯỠNG".

Một ${categoryLabel} tên "${truncate(nameVi)}" vừa được đối chiếu rule-based với hồ sơ cơ địa người
dùng, cho kết quả "${result}" với lý do ngắn gọn: "${truncate(reason)}".

Hồ sơ cơ địa người dùng:
${profileSummaryText(profile)}

Hãy giải thích chi tiết hơn (khoảng 3-5 câu, tiếng Việt, giọng thân thiện dễ hiểu):
- Cơ chế vì sao thành phần/thực phẩm này gây ảnh hưởng như vậy tới loại da/tình trạng sức khỏe này
- Một mẹo thực tế nếu người dùng vẫn muốn dùng (hoặc gợi ý thay thế nếu nên tránh)

Không lặp lại nguyên văn lý do ngắn đã cho, hãy mở rộng thêm thông tin hữu ích. Không đưa ra chẩn đoán
y khoa, chỉ mang tính tham khảo.`
}

export async function explainResult({ nameVi, category, result, reason, profile }) {
  const text = await generateContent([
    { text: buildPrompt({ nameVi, category, result, reason, profile }) },
  ])
  return text
}
