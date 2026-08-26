import { env } from './config/env.js'
import { attachChatHub } from './ws/chatHub.js'
import { startBackgroundJobs } from './services/backgroundJobs.js'
import { createApp } from './app.js'
const app=createApp()
const server=app.listen(env.port,()=>console.log(`TLUCS API đang chạy tại cổng ${env.port}`))
attachChatHub(server)
startBackgroundJobs()
