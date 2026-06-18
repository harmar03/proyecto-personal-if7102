/**
 * useQuiz — Lógica central del juego (la "máquina de estados" del quiz).
 *
 * Responsabilidades:
 *   - Cargar las preguntas desde el JSON con fetch() (requisito del proyecto).
 *   - Derivar las categorías disponibles con sus contadores (computed).
 *   - Armar una partida: filtrar por categoría y BARAJAR preguntas y opciones.
 *   - Llevar el marcador: aciertos, errores, racha y puntos con bonus de tiempo.
 *   - Registrar cada respuesta para el repaso final.
 *   - Guardar el mejor puntaje en localStorage.
 *
 * Demuestra de Vue: ref, computed, manejo asíncrono en composables y separación
 * de la lógica fuera de los componentes (patrón Composition API).
 */
import { ref, computed } from 'vue'

const CLAVE_RECORD = 'puravida-quiz-record'
const CLAVE_GANADORES = 'puravida-quiz-ganadores'
const SEGUNDOS_POR_PREGUNTA = 15

// Escala de premios estilo ¿Quién Quiere Ser Millonario? en colones costarricenses.
// ♦ = nivel garantizado (el jugador se lleva al menos este monto aunque falle después).
export const PREMIOS = [
  { formato: '₡1.000',        garantizado: false },
  { formato: '₡5.000',        garantizado: false },
  { formato: '₡10.000',       garantizado: false },
  { formato: '₡25.000',       garantizado: false },
  { formato: '₡50.000',       garantizado: true  },
  { formato: '₡100.000',      garantizado: false },
  { formato: '₡250.000',      garantizado: false },
  { formato: '₡500.000',      garantizado: false },
  { formato: '₡1.000.000',    garantizado: false },
  { formato: '₡2.500.000',    garantizado: true  },
  { formato: '₡5.000.000',    garantizado: false },
  { formato: '₡10.000.000',   garantizado: false },
  { formato: '₡25.000.000',   garantizado: false },
  { formato: '₡50.000.000',   garantizado: false },
  { formato: '₡100.000.000',  garantizado: false },
]

// Metadatos de presentación de cada categoría del JSON.
const META_CATEGORIAS = {
  naturaleza: { nombre: 'Naturaleza', emoji: '🌿' },
  geografia: { nombre: 'Geografía', emoji: '🗺️' },
  cultura: { nombre: 'Cultura', emoji: '🎭' },
  historia: { nombre: 'Historia', emoji: '📜' },
  gastronomia: { nombre: 'Gastronomía', emoji: '🍲' },
  simbolos: { nombre: 'Símbolos', emoji: '🎺' },
}

// Fisher–Yates: baraja una copia del arreglo sin mutar el original.
function barajar(arreglo) {
  const copia = [...arreglo]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}

