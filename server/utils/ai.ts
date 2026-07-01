import { splitTextIntoModules } from './pdf'

interface GeneratedLesson {
  title: string
  description: string
  contentText: string
}

export async function generateLessonsFromText(
  courseTitle: string,
  sourceText: string,
): Promise<GeneratedLesson[]> {
  const apiKey = process.env.OPENAI_API_KEY
  const chunks = splitTextIntoModules(sourceText)

  if (!chunks.length) {
    return [
      {
        title: 'Introducción',
        description: 'Panorama general del curso',
        contentText: `Bienvenido al curso ${courseTitle}. Agrega un PDF con contenido para generar módulos automáticamente.`,
      },
    ]
  }

  if (apiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          temperature: 0.4,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content:
                'Eres un diseñador instruccional de INESA. Devuelve JSON con forma {"lessons":[{"title":"","description":"","contentText":""}]}. Crea entre 4 y 10 lecciones claras en español, basadas solo en el material.',
            },
            {
              role: 'user',
              content: `Curso: ${courseTitle}\n\nMaterial:\n${sourceText.slice(0, 12000)}`,
            },
          ],
        }),
      })

      if (response.ok) {
        const json = await response.json()
        const content = json.choices?.[0]?.message?.content
        if (content) {
          const parsed = JSON.parse(content) as { lessons?: GeneratedLesson[] }
          if (parsed.lessons?.length) return parsed.lessons
        }
      }
    } catch {
      // fallback below
    }
  }

  return chunks.map((chunk, index) => {
    const lines = chunk.split('\n').filter(Boolean)
    const title = (lines[0] || `Módulo ${index + 1}`).slice(0, 90)
    const summary = lines.slice(1, 4).join(' ').slice(0, 220)
    return {
      title,
      description: summary || `Contenido del módulo ${index + 1}`,
      contentText: chunk.slice(0, 6000),
    }
  })
}