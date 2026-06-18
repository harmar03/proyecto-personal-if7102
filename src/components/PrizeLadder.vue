<script setup>
import { computed } from 'vue'

const props = defineProps({
  premios: { type: Array, required: true },
  nivel:   { type: Number, default: 0 },
})

// Invertimos para mostrar el premio más alto arriba (como en el programa).
const invertidos = computed(() => [...props.premios].reverse())

// Número de nivel legible (1-based) a partir del índice invertido.
function numReal(i) {
  return props.premios.length - i
}
function esActual(i) {
  return props.premios.length - 1 - i === props.nivel
}
function esPasado(i) {
  return props.premios.length - 1 - i < props.nivel
}
</script>

<template>
  <aside class="escalera" aria-label="Escalera de premios">
    <p class="escalera__titulo">💰 Premio</p>
    <ul class="escalera__lista" role="list">
      <li
        v-for="(p, i) in invertidos"
        :key="i"
        class="escalera__nivel"
        :class="{
          'escalera__nivel--actual':      esActual(i),
          'escalera__nivel--pasado':      esPasado(i),
          'escalera__nivel--garantizado': p.garantizado,
        }"
        :aria-current="esActual(i) ? 'step' : null"
      >
        <span class="escalera__n">{{ numReal(i) }}</span>
        <span class="escalera__monto">{{ p.formato }}</span>
        <span v-if="p.garantizado" class="escalera__gema" aria-label="nivel garantizado">♦</span>
      </li>
    </ul>
  </aside>
</template>

<style scoped>
.escalera {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radio);
  box-shadow: var(--sombra);
  overflow: hidden;
  position: sticky;
  top: 72px; /* debajo del header fijo */
}
.escalera__titulo {
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text-suave);
  padding: 0.6rem 0.85rem;
  border-bottom: 1px solid var(--border);
}
.escalera__lista {
  list-style: none;
}
.escalera__nivel {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.85rem;
  font-size: 0.77rem;
  font-weight: 600;
  color: var(--text-suave);
  transition: background 0.25s, color 0.25s;
}
.escalera__n {
  font-size: 0.62rem;
  min-width: 14px;
  text-align: right;
  opacity: 0.5;
}
.escalera__monto {
  flex: 1;
  font-variant-numeric: tabular-nums;
}
.escalera__gema {
  font-size: 0.68rem;
  color: var(--sol);
}

/* Nivel garantizado: borde dorado sutil */
.escalera__nivel--garantizado {
  border-left: 3px solid var(--sol);
  background: color-mix(in srgb, var(--sol) 7%, transparent);
  color: var(--text);
  font-weight: 700;
}

/* Nivel actual: resaltado en dorado */
.escalera__nivel--actual {
  background: var(--sol) !important;
  color: #1a1200 !important;
  font-weight: 800;
  font-size: 0.83rem;
}
.escalera__nivel--actual .escalera__n {
  opacity: 1;
}
.escalera__nivel--actual .escalera__gema {
  color: #1a1200;
}

/* Niveles ya superados: atenuados */
.escalera__nivel--pasado {
  opacity: 0.38;
}
</style>
