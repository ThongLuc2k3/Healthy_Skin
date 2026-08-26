const accountKinds=new Set(['university_student','high_school_student','alumni','explorer'])
export function validateOnboarding(input={}){
  const errors={}
  if(typeof input.displayName!=='string'||input.displayName.trim().length<2||input.displayName.trim().length>40)errors.displayName='Tên hiển thị cần từ 2 đến 40 ký tự.'
  if(!accountKinds.has(input.accountKind))errors.accountKind='Trạng thái tài khoản không hợp lệ.'
  if(typeof input.areaLabel!=='string'||input.areaLabel.trim().length<2)errors.areaLabel='Vui lòng nhập khu vực.'
  if(!Array.isArray(input.topicIds)||input.topicIds.length<1)errors.topicIds='Chọn ít nhất một chủ đề quan tâm.'
  if(!Array.isArray(input.availability)||input.availability.length<1)errors.availability='Chọn ít nhất một khung giờ thường rảnh.'
  return {valid:Object.keys(errors).length===0,errors}
}
