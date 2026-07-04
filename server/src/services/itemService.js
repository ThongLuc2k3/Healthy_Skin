import db from '../db/connection.js'

const allSkincareStmt = db.prepare('SELECT * FROM skincare_ingredients')
const allFoodStmt = db.prepare('SELECT * FROM food_items')

function parseSkincareRow(row) {
  return {
    id: row.id,
    name_vi: row.name_vi,
    category: row.category,
    flags: JSON.parse(row.flags),
    conflicts_with_skin_type: JSON.parse(row.conflicts_with_skin_type),
    explanation_vi: row.explanation_vi,
    source: row.source,
  }
}

function parseFoodRow(row) {
  return {
    id: row.id,
    name_vi: row.name_vi,
    category: row.category,
    flags: JSON.parse(row.flags),
    conflicts_with_allergy: JSON.parse(row.conflicts_with_allergy),
    conflicts_with_condition: JSON.parse(row.conflicts_with_condition),
    explanation_vi: row.explanation_vi,
    source: row.source,
  }
}

export function listSkincareItems() {
  return allSkincareStmt.all().map(parseSkincareRow)
}

export function listFoodItems() {
  return allFoodStmt.all().map(parseFoodRow)
}

export function listAllItems() {
  return [...listSkincareItems(), ...listFoodItems()]
}
