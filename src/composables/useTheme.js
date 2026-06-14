/**
 * useTheme — Modo claro / oscuro.
 *
 * Aplica el atributo data-theme en <html> y lo guarda en localStorage para que
 * la preferencia persista entre visitas. Si no hay preferencia guardada, respeta
 * la del sistema operativo (prefers-color-scheme).
 *
 * Demuestra: estado reactivo (ref), watch para efectos secundarios y
 * persistencia con la Web Storage API.
 */
import { ref, watch } from 'vue'

const CLAVE = 'puravida-quiz-tema'

function temaInicial() {
  const guardado = localStorage.getItem(CLAVE)
  if (guardado === 'light' || guardado === 'dark') return guardado
  const prefiereOscuro =
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  return prefiereOscuro ? 'dark' : 'light'
}

export function useTheme() {
  const tema = ref(temaInicial())

  function aplicar(valor) {
    document.documentElement.setAttribute('data-theme', valor)
  }

  // Aplica de inmediato y ante cualquier cambio.
  aplicar(tema.value)
  watch(tema, (valor) => {
    aplicar(valor)
    localStorage.setItem(CLAVE, valor)
  })

  function alternar() {
    tema.value = tema.value === 'dark' ? 'light' : 'dark'
  }

  return { tema, alternar }
}
