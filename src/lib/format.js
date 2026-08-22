export function formatVnd(amount) {
  return (amount || 0).toLocaleString('vi-VN') + 'đ'
}

export function formatDate(iso) {
  if (!iso) return 'Chưa có'
  return new Date(iso).toLocaleDateString('vi-VN')
}

export function formatDateTime(iso) {
  if (!iso) return 'Chưa có'
  return new Date(iso).toLocaleString('vi-VN')
}
