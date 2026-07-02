import { nanoid } from 'nanoid'
import type Database from 'better-sqlite3'
import type { GeneratedCourse } from './ai'

export function insertGeneratedCourseContent(
  db: Database.Database,
  courseId: string,
  generated: GeneratedCourse,
  now: string,
) {
  const insert = db.prepare(
    `INSERT INTO lessons (id, course_id, title, description, type, content_url, content_text, duration_seconds, sort_order, created_at)
     VALUES (?, ?, ?, ?, ?, NULL, ?, 0, ?, ?)`,
  )

  generated.lessons.forEach((lesson, index) => {
    insert.run(nanoid(), courseId, lesson.title, lesson.description, 'text', lesson.contentText, index, now)
  })

  const quizPayload = JSON.stringify(generated.quiz)
  insert.run(
    nanoid(),
    courseId,
    generated.quiz.title,
    'Responde las preguntas para completar el curso',
    'quiz',
    quizPayload,
    generated.lessons.length,
    now,
  )
}

export function sanitizeQuizContent(contentText: string) {
  try {
    const quiz = JSON.parse(contentText) as {
      title: string
      questions: Array<{
        question: string
        options: string[]
        correctIndex?: number
        explanation?: string
      }>
    }
    return JSON.stringify({
      title: quiz.title,
      questions: quiz.questions.map((q, i) => ({
        id: i,
        question: q.question,
        options: q.options,
      })),
    })
  } catch {
    return contentText
  }
}