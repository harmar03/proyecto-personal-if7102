<script setup>
/**
 * StatPill — Pequeña "pastilla" para mostrar una estadística (icono + valor).
 * Reutilizable: se usa en el HUD del juego y en la pantalla de resultados.
 */
defineProps({
  icono: { type: String, required: true },
  valor: { type: [String, Number], required: true },
  etiqueta: { type: String, default: '' },
  destacado: { type: Boolean, default: false },
})
</script>

<template>
  <div class="pill" :class="{ 'pill--destacado': destacado }">
    <span class="pill__icono" aria-hidden="true">{{ icono }}</span>
    <span class="pill__valor">{{ valor }}</span>
    <span v-if="etiqueta" class="pill__etiqueta">{{ etiqueta }}</span>
  </div>
</template>

<style scoped>
.pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.85rem;
  border-radius: 999px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  font-weight: 700;
  color: var(--text);
  white-space: nowrap;
}
.pill--destacado {
  background: var(--primario);
  color: var(--primario-contraste);
  border-color: transparent;
}
.pill__icono {
  font-size: 1.05rem;
}
.pill__valor {
  font-variant-numeric: tabular-nums;
}
.pill__etiqueta {
  font-size: 0.78rem;
  font-weight: 600;
  opacity: 0.8;
}
</style>
