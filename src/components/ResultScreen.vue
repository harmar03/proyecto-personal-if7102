<script setup>
/**
 * ResultScreen — Pantalla de resultados.
 * Recibe todos los datos de la partida por props (props para pasar datos a un
 * componente hijo) y emite 'revancha' o 'inicio'. Incluye un anillo de progreso
 * en SVG y un repaso educativo de las preguntas.
 */
import { ref, computed, inject } from 'vue'
import StatPill from './StatPill.vue'

// Inyectado desde App: premio ganado, estado de retiro y lista de ganadores.
const quiz = inject('quiz')
const { premioActual, retirado, ganadores } = quiz

// --- Salón de la fama ---
const nombre = ref('')
const guardado = ref(false)

function guardarEnSalon() {
  if (quiz.guardarGanador(nombre.value)) {
    guardado.value = true
  }
}

function fechaCorta(iso) {
  try {
    return new Date(iso).toLocaleDateString('es-CR', {
      day: '2-digit',
      month: 'short',
    })
  } catch {
    return ''
  }
}

const medalla = ['🥇', '🥈', '🥉']

const props = defineProps({
  puntaje: { type: Number, required: true }, // puntos totales
  aciertos: { type: Number, required: true },
  total: { type: Number, required: true },
  porcentaje: { type: Number, required: true },
  rachaMax: { type: Number, default: 0 },
  mejorPuntaje: { type: Number, default: 0 },
  nuevoRecord: { type: Boolean, default: false },
  respuestas: { type: Array, default: () => [] },
})

const emit = defineEmits(['revancha', 'inicio'])

const verRepaso = ref(false)
const copiado = ref(false)

function avisarCopiado() {
  copiado.value = true
  setTimeout(() => (copiado.value = false), 2000)
}

// Copia un resumen del resultado al portapapeles.
// Usa la Clipboard API moderna y, si no está disponible, recurre a un método
// de respaldo con un <textarea> temporal (execCommand) para mayor compatibilidad.
async function compartir() {
  const texto =
    `🇨🇷 Pura Vida Quiz — Acerté ${props.aciertos}/${props.total} ` +
    `(${props.porcentaje}%) y sumé ${props.puntaje} puntos. ¿Podés superarme?`

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(texto)
      avisarCopiado()
      return
    } catch {
      /* sigue al respaldo */
    }
  }

  try {
    const ta = document.createElement('textarea')
    ta.value = texto
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.focus()
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    avisarCopiado()
  } catch {
    copiado.value = false
  }
}

const mensaje = computed(() => {
  if (props.porcentaje === 100) return '¡Perfecto! Sos un experto en Costa Rica 🇨🇷'
  if (props.porcentaje >= 80) return '¡Excelente! Casi todo correcto 🌟'
  if (props.porcentaje >= 50) return '¡Bien hecho! Vas por buen camino 👍'
  return 'Seguí practicando, ya casi lo tenés 💪'
})

const color = computed(() => {
  if (props.porcentaje >= 80) return 'var(--selva)'
  if (props.porcentaje >= 50) return 'var(--sol)'
  return 'var(--coral)'
})

// Anillo SVG: calcula el desfase del trazo según el porcentaje.
const RADIO = 52
const CIRC = 2 * Math.PI * RADIO
const offset = computed(() => CIRC * (1 - props.porcentaje / 100))

const estrellas = computed(() => {
  if (props.porcentaje >= 80) return 3
  if (props.porcentaje >= 50) return 2
  if (props.porcentaje >= 25) return 1
  return 0
})
</script>

