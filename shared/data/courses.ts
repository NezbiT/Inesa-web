import type { Course } from '#shared/types/course'

/**
 * Catálogo de cursos — ampliar cuando la plataforma LMS esté activa.
 * Cada curso publicado tendrá slug, módulos y estado de publicación.
 */
export const coursesCatalog: Course[] = []

export const coursesCatalogCount = coursesCatalog.length