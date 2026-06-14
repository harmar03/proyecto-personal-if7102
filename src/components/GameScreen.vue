<script setup>
/**
 * GameScreen — Orquesta la partida.
 * Inyecta el controlador del quiz y el audio (provide/inject) desde App, maneja
 * el temporizador (useTimer), los eventos de teclado y mouse, reproduce los
 * efectos de sonido y avanza entre preguntas. Emite 'terminar' al acabar.
 */
import { computed, inject, onMounted, onUnmounted } from 'vue'
import { useTimer } from '../composables/useTimer.js'
import ProgressBar from './ProgressBar.vue'
import TimerBar from './TimerBar.vue'
import StatPill from './StatPill.vue'
import QuestionCard from './QuestionCard.vue'

const emit = defineEmits(['terminar'])

// Inyectados desde App.vue (sin prop-drilling).
const quiz = inject('quiz')
const audio = inject('audio')

// Refs del composable (siguen siendo reactivos al destructurarlos).
const {
  preguntaActual,
  bloqueado,
  respuestaElegida,
  numeroPregunta,
  total,
  puntos,
  racha,
  categorias,
  SEGUNDOS_POR_PREGUNTA,
} = quiz

// Temporizador: al agotarse, cuenta como respuesta sin elegir.
const timer = useTimer(SEGUNDOS_POR_PREGUNTA, () => bloquearPorTiempo())
let avanceTimeout = null

const categoriaActual = computed(
  () =>
    categorias.value.find((c) => c.id === preguntaActual.value?.categoria) || {
      nombre: '',
      emoji: '❓',
    }
)

function programarAvance() {
  avanceTimeout = setTimeout(avanzar, 1600)
}

function elegir(indice) {
  if (bloqueado.value) return
  const fraccion = timer.fraccion.value
  timer.detener()
  const acerto = quiz.responder(indice, fraccion)
  audio.reproducir(acerto ? 'acierto' : 'error')
  programarAvance()
}

function bloquearPorTiempo() {
  if (bloqueado.value) return
  quiz.responder(null, 0) // sin respuesta
  audio.reproducir('error')
  programarAvance()
}

function avanzar() {
  const hayMas = quiz.siguiente()
  if (hayMas) {
    timer.iniciar(SEGUNDOS_POR_PREGUNTA)
  } else {
    quiz.finalizar()
    audio.reproducir('resultado')
    emit('terminar')
  }
}

// --- Eventos de teclado: teclas 1–4 para responder ---
function alPresionar(e) {
  if (bloqueado.value) return
  const n = Number(e.key)
  if (n >= 1 && n <= (preguntaActual.value?.opciones.length || 0)) {
    elegir(n - 1)
  }
}

onMounted(() => {
  timer.iniciar(SEGUNDOS_POR_PREGUNTA)
  window.addEventListener('keydown', alPresionar)
})

onUnmounted(() => {
  clearTimeout(avanceTimeout)
  window.removeEventListener('keydown', alPresionar)
})
</script>

<template>
  <section class="juego contenedor" v-if="preguntaActual">
    <ProgressBar :actual="numeroPregunta" :total="total" />

    <div class="juego__hud">
      <StatPill icono="⭐" :valor="puntos" etiqueta="pts" />
      <StatPill icono="🔥" :valor="racha" etiqueta="racha" :destacado="racha >= 3" />
    </div>

    <TimerBar :restante="timer.restante.value" :fraccion="timer.fraccion.value" />

    <Transition name="fade" mode="out-in">
      <QuestionCard
        :key="preguntaActual.id"
        :pregunta="preguntaActual"
        :categoria="categoriaActual"
        :bloqueado="bloqueado"
        :respuesta-elegida="respuestaElegida"
        @elegir="elegir"
      />
    </Transition>
  </section>
</template>

<style scoped>
.juego {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 1.5rem;
  padding-bottom: 2rem;
  position: relative;
}
.juego__hud {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
}
</style>
