import {
  buildDocumentDigest,
  estimatePages,
  splitTextIntoSections,
  targetLessonCount,
  targetQuizCount,
} from './pdf'

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

interface CourseOutlineModule {
  title: string
  description: string
  keyTopics: string[]
  chunkIndex: number
}

interface CourseOutline {
  courseSummary: string
  learningObjectives: string[]
  modules: CourseOutlineModule[]
}

const OUTLINE_SYSTEM = `Eres un diseñador instruccional senior de INESA (Instituto de Evaluación Sensorial de Alimentos).
Analizas documentos largos (artículos, manuales, tesis) y diseñas un curso e-learning completo en español.
Responde SOLO JSON válido con esta forma:
{
  "courseSummary": "Resumen ejecutivo de 3-5 párrafos del documento completo",
  "learningObjectives": ["objetivo medible 1", "objetivo 2"],
  "modules": [
    {
      "title": "Título del módulo",
      "description": "Qué aprenderá el estudiante",
      "keyTopics": ["tema1", "tema2"],
      "chunkIndex": 0
    }
  ]
}
Reglas:
- chunkIndex es el índice de la sección fuente (0-based) que mejor corresponde al módulo.
- Cubre TODO el documento: inicio, desarrollo y conclusiones.
- Títulos específicos al contenido real, no genéricos.
- Objetivos de aprendizaje claros y medibles.`

const LESSON_SYSTEM = `Eres un autor de cursos de evaluación sensorial para INESA.
Escribes lecciones profundas, didácticas y basadas SOLO en el material fuente.
Responde SOLO JSON:
{
  "title": "Título",
  "description": "Una línea",
  "contentText": "Texto largo con secciones markdown: ## Resumen\\n...\\n## Conceptos clave\\n- ...\\n## Desarrollo\\n...\\n## Aplicación en evaluación sensorial\\n...\\n## Puntos para recordar\\n- ..."
}
Reglas:
- contentText: mínimo 500 palabras, máximo 1200 palabras en español.
- Incluye definiciones, ejemplos, relaciones entre conceptos y citas al material.
- Usa listas, subtítulos ## y párrafos completos (no un solo párrafo).
- Conecta con el contexto del curso y módulos anteriores cuando se indique.`

const QUIZ_SYSTEM = `Eres un evaluador de INESA especializado en evaluación sensorial.
Creas exámenes integradores que conectan conceptos de todo el curso.
Responde SOLO JSON:
{
  "title": "Evaluación integradora",
  "questions": [
    {
      "question": "Pregunta contextualizada",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "Por qué es correcta y cómo se relaciona con el curso"
    }
  ]
}
Reglas:
- Preguntas que integren varios módulos (no aisladas).
- Incluye casos prácticos, comparaciones y aplicación profesional.
- 4 opciones plausibles; correctIndex 0-3.
- Explicaciones educativas de 2-3 oraciones.`

function stripJsonFence(raw: string): string {
  return raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim()
}

function parseJson<T>(raw: string): T | null {
  try {
    return JSON.parse(stripJsonFence(raw)) as T
  } catch {
    return null
  }
}

function normalizeQuiz(questions: QuizQuestion[], max: number): QuizQuestion[] {
  return questions.slice(0, max).map((q) => ({
    question: q.question?.trim() || 'Pregunta',
    options: (q.options || []).slice(0, 4).map((o) => String(o).trim()),
    correctIndex: Math.min(Math.max(q.correctIndex ?? 0, 0), 3),
    explanation: q.explanation?.trim() || '',
  }))
}

function ensureFourOptions(options: string[]): string[] {
  const filled = [...options]
  while (filled.length < 4) filled.push(`Opción ${filled.length + 1}`)
  return filled.slice(0, 4)
}

