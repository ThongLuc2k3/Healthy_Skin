import { env } from '../config/env.js'
import { ASSISTANT_TOOL_SCHEMAS, MUTATING_ASSISTANT_TOOLS, READ_ASSISTANT_TOOLS, executeAssistantTool } from './assistantTools.js'

const systemInstruction = `Bạn là Agent TLUCS (Trusted Local University Community Space), cộng đồng sinh viên khởi đầu tại HCMUS.
Bạn trò chuyện tự nhiên bằng tiếng Việt và dùng tool để đọc hoặc thao tác dữ liệu thật thay cho người dùng.

Nguyên tắc bắt buộc:
- Một tài khoản có thể vừa đăng yêu cầu vừa nhận hỗ trợ. Yêu cầu gồm miễn phí, trả phí và trao đổi.
- Ví, QR, liên kết ngân hàng và thanh toán đều là mô phỏng, không phát sinh tiền thật. Phí nền tảng dự kiến là 1% phần được giải ngân thành công.
- Cấm làm hộ, thi hộ, mua bán đề hoặc đáp án, lừa đảo, đa cấp và chia sẻ dữ liệu trái phép.
- Dùng tool đọc để tra dữ liệu thật; không tự bịa ID, kết quả, trạng thái, số dư, lịch sử hoặc chính sách.
- Khi thiếu dữ kiện bắt buộc, hỏi đúng dữ kiện còn thiếu. Hiểu lỗi chính tả, 10k = 10000 VND và thời gian đời thường theo Asia/Ho_Chi_Minh.
- Khi người dùng muốn thay đổi dữ liệu, hãy gọi đúng tool thay đổi. Máy chủ sẽ yêu cầu họ xác nhận trước khi chạy tool đó.
- Không yêu cầu mật khẩu, OTP, số thẻ đầy đủ hoặc dữ liệu nhạy cảm.
- Trả lời thân thiện, gọn, thường 1 đến 5 câu. Nếu không có dữ liệu đáng tin cậy, nói rõ là chưa biết.`

export function cleanHistory(history) {
  if (!Array.isArray(history)) return []
  return history.slice(-20).map(item => ({
    role: item.role === 'assistant' || item.role === 'bot' ? 'model' : 'user',
    parts: [{ text: String(item.text || '').slice(0, 2000) }],
  })).filter(item => item.parts[0].text)
}

const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds))

