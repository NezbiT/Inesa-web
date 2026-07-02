import type { H3Event } from 'h3'

export function requireRouteId(event: H3Event, param = 'id'): string {
  const id = getRouterParam(event, param)
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID requerido' })
  return id
}