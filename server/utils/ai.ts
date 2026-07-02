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

const SYSTEM_PROMPT = `Eres un diseñador instruccional de INESA (evaluación sensorial de alimentos).
Devuelve SOLO JSON válido con esta forma exacta:
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
- Basate SOLO en el material proporcionado.`

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

function parseGeneratedCourse(raw: string): GeneratedCourse | null {
  try {
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim()
    const parsed = JSON.parse(cleaned) as GeneratedCourse
    if (!parsed.lessons?.length || !parsed.quiz?.questions?.length) return null
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
  } catch {
    return null
  }
}

async function callGemini(userPrompt: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null

  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ parts: [{ text: userPrompt }] }],
      generationConfig: {
        temperature: 0.4,
        responseMimeType: 'application/json',
      },
    }),
  })

  if (!response.ok) {
    console.error('[ai] Gemini error:', response.status, await response.text())
    return null
  }

  const json = await response.json()
  return json.candidates?.[0]?.content?.parts?.[0]?.text ?? null
}

async function callGrok(userPrompt: string): Promise<string | null> {
  const apiKey = process.env.XAI_API_KEY
  if (!apiKey) return null

  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.XAI_MODEL || 'grok-4-1-fast-non-reasoning',
      temperature: 0.4,
      response_format: { type: 'json_object' },
      search_parameters: { mode: 'off' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
    }),
  })

  if (!response.ok) {
    console.error('[ai] Grok error:', response.status, await response.text())
    return null
  }

  const json = await response.json()
  return json.choices?.[0]?.message?.content ?? null
}

async function callAiProvider(userPrompt: string): Promise<GeneratedCourse | null> {
  const provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase()

  const attempts: Array<() => Promise<string | null>> = []

  if (provider === 'gemini' || provider === 'auto') attempts.push(callGemini)
  if (provider === 'grok' || provider === 'xai') attempts.push(callGrok)
  if (provider === 'auto') attempts.push(callGrok)

  for (const attempt of attempts) {
    try {
      const content = await attempt(userPrompt)
      if (!content) continue
      const parsed = parseGeneratedCourse(content)
      if (parsed) return parsed
    } catch (err) {
      console.error('[ai] provider failed:', err)
    }
  }

  return null
}

export async function generateCourseFromText(
  courseTitle: string,
  sourceText: string,
): Promise<GeneratedCourse> {
  const chunks = splitTextIntoModules(sourceText)

  if (sourceText.length > 80) {
    const userPrompt = `Curso: ${courseTitle}\n\nMaterial:\n${sourceText.slice(0, 14000)}`
    const aiResult = await callAiProvider(userPrompt)
    if (aiResult) return aiResult
  }

  const lessons = buildFallbackLessons(courseTitle, chunks)
  const quiz = buildFallbackQuiz(courseTitle, chunks.length ? chunks : [sourceText.slice(0, 500)])

  return { lessons, quiz }
}

