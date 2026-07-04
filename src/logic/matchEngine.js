export const RESULT = {
  SUITABLE: 'phù hợp',
  CAUTION: 'cần cân nhắc',
  AVOID: 'nên tránh',
}

// Cờ hiệu áp dụng cảnh báo "cần cân nhắc" cho MỌI người dùng, bất kể hồ sơ cơ địa
// (ví dụ: photosensitizing cần lưu ý chống nắng dù da loại nào; high_sugar nên dùng điều độ dù không tiểu đường)
const UNIVERSAL_CAUTION_FLAGS = new Set([
  'photosensitizing',
  'unstable',
  'allergen_potential',
  'high_sugar',
  'high_sodium',
  'high_purine',
  'high_fat',
  'high_gi',
  'caffeine',
  'processed',
  'high_cholesterol',
])

function findAvoidReason(profile, item) {
  if (item.category === 'skincare') {
    if (item.conflicts_with_skin_type?.includes(profile.skinType)) {
      return item.explanation_vi
    }
    return null
  }

  if (item.category === 'food') {
    const allergyHit = item.conflicts_with_allergy?.some((a) => profile.allergies?.includes(a))
    const conditionHit = item.conflicts_with_condition?.some((c) => profile.conditions?.includes(c))
    if (allergyHit || conditionHit) {
      return item.explanation_vi
    }
    return null
  }

  return null
}

function findCautionReason(item) {
  const hit = item.flags?.some((flag) => UNIVERSAL_CAUTION_FLAGS.has(flag))
  return hit ? item.explanation_vi : null
}

export function matchProfile(profile, item) {
  const avoidReason = findAvoidReason(profile, item)
  if (avoidReason) {
    return { result: RESULT.AVOID, reason: avoidReason }
  }

  const cautionReason = findCautionReason(item)
  if (cautionReason) {
    return { result: RESULT.CAUTION, reason: cautionReason }
  }

  return {
    result: RESULT.SUITABLE,
    reason: 'Không phát hiện xung đột với hồ sơ cơ địa của bạn.',
  }
}

export function getRecommendations(profile, database) {
  const grouped = { [RESULT.SUITABLE]: [], [RESULT.CAUTION]: [], [RESULT.AVOID]: [] }

  for (const item of database) {
    const { result, reason } = matchProfile(profile, item)
    grouped[result].push({ ...item, reason })
  }

  return grouped
}
