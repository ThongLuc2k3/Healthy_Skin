import db from '../db/connection.js'

const insertStmt = db.prepare(`
  INSERT INTO scan_history (user_id, matched_item_id, matched_item_category, ocr_raw_text, product_name, result, reason)
  VALUES (@user_id, @matched_item_id, @matched_item_category, @ocr_raw_text, @product_name, @result, @reason)
`)

const listStmt = db.prepare(`
  SELECT
    sh.*,
    COALESCE(si.name_vi, fi.name_vi) AS matched_item_name
  FROM scan_history sh
  LEFT JOIN skincare_ingredients si ON sh.matched_item_id = si.id AND sh.matched_item_category = 'skincare'
  LEFT JOIN food_items fi ON sh.matched_item_id = fi.id AND sh.matched_item_category = 'food'
  WHERE sh.user_id = ?
  ORDER BY sh.created_at DESC
`)

export function recordScan(
  userId,
  { matchedItemId, matchedItemCategory, ocrRawText, productName, result, reason },
) {
  insertStmt.run({
    user_id: userId,
    matched_item_id: matchedItemId ?? null,
    matched_item_category: matchedItemCategory ?? null,
    ocr_raw_text: ocrRawText ?? null,
    product_name: productName ?? null,
    result: result ?? null,
    reason: reason ?? null,
  })
}

export function listScanHistory(userId) {
  return listStmt.all(userId).map((row) => ({
    id: row.id,
    matchedItemId: row.matched_item_id,
    matchedItemName: row.matched_item_name,
    matchedItemCategory: row.matched_item_category,
    productName: row.product_name,
    ocrRawText: row.ocr_raw_text,
    result: row.result,
    reason: row.reason,
    createdAt: row.created_at,
  }))
}
