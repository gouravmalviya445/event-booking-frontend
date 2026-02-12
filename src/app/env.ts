const _env = {
  API_URL: String(process.env.NEXT_PUBLIC_API_URL),
  cldCloudName: String(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME),
  cldUploadPreset: String(process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET)
}

export const ENV = Object.freeze(_env)