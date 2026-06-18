<script setup>
/**
 * StartScreen — Pantalla de inicio.
 * Muestra el récord, el banco de preguntas por categoría (solo informativo) y
 * arranca un juego general de 15 preguntas. Emite 'iniciar' (sin categoría: el
 * juego siempre es general) o 'reintentar' si la carga del JSON falló.
 */
import { computed } from 'vue'
import StatPill from './StatPill.vue'

const props = defineProps({
  categorias: { type: Array, default: () => [] },
  mejorPuntaje: { type: Number, default: 0 },
  estado: { type: String, default: 'cargando' },
})

const emit = defineEmits(['iniciar', 'reintentar'])

// Solo las categorías reales (sin el comodín "Todas"), para mostrar cuántas
// preguntas hay de cada tema.
const categoriasInfo = computed(() =>
  props.categorias.filter((c) => c.id !== 'todas')
)
</script>

<template>
  <section class="inicio contenedor">
    <!-- Ilustración SVG de producción propia: paisaje de Costa Rica -->
    <svg class="hero" viewBox="0 0 320 170" role="img"
         aria-label="Ilustración de un volcán, palmeras y un tucán en Costa Rica">
      <defs>
        <linearGradient id="cielo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="var(--cielo)" stop-opacity="0.35" />
          <stop offset="1" stop-color="var(--cielo)" stop-opacity="0.05" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="320" height="170" rx="16" fill="url(#cielo)" />
      <circle cx="232" cy="48" r="26" fill="var(--sol)" />
      <!-- montañas de fondo -->
      <path d="M0 120 L70 70 L120 110 L160 78 L210 120 Z" fill="var(--selva)" opacity="0.45" />
      <!-- volcán -->
      <path d="M96 130 L150 56 L204 130 Z" fill="var(--selva)" />
      <path d="M138 72 L150 56 L162 72 L156 80 L150 74 L144 80 Z" fill="var(--coral)" opacity="0.85" />
      <!-- suelo -->
      <rect x="0" y="128" width="320" height="42" fill="var(--selva-claro)" opacity="0.8" />
      <!-- palmera -->
      <path d="M44 130 q3 -30 -1 -48" stroke="#7a5230" stroke-width="4" fill="none" stroke-linecap="round" />
      <g fill="var(--selva)">
        <path d="M43 82 q-26 -6 -34 6 q22 -2 34 2 Z" />
        <path d="M45 82 q26 -6 34 6 q-22 -2 -34 2 Z" />
        <path d="M44 80 q-8 -22 -22 -26 q12 12 18 28 Z" />
        <path d="M45 80 q8 -22 22 -26 q-12 12 -18 28 Z" />
      </g>
      <!-- tucán -->
      <g transform="translate(250 96)">
        <ellipse cx="0" cy="0" rx="13" ry="10" fill="#1f2a26" />
        <circle cx="8" cy="-4" r="3" fill="#fff" />
        <circle cx="8.6" cy="-4" r="1.5" fill="#1f2a26" />
        <path d="M10 -4 q22 -2 26 6 q-16 4 -26 1 Z" fill="var(--sol)" />
        <path d="M10 -1 q20 1 24 6 q-14 2 -24 0 Z" fill="var(--coral)" opacity="0.85" />
      </g>
    </svg>

    <h1 class="inicio__titulo">Quiz <span>Costa Rica</span></h1>
    <p class="inicio__sub">¿Cuánto sabés de Costa Rica? Poné a prueba tus conocimientos.</p>

    <!-- Galería decorativa de fotos de Costa Rica -->
    <div class="inicio__galeria" aria-hidden="true">
      <img src="/images/geografia.jpg"    alt="" class="galeria__foto" />
      <img src="/images/naturaleza.jpg"   alt="" class="galeria__foto" />
      <img src="/images/cultura.jpg"      alt="" class="galeria__foto" />
      <img src="/images/gastronomia.jpg"  alt="" class="galeria__foto" />
      <img src="/images/simbolos.jpg"     alt="" class="galeria__foto" />
    </div>

    <!-- Estado: cargando -->
    <p v-if="estado === 'cargando'" class="inicio__cargando">Cargando preguntas…</p>

    <!-- Estado: error -->
    <div v-else-if="estado === 'error'" class="inicio__error tarjeta">
      <p>😕 No se pudieron cargar las preguntas.</p>
      <button class="boton boton--secundario" @click="emit('reintentar')">Reintentar</button>
    </div>

    <!-- Estado: listo -->
    <template v-else>
      <StatPill
        v-if="mejorPuntaje > 0"
        class="inicio__record"
        icono="🏆"
        :valor="mejorPuntaje"
        etiqueta="mejor puntaje"
        destacado
      />

      <div class="inicio__categorias">
        <p class="inicio__label">Banco de preguntas</p>
        <div class="chips">
          <span
            v-for="cat in categoriasInfo"
            :key="cat.id"
            class="chip chip--info"
          >
            <span aria-hidden="true">{{ cat.emoji }}</span>
            {{ cat.nombre }}
            <span class="chip__n">{{ cat.cantidad }}</span>
          </span>
        </div>
      </div>

      <ul class="inicio__reglas">
        <li>🎬 <strong>15 preguntas</strong> al azar — cada partida es distinta</li>
        <li>💰 Subí la escalera: cada acierto vale más (hasta <strong>₡100.000.000</strong>)</li>
        <li>⏱️ <strong>15 s</strong> por pregunta + bonus por rapidez</li>
        <li>🏳️ Podés <strong>retirarte</strong> y llevarte el premio asegurado</li>
        <li>🎯 5 poderes: <strong>50:50</strong>, <strong>2x</strong>, <strong>+5 s</strong>, <strong>congelar</strong> y <strong>saltar</strong></li>
        <li>⌨️ Usá las teclas <kbd>1</kbd>–<kbd>4</kbd> o el mouse</li>
      </ul>

      <button class="boton boton--primario inicio__jugar" @click="emit('iniciar')">
        ¡Comenzar! ▶
      </button>
    </template>
  </section>
