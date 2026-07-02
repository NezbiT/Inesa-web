import { nanoid } from 'nanoid'
import { z } from 'zod'
import { useDb } from '../../../utils/db'
import { requireLesson, requireLessonAccess } from '../../../utils/lessons'
import { upsertLessonProgress } from '../../../utils/lessonProgress'

const schema = z.object({
  answers: z.array(z.number().int().min(0).max(3)),
})

const PASS_PERCENT = 70

export default defineEventHandler(async (event) => {
  const { user, lessonId } = await requireLessonAccess(event)

  const body = schema.parse(await readBody(event))
  const db = useDb()

  const lesson = requireLesson<{
    id: string
    type: string
    content_text: string | null
    course_id: string
  }>(db, lessonId)
  if (lesson.type !== 'quiz' || !lesson.content_text) {
    throw createError({ statusCode: 400, statusMessage: 'Esta lección no es un cuestionario' })
  }

  let quiz: {
    title: string
    questions: Array<{
      question: string
      options: string[]
      correctIndex: number
      explanation: string
    }>
  }

  try {
    quiz = JSON.parse(lesson.content_text)
  } catch {
    throw createError({ statusCode: 500, statusMessage: 'Cuestionario inválido' })
  }

  if (body.answers.length !== quiz.questions.length) {
    throw createError({ statusCode: 400, statusMessage: 'Debes responder todas las preguntas' })
  }

  const results = quiz.questions.map((q, i) => {
    const selected = body.answers[i]
    const correct = selected === q.correctIndex
    return {
      question: q.question,
      selected,
      correctIndex: q.correctIndex,
      correct,
      explanation: q.explanation,
    }
  })

  const score = results.filter((r) => r.correct).length
  const total = quiz.questions.length
  const percent = Math.round((score / total) * 100)
  const passed = percent >= PASS_PERCENT
  const now = new Date().toISOString()

  const existing = db
    .prepare('SELECT id FROM quiz_attempts WHERE user_id = ? AND lesson_id = ?')
    .get(user.id, lessonId) as { id: string } | undefined

  if (existing) {
    db.prepare(
      `UPDATE quiz_attempts
       SET score = ?, total = ?, percent = ?, passed = ?, answers_json = ?, submitted_at = ?
       WHERE id = ?`,
    ).run(score, total, percent, passed ? 1 : 0, JSON.stringify(results), now, existing.id)
  } else {
    db.prepare(
      `INSERT INTO quiz_attempts (id, user_id, lesson_id, score, total, percent, passed, answers_json, submitted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      nanoid(),
      user.id,
      lessonId,
      score,
      total,
      percent,
      passed ? 1 : 0,
      JSON.stringify(results),
      now,
    )
  }

  upsertLessonProgress(db, user.id, lessonId, {
    progressPercent: percent,
    completed: passed,
  })

  return {
    score,
    total,
    percent,
    passed,
    passPercent: PASS_PERCENT,
    results,
  }
})