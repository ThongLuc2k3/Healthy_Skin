import { Router } from 'express'
import multer from 'multer'
import { requireAuth } from '../middleware/auth.js'
import { getMaterial,listMySharing,saveMaterial,uploadLimits } from '../services/materialService.js'
const router=Router(),limits=uploadLimits(),upload=multer({storage:multer.memoryStorage(),limits:{fileSize:limits.fileSize,files:1}})
router.get('/mine',requireAuth,async(req,res,next)=>{try{res.json({data:await listMySharing(req.auth.sub)})}catch(error){next(error)}})
router.post('/:id/materials',requireAuth,upload.single('file'),async(req,res,next)=>{try{if(!req.file)throw Object.assign(new Error('Chưa chọn tệp.'),{status:422});res.status(201).json({data:await saveMaterial(req.auth.sub,req.params.id,req.file,req.body.title)})}catch(error){next(error)}})
router.get('/materials/:id/download',requireAuth,async(req,res,next)=>{try{const {material,buffer}=await getMaterial(req.auth.sub,req.params.id);res.setHeader('content-type',material.mime_type);res.setHeader('content-disposition',`attachment; filename*=UTF-8''${encodeURIComponent(material.original_filename)}`);res.send(buffer)}catch(error){next(error)}})
export default router