export function useQuiz() {
  // --- Estado de carga ---
  const estado = ref('cargando') // 'cargando' | 'listo' | 'error'
  const titulo = ref('')
  const preguntas = ref([])

  // --- Estado de la partida ---
  const categoriaActiva = ref('todas')
  const preguntasJuego = ref([])
  const indice = ref(0)
  const respuestaElegida = ref(null) // índice de la opción elegida
  const bloqueado = ref(false) // true cuando ya se respondió la pregunta
  const aciertos = ref(0)
  const errores = ref(0)
  const puntos = ref(0)
  const racha = ref(0)
  const rachaMax = ref(0)
  const respuestas = ref([]) // registro para el repaso final
  // Habilidades (power-ups), cada una usable una vez por partida.
  const habilidades = ref({
    cincuenta: true,
    extra: true,
    saltar: true,
    doble: true,
    congelar: true,
  })
  const opcionesOcultas = ref([]) // índices ocultados por el 50:50
  const dobleActivo = ref(false) // true cuando el 2x está armado para la próxima

  // --- Récord persistente ---
  const mejorPuntaje = ref(Number(localStorage.getItem(CLAVE_RECORD)) || 0)
  const nuevoRecord = ref(false)
  const retirado = ref(false) // true si el jugador se retiró con su premio

  // --- Salón de la fama (lista de ganadores en localStorage) ---
  function leerGanadores() {
    try {
      return JSON.parse(localStorage.getItem(CLAVE_GANADORES)) || []
    } catch {
      return []
    }
  }
  const ganadores = ref(leerGanadores())

  // --- Derivados ---
  const preguntaActual = computed(
    () => preguntasJuego.value[indice.value] || null
  )
  const total = computed(() => preguntasJuego.value.length)
  const numeroPregunta = computed(() => indice.value + 1)
  const esUltima = computed(() => indice.value >= total.value - 1)
  const progreso = computed(() =>
    total.value ? (indice.value / total.value) * 100 : 0
  )
  const porcentaje = computed(() =>
    total.value ? Math.round((aciertos.value / total.value) * 100) : 0
  )

  // Nivel de premio según ACIERTOS (como en el programa: subís al acertar).
  // -1 = aún no ha ganado nada (cero aciertos).
  const nivelPremio = computed(() => {
    if (aciertos.value === 0) return -1
    return Math.min(
      Math.floor((aciertos.value / Math.max(total.value, 1)) * PREMIOS.length),
      PREMIOS.length - 1
    )
  })
  // Premio asegurado actual (lo que se lleva si se retira o termina ahora).
  const premioActual = computed(() =>
    nivelPremio.value < 0
      ? { formato: '₡0', garantizado: false }
      : PREMIOS[nivelPremio.value]
  )

  // Lista de categorías con cuántas preguntas tiene cada una.
  const categorias = computed(() => {
    const conteo = {}
    for (const p of preguntas.value) {
      conteo[p.categoria] = (conteo[p.categoria] || 0) + 1
    }
    const lista = Object.keys(conteo).map((id) => ({
      id,
      nombre: META_CATEGORIAS[id]?.nombre || id,
      emoji: META_CATEGORIAS[id]?.emoji || '❓',
      cantidad: conteo[id],
    }))
    return [
      { id: 'todas', nombre: 'Todas', emoji: '🎲', cantidad: preguntas.value.length },
      ...lista,
    ]
  })

  // --- Carga del JSON con fetch ---
  async function cargar() {
    estado.value = 'cargando'
    try {
      const res = await fetch('/data/preguntas.json')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const datos = await res.json()
      titulo.value = datos.titulo || 'Quiz'
      preguntas.value = datos.preguntas || []
      estado.value = 'listo'
    } catch (e) {
      console.error('No se pudo cargar el JSON de preguntas:', e)
      estado.value = 'error'
    }
  }

  // --- Iniciar una partida ---
  function empezar(categoriaId = 'todas') {
    categoriaActiva.value = categoriaId
    const base =
      categoriaId === 'todas'
        ? preguntas.value
        : preguntas.value.filter((p) => p.categoria === categoriaId)

    // Baraja preguntas y, dentro de cada una, sus opciones.
    preguntasJuego.value = barajar(base).map((p) => ({
      ...p,
      opciones: barajar(p.opciones),
    }))

    indice.value = 0
    respuestaElegida.value = null
    bloqueado.value = false
    aciertos.value = 0
    errores.value = 0
    puntos.value = 0
    racha.value = 0
    rachaMax.value = 0
    nuevoRecord.value = false
    respuestas.value = []
    habilidades.value = {
      cincuenta: true,
      extra: true,
      saltar: true,
      doble: true,
      congelar: true,
    }
    opcionesOcultas.value = []
    dobleActivo.value = false
    retirado.value = false
  }

  /** Habilidad 50:50: oculta dos opciones incorrectas de la pregunta actual. */
  function usar5050() {
    if (!habilidades.value.cincuenta || bloqueado.value || !preguntaActual.value) {
      return
    }
    const p = preguntaActual.value
    const incorrectas = p.opciones
      .map((op, i) => ({ op, i }))
      .filter((x) => x.op !== p.correcta)
      .map((x) => x.i)
    opcionesOcultas.value = barajar(incorrectas).slice(0, 2)
    habilidades.value.cincuenta = false
  }

  /** Marca una habilidad como usada (para efectos que aplica GameScreen). */
  function gastarHabilidad(nombre) {
    if (habilidades.value[nombre]) habilidades.value[nombre] = false
  }

  /** Habilidad 2x: arma el doble de puntos para la próxima respuesta. */
  function activarDoble() {
    if (!habilidades.value.doble || bloqueado.value) return
    habilidades.value.doble = false
    dobleActivo.value = true
  }

  /** Habilidad Saltar: registra la pregunta como saltada (sin penalizar puntos). */
  function saltarPregunta() {
    if (!habilidades.value.saltar || bloqueado.value || !preguntaActual.value) {
      return false
    }
    const p = preguntaActual.value
    habilidades.value.saltar = false
    racha.value = 0
    bloqueado.value = true
    respuestas.value.push({
      id: p.id,
      pregunta: p.pregunta,
      correcta: p.correcta,
      elegida: null,
      acerto: false,
      seAgoto: false,
      saltada: true,
      explicacion: p.explicacion || '',
    })
    return true
  }

  /**
   * Registra la respuesta de la pregunta actual.
   * @param {number|null} indiceOpcion  Índice elegido, o null si se agotó el tiempo.
   * @param {number} fraccionTiempo  Tiempo restante 0..1 (para el bonus).
   */
  function responder(indiceOpcion, fraccionTiempo = 0) {
    if (bloqueado.value || !preguntaActual.value) return
    bloqueado.value = true
    respuestaElegida.value = indiceOpcion

    const pregunta = preguntaActual.value
    const seAgoto = indiceOpcion === null
    const textoElegido = seAgoto ? null : pregunta.opciones[indiceOpcion]
    const acerto = !seAgoto && textoElegido === pregunta.correcta

    if (acerto) {
      aciertos.value++
      racha.value++
      rachaMax.value = Math.max(rachaMax.value, racha.value)
      // Puntos: base + bonus por rapidez + bonus por racha.
      const bonusTiempo = Math.round(50 * fraccionTiempo)
      const bonusRacha = (racha.value - 1) * 10
      let ganados = 100 + bonusTiempo + bonusRacha
      if (dobleActivo.value) ganados *= 2 // poder 2x
      puntos.value += ganados
    } else {
      errores.value++
      racha.value = 0
    }

    dobleActivo.value = false // el 2x se consume tras responder

    respuestas.value.push({
      id: pregunta.id,
      pregunta: pregunta.pregunta,
      correcta: pregunta.correcta,
      elegida: textoElegido,
      acerto,
      seAgoto,
      explicacion: pregunta.explicacion || '',
    })

    return acerto
  }

  /** Avanza a la siguiente pregunta. Devuelve false si ya no hay más. */
  function siguiente() {
    if (indice.value < total.value - 1) {
      indice.value++
      respuestaElegida.value = null
      bloqueado.value = false
      opcionesOcultas.value = []
      return true
    }
    return false
  }

  /**
   * Retirarse: el jugador abandona y se lleva el premio asegurado actual.
   * Solo posible si ya ganó algo (nivelPremio >= 0) y no está respondiendo.
   * Devuelve true si se concretó el retiro.
   */
  function retirarse() {
    if (bloqueado.value || nivelPremio.value < 0) return false
    bloqueado.value = true
    retirado.value = true
    finalizar()
    return true
  }

  /** Cierra la partida y guarda el récord si corresponde. */
  function finalizar() {
    if (puntos.value > mejorPuntaje.value) {
      mejorPuntaje.value = puntos.value
      nuevoRecord.value = true
      localStorage.setItem(CLAVE_RECORD, String(puntos.value))
    }
  }

  /** Guarda un ganador en el salón de la fama (persistido en localStorage). */
  function guardarGanador(nombre) {
    const limpio = String(nombre || '').trim().slice(0, 24)
    if (!limpio) return false
    const entrada = {
      nombre: limpio,
      premio: premioActual.value.formato,
      nivel: nivelPremio.value,
      puntos: puntos.value,
      aciertos: aciertos.value,
      total: total.value,
      retirado: retirado.value,
      fecha: new Date().toISOString(),
    }
    const lista = [...ganadores.value, entrada]
    // Ordena por nivel de premio (desc) y, a igualdad, por puntos.
    lista.sort((a, b) => b.nivel - a.nivel || b.puntos - a.puntos)
    ganadores.value = lista.slice(0, 20) // top 20
    localStorage.setItem(CLAVE_GANADORES, JSON.stringify(ganadores.value))
    return true
  }

  return {
    // estado de carga
    estado,
    titulo,
    preguntas,
    categorias,
    // partida
    categoriaActiva,
    preguntasJuego,
    indice,
    preguntaActual,
    respuestaElegida,
    bloqueado,
    aciertos,
    errores,
    puntos,
    racha,
    rachaMax,
    respuestas,
    habilidades,
    opcionesOcultas,
    dobleActivo,
    // derivados
    total,
    numeroPregunta,
    esUltima,
    progreso,
    porcentaje,
    // récord
    mejorPuntaje,
    nuevoRecord,
    retirado,
    ganadores,
    // constantes útiles
    SEGUNDOS_POR_PREGUNTA,
    PREMIOS,
    nivelPremio,
    premioActual,
    // acciones
    cargar,
    empezar,
    responder,
    siguiente,
    finalizar,
    usar5050,
    gastarHabilidad,
    saltarPregunta,
    activarDoble,
    retirarse,
    guardarGanador,
  }
}
