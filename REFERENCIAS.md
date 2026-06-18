# REFERENCIAS — Pura Vida Quiz (Proyecto Personal IF7102)

**Estudiante:** Harold Martin
**Curso:** IF7102 – Multimedios | I Ciclo 2026
**Framework elegido:** Vue 3 (Composition API)

Este archivo documenta el proceso de aprendizaje autónomo del framework y las
fuentes de los recursos usados.

---

## 1. Documentación oficial consultada

| Tema | Recurso | URL |
| ---- | ------- | --- |
| Fundamentos de Vue 3 y reactividad (`ref`, `computed`) | Vue.js – Guide | https://vuejs.org/guide/introduction.html |
| `<script setup>`, `defineProps`, `defineEmits` | Vue.js – SFC Script Setup | https://vuejs.org/api/sfc-script-setup.html |
| Composables (reutilizar lógica) | Vue.js – Composables | https://vuejs.org/guide/reusability/composables.html |
| Ciclo de vida (`onMounted`, `onUnmounted`) | Vue.js – Lifecycle Hooks | https://vuejs.org/api/composition-api-lifecycle.html |
| `provide` / `inject` | Vue.js – Provide / Inject | https://vuejs.org/guide/components/provide-inject.html |
| Animaciones de entrada/salida | Vue.js – `<Transition>` | https://vuejs.org/guide/built-ins/transition.html |
| Configuración del entorno | Vite – Guide | https://vite.dev/guide/ |
| Carga del JSON | MDN – Fetch API | https://developer.mozilla.org/es/docs/Web/API/Fetch_API |
| Síntesis de sonido | MDN – Web Audio API | https://developer.mozilla.org/es/docs/Web/API/Web_Audio_API |
| `OscillatorNode` (tonos) | MDN – OscillatorNode | https://developer.mozilla.org/es/docs/Web/API/OscillatorNode |
| Persistencia del tema y récord | MDN – Window.localStorage | https://developer.mozilla.org/es/docs/Web/API/Window/localStorage |
| Variables CSS para el tema | MDN – Custom properties | https://developer.mozilla.org/es/docs/Web/CSS/--* |

---

## 2. Tutoriales y cursos

- **Vue 3 Crash Course** – documentación interactiva oficial (tutorial paso a
  paso de Vue): https://vuejs.org/tutorial/
- **Vue Mastery / Vue School** – conceptos de Composition API (referencia
  conceptual gratuita): https://vueschool.io/articles/

> Reemplazar/añadir aquí los videos o artículos concretos que se sigan durante
> el desarrollo, con su URL y título.

---

## 3. Recursos multimedia

### Efectos de sonido

El efecto `resultado` se **genera en tiempo real con la Web Audio API**
(osciladores), en `src/composables/useAudio.js` → producción propia. Los efectos
`acierto` y `error` usan archivos `.mp3` (ver tabla). Si un archivo faltara, el
código cae automáticamente en la síntesis de respaldo (también propia).

| Efecto      | Cómo se produce                               | Origen / Licencia                                   |
| ----------- | --------------------------------------------- | --------------------------------------------------- |
| `acierto`   | `public/audio/acierto.mp3`                    | Generado con **ElevenLabs (IA)** — sonido de éxito  |
| `error`     | `public/audio/error.mp3`                      | Archivo de banco de sonidos (terceros), uso libre   |
| `resultado` | Fanfarria de 4 tonos (Web Audio API)          | Producción propia                                   |

> Respaldo sintetizado (producción propia) si los `.mp3` no están presentes:
> `acierto` = arpegio ascendente, `error` = dos tonos graves descendentes.

### Música de fondo — **material de terceros**

| Recurso | Descripción | Origen / Licencia |
| ------- | ----------- | ----------------- |
| `public/audio/millonario.mp3` | Música de tensión que suena en bucle durante cada pregunta | Tema musical del programa *¿Quién Quiere Ser Millonario?* — **material con derechos de autor**, usado solo con fines educativos y sin fin de lucro dentro de este proyecto académico. **No es de producción propia.** |
| `public/audio/entrada.mp3` | Jingle corto al aparecer cada pregunta | Sonido del programa *¿Quién Quiere Ser Millonario?* — **material con derechos de autor**, uso educativo. **No es de producción propia.** |
| `public/audio/retiro.mp3` | Suena cuando el jugador se retira con su premio | Sonido del programa *¿Quién Quiere Ser Millonario?* — **material con derechos de autor**, uso educativo. **No es de producción propia.** |

> Si este archivo no está presente, el juego cae automáticamente en un arpegio
> de tensión **sintetizado con la Web Audio API** (producción propia), definido
> en `src/composables/useAudio.js`.

### Imágenes e ilustraciones — **producción propia**

| Recurso | Descripción | Licencia |
| ------- | ----------- | -------- |
| Ilustración de inicio | Paisaje tico (volcán, palmera, tucán) dibujado en SVG en `StartScreen.vue` | Propia |
| Anillo de resultados | Gráfico de progreso en SVG en `ResultScreen.vue` | Propia |
| `favicon.svg` | Ícono de la app (bandera + signo de pregunta) | Propia |
| Íconos de preguntas/categorías | Emojis Unicode estándar | Uso libre |

---

## 4. Datos del quiz

Las preguntas sobre Costa Rica (`public/data/preguntas.json`) son de redacción
propia. Datos verificados con fuentes de referencia general:

- Símbolos nacionales de Costa Rica – Asamblea Legislativa / fuentes oficiales.
- Geografía y provincias – Instituto Geográfico Nacional.
- Historia (abolición del ejército, 1948-1949) – referencias históricas
  estándar.

---

## 5. Uso de Inteligencia Artificial

Se usó **Claude (Anthropic)** como apoyo para:

- Estructurar el proyecto en componentes y composables.
- Entender y aplicar correctamente `provide/inject`, `<Transition>` y la
  Web Audio API.
- Revisar el código y mejorar la accesibilidad y el diseño responsivo.

Todo el código fue **leído, comprendido y probado** por el estudiante. Soy capaz
de explicar por qué se usa cada parte del framework (reactividad, props, eventos,
ciclo de vida, composables y provide/inject).

---

*Documento actualizado durante el desarrollo del proyecto.*
