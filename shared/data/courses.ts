import type { MarketingCourse } from '#shared/types/course'

/** Catálogo estático del sitio (no confundir con cursos LMS en /api/courses). */
export const coursesCatalog: MarketingCourse[] = []

export const coursesCatalogCount = coursesCatalog.length