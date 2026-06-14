<script setup>
/**
 * App — Componente raíz.
 * - Crea los composables (quiz, audio, tema) y comparte quiz/audio con los
 *   descendientes mediante provide/inject.
 * - Controla qué pantalla se muestra y la transición entre ellas.
 * - Cabecera con cambio de tema (claro/oscuro) y silenciar sonido.
 */
import { ref, provide, onMounted } from 'vue'
import { useQuiz } from './composables/useQuiz.js'
import { useAudio } from './composables/useAudio.js'
import { useTheme } from './composables/useTheme.js'
import StartScreen from './components/StartScreen.vue'
import GameScreen from './components/GameScreen.vue'
import ResultScreen from './components/ResultScreen.vue'

const quiz = useQuiz()
const audio = useAudio()
const { tema, alternar } = useTheme()

// Compartidos hacia abajo sin prop-drilling.
provide('quiz', quiz)
provide('audio', audio)

// Refs del quiz que necesita la plantilla (se mantienen reactivos).
const {
  estado,
  categorias,
  mejorPuntaje,
  aciertos,
  total,
  porcentaje,
  puntos,
  rachaMax,
  nuevoRecord,
  respuestas,
  categoriaActiva,
} = quiz
const { silenciado } = audio

const pantalla = ref('inicio') // 'inicio' | 'juego' | 'resultado'

onMounted(quiz.cargar)

function iniciar(categoria) {
  quiz.empezar(categoria)
  pantalla.value = 'juego'
}
function terminar() {
  pantalla.value = 'resultado'
}
function revancha() {
  quiz.empezar(categoriaActiva.value)
  pantalla.value = 'juego'
}
function alInicio() {
  pantalla.value = 'inicio'
}
</script>

<template>
  <header class="cabecera">
    <div class="cabecera__interno contenedor">
      <button class="marca" @click="alInicio" aria-label="Volver al inicio">
        <span class="marca__logo" aria-hidden="true">🇨🇷</span>
        <span class="marca__txt">Pura Vida <strong>Quiz</strong></span>
      </button>
      <div class="cabecera__acciones">
        <button
          class="iconbtn"
          @click="audio.alternarSilencio()"
          :aria-label="silenciado ? 'Activar sonido' : 'Silenciar'"
          :title="silenciado ? 'Activar sonido' : 'Silenciar'"
        >
          {{ silenciado ? '🔇' : '🔊' }}
        </button>
        <button
          class="iconbtn"
          @click="alternar"
          :aria-label="tema === 'dark' ? 'Tema claro' : 'Tema oscuro'"
          :title="tema === 'dark' ? 'Tema claro' : 'Tema oscuro'"
        >
          {{ tema === 'dark' ? '☀️' : '🌙' }}
        </button>
      </div>
    </div>
  </header>

  <main class="principal">
    <Transition name="fade" mode="out-in">
      <StartScreen
        v-if="pantalla === 'inicio'"
        :categorias="categorias"
        :mejor-puntaje="mejorPuntaje"
        :estado="estado"
        @iniciar="iniciar"
        @reintentar="quiz.cargar()"
      />
      <GameScreen v-else-if="pantalla === 'juego'" @terminar="terminar" />
      <ResultScreen
        v-else
        :puntaje="puntos"
        :aciertos="aciertos"
        :total="total"
        :porcentaje="porcentaje"
        :racha-max="rachaMax"
        :mejor-puntaje="mejorPuntaje"
        :nuevo-record="nuevoRecord"
        :respuestas="respuestas"
        @revancha="revancha"
        @inicio="alInicio"
      />
    </Transition>
  </main>

  <footer class="pie">
    <p class="contenedor">
      Proyecto Personal · IF7102 Multimedios · I Ciclo 2026 — hecho con Vue 3
    </p>
  </footer>
</template>

<style scoped>
.cabecera {
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(10px);
  background: color-mix(in srgb, var(--bg) 78%, transparent);
  border-bottom: 1px solid var(--border);
}
.cabecera__interno {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}
.marca {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text);
  font-size: 1.15rem;
  font-weight: 700;
}
.marca__logo {
  font-size: 1.4rem;
}
.marca__txt strong {
  color: var(--primario);
}
.cabecera__acciones {
  display: flex;
  gap: 0.4rem;
}
.iconbtn {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--surface);
  font-size: 1.15rem;
  cursor: pointer;
  transition: transform 0.12s ease, background 0.2s ease, border-color 0.2s ease;
}
.iconbtn:hover {
  transform: translateY(-2px);
  border-color: var(--cielo);
}
.principal {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.pie {
  border-top: 1px solid var(--border);
  padding: 1rem 0;
  text-align: center;
  font-size: 0.82rem;
  color: var(--text-tenue);
}
</style>
