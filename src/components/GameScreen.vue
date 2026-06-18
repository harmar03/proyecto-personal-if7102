<script setup>
/**
 * GameScreen — Orquesta la partida.
 * Inyecta el controlador del quiz y el audio (provide/inject) desde App, maneja
 * el temporizador (useTimer), los eventos de teclado y mouse, reproduce los
 * efectos de sonido (incluyendo música de tensión) y avanza entre preguntas.
 * Emite 'terminar' al acabar.
 */
import { computed, inject, onMounted, onUnmounted, ref } from 'vue'
import { useTimer } from '../composables/useTimer.js'
import ProgressBar from './ProgressBar.vue'
import TimerBar from './TimerBar.vue'
import StatPill from './StatPill.vue'
import QuestionCard from './QuestionCard.vue'
import PrizeLadder from './PrizeLadder.vue'

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
  PREMIOS,
  nivelPremio,
  premioActual,
} = quiz

// El jugador puede retirarse solo si ya aseguró algún premio.
const puedeRetirarse = computed(() => !bloqueado.value && nivelPremio.value >= 0)

// Temporizador: al agotarse, cuenta como respuesta sin elegir.
const timer = useTimer(SEGUNDOS_POR_PREGUNTA, () => bloquearPorTiempo())

// true cuando el jugador respondió y espera hacer clic en "Siguiente pregunta".
const esperandoSiguiente = ref(false)

const categoriaActual = computed(
  () =>
    categorias.value.find((c) => c.id === preguntaActual.value?.categoria) || {
      nombre: '',
      emoji: '❓',
    }
)

// Tras responder muestra el botón "Siguiente pregunta" en vez de avanzar solo.
function programarAvance() {
  esperandoSiguiente.value = true
}

function elegir(indice) {
  if (bloqueado.value) return
  const fraccion = timer.fraccion.value
  timer.detener()
  audio.pararMusica()
  const acerto = quiz.responder(indice, fraccion)
  audio.reproducir(acerto ? 'acierto' : 'error')
  programarAvance()
}

function bloquearPorTiempo() {
  if (bloqueado.value) return
  audio.pararMusica()
  quiz.responder(null, 0)
  audio.reproducir('error')
  programarAvance()
}

function siguienteManual() {
  esperandoSiguiente.value = false
  avanzar()
}

function avanzar() {
  const hayMas = quiz.siguiente()
  if (hayMas) {
    timer.iniciar(SEGUNDOS_POR_PREGUNTA)
    audio.iniciarMusica('tension')
  } else {
    quiz.finalizar()
    audio.pararMusica()
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
    audio.pararMusica()
    avanzar()
  }
}

function habilidadCongelar() {
  if (bloqueado.value || !habilidades.value.congelar) return
  quiz.gastarHabilidad('congelar')
  timer.detener()
  audio.pararMusica() // tiempo congelado = silencio dramático
}

// --- Retirarse: abandona llevándose el premio asegurado ---
function retirarse() {
  if (!puedeRetirarse.value) return
  if (quiz.retirarse()) {
    timer.detener()
    audio.pararMusica()
    audio.reproducir('retiro') // "el jugador se lleva el dinero"
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
  audio.iniciarMusica('tension') // música de tensión desde la primera pregunta
})

onUnmounted(() => {
  window.removeEventListener('keydown', alPresionar)
  audio.pararMusica()
})
</script>

<template>
  <div class="juego-layout" v-if="preguntaActual">
    <!-- Área principal de juego -->
    <section class="juego">
      <ProgressBar :actual="numeroPregunta" :total="total" />

      <div class="juego__hud">
        <StatPill icono="⭐" :valor="puntos" etiqueta="pts" />
        <StatPill icono="🔥" :valor="racha" etiqueta="racha" :destacado="racha >= 3" />
        <StatPill v-if="dobleActivo" icono="💎" valor="2x" etiqueta="armado" destacado />
        <!-- Premio actual: visible en móvil donde la escalera está oculta -->
        <StatPill class="hud-premio" icono="💰" :valor="premioActual?.formato" etiqueta="nivel" destacado />
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

      <!-- Retirarse: solo visible cuando ya hay un premio asegurado -->
      <Transition name="explica">
        <button
          v-if="puedeRetirarse"
          class="retiro"
          @click="retirarse"
          :title="`Retirarte y llevarte ${premioActual.formato}`"
        >
          🏳️ Retirarme con <strong>{{ premioActual.formato }}</strong>
        </button>
      </Transition>

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

      <!-- Botón siguiente: aparece tras responder (en vez de avance automático) -->
      <Transition name="explica">
        <button
          v-if="esperandoSiguiente"
          class="boton boton--siguiente"
          @click="siguienteManual"
          autofocus
        >
          Siguiente pregunta →
        </button>
      </Transition>
    </section>

    <!-- Escalera de premios (visible solo en escritorio vía CSS) -->
    <PrizeLadder :premios="PREMIOS" :nivel="nivelPremio" />
  </div>
</template>

<style scoped>
/* Layout de dos columnas en escritorio (juego | escalera) */
.juego-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  padding: 1.5rem 20px 2rem;
  align-items: start;
}
@media (min-width: 820px) {
  .juego-layout {
    grid-template-columns: 1fr 190px;
  }
  /* Oculta el pill de premio en HUD cuando la escalera es visible */
  .hud-premio {
    display: none !important;
  }
}

.juego {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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
.hab--oro {
  border-color: var(--sol);
  background: color-mix(in srgb, var(--sol) 14%, var(--surface));
  color: var(--acento);
}
.hab--oro:hover:not(:disabled) {
  background: color-mix(in srgb, var(--sol) 24%, var(--surface));
}
.hab--activo {
  opacity: 1 !important;
  text-decoration: none !important;
  border-color: var(--sol);
  background: var(--sol);
  color: #3a2c00;
  animation: latido2x 1s ease-in-out infinite;
}
@keyframes latido2x {
  0%, 100% { transform: scale(1); }
  50%       { transform: scale(1.05); }
}
@media (max-width: 380px) {
  .hab__txt { display: none; }
}

/* Botón "Retirarme" — discreto pero visible, color coral */
.retiro {
  align-self: center;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1.1rem;
  border-radius: 999px;
  border: 1.5px solid var(--coral);
  background: color-mix(in srgb, var(--coral) 10%, var(--surface));
  color: var(--coral);
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: transform 0.12s ease, background 0.2s ease;
}
.retiro:hover {
  transform: translateY(-2px);
  background: color-mix(in srgb, var(--coral) 20%, var(--surface));
}
.retiro strong {
  font-weight: 900;
}

/* Botón "Siguiente pregunta" — estilo Millonario dorado */
.boton--siguiente {
  width: 100%;
  padding: 1rem 1.6rem;
  font-size: 1.05rem;
  font-weight: 800;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #ffd700, #f5a800);
  color: #1a1200;
  cursor: pointer;
  box-shadow: 0 8px 24px -8px rgba(245, 168, 0, 0.7);
  transition: transform 0.15s ease, box-shadow 0.2s ease;
  letter-spacing: 0.02em;
}
.boton--siguiente:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 32px -8px rgba(245, 168, 0, 0.85);
}
.boton--siguiente:active {
  transform: translateY(0);
}
</style>
