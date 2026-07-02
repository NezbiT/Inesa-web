import type { AuthLoginResponse } from '#shared/types/api'
import type { DbUserRow } from '#shared/types/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { useDb } from '../../utils/db'
import { setSessionCookie, signToken } from '../../utils/auth'
import { mapUser } from '../../utils/mappers'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
})

export default defineEventHandler(async (event): Promise<AuthLoginResponse> => {
  const body = schema.parse(await readBody(event))
  const row = useDb()
    .prepare('SELECT id, email, name, role, password_hash, created_at FROM users WHERE email = ?')
    .get(body.email) as DbUserRow | undefined

  if (!row || !bcrypt.compareSync(body.password, row.password_hash)) {
    throw createError({ statusCode: 401, statusMessage: 'Credenciales inválidas' })
  }

  const token = await signToken({ id: row.id, email: row.email, role: row.role })
  setSessionCookie(event, token)

  return { user: mapUser(row) }
})