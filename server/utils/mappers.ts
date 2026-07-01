import type { Course, Lesson } from '#shared/types/lms'

export function mapCourse(row: Record<string, unknown>): Course {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    description: String(row.description || ''),
    status: row.status as Course['status'],
    thumbnailUrl: row.thumbnail_url ? String(row.thumbnail_url) : null,
    sourcePdfPath: row.source_pdf_path ? String(row.source_pdf_path) : null,
    sourceText: row.source_text ? String(row.source_text) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  }
}

export function mapLesson(row: Record<string, unknown>): Lesson {
  return {
    id: String(row.id),
    courseId: String(row.course_id),
    title: String(row.title),
    description: row.description ? String(row.description) : null,
    type: row.type as Lesson['type'],
    contentUrl: row.content_url ? String(row.content_url) : null,
    contentText: row.content_text ? String(row.content_text) : null,
    durationSeconds: Number(row.duration_seconds || 0),
    sortOrder: Number(row.sort_order || 0),
    createdAt: String(row.created_at),
  }
}