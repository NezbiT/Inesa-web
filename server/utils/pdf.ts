import { readFile } from 'node:fs/promises'

const CHARS_PER_PAGE = 2800

/**
 * pdf-parse / pdfjs-dist touch browser globals at import time.
 * Polyfill only when we actually parse a PDF (not on every cold start).
 */
function ensurePdfJsGlobals() {
  const g = globalThis as typeof globalThis & {
    DOMMatrix?: unknown
    ImageData?: unknown
    Path2D?: unknown
  }

  if (typeof g.DOMMatrix === 'undefined') {
    g.DOMMatrix = class DOMMatrix {
      a = 1
      b = 0
      c = 0
      d = 1
      e = 0
      f = 0
      m11 = 1
      m12 = 0
      m21 = 0
      m22 = 1
      m41 = 0
      m42 = 0
      constructor(_init?: string | number[]) {}
      multiplySelf() {
        return this
      }
      inverse() {
        return this
      }
      transformPoint(p: { x?: number; y?: number } = {}) {
        return { x: p.x ?? 0, y: p.y ?? 0, z: 0, w: 1 }
      }
    }
  }

  if (typeof g.ImageData === 'undefined') {
    g.ImageData = class ImageData {
      data: Uint8ClampedArray
      width: number
      height: number
      constructor(dataOrWidth: Uint8ClampedArray | number, widthOrHeight?: number, height?: number) {
        if (typeof dataOrWidth === 'number') {
          this.width = dataOrWidth
          this.height = widthOrHeight ?? 0
          this.data = new Uint8ClampedArray(this.width * this.height * 4)
        } else {
          this.data = dataOrWidth
          this.width = widthOrHeight ?? 0
          this.height = height ?? 0
        }
      }
    }
  }

  if (typeof g.Path2D === 'undefined') {
    g.Path2D = class Path2D {
      constructor(_path?: unknown) {}
    }
  }
}

export async function extractPdfText(filePath: string) {
  ensurePdfJsGlobals()
  // Dynamic import keeps pdfjs out of SSR/API cold starts for unrelated routes.
  const { PDFParse } = await import('pdf-parse')
  const buffer = await readFile(filePath)
  const parser = new PDFParse({ data: buffer })
  try {
    const result = await parser.getText()
    return String(result.text || '').replace(/\s+\n/g, '\n').trim()
  } finally {
    await parser.destroy()
  }
}

export function estimatePages(text: string): number {
  return Math.max(1, Math.ceil(text.length / CHARS_PER_PAGE))
}

/** @deprecated Use splitTextIntoSections for large documents */
export function splitTextIntoModules(text: string, maxModules = 6) {
  return splitTextIntoSections(text, 1800).slice(0, maxModules)
}

export function splitTextIntoSections(text: string, chunkSize = 14_000): string[] {
  const cleaned = text.replace(/\r/g, '').trim()
  if (!cleaned) return []
  if (cleaned.length <= chunkSize) return [cleaned]

  const chunks: string[] = []
  let pos = 0

  while (pos < cleaned.length) {
    let end = Math.min(pos + chunkSize, cleaned.length)
    if (end < cleaned.length) {
      const slice = cleaned.slice(pos, end)
      const breakAt = Math.max(slice.lastIndexOf('\n\n'), slice.lastIndexOf('\n'))
      if (breakAt > chunkSize * 0.45) end = pos + breakAt
    }
    const piece = cleaned.slice(pos, end).trim()
    if (piece.length > 80) chunks.push(piece)
    pos = end
  }

  return chunks
}

export function buildDocumentDigest(text: string, maxSamples = 10): string {
  const sections = splitTextIntoSections(text)
  const pages = estimatePages(text)
  const parts: string[] = [
    `[INICIO — págs. estimadas 1-${Math.min(3, pages)}]\n${text.slice(0, 6000)}`,
  ]

  if (sections.length > 1) {
    const step = Math.max(1, Math.floor(sections.length / maxSamples))
    for (let i = 0; i < sections.length; i += step) {
      if (parts.length >= maxSamples + 1) break
      const header = `[SECCIÓN ${i + 1} de ${sections.length}]`
      parts.push(`${header}\n${sections[i].slice(0, 4000)}`)
    }
  }

  parts.push(`[FINAL DEL DOCUMENTO]\n${text.slice(-5000)}`)
  parts.push(
    `[METADATA] Caracteres: ${text.length} · Secciones: ${sections.length} · Páginas estimadas: ${pages}`,
  )

  return parts.join('\n\n').slice(0, 48_000)
}

export function targetLessonCount(text: string): number {
  const pages = estimatePages(text)
  if (pages <= 12) return 8
  if (pages <= 30) return 12
  if (pages <= 60) return 16
  if (pages <= 100) return 20
  return 24
}

export function targetQuizCount(lessonCount: number): number {
  return Math.min(24, Math.max(10, Math.round(lessonCount * 0.8)))
}
