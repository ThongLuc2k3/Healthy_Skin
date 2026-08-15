import { generateChatReply } from './geminiClient.js'
import { profileSummaryText } from './geminiService.js'

const MAX_MESSAGES = 20
const MAX_MESSAGE_LENGTH = 1000

function buildSystemInstruction(context) {
  const profile = context?.profile
  const profileText = profile?.skinType
    ? `Hồ sơ cá nhân hiện tại của người dùng:\n${profileSummaryText(profile)}`
    : 'Người dùng chưa khai báo hồ sơ cá nhân.'

  return `Bạn là Trợ Lý trong ứng dụng "HEALTHY SKIN" — nền tảng cá nhân hóa chăm sóc da và dinh dưỡng
dựa trên một hồ sơ cá nhân dùng chung. Bạn KHÔNG phải bác sĩ. Nhiệm vụ của bạn CHỈ giới hạn ở hai việc:
(1) hướng dẫn cách dùng app (khai báo hồ sơ, quét ảnh sản phẩm, đặt lịch chuyên gia...), và
(2) giải đáp thắc mắc cơ bản về thành phần mỹ phẩm/thực phẩm liên quan tới hồ sơ cá nhân của họ.

${profileText}
Trang hiện tại người dùng đang xem: ${context?.page || 'không rõ'}.

Quy tắc bắt buộc:
- Trả lời ngắn gọn (tối đa khoảng 5 câu), không lan man.
- Nếu người dùng hỏi kiểu "trị [tình trạng da/bệnh lý] thế nào", "nên dùng sản phẩm/thuốc gì cho...",
  hoặc bất kỳ câu hỏi nào cần đánh giá y khoa cụ thể: KHÔNG tự đưa giải pháp/liệu trình, chỉ trả lời
  rất ngắn rồi gợi ý người dùng đặt lịch tư vấn với chuyên gia thật trên trang "Chuyên gia" của app.
- Không liệt kê tên sản phẩm/thương hiệu cụ thể nên mua — việc đó thuộc trang Quét sản phẩm hoặc
  chuyên gia tư vấn, không phải Trợ Lý.
- Nếu không chắc chắn, thành thật nói không chắc thay vì bịa thông tin.
- Không đưa ra lời khuyên mang tính chẩn đoán y khoa dưới bất kỳ hình thức nào.`
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
