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

### Efectos de sonido — **producción propia**

Los 3 efectos requeridos (acierto, error y resultado) **no se descargaron**: se
generan en tiempo real con la **Web Audio API** (osciladores), en el composable
`src/composables/useAudio.js`. Por lo tanto son de producción propia y con
licencia libre de uso.

| Efecto      | Cómo se produce                              | Licencia        |
| ----------- | -------------------------------------------- | --------------- |
| `acierto`   | Arpegio ascendente (3 tonos, onda triangular) | Propia          |
| `error`     | Dos tonos graves descendentes (sierra)        | Propia          |
| `resultado` | Fanfarria de 4 tonos (onda cuadrada)          | Propia          |

> El código admite además archivos `.mp3` reales en `public/audio/`
> (`acierto.mp3`, `error.mp3`, `resultado.mp3`). Si se agregan, se usan esos.

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
