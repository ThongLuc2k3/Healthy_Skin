import { v2 as cloudinary } from 'cloudinary'
import config from '../config/env.js'

cloudinary.config({
  cloud_name: config.cloudinaryCloudName,
  api_key: config.cloudinaryApiKey,
  api_secret: config.cloudinaryApiSecret,
})

const MIME_TO_RESOURCE = {
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/webp': 'image',
  'image/gif': 'image',
  'application/pdf': 'raw',
}

export async function uploadBuffer(buffer, mimeType, { folder = 'da-duong' } = {}) {
  const resourceType = MIME_TO_RESOURCE[mimeType] || 'image'

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) reject(new Error(`Cloudinary upload failed: ${error.message}`))
        else resolve({ url: result.secure_url, publicId: result.public_id })
      },
    )
    uploadStream.end(buffer)
  })
}

export async function deleteFile(publicId) {
  if (!publicId) return
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch {
    // silent fail — xoá file không quan trọng nếu Cloudinary lỗi
  }
}

export function extractPublicId(url) {
  if (!url || typeof url !== 'string') return null
  const parts = url.split('/')
  const versionIndex = parts.findIndex((p) => p.startsWith('v') && /^\d+$/.test(p.slice(1)))
  if (versionIndex === -1) return null
  return parts.slice(versionIndex + 1).join('/').replace(/\.[^/.]+$/, '')
}
