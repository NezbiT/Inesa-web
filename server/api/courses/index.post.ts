import { nanoid } from 'nanoid'
import { writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { requireUser } from '../../utils/auth'
import { slugify, useDb } from '../../utils/db'
import { extractPdfText } from '../../utils/pdf'
import { generateCourseFromText } from '../../utils/ai'
import { insertGeneratedCourseContent } from '../../utils/courseContent'
import type { DbCourseRow } from '#shared/types/db'
import { mapCourse } from '../../utils/mappers'

export default defineEventHandler(async (event) => {
  await requireUser(event, ['admin'])
  const form = await readMultipartFormData(event)
  if (!form) throw createError({ statusCode: 400, statusMessage: 'Formulario inválido' })

  const title = String(form.find((f) => f.name === 'title')?.data?.toString() || '').trim()
  const description = String(
    form.find((f) => f.name === 'description')?.data?.toString() || '',
  ).trim()
  const pdfFile = form.find((f) => f.name === 'pdf' && f.filename)

  if (!title) throw createError({ statusCode: 400, statusMessage: 'Título requerido' })

  const db = useDb()
  const id = nanoid()
  const now = new Date().toISOString()
  let slug = slugify(title)
  const slugExists = db.prepare('SELECT id FROM courses WHERE slug = ?').get(slug)
  if (slugExists) slug = `${slug}-${id.slice(0, 6)}`

  let sourcePdfPath: string | null = null
  let sourceText: string | null = null

  if (pdfFile?.data) {
    try {
      const uploadDir = join(process.cwd(), 'uploads', 'courses', id)
      await mkdir(uploadDir, { recursive: true })
      const filename = pdfFile.filename || 'source.pdf'
      const diskPath = join(uploadDir, filename)
      await writeFile(diskPath, pdfFile.data)
      sourcePdfPath = `/api/media/courses/${id}/${filename}`
      sourceText = await extractPdfText(diskPath)
      if (!sourceText || sourceText.length < 20) {
        throw createError({
          statusCode: 400,
          statusMessage: 'El PDF no tiene texto legible. Usa un PDF con texto seleccionable.',
        })
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'statusCode' in err) throw err
      throw createError({
        statusCode: 500,
        statusMessage: 'No se pudo leer el PDF. Verifica que el archivo sea válido.',
      })
    }
  }

  db.prepare(
    `INSERT INTO courses (id, slug, title, description, status, thumbnail_url, source_pdf_path, source_text, created_at, updated_at)
     VALUES (?, ?, ?, ?, 'draft', NULL, ?, ?, ?, ?)`,
  ).run(id, slug, title, description, sourcePdfPath, sourceText, now, now)

  if (sourceText) {
    const generated = await generateCourseFromText(title, sourceText)
    insertGeneratedCourseContent(db, id, generated, now)
  }

  const row = db.prepare('SELECT * FROM courses WHERE id = ?').get(id)
  const lessonCount = db
    .prepare('SELECT COUNT(*) as c FROM lessons WHERE course_id = ?')
    .get(id) as { c: number }

  return {
    course: mapCourse(row as DbCourseRow),
    lessonCount: lessonCount.c,
  }
})