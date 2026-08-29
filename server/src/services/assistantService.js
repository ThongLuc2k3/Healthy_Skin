import { env } from '../config/env.js'
import { listSharingPosts } from './sharingService.js'
import { listRequests } from './requestService.js'
import { listPeople } from './socialService.js'

const systemInstruction = `Bạn là Trợ lý AI của TLUCS (Trusted Local University Community Space), một cộng đồng sinh viên khởi đầu tại HCMUS.
Nhiệm vụ của bạn là trò chuyện tự nhiên bằng tiếng Việt và hỗ trợ người dùng về sản phẩm.

Thông tin chính xác về TLUCS:
- Một tài khoản có thể vừa đăng yêu cầu vừa nhận hỗ trợ.
- Yêu cầu có ba hình thức: miễn phí, trả phí và trao đổi.
- Người dùng nhấn vào thẻ bài để đọc chi tiết, sau đó có thể nhận yêu cầu hoặc tham gia bài chia sẻ.
- Ví, QR, liên kết ngân hàng và thanh toán hiện chỉ là mô phỏng, không phát sinh tiền thật.
- Phí nền tảng dự kiến là 1% trên phần giao dịch được giải ngân thành công.
- Cấm làm hộ, thi hộ, mua bán đề hoặc đáp án, lừa đảo, đa cấp và chia sẻ dữ liệu trái phép.
- Khiếu nại chính thức phải được gửi bằng nút "Gửi khiếu nại" trong chatbot.

Quy tắc trả lời:
- Suy luận linh hoạt, hiểu câu hỏi đời thường, hài hước hoặc không viết đúng chính tả.
- Trả lời thân thiện, súc tích, thường từ 1 đến 4 câu.
- Không bịa tính năng hoặc chính sách. Nếu không biết, nói rõ và hướng người dùng đến khiếu nại/hỗ trợ.
- Không yêu cầu mật khẩu, OTP, số thẻ đầy đủ hoặc dữ liệu nhạy cảm.
- Với câu hỏi vui hoặc chủ quan, có thể đáp dí dỏm nhưng không xúc phạm ai.
- Không tự nhận đã gửi khiếu nại; chỉ giao diện riêng mới thực hiện việc đó.`

function cleanHistory(history) {
  if (!Array.isArray(history)) return []
  return history.slice(-10).map(item => ({
    role: item.role === 'assistant' || item.role === 'bot' ? 'model' : 'user',
    parts: [{ text: String(item.text || '').slice(0, 2000) }],
  })).filter(item => item.parts[0].text)
}

function parseJsonResponse(payload) {
  const text = payload.candidates?.[0]?.content?.parts
    ?.map(part => part.text)
    .filter(Boolean)
    .join('\n')
    .trim()
  if (!text) throw Object.assign(new Error('AI Agent chưa tạo được kế hoạch.'), { status: 502, code: 'AI_EMPTY_RESPONSE' })
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  try { return JSON.parse(cleaned) } catch { throw Object.assign(new Error('AI Agent trả dữ liệu không hợp lệ.'), { status: 502, code: 'AI_INVALID_RESPONSE' }) }
}

const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds))

async function generateContent(body, timeoutMs = 30000) {
  let lastResult
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(env.geminiModel)}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': env.geminiApiKey },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    })
    const payload = await response.json().catch(() => ({}))
    lastResult = { response, payload }
    if (response.ok || ![429, 503].includes(response.status) || attempt === 2) return lastResult
    await wait(attempt === 0 ? 600 : 1500)
  }
  return lastResult
}