<template>
  <section class="resultado contenedor">
    <div v-if="nuevoRecord" class="resultado__record">🏆 ¡Nuevo récord!</div>

    <h1 class="resultado__titulo">{{ retirado ? '¡Te retiraste!' : 'Resultado' }}</h1>

    <!-- Premio ganado (estilo Millonario) -->
    <div class="premio" :class="{ 'premio--retiro': retirado }">
      <span class="premio__label">{{ retirado ? '🏳️ Te llevás' : '🏆 Ganaste' }}</span>
      <span class="premio__monto">{{ premioActual.formato }}</span>
    </div>

    <!-- Anillo de puntuación (SVG) -->
    <div class="anillo">
      <svg viewBox="0 0 120 120" width="160" height="160">
        <circle cx="60" cy="60" :r="RADIO" fill="none" stroke="var(--border)" stroke-width="10" />
        <circle
          cx="60" cy="60" :r="RADIO" fill="none"
          :stroke="color" stroke-width="10" stroke-linecap="round"
          :stroke-dasharray="CIRC" :stroke-dashoffset="offset"
          transform="rotate(-90 60 60)" class="anillo__trazo"
        />
      </svg>
      <div class="anillo__centro">
        <span class="anillo__pct">{{ porcentaje }}%</span>
        <span class="anillo__detalle">{{ aciertos }} / {{ total }}</span>
      </div>
    </div>

    <div class="resultado__estrellas" aria-hidden="true">
      <span v-for="i in 3" :key="i" :class="{ activa: i <= estrellas }">⭐</span>
    </div>

    <p class="resultado__mensaje" :style="{ color }">{{ mensaje }}</p>

    <div class="resultado__stats">
      <StatPill icono="⭐" :valor="puntaje" etiqueta="puntos" destacado />
      <StatPill icono="✅" :valor="aciertos" etiqueta="aciertos" />
      <StatPill icono="🔥" :valor="rachaMax" etiqueta="mejor racha" />
      <StatPill icono="🏆" :valor="mejorPuntaje" etiqueta="récord" />
    </div>

    <!-- Repaso educativo -->
    <button class="resultado__toggle" @click="verRepaso = !verRepaso">
      {{ verRepaso ? '▲ Ocultar repaso' : '▼ Ver repaso de respuestas' }}
    </button>

    <Transition name="fade">
      <ul v-if="verRepaso" class="repaso">
        <li
          v-for="(r, i) in respuestas"
          :key="r.id"
          class="repaso__item tarjeta"
          :class="r.acerto ? 'ok' : 'mal'"
        >
          <div class="repaso__cab">
            <span class="repaso__marca">{{ r.acerto ? '✓' : '✕' }}</span>
            <span class="repaso__num">{{ i + 1 }}.</span>
            <span class="repaso__preg">{{ r.pregunta }}</span>
          </div>
          <p v-if="!r.acerto" class="repaso__linea">
            <span v-if="r.saltada">⏭️ Saltaste esta pregunta.</span>
            <span v-else-if="r.seAgoto">⏱️ Se agotó el tiempo.</span>
            <span v-else>Tu respuesta: <em>{{ r.elegida }}</em>.</span>
            Correcta: <strong>{{ r.correcta }}</strong>
          </p>
          <p v-if="r.explicacion" class="repaso__explica">{{ r.explicacion }}</p>
        </li>
      </ul>
    </Transition>

    <!-- Salón de la fama -->
    <section class="salon">
      <h2 class="salon__titulo">🏆 Salón de la fama</h2>

      <!-- Formulario para registrar al ganador (se oculta tras guardar) -->
      <form v-if="!guardado" class="salon__form" @submit.prevent="guardarEnSalon">
        <input
          v-model="nombre"
          class="salon__input"
          type="text"
          maxlength="24"
          placeholder="Tu nombre"
          aria-label="Tu nombre para el salón de la fama"
        />
        <button class="boton boton--primario salon__guardar" :disabled="!nombre.trim()">
          Guardar
        </button>
      </form>
      <p v-else class="salon__ok">✅ ¡Guardado, {{ nombre }}!</p>

      <!-- Lista de ganadores -->
      <ol v-if="ganadores.length" class="salon__lista">
        <li
          v-for="(g, i) in ganadores"
          :key="g.fecha + g.nombre"
          class="salon__fila"
          :class="{ 'salon__fila--top': i < 3 }"
        >
          <span class="salon__pos">{{ medalla[i] || (i + 1) }}</span>
          <span class="salon__nombre">
            {{ g.nombre }}
            <span v-if="g.retirado" class="salon__tag" title="Se retiró">🏳️</span>
          </span>
          <span class="salon__premio">{{ g.premio }}</span>
          <span class="salon__fecha">{{ fechaCorta(g.fecha) }}</span>
        </li>
      </ol>
      <p v-else class="salon__vacio">Aún no hay ganadores. ¡Sé el primero!</p>
    </section>

    <div class="resultado__acciones">
      <button class="boton boton--primario" @click="emit('revancha')">🔄 Jugar de nuevo</button>
      <button class="boton boton--secundario" @click="emit('inicio')">🏠 Menú</button>
      <button class="boton boton--secundario" @click="compartir">
        {{ copiado ? '✅ ¡Copiado!' : '📋 Compartir' }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.resultado {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding-top: 1.5rem;
  padding-bottom: 2.5rem;
}
.resultado__record {
  background: linear-gradient(135deg, var(--sol), var(--sol-claro));
  color: #3a2c00;
  font-weight: 800;
  padding: 0.5rem 1.2rem;
  border-radius: 999px;
  margin-bottom: 1rem;
  box-shadow: var(--sombra);
  animation: aparecer 0.5s ease;
}
.resultado__titulo {
  font-size: clamp(1.8rem, 6vw, 2.4rem);
  margin-bottom: 1rem;
}

/* --- Premio ganado --- */
.premio {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
  padding: 0.7rem 1.6rem;
  margin-bottom: 1.3rem;
  border-radius: var(--radio);
  background: linear-gradient(135deg, #ffd700, #f5a800);
  color: #1a1200;
  box-shadow: 0 10px 26px -10px rgba(245, 168, 0, 0.7);
  animation: aparecer 0.5s ease;
}
.premio--retiro {
  background: linear-gradient(135deg, var(--cielo), #1487b8);
  color: #fff;
  box-shadow: 0 10px 26px -10px rgba(27, 160, 215, 0.7);
}
.premio__label {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.85;
}
.premio__monto {
  font-size: 1.9rem;
  font-weight: 900;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}
.anillo {
  position: relative;
  width: 160px;
  height: 160px;
  margin-bottom: 0.8rem;
}
.anillo__trazo {
  transition: stroke-dashoffset 1s cubic-bezier(0.22, 1, 0.36, 1);
}
.anillo__centro {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.anillo__pct {
  font-size: 2.2rem;
  font-weight: 800;
  line-height: 1;
}
.anillo__detalle {
  font-size: 0.9rem;
  color: var(--text-suave);
  font-weight: 600;
}
.resultado__estrellas {
  font-size: 1.7rem;
  margin-bottom: 0.6rem;
}
.resultado__estrellas span {
  opacity: 0.25;
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.resultado__estrellas span.activa {
  opacity: 1;
  transform: scale(1.15);
}
.resultado__mensaje {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 1.3rem;
  max-width: 32ch;
}
.resultado__stats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 1.4rem;
}
.resultado__toggle {
  background: none;
  border: none;
  color: var(--cielo);
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  margin-bottom: 1rem;
  padding: 0.3rem;
}
.repaso {
  list-style: none;
  width: 100%;
  display: grid;
  gap: 0.7rem;
  margin-bottom: 1.6rem;
  text-align: left;
}
.repaso__item {
  padding: 0.9rem 1.05rem;
  border-left: 4px solid var(--border);
}
.repaso__item.ok {
  border-left-color: var(--selva);
}
.repaso__item.mal {
  border-left-color: var(--coral);
}
.repaso__cab {
  display: flex;
  gap: 0.45rem;
  align-items: baseline;
  font-weight: 700;
}
.repaso__marca {
  font-weight: 900;
}
.repaso__item.ok .repaso__marca {
  color: var(--selva);
}
.repaso__item.mal .repaso__marca {
  color: var(--coral);
}
.repaso__num {
  color: var(--text-tenue);
}
.repaso__linea {
  font-size: 0.9rem;
  color: var(--text-suave);
  margin-top: 0.4rem;
}
.repaso__linea strong {
  color: var(--selva);
}
.repaso__explica {
  font-size: 0.88rem;
  color: var(--text-suave);
  margin-top: 0.35rem;
  line-height: 1.5;
}
/* --- Salón de la fama --- */
.salon {
  width: 100%;
  max-width: 460px;
  margin-bottom: 1.6rem;
  text-align: left;
}
.salon__titulo {
  font-size: 1.1rem;
  text-align: center;
  margin-bottom: 0.9rem;
}
.salon__form {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.salon__input {
  flex: 1;
  padding: 0.7rem 1rem;
  border-radius: 999px;
  border: 1.5px solid var(--border-fuerte);
  background: var(--surface);
  color: var(--text);
  font-size: 1rem;
  font-family: inherit;
}
.salon__input:focus-visible {
  border-color: var(--cielo);
}
.salon__guardar {
  padding: 0.7rem 1.4rem;
  font-size: 0.95rem;
}
.salon__guardar:disabled {
  opacity: 0.5;
  cursor: default;
}
.salon__ok {
  text-align: center;
  font-weight: 700;
  color: var(--selva);
  margin-bottom: 1rem;
}
.salon__lista {
  list-style: none;
  display: grid;
  gap: 0.4rem;
}
.salon__fila {
  display: grid;
  grid-template-columns: 2rem 1fr auto auto;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.8rem;
  border-radius: var(--radio-sm);
  background: var(--surface-2);
  border: 1px solid var(--border);
  font-size: 0.92rem;
}
.salon__fila--top {
  background: color-mix(in srgb, var(--sol) 12%, var(--surface));
  border-color: color-mix(in srgb, var(--sol) 40%, var(--border));
}
.salon__pos {
  font-weight: 800;
  text-align: center;
  font-size: 1.05rem;
}
.salon__nombre {
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.salon__tag {
  font-size: 0.8rem;
}
.salon__premio {
  font-weight: 800;
  color: var(--acento);
  font-variant-numeric: tabular-nums;
}
.salon__fecha {
  font-size: 0.78rem;
  color: var(--text-tenue);
}
.salon__vacio {
  text-align: center;
  color: var(--text-suave);
  font-size: 0.92rem;
}

.resultado__acciones {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
  justify-content: center;
}
@keyframes aparecer {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.9);
  }
}
</style>
