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
  habilidades,
  opcionesOcultas,
  dobleActivo,
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

// --- Habilidades (power-ups) ---
function habilidadExtra() {
  if (bloqueado.value || !habilidades.value.extra) return
  quiz.gastarHabilidad('extra')
  timer.agregar(5)
}

function habilidadSaltar() {
  if (bloqueado.value || !habilidades.value.saltar) return
  if (quiz.saltarPregunta()) {
    timer.detener()
    avanzar()
  }
}

function habilidadCongelar() {
  if (bloqueado.value || !habilidades.value.congelar) return
  quiz.gastarHabilidad('congelar')
  timer.detener() // el tiempo queda congelado en esta pregunta
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
      <StatPill v-if="dobleActivo" icono="💎" valor="2x" etiqueta="armado" destacado />
    </div>

    <TimerBar :restante="timer.restante.value" :fraccion="timer.fraccion.value" />

    <!-- Habilidades (cada una se puede usar una vez por partida) -->
    <div class="habilidades" role="group" aria-label="Habilidades">
      <button
        class="hab"
        :disabled="bloqueado || !habilidades.cincuenta"
        @click="quiz.usar5050()"
        title="50:50 — elimina dos opciones incorrectas"
      >
        🎯 <span class="hab__txt">50:50</span>
      </button>
      <button
        class="hab hab--oro"
        :class="{ 'hab--activo': dobleActivo }"
        :disabled="bloqueado || !habilidades.doble"
        @click="quiz.activarDoble()"
        title="Doble puntos — la próxima respuesta correcta vale x2"
      >
        💎 <span class="hab__txt">2x</span>
      </button>
      <button
        class="hab"
        :disabled="bloqueado || !habilidades.extra"
        @click="habilidadExtra"
        title="Tiempo extra — suma 5 segundos"
      >
        ⏱️ <span class="hab__txt">+5 s</span>
      </button>
      <button
        class="hab"
        :disabled="bloqueado || !habilidades.congelar"
        @click="habilidadCongelar"
        title="Congelar — detiene el tiempo en esta pregunta"
      >
        ❄️ <span class="hab__txt">Congelar</span>
      </button>
      <button
        class="hab"
        :disabled="bloqueado || !habilidades.saltar"
        @click="habilidadSaltar"
        title="Saltar — pasa a la siguiente sin penalizar puntos"
      >
        ⏭️ <span class="hab__txt">Saltar</span>
      </button>
    </div>

    <Transition name="fade" mode="out-in">
      <QuestionCard
        :key="preguntaActual.id"
        :pregunta="preguntaActual"
        :categoria="categoriaActual"
        :bloqueado="bloqueado"
        :respuesta-elegida="respuestaElegida"
        :ocultas="opcionesOcultas"
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
  align-items: center;
}
.habilidades {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.hab {
  flex: 1 1 auto;
  min-width: 84px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.5rem 0.6rem;
  border-radius: 999px;
  border: 1.5px solid var(--cielo);
  background: color-mix(in srgb, var(--cielo) 12%, var(--surface));
  color: var(--cielo);
  font-weight: 800;
  font-size: 0.92rem;
  cursor: pointer;
  transition: transform 0.12s ease, background 0.2s ease;
}
.hab:hover:not(:disabled) {
  transform: translateY(-2px);
  background: color-mix(in srgb, var(--cielo) 22%, var(--surface));
}
.hab:disabled {
  opacity: 0.4;
  cursor: default;
  text-decoration: line-through;
}
/* Poder 2x (dorado) */
.hab--oro {
  border-color: var(--sol);
  background: color-mix(in srgb, var(--sol) 14%, var(--surface));
  color: var(--acento);
}
.hab--oro:hover:not(:disabled) {
  background: color-mix(in srgb, var(--sol) 24%, var(--surface));
}
/* 2x armado: resaltado y pulsante aunque ya esté "usado" */
.hab--activo {
  opacity: 1 !important;
  text-decoration: none !important;
  border-color: var(--sol);
  background: var(--sol);
  color: #3a2c00;
  animation: latido2x 1s ease-in-out infinite;
}
@keyframes latido2x {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}
@media (max-width: 380px) {
  .hab__txt {
    display: none;
  }
}
</style>
