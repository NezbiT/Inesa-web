import { SignJWT, jwtVerify } from 'jose'
import type { H3Event } from 'h3'
import type { User, UserRole } from '#shared/types/lms'
import { useDb } from './db'

const COOKIE = 'inesa-session'

function getSecret() {
  return new TextEncoder().encode(
    process.env.INESA_JWT_SECRET || 'inesa-dev-secret-change-me',
  )
}

export async function signToken(user: {
  id: string
  email: string
  role: UserRole
}) {
  return new SignJWT({ sub: user.id, email: user.email, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret())
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, getSecret())
  return {
    id: String(payload.sub),
    email: String(payload.email),
    role: payload.role as UserRole,
  }
}

export function setSessionCookie(event: H3Event, token: string) {
  setCookie(event, COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
}

export function clearSessionCookie(event: H3Event) {
  deleteCookie(event, COOKIE, { path: '/' })
}

export async function getSessionUser(event: H3Event) {
  const token = getCookie(event, COOKIE)
  if (!token) return null
  try {
    const session = await verifyToken(token)
    const row = useDb()
      .prepare('SELECT id, email, name, role, created_at FROM users WHERE id = ?')
      .get(session.id) as
      | {
          id: string
          email: string
          name: string
          role: UserRole
          created_at: string
        }
      | undefined
    if (!row) return null
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      createdAt: row.created_at,
    } satisfies User
  } catch {
    return null
  }
}

export async function requireUser(event: H3Event, roles?: UserRole[]) {
  const user = await getSessionUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'No autenticado' })
  }
  if (roles && !roles.includes(user.role)) {
    throw createError({ statusCode: 403, statusMessage: 'Sin permisos' })
  }
  return user
}