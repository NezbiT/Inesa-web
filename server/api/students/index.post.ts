import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'
import { z } from 'zod'
import { requireUser } from '../../utils/auth'
import { useDb } from '../../utils/db'

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(6),
})

export default defineEventHandler(async (event) => {
  await requireUser(event, ['admin'])
  const body = schema.parse(await readBody(event))
  const db = useDb()
  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(body.email)
  if (exists) {
    throw createError({ statusCode: 409, statusMessage: 'El estudiante ya existe' })
  }

  const id = nanoid()
  const now = new Date().toISOString()
  db.prepare(
    `INSERT INTO users (id, email, name, role, password_hash, created_at)
     VALUES (?, ?, ?, 'student', ?, ?)`,
  ).run(id, body.email, body.name, bcrypt.hashSync(body.password, 10), now)

  return { id, email: body.email, name: body.name, createdAt: now }
})