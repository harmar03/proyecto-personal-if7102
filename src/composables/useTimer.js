/**
 * useTimer — Cuenta regresiva reutilizable.
 *
 * Actualiza cada 100 ms para que la barra de tiempo se vea fluida, pero expone
 * los segundos enteros para mostrarlos. Limpia su intervalo automáticamente
 * cuando el componente se desmonta (onUnmounted), evitando fugas de memoria.
 *
 * @param {number} segundos  Duración total de la cuenta.
 * @param {Function} alAgotarse  Callback que se ejecuta al llegar a 0.
 */
import { ref, computed, onUnmounted } from 'vue'

export function useTimer(segundos, alAgotarse) {
  const total = ref(segundos)
  const restanteMs = ref(segundos * 1000)
  const corriendo = ref(false)
  let intervalo = null
  const PASO = 100 // ms

  // Segundos enteros para mostrar (15, 14, 13...).
  const restante = computed(() => Math.ceil(restanteMs.value / 1000))
  // Fracción 0..1 para la barra visual.
  const fraccion = computed(() => restanteMs.value / (total.value * 1000))

  function detener() {
    corriendo.value = false
    if (intervalo) {
      clearInterval(intervalo)
      intervalo = null
    }
  }

  function iniciar(nuevosSegundos = total.value) {
    detener()
    total.value = nuevosSegundos
    restanteMs.value = nuevosSegundos * 1000
    corriendo.value = true
    intervalo = setInterval(() => {
      restanteMs.value -= PASO
      if (restanteMs.value <= 0) {
        restanteMs.value = 0
        detener()
        if (typeof alAgotarse === 'function') alAgotarse()
      }
    }, PASO)
  }

  // Suma segundos a la cuenta actual (habilidad "tiempo extra").
  // Si supera la duración base, amplía el total para que la barra no se desborde.
  function agregar(segundos) {
    restanteMs.value += segundos * 1000
    if (restanteMs.value > total.value * 1000) {
      total.value = restanteMs.value / 1000
    }
  }

  // Seguridad: si el componente desaparece, no dejamos el intervalo vivo.
  onUnmounted(detener)

  return {
    total,
    restante,
    restanteMs,
    fraccion,
    corriendo,
    iniciar,
    detener,
    agregar,
  }
}
