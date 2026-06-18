/**
 * useAudio — Efectos de sonido del quiz.
 *
 * Los 3 clips obligatorios (acierto, error, resultado) se GENERAN en vivo con la
 * Web Audio API mediante osciladores. Es decir: son de PRODUCCIÓN PROPIA, no se
 * descargó ningún archivo. Ventajas para el proyecto:
 *   - No dependen de binarios .mp3 (el repo pesa menos y nunca "falta" un sonido).
 *   - Funcionan sin conexión y se sintetizan en el momento.
 *
 * Si en public/audio/ existen archivos reales (acierto.mp3, error.mp3,
 * resultado.mp3) se usan ESOS y la síntesis queda como respaldo. Así el código
 * sirve para ambas estrategias sin cambiar nada.
 *
 * Documentado en REFERENCIAS.md como medio de producción propia.
 */
import { ref } from 'vue'

export function useAudio() {
  const silenciado = ref(false)
  let ctx = null

  // El AudioContext debe crearse tras una interacción del usuario (política de
  // autoplay de los navegadores). Lo creamos de forma perezosa.
  function getCtx() {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (AudioCtx) ctx = new AudioCtx()
    }
    if (ctx && ctx.state === 'suspended') ctx.resume()
    return ctx
  }

  /**
   * Reproduce una secuencia de tonos (síntesis propia).
   * @param {Array<{f:number, t:number, d:number, tipo?:OscillatorType}>} notas
   */
  function tocarSecuencia(notas) {
    const audio = getCtx()
    if (!audio) return
    const master = audio.createGain()
    master.gain.value = 0.18
    master.connect(audio.destination)

    notas.forEach(({ f, t, d, tipo = 'sine' }) => {
      const osc = audio.createOscillator()
      const gain = audio.createGain()
      osc.type = tipo
      osc.frequency.value = f

      const inicio = audio.currentTime + t
      const fin = inicio + d
      // Envolvente suave para evitar "clicks".
      gain.gain.setValueAtTime(0, inicio)
      gain.gain.linearRampToValueAtTime(1, inicio + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, fin)

      osc.connect(gain).connect(master)
      osc.start(inicio)
      osc.stop(fin + 0.02)
    })
  }

  // --- Definición de cada efecto (notas en Hz) ---
  const efectos = {
    // Arpegio ascendente alegre.
    acierto: [
      { f: 659.25, t: 0, d: 0.12, tipo: 'triangle' }, // Mi
      { f: 783.99, t: 0.1, d: 0.12, tipo: 'triangle' }, // Sol
      { f: 1046.5, t: 0.2, d: 0.2, tipo: 'triangle' }, // Do agudo
    ],
    // Dos tonos graves descendentes.
    error: [
      { f: 196, t: 0, d: 0.18, tipo: 'sawtooth' }, // Sol grave
      { f: 146.83, t: 0.14, d: 0.28, tipo: 'sawtooth' }, // Re grave
    ],
    // Fanfarria final.
    resultado: [
      { f: 523.25, t: 0, d: 0.14, tipo: 'square' },
      { f: 659.25, t: 0.14, d: 0.14, tipo: 'square' },
      { f: 783.99, t: 0.28, d: 0.14, tipo: 'square' },
      { f: 1046.5, t: 0.42, d: 0.34, tipo: 'square' },
    ],
  }

  // Caché de elementos <audio> si el usuario provee archivos reales.
  const archivos = {
    acierto: '/audio/acierto.mp3',
    error: '/audio/error.mp3',
    resultado: '/audio/resultado.mp3',
  }
  const cacheArchivo = {}
  const archivoDisponible = {}

  // Clips de un solo disparo (archivo .mp3). Tienen prioridad sobre la síntesis.
  //  - acierto: sonido de respuesta correcta.
  //  - error:   sonido de respuesta incorrecta.
  //  - entrada: jingle corto al aparecer cada pregunta.
  //  - retiro:  suena cuando el jugador se retira llevándose el premio.
  const CLIPS = {
    acierto: { ruta: '/audio/acierto.mp3', vol: 0.8 },
    error: { ruta: '/audio/error.mp3', vol: 0.8 },
    entrada: { ruta: '/audio/entrada.mp3', vol: 0.7 },
    retiro: { ruta: '/audio/retiro.mp3', vol: 0.85 },
  }
  const cacheClip = {}
  let entradaEl = null // jingle de entrada en curso (para poder cortarlo)

  function reproducirClip(tipo) {
    const cfg = CLIPS[tipo]
    if (!cfg) return
    try {
      let base = cacheClip[tipo]
      if (!base) {
        base = new Audio(cfg.ruta)
        base.preload = 'auto'
        cacheClip[tipo] = base
      }
      // Clonamos para permitir solapamientos sin cortar la reproducción previa.
      const el = base.cloneNode()
      el.volume = cfg.vol
      // El jingle de entrada se rastrea para cortarlo al cambiar de pregunta.
      if (tipo === 'entrada') {
        if (entradaEl) {
          try {
            entradaEl.pause()
            entradaEl.currentTime = 0
          } catch {
            /* noop */
          }
        }
        entradaEl = el
      }
      const p = el.play()
      if (p && p.catch) p.catch(() => {})
    } catch {
      /* sin sonido si el navegador lo bloquea */
    }
  }

  function intentarArchivo(tipo) {
    // Devuelve true si logró reproducir un archivo real existente.
    if (archivoDisponible[tipo] === false) return false
    try {
      let el = cacheArchivo[tipo]
      if (!el) {
        el = new Audio(archivos[tipo])
        el.preload = 'auto'
        cacheArchivo[tipo] = el
      }
      const p = el.cloneNode().play()
      if (p && p.then) {
        p.then(() => {
          archivoDisponible[tipo] = true
        }).catch(() => {
          archivoDisponible[tipo] = false
        })
      }
      // No sabemos aún si existe; devolvemos false para que la síntesis suene
      // la primera vez. Tras detectar que existe, se priorizará el archivo.
      return archivoDisponible[tipo] === true
    } catch {
      archivoDisponible[tipo] = false
      return false
    }
  }

  /** Reproduce un efecto por nombre: 'acierto'|'error'|'resultado'|'entrada'|'retiro'. */
  function reproducir(tipo) {
    if (silenciado.value) return
    // Clips de archivo (entrada / retiro).
    if (CLIPS[tipo]) {
      reproducirClip(tipo)
      return
    }
    if (!efectos[tipo]) return
    // Si ya confirmamos que existe un archivo real, lo usamos; si no, síntesis.
    if (!intentarArchivo(tipo)) {
      tocarSecuencia(efectos[tipo])
    }
  }

  function alternarSilencio() {
    silenciado.value = !silenciado.value
    if (silenciado.value) pararMusica()
    return silenciado.value
  }

  // --- Música al entrar a una pregunta (estilo ¿Quién Quiere Ser Millonario?) ---
  // Reproduce UNA sola vez el clip public/audio/nueva-pregunta.mp3 al aparecer
  // cada pregunta. NO se repite en bucle: suena solo al entrar y se detiene
  // cuando el jugador responde. Si el archivo falla, cae en un arpegio
  // sintetizado corto de respaldo (Web Audio API), también de un solo disparo.
  let musicaEl = null // elemento <audio> del mp3
  const RUTA_MUSICA = '/audio/nueva-pregunta.mp3'

  function iniciarSintetizada() {
    // Respaldo: breve arpegio de tensión que suena una vez (no en bucle).
    const a = getCtx()
    if (!a) return
    const notas = [146.83, 220, 174.61, 220, 130.81, 196]
    notas.forEach((f, i) => {
      const osc = a.createOscillator()
      const g = a.createGain()
      osc.type = 'sine'
      osc.frequency.value = f
      const t = a.currentTime + i * 0.18
      g.gain.setValueAtTime(0.09, t)
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.4)
      osc.connect(g)
      g.connect(a.destination)
      osc.start(t)
      osc.stop(t + 0.45)
    })
  }

  function iniciarMusica(tipo) {
    pararMusica()
    if (tipo !== 'tension' || silenciado.value) return

    // Reproduce el clip una sola vez (sin bucle).
    try {
      if (!musicaEl) {
        musicaEl = new Audio(RUTA_MUSICA)
        musicaEl.loop = false // <-- clave: suena UNA vez al entrar
        musicaEl.volume = 0.5
        musicaEl.preload = 'auto'
      }
      musicaEl.currentTime = 0
      const p = musicaEl.play()
      if (p && p.catch) {
        // Si el navegador bloquea o el archivo no existe, usa el respaldo.
        p.catch(() => iniciarSintetizada())
      }
    } catch {
      iniciarSintetizada()
    }
  }

  function pararMusica() {
    if (musicaEl) {
      musicaEl.pause()
      musicaEl.currentTime = 0
    }
  }

  return { reproducir, silenciado, alternarSilencio, iniciarMusica, pararMusica }
}
