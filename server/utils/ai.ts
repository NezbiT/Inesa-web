import { splitTextIntoModules } from './pdf'

export interface QuizQuestion {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface GeneratedLesson {
  title: string
  description: string
  contentText: string
}

export interface GeneratedQuiz {
  title: string
  questions: QuizQuestion[]
}

export interface GeneratedCourse {
  lessons: GeneratedLesson[]
  quiz: GeneratedQuiz
}

function buildFallbackQuiz(courseTitle: string, chunks: string[]): GeneratedQuiz {
  const questions: QuizQuestion[] = chunks.slice(0, 4).map((chunk, index) => {
    const lines = chunk.split('\n').filter(Boolean)
    const topic = (lines[0] || `Tema ${index + 1}`).slice(0, 120)
    const detail = lines.slice(1, 3).join(' ').slice(0, 200) || chunk.slice(0, 200)
    return {
      question: `Según el material del curso "${courseTitle}", ¿qué afirmación describe mejor "${topic}"?`,
      options: [
        detail.slice(0, 100) || 'Concepto principal del módulo',
        'No está relacionado con evaluación sensorial',
        'Es un procedimiento de laboratorio químico únicamente',
        'No se menciona en el material de estudio',
      ],
      correctIndex: 0,
      explanation: `La respuesta correcta se basa en el módulo: ${topic}`,
    }
  })

  if (!questions.length) {
    questions.push({
      question: `¿Cuál es el objetivo principal del curso "${courseTitle}"?`,
      options: [
        'Aprender evaluación sensorial aplicada',
        'Solo teoría sin práctica',
        'Análisis financiero de alimentos',
        'Ninguna de las anteriores',
      ],
      correctIndex: 0,
      explanation: 'El curso está orientado a evaluación sensorial.',
    })
  }

  return { title: 'Evaluación final', questions }
}

function buildFallbackLessons(courseTitle: string, chunks: string[]): GeneratedLesson[] {
  if (!chunks.length) {
    return [
      {
        title: 'Introducción',
        description: 'Panorama general del curso',
        contentText: `Bienvenido al curso ${courseTitle}. El PDF no contenía texto extraíble; agrega otro archivo o edita las lecciones manualmente.`,
      },
    ]
  }

  return chunks.map((chunk, index) => {
    const lines = chunk.split('\n').filter(Boolean)
    const title = (lines[0] || `Módulo ${index + 1}`).slice(0, 90)
    const summary = lines.slice(1, 4).join(' ').slice(0, 220)
    return {
      title,
      description: summary || `Contenido del módulo ${index + 1}`,
      contentText: chunk.slice(0, 5000),
    }
  })
}

export async function generateCourseFromText(
  courseTitle: string,
  sourceText: string,
): Promise<GeneratedCourse> {
  const apiKey = process.env.OPENAI_API_KEY
  const chunks = splitTextIntoModules(sourceText)

  if (apiKey && sourceText.length > 80) {
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
              content: `Eres un diseñador instruccional de INESA (evaluación sensorial de alimentos).
Devuelve JSON con esta forma exacta:
{
  "lessons": [{"title":"","description":"","contentText":""}],
  "quiz": {
    "title": "Evaluación final",
    "questions": [{"question":"","options":["","","",""],"correctIndex":0,"explanation":""}]
  }
}
Reglas:
- Crea entre 3 y 6 lecciones cortas en español, claras y prácticas.
- Crea entre 4 y 6 preguntas de opción múltiple (4 opciones cada una).
- Las preguntas deben evaluar comprensión del material, no memorización literal.
- correctIndex es 0-3.
- Basate SOLO en el material proporcionado.`,
            },
            {
              role: 'user',
              content: `Curso: ${courseTitle}\n\nMaterial:\n${sourceText.slice(0, 14000)}`,
            },
          ],
        }),
      })

      if (response.ok) {
        const json = await response.json()
        const content = json.choices?.[0]?.message?.content
        if (content) {
          const parsed = JSON.parse(content) as GeneratedCourse
          if (parsed.lessons?.length && parsed.quiz?.questions?.length) {
            return {
              lessons: parsed.lessons.slice(0, 6),
              quiz: {
                title: parsed.quiz.title || 'Evaluación final',
                questions: parsed.quiz.questions.slice(0, 6).map((q) => ({
                  question: q.question,
                  options: q.options.slice(0, 4),
                  correctIndex: Math.min(Math.max(q.correctIndex, 0), 3),
                  explanation: q.explanation || '',
                })),
              },
            }
          }
        }
      }
    } catch {
      // fallback below
    }
  }

  const lessons = buildFallbackLessons(courseTitle, chunks)
  const quiz = buildFallbackQuiz(courseTitle, chunks.length ? chunks : [sourceText.slice(0, 500)])

  return { lessons, quiz }
}

/** @deprecated use generateCourseFromText */
export async function generateLessonsFromText(courseTitle: string, sourceText: string) {
  const result = await generateCourseFromText(courseTitle, sourceText)
  return result.lessons
}