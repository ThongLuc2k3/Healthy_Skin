const hardPatterns=[
  ['ACADEMIC_CHEATING',/(thi hộ|làm hộ bài|mua bán đề|đáp án thi)/i],
  ['PYRAMID_SCHEME',/(đa cấp|tuyển tuyến dưới|hoa hồng hệ thống)/i],
  ['EXTERNAL_PAYMENT',/(chuyển khoản ngoài|quét qr|thanh toán ngoài)/i],
]
const urlPattern=/(https?:\/\/|www\.|bit\.ly|tinyurl\.com|t\.me\/)/i
export function screenText(input){const text=[input.title,input.description,input.body,input.offeredDescription].filter(Boolean).join('\n');const findings=hardPatterns.filter(([,pattern])=>pattern.test(text)).map(([code])=>({source:'rule',code,severity:'high'}));if(urlPattern.test(text))findings.push({source:'rule',code:'EXTERNAL_LINK',severity:'medium'});return {outcome:findings.some(x=>x.severity==='high')?'priority_hold':findings.length?'hold':'publish',findings,rulesVersion:'tlucs-rules-1'} }
