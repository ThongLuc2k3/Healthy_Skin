const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const TOKEN_KEY = 'da_duong_token'
const REQUEST_TIMEOUT_MS = 15000

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

async function request(path, { method = 'GET', body, isFormData = false, auth = false } = {}) {
  const headers = {}
  if (!isFormData) headers['Content-Type'] = 'application/json'
  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      signal: controller.signal,
      body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    })
  } catch (error) {
    if (error?.name === 'AbortError') {
      const err = new Error('Máy chủ phản hồi quá chậm hoặc không phản hồi. Kiểm tra backend rồi thử lại.')
      err.timeout = true
      throw err
    }
    const err = new Error('Không thể kết nối tới máy chủ. Backend có thể chưa chạy hoặc bị chặn do cấu hình mạng/CORS.')
    err.offline = true
    throw err
  } finally {
    clearTimeout(timeoutId)
  }

  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json') ? await response.json() : null

  if (!response.ok) {
    const err = new Error(data?.error || 'Đã có lỗi xảy ra, vui lòng thử lại.')
    err.status = response.status
    throw err
  }

  return data
}

// Ảnh điểm danh yêu cầu xác thực (không phải static công khai) nên <img src> thường
// không gửi được header Authorization — tải về dạng blob rồi tạo object URL để hiển thị.
export async function fetchAuthedBlobUrl(path) {
  const token = getToken()
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      signal: controller.signal,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
  } catch (error) {
    clearTimeout(timeoutId)
    if (error?.name === 'AbortError') {
      throw new Error('Tải file quá chậm hoặc không phản hồi.')
    }
    throw new Error('Không tải được file từ máy chủ.')
  }
  clearTimeout(timeoutId)
  if (!response.ok) throw new Error('Không tải được ảnh.')
  const blob = await response.blob()
  return URL.createObjectURL(blob)
}

export async function openAuthedFile(path) {
  const blobUrl = await fetchAuthedBlobUrl(path)
  window.open(blobUrl, '_blank', 'noopener,noreferrer')
}

export const apiClient = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
  delete: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
}
