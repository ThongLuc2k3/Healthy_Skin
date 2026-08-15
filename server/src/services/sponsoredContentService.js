import { query } from '../db/connection.js'

function toProductShape(row) {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    matchedItemId: row.matched_item_id,
    priceVnd: row.price_vnd,
    affiliateUrl: row.affiliate_url,
    sponsorName: row.sponsor_name,
  }
}

export async function listSponsoredProducts() {
  const { rows } = await query('SELECT * FROM sponsored_products WHERE active = TRUE ORDER BY id')
  return rows.map(toProductShape)
}

// Ưu tiên trả sản phẩm liên kết đã đối chiếu được với đúng thành phần/tên đang xem (matchedItemId),
// nếu không có mục nào khớp thì trả một vài sản phẩm tiếp thị liên kết đang hoạt động để vẫn có gợi ý.
export async function findSponsoredAlternatives(matchedItemId, limit = 3) {
  if (matchedItemId) {
    const { rows } = await query(
      'SELECT * FROM sponsored_products WHERE active = TRUE AND matched_item_id = $1 ORDER BY id LIMIT $2',
      [matchedItemId, limit],
    )
    if (rows.length > 0) return rows.map(toProductShape)
  }

  const { rows } = await query(
    'SELECT * FROM sponsored_products WHERE active = TRUE ORDER BY id LIMIT $1',
    [limit],
  )
  return rows.map(toProductShape)
}

export async function listHomepageAds() {
  const { rows } = await query(
    'SELECT * FROM homepage_ads WHERE active = TRUE ORDER BY priority ASC, id ASC',
  )
  return rows.map((row) => ({
    id: row.id,
    sponsorName: row.sponsor_name,
    imageUrl: row.image_url,
    linkUrl: row.link_url,
  }))
}