async function callGemini(system: string, userPrompt: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null

  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ parts: [{ text: userPrompt }] }],
      generationConfig: {
        temperature: 0.45,
        maxOutputTokens: 8192,
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

async function callGrok(system: string, userPrompt: string): Promise<string | null> {
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
      temperature: 0.45,
      response_format: { type: 'json_object' },
      search_parameters: { mode: 'off' },
      messages: [
        { role: 'system', content: system },
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

async function callAiJson<T>(system: string, userPrompt: string): Promise<T | null> {
  const provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase()
  const attempts: Array<() => Promise<string | null>> = []

  if (provider === 'gemini' || provider === 'auto') {
    attempts.push(() => callGemini(system, userPrompt))
  }
  if (provider === 'grok' || provider === 'xai') {
    attempts.push(() => callGrok(system, userPrompt))
  }
  if (provider === 'auto') {
    attempts.push(() => callGrok(system, userPrompt))
  }

  for (const attempt of attempts) {
    try {
      const content = await attempt()
      if (!content) continue
      const parsed = parseJson<T>(content)
      if (parsed) return parsed
    } catch (err) {
      console.error('[ai] provider failed:', err)
    }
  }

  return null
}

async function generateOutline(
  courseTitle: string,
  sourceText: string,
  sections: string[],
  moduleCount: number,
): Promise<CourseOutline | null> {
  const digest = buildDocumentDigest(sourceText)
  const prompt = `Curso: "${courseTitle}"
Páginas estimadas: ${estimatePages(sourceText)}
Secciones fuente (${sections.length} fragmentos, índices 0-${sections.length - 1}).
Genera exactamente ${moduleCount} módulos que cubran TODO el documento de forma progresiva.

DOCUMENTO (muestra representativa):
${digest}`

  const outline = await callAiJson<CourseOutline>(OUTLINE_SYSTEM, prompt)
  if (!outline?.modules?.length) return null

  return {
    courseSummary: outline.courseSummary || `Resumen del curso ${courseTitle}`,
    learningObjectives: outline.learningObjectives || [],
    modules: outline.modules.slice(0, moduleCount).map((m, i) => ({
      title: m.title || `Módulo ${i + 1}`,
      description: m.description || '',
      keyTopics: m.keyTopics || [],
      chunkIndex: Math.min(Math.max(m.chunkIndex ?? i, 0), sections.length - 1),
    })),
  }
}

async function generateLesson(
  courseTitle: string,
  module: CourseOutlineModule,
  moduleIndex: number,
  totalModules: number,
  sourceChunk: string,
  previousTitles: string[],
): Promise<GeneratedLesson | null> {
  const prompt = `Curso: "${courseTitle}"
Módulo ${moduleIndex + 1} de ${totalModules}: "${module.title}"
Descripción: ${module.description}
Temas clave: ${module.keyTopics.join(', ')}
Módulos previos: ${previousTitles.join(' → ') || 'Ninguno (es el primero)'}

MATERIAL FUENTE DEL MÓDULO:
${sourceChunk.slice(0, 16_000)}`

  const lesson = await callAiJson<GeneratedLesson>(LESSON_SYSTEM, prompt)
  if (!lesson?.contentText || lesson.contentText.length < 200) return null

  return {
    title: lesson.title || module.title,
    description: lesson.description || module.description,
    contentText: lesson.contentText.trim(),
  }
}

async function generateQuizFromLessons(
  courseTitle: string,
  lessons: GeneratedLesson[],
  questionCount: number,
  objectives: string[],
): Promise<GeneratedQuiz | null> {
  const syllabus = lessons
    .map(
      (l, i) =>
        `${i + 1}. ${l.title}\n   ${l.description}\n   Extracto: ${l.contentText.slice(0, 400)}…`,
    )
    .join('\n\n')

  const prompt = `Curso: "${courseTitle}"
Objetivos: ${objectives.join('; ') || 'Dominar el contenido del documento'}

SÍLABO (${lessons.length} lecciones):
${syllabus}

Genera ${questionCount} preguntas integradoras conectadas entre módulos.`

  const quiz = await callAiJson<GeneratedQuiz>(QUIZ_SYSTEM, prompt)
  if (!quiz?.questions?.length) return null

  return {
    title: quiz.title || 'Evaluación integradora',
    questions: normalizeQuiz(quiz.questions, questionCount).map((q) => ({
      ...q,
      options: ensureFourOptions(q.options),
    })),
  }
}

function buildIntroLesson(courseTitle: string, outline: CourseOutline): GeneratedLesson {
  const objectives =
    outline.learningObjectives.length > 0
      ? `\n\n## Objetivos de aprendizaje\n${outline.learningObjectives.map((o) => `- ${o}`).join('\n')}`
      : ''

  const modules = `\n\n## Estructura del curso\n${outline.modules.map((m, i) => `${i + 1}. **${m.title}** — ${m.description}`).join('\n')}`

  return {
    title: 'Introducción y resumen general',
    description: 'Panorama del documento y objetivos del curso',
    contentText: `## Resumen ejecutivo\n\n${outline.courseSummary}${objectives}${modules}\n\n## Cómo estudiar este curso\n\nLee cada módulo en orden, toma notas de los conceptos clave y al finalizar completa la evaluación integradora que conecta todos los temas del material "${courseTitle}".`,
  }
}

function buildFallbackLessons(courseTitle: string, sections: string[]): GeneratedLesson[] {
  if (!sections.length) {
    return [
      {
        title: 'Introducción',
        description: 'Panorama del curso',
        contentText: `Bienvenido al curso ${courseTitle}. No se pudo extraer texto suficiente del PDF.`,
      },
    ]
  }

  return sections.map((chunk, index) => {
    const lines = chunk.split('\n').filter(Boolean)
    const title = (lines[0] || `Módulo ${index + 1}`).slice(0, 90)
    return {
      title,
      description: `Contenido basado en la sección ${index + 1}`,
      contentText: `## Resumen\n\n${lines.slice(1, 6).join(' ').slice(0, 600)}\n\n## Desarrollo\n\n${chunk.slice(0, 8000)}`,
    }
  })
}

function buildFallbackQuiz(courseTitle: string, lessons: GeneratedLesson[]): GeneratedQuiz {
  const questions: QuizQuestion[] = lessons.slice(0, 12).map((lesson, index) => ({
    question: `Según el módulo "${lesson.title}" del curso "${courseTitle}", ¿cuál idea es central?`,
    options: [
      lesson.description || 'Concepto principal del módulo',
      'No aplica a evaluación sensorial',
      'Solo metodología química instrumental',
      'No se menciona en el material',
    ],
    correctIndex: 0,
    explanation: `La respuesta deriva del módulo ${index + 1}: ${lesson.title}`,
  }))

  return { title: 'Evaluación integradora', questions: questions.length ? questions : [{
    question: `¿Cuál es el enfoque del curso "${courseTitle}"?`,
    options: ['Evaluación sensorial aplicada', 'Contabilidad', 'Marketing', 'Ninguna'],
    correctIndex: 0,
    explanation: 'El curso está basado en evaluación sensorial.',
  }] }
}

async function runInBatches<T, R>(
  items: T[],
  batchSize: number,
  fn: (item: T, index: number) => Promise<R | null>,
): Promise<R[]> {
  const results: R[] = []
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const batchResults = await Promise.all(batch.map((item, j) => fn(item, i + j)))
    for (const r of batchResults) {
      if (r) results.push(r)
    }
  }
  return results
}

export async function generateCourseFromText(
  courseTitle: string,
  sourceText: string,
): Promise<GeneratedCourse> {
  const sections = splitTextIntoSections(sourceText)
  const moduleCount = targetLessonCount(sourceText)
  const quizCount = targetQuizCount(moduleCount)

  console.log(
    `[ai] Generating course "${courseTitle}" — ${estimatePages(sourceText)} pages, ${sections.length} sections, ${moduleCount} modules target`,
  )

  const hasAi = Boolean(process.env.GEMINI_API_KEY || process.env.XAI_API_KEY)

  if (hasAi && sourceText.length > 80) {
    const outline = await generateOutline(courseTitle, sourceText, sections, moduleCount)

    if (outline) {
      const intro = buildIntroLesson(courseTitle, outline)
      const titles: string[] = [intro.title]

      const moduleLessons = await runInBatches(
        outline.modules,
        3,
        async (module, index) => {
          const chunk = sections[module.chunkIndex] || sections[index % sections.length] || sourceText
          const lesson =
            (await generateLesson(
              courseTitle,
              module,
              index,
              outline.modules.length,
              chunk,
              titles,
            )) ||
            ({
              title: module.title,
              description: module.description,
              contentText: `## Resumen\n\n${module.description}\n\n## Desarrollo\n\n${chunk.slice(0, 10_000)}`,
            } satisfies GeneratedLesson)
          titles.push(lesson.title)
          return lesson
        },
      )

      const lessons = [intro, ...moduleLessons]

      if (lessons.length >= 2) {
        const quiz =
          (await generateQuizFromLessons(courseTitle, lessons, quizCount, outline.learningObjectives)) ||
          buildFallbackQuiz(courseTitle, lessons)

        console.log(`[ai] Done: ${lessons.length} lessons, ${quiz.questions.length} questions`)
        return { lessons, quiz }
      }
    }
  }

  console.log('[ai] Falling back to section-based generation')
  const fallbackLessons = buildFallbackLessons(courseTitle, sections)
  return {
    lessons: fallbackLessons,
    quiz: buildFallbackQuiz(courseTitle, fallbackLessons),
  }
}