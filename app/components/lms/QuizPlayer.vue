<script setup lang="ts">
import type { QuizPayload, QuizResult } from '#shared/types/lms'

const props = defineProps<{
  contentText: string
  lessonId: string
}>()

const emit = defineEmits<{
  submitted: [result: QuizResult]
}>()

const { submitQuiz } = useLms()

const quiz = computed<QuizPayload | null>(() => {
  try {
    return JSON.parse(props.contentText) as QuizPayload
  } catch {
    return null
  }
})

const answers = ref<number[]>([])
const loading = ref(false)
const result = ref<QuizResult | null>(null)
const error = ref('')

watch(
  quiz,
  (q) => {
    if (q) answers.value = q.questions.map(() => -1)
  },
  { immediate: true },
)

async function onSubmit() {
  error.value = ''
  if (answers.value.some((a) => a < 0)) {
    error.value = 'Responde todas las preguntas antes de enviar.'
    return
  }
  loading.value = true
  try {
    result.value = await submitQuiz(props.lessonId, answers.value)
    emit('submitted', result.value)
  } catch {
    error.value = 'No se pudo calificar el cuestionario.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div v-if="quiz" class="lms-quiz">
    <p v-if="error" class="lms-alert lms-alert--error">{{ error }}</p>

    <div v-if="!result" class="lms-quiz__questions">
      <div v-for="(q, qi) in quiz.questions" :key="qi" class="lms-quiz__question">
        <h3>{{ qi + 1 }}. {{ q.question }}</h3>
        <label
          v-for="(opt, oi) in q.options"
          :key="oi"
          class="lms-quiz__option"
          :class="{ selected: answers[qi] === oi }"
        >
          <input v-model="answers[qi]" type="radio" :value="oi" :name="`q-${qi}`" />
          <span>{{ opt }}</span>
        </label>
      </div>

      <button type="button" class="lms-btn lms-btn--primary" :disabled="loading" @click="onSubmit">
        {{ loading ? 'Calificando…' : 'Enviar respuestas' }}
      </button>
    </div>

    <div v-else class="lms-quiz__result">
      <div class="lms-quiz__score" :class="{ passed: result.passed }">
        <span class="lms-quiz__score-value">{{ result.percent }}%</span>
        <span>{{ result.score }} / {{ result.total }} correctas</span>
        <strong>{{ result.passed ? '¡Aprobado!' : `Necesitas ${result.passPercent}% para aprobar` }}</strong>
      </div>

      <div v-for="(item, i) in result.results" :key="i" class="lms-quiz__feedback" :class="{ correct: item.correct, wrong: !item.correct }">
        <p><strong>{{ i + 1 }}. {{ item.question }}</strong></p>
        <p>{{ item.correct ? '✓ Correcta' : '✗ Incorrecta' }}</p>
        <p v-if="item.explanation" class="lms-quiz__explanation">{{ item.explanation }}</p>
      </div>

      <button v-if="!result.passed" type="button" class="lms-btn lms-btn--secondary" @click="result = null">
        Intentar de nuevo
      </button>
    </div>
  </div>
</template>

<style scoped>
.lms-quiz__questions {
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
}

.lms-quiz__question h3 {
  color: #fff;
  font-family: var(--font-sans);
  font-size: 1.4rem;
  margin-bottom: 0.8rem;
}

.lms-quiz__option {
  align-items: center;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  display: flex;
  font-family: var(--font-sans);
  font-size: 1.25rem;
  gap: 0.8rem;
  margin-bottom: 0.5rem;
  padding: 0.8rem 1rem;
}

.lms-quiz__option.selected {
  background: rgba(233, 79, 29, 0.15);
  border-color: var(--color-brand);
}

.lms-quiz__score {
  background: #1a1f26;
  border-radius: var(--radius-md);
  color: rgba(255, 255, 255, 0.8);
  font-family: var(--font-sans);
  margin-bottom: 1.6rem;
  padding: 1.6rem;
  text-align: center;
}

.lms-quiz__score.passed {
  border: 2px solid var(--color-accent);
}

.lms-quiz__score-value {
  color: var(--color-brand);
  display: block;
  font-size: 3.2rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 0.4rem;
}

.lms-quiz__feedback {
  border-radius: 8px;
  font-family: var(--font-sans);
  font-size: 1.2rem;
  margin-bottom: 0.8rem;
  padding: 1rem;
}

.lms-quiz__feedback.correct {
  background: rgba(133, 170, 12, 0.15);
  color: #b8d86a;
}

.lms-quiz__feedback.wrong {
  background: rgba(207, 46, 46, 0.12);
  color: #ff8a8a;
}

.lms-quiz__explanation {
  margin-top: 0.4rem;
  opacity: 0.85;
}
</style>