export async function askAssistant(message, history = []) {
  const text = String(message || '').trim()
  if (!text || text.length > 2000) throw Object.assign(new Error('Câu hỏi cần từ 1 đến 2.000 ký tự.'), { status: 422 })
  if (!env.geminiApiKey) throw Object.assign(new Error('Trợ lý AI chưa được cấu hình.'), { status: 503, code: 'AI_NOT_CONFIGURED' })
  const { response, payload } = await generateContent({ system_instruction: { parts: [{ text: systemInstruction }] }, contents: [...cleanHistory(history), { role: 'user', parts: [{ text }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 1024 } }, 15000)
  if (!response.ok) throw Object.assign(new Error('Trợ lý AI đang bận. Vui lòng thử lại sau.'), { status: 502, code: 'AI_PROVIDER_ERROR', cause: payload.error })
  const answer = payload.candidates?.[0]?.content?.parts?.map(part => part.text).filter(Boolean).join('\n').trim()
  if (!answer) throw Object.assign(new Error('Trợ lý AI chưa tạo được câu trả lời.'), { status: 502, code: 'AI_EMPTY_RESPONSE' })
  return answer
}

export async function runSearch(target, q, context = {}) {
  const query = String(q || '').trim().slice(0, 200)
  if (target === 'sharing') {
    const rows = await listSharingPosts({ q: query, universityId: context.universityId })
    return rows.slice(0, 5).map(row => ({ title: row.title, format: row.format, priceVnd: Number(row.access_price_vnd), host: row.display_name, university: row.university_code }))
  }
  if (target === 'requests') {
    const rows = await listRequests({ q: query, universityId: context.universityId })
    return rows.slice(0, 5).map(row => ({ title: row.title, kind: row.kind, courseName: row.course_name }))
  }
  if (target === 'peers') {
    const rows = await listPeople(context.userId, { q: query, universityId: context.universityId })
    return rows.slice(0, 5).map(row => ({ displayName: row.display_name, university: row.university_code, rating: row.average_rating }))
  }
  return []
}

export async function summarizeSearchResults(message, history, context, target, results) {
  const prompt = `${systemInstruction}
Bạn vừa tra cứu dữ liệu thật trong hệ thống theo yêu cầu người dùng. Hãy trả lời tự nhiên, súc tích (tối đa 5 câu), liệt kê những kết quả nổi bật kèm thông tin chính (tiêu đề, hình thức/giá hoặc trường). Nếu kết quả rỗng, nói rõ chưa tìm thấy và gợi ý người dùng thử từ khóa khác hoặc tự đăng yêu cầu/bài chia sẻ. Tuyệt đối không bịa thêm kết quả ngoài dữ liệu được cung cấp dưới đây.
Loại tra cứu: ${target}
Kết quả (JSON, có thể rỗng): ${JSON.stringify(results)}
Bối cảnh người dùng: ${JSON.stringify(context)}`
  const { response, payload } = await generateContent({ system_instruction: { parts: [{ text: prompt }] }, contents: [...cleanHistory(history), { role: 'user', parts: [{ text: String(message).slice(0, 2000) }] }], generationConfig: { temperature: 0.5, maxOutputTokens: 1024 } }, 15000)
  if (!response.ok) throw Object.assign(new Error('Trợ lý AI đang bận. Vui lòng thử lại sau.'), { status: 502, code: 'AI_PROVIDER_ERROR', cause: payload.error })
  const text = payload.candidates?.[0]?.content?.parts?.map(part => part.text).filter(Boolean).join('\n').trim()
  if (!text) throw Object.assign(new Error('Trợ lý AI chưa tạo được câu trả lời.'), { status: 502, code: 'AI_EMPTY_RESPONSE' })
  return text
}

export async function planAgent(message,history=[],context={}){
  const agentPrompt=`${systemInstruction}
Bạn còn là agent lập kế hoạch, có thể tự tra cứu dữ liệu thật và đề xuất thao tác thay đổi dữ liệu thay cho người dùng. Chỉ trả JSON hợp lệ đúng MỘT trong các dạng sau, không thêm chữ nào khác:
{"reply":"...","action":null}
{"reply":"...","action":{"type":"search","payload":{"target":"sharing|requests|peers","q":"..."}}}
{"reply":"...","action":{"type":"create_request","summary":"...","payload":{...}}}
{"reply":"...","action":{"type":"update_profile","summary":"...","payload":{...}}}
{"reply":"...","action":{"type":"create_sharing_post","summary":"...","payload":{...}}}
{"reply":"...","action":{"type":"wallet_topup","summary":"...","payload":{"amountVnd":number}}}
{"reply":"...","action":{"type":"wallet_withdraw","summary":"...","payload":{"amountVnd":number}}}

Quy tắc chọn action:
- "search": khi người dùng muốn TÌM/TRA CỨU nội dung có sẵn (bài chia sẻ/tài liệu, yêu cầu hỗ trợ, hoặc thành viên) chứ không phải tự đăng nội dung mới. Hệ thống sẽ tự thực thi tra cứu ngay và trả lời bằng dữ liệu thật, không cần người dùng xác nhận. q là từ khóa ngắn rút ra từ câu hỏi, target chọn đúng một trong sharing/requests/peers.
- "create_request": khi người dùng muốn tự đăng một yêu cầu cần hỗ trợ mới. Cần đủ: kind (free|paid|exchange), universityId, courseName, title, description ít nhất 20 ký tự, durationMinutes, startsAt ISO; luôn đặt deliveryMode là online; nếu paid cần amountVnd; nếu exchange cần offeredDescription.
- "update_profile": chỉ dùng displayName và areaLabel.
- "create_sharing_post": khi người dùng muốn tự đăng bài chia sẻ tài liệu hoặc mở một buổi trao đổi mới lên Bảng chia sẻ. Cần đủ: format (instant_unlock|scheduled_exchange), title (tự viết rõ ràng, ít nhất 10 ký tự), description (tự viết đầy đủ từ ý người dùng, ít nhất 20 ký tự), accessPriceVnd (số nguyên VND, 0 nếu miễn phí). Nếu accessPriceVnd>0 phải tự soạn thêm deliverables, contentFormat, contentExtent, refundTerms hợp lý từ ý người dùng. Nếu format là scheduled_exchange cần thêm startsAt (ISO), capacity (số nguyên), minimumParticipants (mặc định 1 nếu người dùng không nói).
- "wallet_topup" / "wallet_withdraw": khi người dùng muốn nạp hoặc rút tiền ví mô phỏng. amountVnd là số nguyên VND, chỉ chấp nhận từ 10.000 đến 1.000.000; hiểu "10k" là 10000.
- Với mọi action làm thay đổi dữ liệu (không tính search), nếu chỉ thiếu đúng một dữ kiện thực sự chưa được nói, action phải null và chỉ hỏi đúng dữ kiện đó. Khi đã đủ dữ liệu, phải tạo action kèm summary rõ ràng để người dùng xác nhận, không chỉ hướng dẫn họ tự làm.
- Hiểu cách nói tự nhiên như 10k là 10000 VND, 8h tối là 20:00 và tối nay là ngày hiện tại theo timezone trong bối cảnh. Dùng universityId tương ứng trong memberships khi người dùng nói mã trường như HCMUS.
- Không tự đoán thời gian, số tiền hoặc trường khi người dùng chưa nói.
Bối cảnh người dùng: ${JSON.stringify(context)}`
  if(!env.geminiApiKey)throw Object.assign(new Error('Trợ lý AI chưa được cấu hình.'),{status:503})
  const {response,payload}=await generateContent({system_instruction:{parts:[{text:agentPrompt}]},contents:[...cleanHistory(history),{role:'user',parts:[{text:String(message).slice(0,2000)}]}],generationConfig:{temperature:.2,maxOutputTokens:3000,responseMimeType:'application/json'}},30000)
  if(!response.ok)throw Object.assign(new Error('AI Agent đang bận.'),{status:502,code:'AI_PROVIDER_ERROR',cause:payload.error});return parseJsonResponse(payload)
}
