import { Router } from 'express'
import { listSkincareItems, listFoodItems } from '../services/itemService.js'

const router = Router()

router.get('/skincare', (req, res) => {
  res.json(listSkincareItems())
})

router.get('/food', (req, res) => {
  res.json(listFoodItems())
})

export default router
