<script setup>
/**
 * ProgressBar — Barra de avance del quiz. Componente reutilizable.
 * Recibe por props la pregunta actual y el total; calcula el porcentaje.
 */
import { computed } from 'vue'

const props = defineProps({
  actual: { type: Number, required: true }, // pregunta actual (1..total)
  total: { type: Number, required: true },
})

const porcentaje = computed(() =>
  props.total ? Math.round((props.actual / props.total) * 100) : 0
)
</script>

<template>
  <div class="progreso" role="progressbar" :aria-valuenow="actual" aria-valuemin="0" :aria-valuemax="total">
    <div class="progreso__cabecera">
      <span>Pregunta {{ actual }} de {{ total }}</span>
      <span class="progreso__pct">{{ porcentaje }}%</span>
    </div>
    <div class="progreso__riel">
      <div class="progreso__relleno" :style="{ width: porcentaje + '%' }"></div>
    </div>
  </div>
</template>

<style scoped>
.progreso {
  width: 100%;
}
.progreso__cabecera {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-suave);
  margin-bottom: 0.45rem;
}
.progreso__pct {
  color: var(--primario);
}
.progreso__riel {
  height: 8px;
  border-radius: 999px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  overflow: hidden;
}
.progreso__relleno {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--selva-claro), var(--cielo));
  transition: width 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
</style>
