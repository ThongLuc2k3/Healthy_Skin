export const requestPolicy = Object.freeze({
  minimumLeadMinutes: 30,
  maximumLeadDays: 3,
  paidDepositVnd: 5_000,
  regularPaymentDueMinutesBeforeStart: 30,
  lateMatchPaymentWindowMinutes: 5,
  autoReleaseHours: 12,
  platformFeeRate: 0.01,
  durationPresetsMinutes: [15, 30, 45, 60, 90, 120],
  minimumDurationMinutes: 15,
  maximumDurationMinutes: 240,
  longSessionWarningMinutes: 120,
  minimumPaidAmountVnd: 10_000,
  maximumPaidAmountVnd: 200_000,
  paidAmountStepVnd: 1_000,
  standardContentAccessMaxVnd: 20_000,
  contentAccessPriceStepVnd: 1_000,
  instantContentHoldHours: 12,
  paidSharingHostDepositRate: 0.1,
  sharingCancellationWindowDays: 30,
  sharingCancellationLimit: 3,
  firstSharingSuspensionDays: 7,
  repeatSharingSuspensionDays: 30,
  sharingRepeatOffenseWindowDays: 90,
  lateSharingCancellationRefundRate: 0.5,
  disputeAppealWindowHours: 48,
  maximumDisputeAppeals: 1,
})

export function validateRequestStart(startsAt, now = new Date()) {
  const start = new Date(startsAt)
  if (Number.isNaN(start.getTime())) return { valid:false, code:'INVALID_START_TIME' }
  const delta = start.getTime() - now.getTime()
  if (delta < requestPolicy.minimumLeadMinutes * 60_000) return { valid:false, code:'START_TOO_SOON' }
  if (delta > requestPolicy.maximumLeadDays * 86_400_000) return { valid:false, code:'START_TOO_FAR' }
  return { valid:true }
}

export function validateDuration(durationMinutes) {
  if (!Number.isInteger(durationMinutes)) return { valid:false, code:'INVALID_DURATION' }
  if (durationMinutes < requestPolicy.minimumDurationMinutes) return { valid:false, code:'DURATION_TOO_SHORT' }
  if (durationMinutes > requestPolicy.maximumDurationMinutes) return { valid:false, code:'DURATION_TOO_LONG' }
  return { valid:true, warning:durationMinutes > requestPolicy.longSessionWarningMinutes ? 'CONSIDER_SPLITTING_SESSION' : null }
}

export function validatePaidAmount(amountVnd) {
  if (!Number.isInteger(amountVnd)) return { valid:false, code:'INVALID_AMOUNT' }
  if (amountVnd < requestPolicy.minimumPaidAmountVnd) return { valid:false, code:'AMOUNT_TOO_LOW' }
  if (amountVnd > requestPolicy.maximumPaidAmountVnd) return { valid:false, code:'AMOUNT_TOO_HIGH' }
  if (amountVnd % requestPolicy.paidAmountStepVnd !== 0) return { valid:false, code:'INVALID_AMOUNT_STEP' }
  return { valid:true }
}

export function calculatePlatformFee(amountVnd) {
  return Math.round(amountVnd * requestPolicy.platformFeeRate)
}

export function reviewContentAccessPrice(amountVnd) {
  if (!Number.isInteger(amountVnd) || amountVnd < 0 || amountVnd % requestPolicy.contentAccessPriceStepVnd !== 0) return { valid:false, code:'INVALID_ACCESS_PRICE' }
  return { valid:true, adminReviewRequired:amountVnd > requestPolicy.standardContentAccessMaxVnd }
}

export function splitCompensation(amountVnd, recipientIds) {
  if (!recipientIds.length) return []
  const each = Math.floor(amountVnd / recipientIds.length)
  let remainder = amountVnd % recipientIds.length
  return recipientIds.map(recipientId => ({ recipientId, amountVnd:each + (remainder-- > 0 ? 1 : 0) }))
}

export function calculateSharingHostDeposit(accessPriceVnd) {
  if (accessPriceVnd === 0) return 0
  return Math.round(accessPriceVnd * requestPolicy.paidSharingHostDepositRate)
}
