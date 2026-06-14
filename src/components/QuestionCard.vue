<script setup>
/**
 * QuestionCard — Tarjeta de una pregunta. Componente reutilizable.
 * Recibe la pregunta y el estado de respuesta por props, calcula el estado
 * visual de cada opción y reemite el evento 'elegir' del OptionButton hacia
 * GameScreen. Tras responder, muestra una explicación educativa.
 */
import { computed } from 'vue'
import OptionButton from './OptionButton.vue'

const props = defineProps({
  pregunta: { type: Object, required: true },
  categoria: { type: Object, default: () => ({ nombre: '', emoji: '❓' }) },
  bloqueado: { type: Boolean, default: false },
  respuestaElegida: { type: Number, default: null },
})

const emit = defineEmits(['elegir'])

// Estado visual de cada opción según si ya se respondió.
function estadoOpcion(i, texto) {
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
    <header class="pregunta__top">
      <span class="pregunta__cat">
        <span aria-hidden="true">{{ categoria.emoji }}</span> {{ categoria.nombre }}
      </span>
      <span class="pregunta__ilustracion" aria-hidden="true">{{ pregunta.emoji }}</span>
    </header>

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
  </article>
</template>

<style scoped>
.pregunta {
  padding: 1.6rem;
  text-align: left;
}
.pregunta__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}
.pregunta__cat {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-suave);
  background: var(--surface-2);
  border: 1px solid var(--border);
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
}
.pregunta__ilustracion {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  font-size: 1.9rem;
  border-radius: 50%;
  background: var(--surface-2);
  border: 1px solid var(--border);
}
.pregunta__texto {
  font-size: 1.3rem;
  line-height: 1.35;
  margin-bottom: 1.3rem;
}
@media (min-width: 560px) {
  .pregunta__texto {
    font-size: 1.45rem;
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
