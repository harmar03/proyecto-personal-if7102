<script setup>
/**
 * QuestionCard — Tarjeta de una pregunta. Componente reutilizable.
 * Muestra una foto de la categoría (si existe en public/images/<categoria>.jpg)
 * o la ilustración SVG de CategoryArt como fallback. Estilo inspirado en
 * ¿Quién Quiere Ser Millonario?
 */
import { computed } from 'vue'
import OptionButton from './OptionButton.vue'

const props = defineProps({
  pregunta: { type: Object, required: true },
  categoria: { type: Object, default: () => ({ nombre: '', emoji: '❓' }) },
  bloqueado: { type: Boolean, default: false },
  respuestaElegida: { type: Number, default: null },
  ocultas: { type: Array, default: () => [] },
})

const emit = defineEmits(['elegir'])


// Estado visual de cada opción según si ya se respondió.
function estadoOpcion(i, texto) {
  if (props.ocultas.includes(i)) return 'oculta'
  if (!props.bloqueado) return 'idle'
  if (texto === props.pregunta.correcta) return 'correcta'
  if (i === props.respuestaElegida) return 'incorrecta'
  return 'inactiva'
}

const acerto = computed(
  () =>
    props.bloqueado &&
    props.respuestaElegida !== null &&
    props.pregunta.opciones[props.respuestaElegida] === props.pregunta.correcta
)
</script>

<template>
  <article class="pregunta tarjeta">
    <!-- Cuerpo: pregunta y opciones -->
    <div class="pregunta__cuerpo">
      <h2 class="pregunta__texto">{{ pregunta.pregunta }}</h2>

      <div class="pregunta__opciones">
        <OptionButton
          v-for="(opcion, i) in pregunta.opciones"
          :key="opcion"
          :texto="opcion"
          :indice="i"
          :atajo="i + 1"
          :estado="estadoOpcion(i, opcion)"
          :bloqueado="bloqueado"
          @elegir="emit('elegir', $event)"
        />
      </div>

      <Transition name="explica">
        <div
          v-if="bloqueado && pregunta.explicacion"
          class="pregunta__explica"
          :class="acerto ? 'es-ok' : 'es-mal'"
        >
          <strong>{{ acerto ? '¡Correcto! ' : 'Respuesta: ' }}</strong>
          <span v-if="!acerto" class="pregunta__correcta">{{ pregunta.correcta }}. </span>
          {{ pregunta.explicacion }}
        </div>
      </Transition>
    </div>
  </article>
</template>

<style scoped>
.pregunta {
  overflow: hidden;
  padding: 0;
}

/* --- Cuerpo de la tarjeta --- */
.pregunta__cuerpo {
  padding: 1.4rem 1.6rem 1.6rem;
}
.pregunta__texto {
  font-size: 1.25rem;
  line-height: 1.35;
  margin-bottom: 1.3rem;
}
@media (min-width: 560px) {
  .pregunta__texto {
    font-size: 1.4rem;
  }
}
.pregunta__opciones {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.7rem;
}
@media (min-width: 560px) {
  .pregunta__opciones {
    grid-template-columns: 1fr 1fr;
  }
}

.pregunta__explica {
  margin-top: 1.2rem;
  padding: 0.9rem 1.05rem;
  border-radius: var(--radio-sm);
  font-size: 0.95rem;
  line-height: 1.5;
  border: 1px solid var(--border);
  background: var(--surface-2);
}
.pregunta__explica.es-ok {
  border-color: color-mix(in srgb, var(--selva) 45%, var(--border));
}
.pregunta__explica.es-mal {
  border-color: color-mix(in srgb, var(--coral) 40%, var(--border));
}
.pregunta__correcta {
  color: var(--selva);
  font-weight: 700;
}

.explica-enter-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.explica-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
</style>
