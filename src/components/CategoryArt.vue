<script setup>
/**
 * CategoryArt — Ilustración SVG por categoría (producción propia).
 * Cada categoría tiene un dibujo simple hecho con formas SVG que usan las
 * variables de color del tema, por lo que se adaptan a claro/oscuro.
 * Reutilizable: recibe el id de categoría por prop.
 */
defineProps({
  categoria: { type: String, default: '' },
})
</script>

<template>
  <svg class="art" viewBox="0 0 64 64" role="img" aria-hidden="true">
    <!-- Naturaleza: árbol y sol -->
    <g v-if="categoria === 'naturaleza'">
      <circle cx="47" cy="17" r="7" fill="var(--sol)" />
      <rect x="29" y="36" width="6" height="20" rx="2" fill="#7a5230" />
      <circle cx="24" cy="33" r="11" fill="var(--selva)" />
      <circle cx="40" cy="31" r="12" fill="var(--selva-claro)" />
      <circle cx="32" cy="23" r="11" fill="var(--selva)" />
    </g>

    <!-- Geografía: volcán -->
    <g v-else-if="categoria === 'geografia'">
      <circle cx="48" cy="16" r="6" fill="var(--sol)" />
      <rect x="8" y="48" width="48" height="9" rx="4" fill="var(--selva-claro)" />
      <path d="M14 50 L30 22 L46 50 Z" fill="var(--selva)" />
      <path d="M24 33 L30 22 L36 33 L32 39 L30 34 L28 39 Z" fill="var(--coral)" />
    </g>

    <!-- Cultura: rueda de carreta típica -->
    <g v-else-if="categoria === 'cultura'">
      <g stroke="var(--cielo)" stroke-width="3">
        <line x1="32" y1="13" x2="32" y2="51" />
        <line x1="13" y1="32" x2="51" y2="32" />
        <line x1="18" y1="18" x2="46" y2="46" />
        <line x1="46" y1="18" x2="18" y2="46" />
      </g>
      <circle cx="32" cy="32" r="20" fill="none" stroke="var(--coral)" stroke-width="4" />
      <circle cx="32" cy="32" r="6" fill="var(--sol)" />
    </g>

    <!-- Historia: antorcha -->
    <g v-else-if="categoria === 'historia'">
      <rect x="29" y="30" width="6" height="25" rx="2" fill="#7a5230" />
      <ellipse cx="32" cy="29" rx="9" ry="4" fill="var(--sol)" />
      <path d="M32 7 C25 16 28 23 32 26 C36 23 39 16 32 7 Z" fill="var(--coral)" />
      <path d="M32 14 C29 19 30 23 32 25 C34 23 35 19 32 14 Z" fill="var(--sol)" />
    </g>

    <!-- Gastronomía: plato típico -->
    <g v-else-if="categoria === 'gastronomia'">
      <circle cx="32" cy="32" r="21" fill="#f1ece0" stroke="#d8cdb6" stroke-width="2" />
      <circle cx="32" cy="32" r="14" fill="none" stroke="#d8cdb6" stroke-width="1.5" />
      <circle cx="26" cy="29" r="6" fill="var(--sol)" />
      <circle cx="39" cy="28" r="6" fill="#7a5230" />
      <circle cx="29" cy="39" r="6" fill="var(--selva)" />
      <circle cx="40" cy="38" r="5" fill="var(--coral)" />
    </g>

    <!-- Símbolos: bandera de Costa Rica -->
    <g v-else-if="categoria === 'simbolos'">
      <rect x="14" y="9" width="3" height="46" rx="1.5" fill="var(--text-tenue)" />
      <g transform="translate(17 12)">
        <rect width="34" height="6" y="0" fill="var(--cielo)" />
        <rect width="34" height="4" y="6" fill="#ffffff" />
        <rect width="34" height="8" y="10" fill="var(--coral)" />
        <rect width="34" height="4" y="18" fill="#ffffff" />
        <rect width="34" height="6" y="22" fill="var(--cielo)" />
      </g>
    </g>

    <!-- Por defecto: signo de pregunta -->
    <g v-else>
      <circle cx="32" cy="32" r="20" fill="var(--surface-2)" />
      <text x="32" y="42" text-anchor="middle" font-size="28" font-weight="800" fill="var(--cielo)">?</text>
    </g>
  </svg>
</template>

<style scoped>
.art {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
