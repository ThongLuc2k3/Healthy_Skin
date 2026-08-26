export function notFound(req,res){res.status(404).json({error:{code:'NOT_FOUND',message:'Không tìm thấy tài nguyên.'}})}
export function errorHandler(error,req,res,_next){console.error(error);res.status(error.status||500).json({error:{code:error.code||'INTERNAL_ERROR',message:error.status?error.message:'Đã có lỗi xảy ra.',...(error.fields?{fields:error.fields}:{})}})}
