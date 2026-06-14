<script setup>
/**
 * ResultScreen — Pantalla de resultados.
 * Recibe todos los datos de la partida por props (props para pasar datos a un
 * componente hijo) y emite 'revancha' o 'inicio'. Incluye un anillo de progreso
 * en SVG y un repaso educativo de las preguntas.
 */
import { ref, computed } from 'vue'
import StatPill from './StatPill.vue'

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

    <h1 class="resultado__titulo">Resultado</h1>

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
            <span v-if="r.seAgoto">⏱️ Se agotó el tiempo.</span>
            <span v-else>Tu respuesta: <em>{{ r.elegida }}</em>.</span>
            Correcta: <strong>{{ r.correcta }}</strong>
          </p>
          <p v-if="r.explicacion" class="repaso__explica">{{ r.explicacion }}</p>
        </li>
      </ul>
    </Transition>

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
