import { generateChatReply } from './geminiClient.js'
import { profileSummaryText } from './geminiService.js'

const MAX_MESSAGES = 20
const MAX_MESSAGE_LENGTH = 1000

function buildSystemInstruction(context) {
  const profile = context?.profile
  const profileText = profile?.skinType
    ? `Hồ sơ cơ địa hiện tại của người dùng:\n${profileSummaryText(profile)}`
    : 'Người dùng chưa khai báo hồ sơ cơ địa.'

  return `Bạn là trợ lý ảo trong ứng dụng "DA DƯỠNG" — nền tảng cá nhân hóa chăm sóc da và dinh dưỡng
dựa trên một hồ sơ cơ địa dùng chung. Nhiệm vụ: trả lời ngắn gọn, thân thiện bằng tiếng Việt, giúp
người dùng hiểu cách dùng app (khai báo hồ sơ, xem kết quả gợi ý, quét ảnh sản phẩm) và giải đáp thắc
mắc về thành phần mỹ phẩm/thực phẩm liên quan tới hồ sơ cơ địa của họ.

${profileText}
Trang hiện tại người dùng đang xem: ${context?.page || 'không rõ'}.

Quy tắc:
- Trả lời ngắn gọn (tối đa khoảng 5 câu), không lan man.
- Nếu câu hỏi liên quan sức khỏe nghiêm trọng, khuyên người dùng gặp bác sĩ/chuyên gia, không tự chẩn đoán thay.
- Nếu không chắc chắn, thành thật nói không chắc thay vì bịa thông tin.
- Không đưa ra lời khuyên mang tính chẩn đoán y khoa.`
}

function toGeminiRole(role) {
  return role === 'assistant' ? 'model' : 'user'
}

export async function chatReply(messages, context) {
  const contents = messages.slice(-MAX_MESSAGES).map((m) => ({
    role: toGeminiRole(m.role),
    parts: [{ text: String(m.text).slice(0, MAX_MESSAGE_LENGTH) }],
  }))

  return generateChatReply(contents, buildSystemInstruction(context))
}
