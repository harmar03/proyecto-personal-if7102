<script setup>
/**
 * QuestionCard — Tarjeta de una pregunta. Componente reutilizable.
 * Muestra una foto de la categoría (si existe en public/images/<categoria>.jpg)
 * o la ilustración SVG de CategoryArt como fallback. Estilo inspirado en
 * ¿Quién Quiere Ser Millonario?
 */
import { computed, ref } from 'vue'
import OptionButton from './OptionButton.vue'
import CategoryArt from './CategoryArt.vue'

const props = defineProps({
  pregunta: { type: Object, required: true },
  categoria: { type: Object, default: () => ({ nombre: '', emoji: '❓' }) },
  bloqueado: { type: Boolean, default: false },
  respuestaElegida: { type: Number, default: null },
  ocultas: { type: Array, default: () => [] },
})

const emit = defineEmits(['elegir'])

// Intenta cargar la foto de categoría desde public/images/<categoria>.jpg.
// Si no existe, fotoFallo se pone true y se muestra la ilustración SVG.
const fotoFallo = ref(false)

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
    <!-- Banner de imagen estilo Millonario -->
    <div class="pregunta__media">
      <img
        v-if="!fotoFallo"
        :src="`/images/${pregunta.categoria}.jpg`"
        :alt="categoria.nombre"
        class="pregunta__foto"
        @error="fotoFallo = true"
      />
      <!-- Fallback: ilustración SVG grande de la categoría -->
      <div v-else class="pregunta__svg-banner" aria-hidden="true">
        <div class="pregunta__art-wrap">
          <CategoryArt :categoria="pregunta.categoria" />
        </div>
        <div class="pregunta__svg-overlay"></div>
      </div>

      <!-- Etiqueta de categoría sobre la imagen -->
      <span class="pregunta__cat-badge">
        <span aria-hidden="true">{{ categoria.emoji }}</span>
        {{ categoria.nombre }}
      </span>
    </div>

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

/* --- Media banner (foto o SVG) --- */
.pregunta__media {
  position: relative;
  width: 100%;
  height: 170px;
  overflow: hidden;
  background: var(--surface-2);
}
.pregunta__foto {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.pregunta__svg-banner {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--selva) 35%, var(--surface-2)),
    color-mix(in srgb, var(--cielo) 25%, var(--surface-2))
  );
  position: relative;
}
/* Overlay sutil que oscurece un poco para que el badge de categoría sea legible */
.pregunta__svg-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.25) 100%);
}
.pregunta__art-wrap {
  width: 140px;
  height: 140px;
  filter: drop-shadow(0 6px 16px rgba(0,0,0,0.3));
  position: relative;
  z-index: 1;
}

/* Badge de categoría flotando sobre la imagen */
.pregunta__cat-badge {
  position: absolute;
  bottom: 0.6rem;
  left: 0.8rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #fff;
  background: rgba(0,0,0,0.52);
  backdrop-filter: blur(4px);
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
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
