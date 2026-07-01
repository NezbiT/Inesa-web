import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { useDb } from '../../utils/db'
import { setSessionCookie, signToken } from '../../utils/auth'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
})

export default defineEventHandler(async (event) => {
  const body = schema.parse(await readBody(event))
  const row = useDb()
    .prepare('SELECT id, email, name, role, password_hash, created_at FROM users WHERE email = ?')
    .get(body.email) as
    | {
        id: string
        email: string
        name: string
        role: 'admin' | 'student'
        password_hash: string
        created_at: string
      }
    | undefined

  if (!row || !bcrypt.compareSync(body.password, row.password_hash)) {
    throw createError({ statusCode: 401, statusMessage: 'Credenciales inválidas' })
  }

  const token = await signToken({ id: row.id, email: row.email, role: row.role })
  setSessionCookie(event, token)

  return {
    user: {
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      createdAt: row.created_at,
    },
  }
})