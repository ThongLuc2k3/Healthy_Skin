import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import { env } from './config/env.js'
import api from './routes/index.js'
import { errorHandler,notFound } from './middleware/errorHandler.js'
export function createApp(){
  const app=express(),origins=env.webOrigin.split(',').map(x=>x.trim())
  app.set('trust proxy',1)
  app.use(helmet())
  app.use(cors({origin(origin,callback){callback(null,!origin||origins.includes(origin))},credentials:true}))
  app.use(express.json({limit:'1mb'}))
  app.use('/api',rateLimit({windowMs:15*60*1000,limit:500,standardHeaders:'draft-8',legacyHeaders:false,message:{error:{code:'RATE_LIMITED',message:'Bạn thao tác quá nhanh. Vui lòng thử lại sau.'}}}))
  app.use('/api/v1',api)
  app.use(notFound)
  app.use(errorHandler)
  return app
}
