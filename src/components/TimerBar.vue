<script setup>
/**
 * TimerBar — Barra visual de la cuenta regresiva. Componente reutilizable.
 * Recibe los segundos restantes y la fracción 0..1; cambia a rojo cuando queda
 * poco tiempo. No tiene lógica de temporizador: solo presenta lo que recibe.
 */
import { computed } from 'vue'

const props = defineProps({
  restante: { type: Number, required: true }, // segundos enteros
  fraccion: { type: Number, required: true }, // 0..1
})

const urgente = computed(() => props.fraccion <= 0.34)
</script>

<template>
  <div class="timer" :class="{ 'timer--urgente': urgente }">
    <span class="timer__icono" aria-hidden="true">⏱️</span>
    <div class="timer__riel">
      <div class="timer__relleno" :style="{ width: fraccion * 100 + '%' }"></div>
    </div>
    <span class="timer__num">{{ restante }}s</span>
  </div>
</template>

<style scoped>
.timer {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.timer__icono {
  font-size: 1.1rem;
}
.timer__riel {
  flex: 1;
  height: 10px;
  border-radius: 999px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  overflow: hidden;
}
.timer__relleno {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--selva-claro), var(--sol));
  transition: width 0.1s linear, background 0.3s ease;
}
.timer__num {
  font-variant-numeric: tabular-nums;
  font-weight: 800;
  min-width: 2.6ch;
  text-align: right;
  color: var(--text-suave);
}
.timer--urgente .timer__relleno {
  background: linear-gradient(90deg, var(--coral-suave), var(--coral));
}
.timer--urgente .timer__num {
  color: var(--coral);
  animation: latido 0.6s ease-in-out infinite;
}
@keyframes latido {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.18);
  }
}
</style>
