export const uploadPolicy = Object.freeze({
  maximumFileBytes: 100 * 1024 * 1024,
  maximumFilesPerSharingPost: 10,
  allowedMimeTypes: new Set([
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg','image/png','image/webp',
    'audio/mpeg','audio/mp4','video/mp4',
  ]),
})

export function validateUpload({ mimeType, sizeBytes }) {
  if (!uploadPolicy.allowedMimeTypes.has(mimeType)) return { valid:false, code:'FILE_TYPE_NOT_ALLOWED' }
  if (!Number.isInteger(sizeBytes) || sizeBytes <= 0) return { valid:false, code:'INVALID_FILE_SIZE' }
  if (sizeBytes > uploadPolicy.maximumFileBytes) return { valid:false, code:'FILE_TOO_LARGE' }
  return { valid:true }
}
