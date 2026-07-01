import { nanoid } from 'nanoid'
import { writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { requireUser } from '../../utils/auth'
import { slugify, useDb } from '../../utils/db'
import { extractPdfText } from '../../utils/pdf'
import { generateLessonsFromText } from '../../utils/ai'
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
    const uploadDir = join(process.cwd(), 'uploads', 'courses', id)
    await mkdir(uploadDir, { recursive: true })
    const filename = pdfFile.filename || 'source.pdf'
    const diskPath = join(uploadDir, filename)
    await writeFile(diskPath, pdfFile.data)
    sourcePdfPath = `/api/media/courses/${id}/${filename}`
    sourceText = await extractPdfText(diskPath)
  }

  db.prepare(
    `INSERT INTO courses (id, slug, title, description, status, thumbnail_url, source_pdf_path, source_text, created_at, updated_at)
     VALUES (?, ?, ?, ?, 'draft', NULL, ?, ?, ?, ?)`,
  ).run(id, slug, title, description, sourcePdfPath, sourceText, now, now)

  if (sourceText) {
    const generated = await generateLessonsFromText(title, sourceText)
    const insert = db.prepare(
      `INSERT INTO lessons (id, course_id, title, description, type, content_url, content_text, duration_seconds, sort_order, created_at)
       VALUES (?, ?, ?, ?, 'text', NULL, ?, 0, ?, ?)`,
    )
    generated.forEach((lesson, index) => {
      insert.run(
        nanoid(),
        id,
        lesson.title,
        lesson.description,
        lesson.contentText,
        index,
        now,
      )
    })
  }

  const row = db.prepare('SELECT * FROM courses WHERE id = ?').get(id)
  return { course: mapCourse(row as Record<string, unknown>) }
})