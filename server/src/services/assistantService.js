import { env } from '../config/env.js'

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

export async function askAssistant(message, history = []) {
  const text = String(message || '').trim()
  if (!text || text.length > 2000) throw Object.assign(new Error('Câu hỏi cần từ 1 đến 2.000 ký tự.'), { status: 422 })
  if (!env.geminiApiKey) throw Object.assign(new Error('Trợ lý AI chưa được cấu hình.'), { status: 503, code: 'AI_NOT_CONFIGURED' })
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(env.geminiModel)}:generateContent`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': env.geminiApiKey },
    body: JSON.stringify({ system_instruction: { parts: [{ text: systemInstruction }] }, contents: [...cleanHistory(history), { role: 'user', parts: [{ text }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 350 } }),
    signal: AbortSignal.timeout(15000),
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw Object.assign(new Error('Trợ lý AI đang bận. Vui lòng thử lại sau.'), { status: 502, code: 'AI_PROVIDER_ERROR', cause: payload.error })
  const answer = payload.candidates?.[0]?.content?.parts?.map(part => part.text).filter(Boolean).join('\n').trim()
  if (!answer) throw Object.assign(new Error('Trợ lý AI chưa tạo được câu trả lời.'), { status: 502, code: 'AI_EMPTY_RESPONSE' })
  return answer
}

export async function planAgent(message,history=[],context={}){
  const agentPrompt=`${systemInstruction}\nBạn còn là agent lập kế hoạch. Chỉ trả JSON hợp lệ dạng {"reply":"...","action":null} hoặc {"reply":"...","action":{"type":"create_request|update_profile","summary":"...","payload":{...}}}. Với create_request cần đủ: kind (free|paid|exchange), universityId, courseName, title, description ít nhất 20 ký tự, durationMinutes, deliveryMode, startsAt ISO; nếu paid cần amountVnd; nếu exchange cần offeredDescription. Với update_profile chỉ dùng displayName và areaLabel. Nếu thiếu trường bắt buộc, action phải null và reply phải hỏi đúng thông tin còn thiếu. Không tự đoán thời gian, số tiền hay trường. Bối cảnh người dùng: ${JSON.stringify(context)}`
  if(!env.geminiApiKey)throw Object.assign(new Error('Trợ lý AI chưa được cấu hình.'),{status:503})
  const response=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(env.geminiModel)}:generateContent`,{method:'POST',headers:{'content-type':'application/json','x-goog-api-key':env.geminiApiKey},body:JSON.stringify({system_instruction:{parts:[{text:agentPrompt}]},contents:[...cleanHistory(history),{role:'user',parts:[{text:String(message).slice(0,2000)}]}],generationConfig:{temperature:.2,maxOutputTokens:600,responseMimeType:'application/json'}}),signal:AbortSignal.timeout(15000)})
  const payload=await response.json().catch(()=>({}));if(!response.ok)throw Object.assign(new Error('AI Agent đang bận.'),{status:502,code:'AI_PROVIDER_ERROR'});const text=payload.candidates?.[0]?.content?.parts?.[0]?.text;try{return JSON.parse(text)}catch{throw Object.assign(new Error('AI Agent trả dữ liệu không hợp lệ.'),{status:502})}
}