</template>

<style scoped>
.inicio {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding-top: 1rem;
  padding-bottom: 2rem;
}
.hero {
  width: min(100%, 360px);
  height: auto;
  filter: drop-shadow(var(--sombra));
  margin-bottom: 0.5rem;
}
.inicio__titulo {
  font-size: clamp(2.2rem, 7vw, 3rem);
  margin-bottom: 0.3rem;
}
.inicio__titulo span {
  color: var(--primario);
}
.inicio__sub {
  color: var(--text-suave);
  max-width: 38ch;
  margin-bottom: 1.4rem;
}
.inicio__cargando {
  color: var(--text-suave);
  padding: 2rem;
}
.inicio__error {
  padding: 1.5rem;
  display: grid;
  gap: 1rem;
  place-items: center;
}
.inicio__record {
  margin-bottom: 1.3rem;
}
.inicio__categorias {
  width: 100%;
  margin-bottom: 1.3rem;
}
.inicio__label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-suave);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.6rem;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}
.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.9rem;
  border-radius: 999px;
  border: 1.5px solid var(--border-fuerte);
  background: var(--surface);
  color: var(--text);
  font-weight: 700;
  font-size: 0.92rem;
  cursor: pointer;
  transition: transform 0.12s ease, border-color 0.2s ease, background 0.2s ease;
}
.chip:hover {
  transform: translateY(-2px);
  border-color: var(--cielo);
}
.chip--activo {
  background: var(--primario);
  color: var(--primario-contraste);
  border-color: transparent;
}
.chip__n {
  font-size: 0.75rem;
  opacity: 0.7;
  font-variant-numeric: tabular-nums;
}
.inicio__reglas {
  list-style: none;
  display: grid;
  gap: 0.5rem;
  width: 100%;
  max-width: 360px;
  margin-bottom: 1.6rem;
}
.inicio__reglas li {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radio-sm);
  padding: 0.6rem 0.9rem;
  font-size: 0.92rem;
  text-align: left;
}
kbd {
  font-family: var(--mono);
  font-size: 0.8rem;
  background: var(--surface-2);
  border: 1px solid var(--border-fuerte);
  border-bottom-width: 2px;
  border-radius: 5px;
  padding: 1px 6px;
}
.inicio__jugar {
  font-size: 1.1rem;
  padding: 1rem 2.4rem;
}

/* Galería decorativa de fotos */
.inicio__galeria {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 4px;
  width: 100%;
  max-width: 560px;
  height: 130px;
  border-radius: var(--radio);
  overflow: hidden;
  margin-bottom: 1.5rem;
  box-shadow: var(--sombra);
}
.galeria__foto {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.35s ease;
}
.galeria__foto:hover {
  transform: scale(1.1);
}
</style>
