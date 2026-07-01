import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { existsSync } from 'node:fs'

export default defineEventHandler(async (event) => {
  const parts = getRouterParam(event, 'path')?.split('/') || []
  if (!parts.length) throw createError({ statusCode: 404, statusMessage: 'Archivo no encontrado' })

  const diskPath = join(process.cwd(), 'uploads', ...parts)
  if (!existsSync(diskPath)) {
    throw createError({ statusCode: 404, statusMessage: 'Archivo no encontrado' })
  }

  const ext = diskPath.split('.').pop()?.toLowerCase()
  const types: Record<string, string> = {
    pdf: 'application/pdf',
    mp4: 'video/mp4',
    webm: 'video/webm',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    m4a: 'audio/mp4',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
  }
  if (ext && types[ext]) setHeader(event, 'Content-Type', types[ext])

  return readFile(diskPath)
})