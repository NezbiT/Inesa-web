import { readFile } from 'node:fs/promises'
import { PDFParse } from 'pdf-parse'

export async function extractPdfText(filePath: string) {
  const buffer = await readFile(filePath)
  const parser = new PDFParse({ data: buffer })
  try {
    const result = await parser.getText()
    return String(result.text || '').replace(/\s+\n/g, '\n').trim()
  } finally {
    await parser.destroy()
  }
}

export function splitTextIntoModules(text: string, maxModules = 6) {
  const cleaned = text.replace(/\r/g, '').trim()
  if (!cleaned) return []

  const byHeadings = cleaned.split(/\n(?=[A-ZÁÉÍÓÚÑ][^\n]{4,80}\n)/)
  const chunks =
    byHeadings.length > 1
      ? byHeadings
      : cleaned.match(/[\s\S]{1,1800}(?:\.\s|\n\n|$)/g) || [cleaned]

  return chunks
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 60)
    .slice(0, maxModules)
}