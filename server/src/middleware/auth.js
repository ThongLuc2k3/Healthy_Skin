import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
export function requireAuth(req,res,next){
  const token=req.headers.authorization?.replace(/^Bearer\s+/i,'')
  if(!token)return res.status(401).json({error:{code:'AUTH_REQUIRED',message:'Bạn cần đăng nhập.'}})
  try{req.auth=jwt.verify(token,env.jwtSecret,{issuer:'tlucs-api',audience:'tlucs-app'});next()}
  catch{return res.status(401).json({error:{code:'INVALID_TOKEN',message:'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.'}})}
}
export function optionalAuth(req,res,next){
  const token=req.headers.authorization?.replace(/^Bearer\s+/i,'')
  if(!token)return next()
  try{req.auth=jwt.verify(token,env.jwtSecret,{issuer:'tlucs-api',audience:'tlucs-app'})}catch{req.auth=null}
  next()
}