async function generateContent(body, timeoutMs = 120000) {
  let lastResult
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(env.geminiModel)}:generateContent`, {
      method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': env.geminiApiKey }, body: JSON.stringify(body), signal: AbortSignal.timeout(timeoutMs),
    })
    const payload = await response.json().catch(() => ({}))
    lastResult = { response, payload }
    if (response.ok || ![429, 500, 503].includes(response.status) || attempt === 2) return lastResult
    await wait(attempt === 0 ? 1000 : 3000)
  }
  return lastResult
}

function providerError(response, payload) {
  const providerMessage = payload?.error?.message || ''
  const quota = response.status === 429 || /quota|rate limit|resource exhausted/i.test(providerMessage)
  return Object.assign(new Error(quota ? 'Gemini đã hết hạn mức API hiện tại. Bạn vẫn có thể dùng tra cứu RAG nội bộ.' : 'AI Agent đang bận hoặc chưa phản hồi. Bạn có thể thử lại sau.'), { status: response.status === 429 ? 429 : 502, code: quota ? 'AI_QUOTA_EXCEEDED' : 'AI_PROVIDER_ERROR', cause: payload?.error })
}

const responseParts = payload => payload?.candidates?.[0]?.content?.parts || []
const textFromParts = parts => parts.map(part => part.text).filter(Boolean).join('\n').trim()
function trimToolResult(value) { const json = JSON.stringify(value ?? null); return json.length <= 12000 ? value ?? null : { truncated: true, preview: json.slice(0, 12000) } }

function pendingSummary(name, args) {
  const labels = {
    create_request: 'Đăng yêu cầu hỗ trợ', accept_request: 'Nhận yêu cầu', select_request_application: 'Chọn ứng viên', create_sharing_post: 'Đăng bài chia sẻ', join_sharing_post: 'Tham gia bài chia sẻ', confirm_sharing_access: 'Xác nhận đã nhận nội dung', cancel_sharing_participation: 'Hủy tham gia', cancel_sharing_post: 'Hủy bài chia sẻ', update_profile: 'Cập nhật hồ sơ', wallet_topup: 'Nạp ví mô phỏng', wallet_withdraw: 'Rút ví mô phỏng', pay_request_remaining: 'Thanh toán phần còn lại', release_request_payment: 'Giải ngân giao dịch', check_in_session: 'Check-in phiên', complete_session: 'Hoàn tất phiên', review_session: 'Đánh giá phiên', report_no_show: 'Báo vắng mặt', open_request_dispute: 'Mở tranh chấp yêu cầu', open_sharing_dispute: 'Mở tranh chấp chia sẻ', create_forum_post: 'Đăng bài diễn đàn', add_forum_comment: 'Gửi bình luận', react_forum_post: 'Thả cảm xúc bài viết', react_forum_comment: 'Thả cảm xúc bình luận', save_forum_post: 'Lưu hoặc bỏ lưu bài', follow_forum_post: 'Theo dõi hoặc bỏ theo dõi bài', gift_forum_post: 'Tặng quà bài viết', gift_forum_comment: 'Tặng quà bình luận', send_conversation_message: 'Gửi tin nhắn riêng', send_channel_message: 'Gửi tin nhắn kênh', request_direct_chat: 'Gửi lời mời trò chuyện', respond_chat_request: 'Phản hồi lời mời chat', mark_notification_read: 'Đánh dấu thông báo đã đọc', propose_community_channel: 'Đề xuất kênh cộng đồng', submit_verification: 'Gửi yêu cầu xác minh', create_report: 'Gửi báo cáo hỗ trợ',
  }
  const details = Object.entries(args || {}).filter(([, value]) => value !== undefined && value !== '').slice(0, 5).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join(' · ')
  return `${labels[name] || name}${details ? ` — ${details}` : ''}`
}

export async function askAssistant(message, history = []) {
  const text = String(message || '').trim()
  if (!text || text.length > 2000) throw Object.assign(new Error('Câu hỏi cần từ 1 đến 2.000 ký tự.'), { status: 422 })
  if (!env.geminiApiKey) throw Object.assign(new Error('Trợ lý AI chưa được cấu hình.'), { status: 503, code: 'AI_NOT_CONFIGURED' })
  const { response, payload } = await generateContent({ system_instruction: { parts: [{ text: systemInstruction }] }, contents: [...cleanHistory(history), { role: 'user', parts: [{ text }] }], generationConfig: { temperature: 0.5, maxOutputTokens: 1024 } })
  if (!response.ok) throw providerError(response, payload)
  const answer = textFromParts(responseParts(payload))
  if (!answer) throw Object.assign(new Error('Trợ lý AI chưa tạo được câu trả lời.'), { status: 502, code: 'AI_EMPTY_RESPONSE' })
  return answer
}

export async function planAgent(message, history = [], context = {}) {
  const text = String(message || '').trim()
  if (!text || text.length > 2000) throw Object.assign(new Error('Yêu cầu cần từ 1 đến 2.000 ký tự.'), { status: 422 })
  if (!env.geminiApiKey) throw Object.assign(new Error('AI Agent chưa được cấu hình. Tra cứu RAG nội bộ vẫn hoạt động.'), { status: 503, code: 'AI_NOT_CONFIGURED' })
  const contents = [...cleanHistory(history), { role: 'user', parts: [{ text }] }], toolsUsed = []
  const instruction = `${systemInstruction}\nBối cảnh người dùng và thời gian hiện tại (JSON): ${JSON.stringify(context)}`
  for (let step = 1; step <= 12; step += 1) {
    const { response, payload } = await generateContent({ system_instruction: { parts: [{ text: instruction }] }, contents, tools: [{ functionDeclarations: ASSISTANT_TOOL_SCHEMAS }], toolConfig: { functionCallingConfig: { mode: 'AUTO' } }, generationConfig: { temperature: 0.2, maxOutputTokens: 3000 } })
    if (!response.ok) throw providerError(response, payload)
    const parts = responseParts(payload), calls = parts.filter(part => part.functionCall).map(part => part.functionCall)
    if (!calls.length) return { reply: textFromParts(parts) || 'Mình chưa biết câu trả lời đáng tin cậy cho yêu cầu này.', action: null, toolsUsed, steps: step }
    contents.push({ role: 'model', parts })
    const responses = []
    for (const call of calls) {
      const name = call.name, args = call.args || {}
      if (MUTATING_ASSISTANT_TOOLS.has(name)) return { reply: 'Mình đã chuẩn bị thao tác dưới đây. Bạn kiểm tra rồi xác nhận để mình thực hiện.', action: { type: name, summary: pendingSummary(name, args), payload: args }, toolsUsed, steps: step }
      if (!READ_ASSISTANT_TOOLS.has(name)) { responses.push({ functionResponse: { name, response: { error: 'Tool không được hỗ trợ.' } } }); continue }
      try { const result = await executeAssistantTool(name, args, context); toolsUsed.push(name); responses.push({ functionResponse: { name, response: { result: trimToolResult(result) } } }) }
      catch (error) { responses.push({ functionResponse: { name, response: { error: error.message } } }) }
    }
    contents.push({ role: 'user', parts: responses })
  }
  return { reply: 'Mình đã dùng tối đa 12 bước nhưng chưa đủ dữ liệu để hoàn tất. Bạn hãy nói cụ thể hơn một chút.', action: null, toolsUsed, steps: 12 }
}
