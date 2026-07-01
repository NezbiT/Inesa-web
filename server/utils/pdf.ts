import { readFile } from 'node:fs/promises'

export async function extractPdfText(filePath: string) {
  const buffer = await readFile(filePath)
  const pdfParse = (await import('pdf-parse')).default
  const data = await pdfParse(buffer)
  return String(data.text || '').replace(/\s+\n/g, '\n').trim()
}

export function splitTextIntoModules(text: string, maxModules = 8) {
  const cleaned = text.replace(/\r/g, '').trim()
  if (!cleaned) return []

  const byHeadings = cleaned.split(/\n(?=[A-ZÁÉÍÓÚÑ][^\n]{4,80}\n)/)
  const chunks =
    byHeadings.length > 1
      ? byHeadings
      : cleaned.match(/[\s\S]{1,2200}(?:\.\s|\n\n|$)/g) || [cleaned]

  return chunks
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 120)
    .slice(0, maxModules)
}