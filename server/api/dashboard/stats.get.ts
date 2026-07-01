import { requireUser } from '../../utils/auth'
import { useDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  await requireUser(event, ['admin'])
  const db = useDb()
  const courses = db.prepare('SELECT COUNT(*) as c FROM courses').get() as { c: number }
  const students = db
    .prepare("SELECT COUNT(*) as c FROM users WHERE role = 'student'")
    .get() as { c: number }
  const lessons = db.prepare('SELECT COUNT(*) as c FROM lessons').get() as { c: number }
  const completions = db
    .prepare('SELECT COUNT(*) as c FROM lesson_progress WHERE completed = 1')
    .get() as { c: number }

  return {
    courses: courses.c,
    students: students.c,
    lessons: lessons.c,
    completions: completions.c,
  }
})