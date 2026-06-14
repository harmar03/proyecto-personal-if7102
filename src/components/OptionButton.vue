<script setup>
/**
 * OptionButton — Una opción de respuesta. Componente reutilizable.
 * Recibe el texto, su número de atajo y el estado visual por props, y emite
 * 'elegir' con su índice cuando se hace clic (eventos hacia el padre).
 *
 * estado: 'idle' | 'correcta' | 'incorrecta' | 'inactiva'
 */
defineProps({
  texto: { type: String, required: true },
  indice: { type: Number, required: true },
  atajo: { type: Number, required: true }, // tecla 1..4
  estado: { type: String, default: 'idle' },
  bloqueado: { type: Boolean, default: false },
})

const emit = defineEmits(['elegir'])
</script>

<template>
  <button
    class="opcion"
    :class="`opcion--${estado}`"
    :disabled="bloqueado || estado === 'oculta'"
    @click="emit('elegir', indice)"
  >
    <span class="opcion__atajo" aria-hidden="true">{{ atajo }}</span>
    <span class="opcion__texto">{{ texto }}</span>
    <span class="opcion__marca" aria-hidden="true">
      <template v-if="estado === 'correcta'">✓</template>
      <template v-else-if="estado === 'incorrecta'">✕</template>
    </span>
  </button>
</template>

<style scoped>
.opcion {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  width: 100%;
  text-align: left;
  padding: 0.95rem 1.05rem;
  border-radius: var(--radio-sm);
  border: 1.5px solid var(--border-fuerte);
  background: var(--surface);
  color: var(--text);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.12s ease, border-color 0.2s ease, background 0.2s ease,
    box-shadow 0.2s ease;
}
.opcion:not(:disabled):hover {
  transform: translateY(-2px);
  border-color: var(--cielo);
  box-shadow: var(--sombra);
}
.opcion:disabled {
  cursor: default;
}

.opcion__atajo {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--text-suave);
}
.opcion__texto {
  flex: 1;
}
.opcion__marca {
  font-weight: 900;
  font-size: 1.15rem;
}

/* --- Estados tras responder --- */
.opcion--correcta {
  border-color: var(--selva);
  background: color-mix(in srgb, var(--selva) 16%, var(--surface));
  color: var(--text);
  animation: pop 0.4s ease;
}
.opcion--incorrecta {
  animation: shake 0.4s ease;
}
@keyframes pop {
  0% {
    transform: scale(1);
  }
  45% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}
@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-6px);
  }
  40% {
    transform: translateX(6px);
  }
  60% {
    transform: translateX(-4px);
  }
  80% {
    transform: translateX(4px);
  }
}
.opcion--correcta .opcion__atajo {
  background: var(--selva);
  color: #fff;
  border-color: transparent;
}
.opcion--correcta .opcion__marca {
  color: var(--selva);
}
.opcion--incorrecta {
  border-color: var(--coral);
  background: color-mix(in srgb, var(--coral) 14%, var(--surface));
}
.opcion--incorrecta .opcion__atajo {
  background: var(--coral);
  color: #fff;
  border-color: transparent;
}
.opcion--incorrecta .opcion__marca {
  color: var(--coral);
}
.opcion--inactiva {
  opacity: 0.5;
}
.opcion--oculta {
  opacity: 0.3;
  text-decoration: line-through;
  filter: grayscale(1);
}
</style>
