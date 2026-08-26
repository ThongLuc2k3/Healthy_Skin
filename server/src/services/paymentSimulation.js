import { env } from '../config/env.js'

export const paymentSimulationEnabled=()=>env.paymentMode==='simulation'
export async function waitForPaymentSimulation(){if(paymentSimulationEnabled())await new Promise(resolve=>setTimeout(resolve,3000))}
