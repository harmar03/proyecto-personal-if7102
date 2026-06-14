# 🇨🇷 Pura Vida Quiz — Conocé Costa Rica

Quiz educativo interactivo sobre Costa Rica (naturaleza, geografía, cultura e
historia), construido con **Vue 3 + Vite**. Proyecto Personal del curso.

**Estudiante:** Harold Martin
**Curso:** IF7102 – Multimedios | I Ciclo 2026 · UCR, Sede Regional de Guanacaste
**Framework:** Vue 3 (Composition API con `<script setup>`) + Vite
**Opción temática:** 5 – Juego Educativo de Un Nivel (quiz con temporizador)
**Valor:** 25 % de la nota final

---

## ✨ Características

- **Tres pantallas**: inicio → juego → resultado, con transiciones animadas.
- **29 preguntas** en **6 categorías** (Naturaleza, Geografía, Cultura, Historia,
  Gastronomía y Símbolos), seleccionables o todas juntas.
- **Temporizador** de 15 s por pregunta con barra visual y auto-avance.
- **Puntuación con estrategia**: puntos base + bonus por rapidez + bonus por
  racha de aciertos consecutivos.
- **5 poderes** (cada uno una vez por partida): 50:50, doble puntos (2x),
  +5 s, congelar tiempo y saltar.
- **Compartir resultado** al portapapeles (con método de respaldo).
- **Preguntas y opciones barajadas** en cada partida (nunca sale igual).
- **Efectos de sonido sintetizados** en vivo con la Web Audio API
  (acierto / error / resultado) — *producción propia*, sin archivos externos.
- **Repaso educativo** al final: muestra qué se falló y la explicación de cada
  respuesta correcta.
- **Modo claro / oscuro** con persistencia en `localStorage`.
- **Mejor puntaje** guardado entre partidas (`localStorage`).
- **Accesibilidad**: se juega con mouse o con las teclas `1`–`4`; respeta
  `prefers-reduced-motion`; etiquetas ARIA en controles.
- **Responsivo**: una sola columna en móvil, dos en escritorio.

---

## 🚀 Instrucciones de ejecución

Requisitos: **Node.js 18+** y **npm 8+**.

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar el servidor de desarrollo
npm run dev
# abrir http://localhost:5173

# 3. (Opcional) Compilar para producción
npm run build
npm run preview
```

---

## 🧩 Estructura del proyecto

```
proyecto-personal-if7102/
├── public/
│   ├── data/
│   │   └── preguntas.json        ← Datos del quiz (se cargan con fetch)
│   ├── audio/                    ← (opcional) .mp3 propios; si no, se sintetizan
│   └── favicon.svg               ← Ícono propio (SVG)
├── src/
│   ├── components/               ← 8 componentes reutilizables
│   │   ├── StartScreen.vue       ← Pantalla de inicio (+ ilustración SVG propia)
│   │   ├── GameScreen.vue        ← Orquesta la partida
│   │   ├── ResultScreen.vue      ← Resultados + repaso (anillo SVG)
│   │   ├── QuestionCard.vue      ← Tarjeta de pregunta (props + emits)
│   │   ├── OptionButton.vue      ← Botón de opción (props + emits)
│   │   ├── TimerBar.vue          ← Barra del temporizador
│   │   ├── ProgressBar.vue       ← Barra de progreso
│   │   └── StatPill.vue          ← Pastilla de estadística
│   ├── composables/              ← Lógica reutilizable (Composition API)
│   │   ├── useQuiz.js            ← Estado del juego, puntaje, carga del JSON
│   │   ├── useTimer.js          ← Cuenta regresiva con limpieza de ciclo de vida
│   │   ├── useAudio.js          ← Síntesis de sonidos (Web Audio API)
│   │   └── useTheme.js          ← Modo claro/oscuro persistente
│   ├── App.vue                   ← Raíz: cabecera, ruteo de pantallas, provide()
│   ├── main.js
│   └── style.css                 ← Sistema de diseño (variables CSS, temas)
├── index.html
├── README.md
├── REFERENCIAS.md
└── package.json
```

---

## 🛠️ Funcionalidades de Vue 3 aplicadas

| Concepto del framework            | Dónde se usa                                              |
| --------------------------------- | -------------------------------------------------------- |
| `ref()` / estado reactivo         | Puntaje, índice, tema, respuesta elegida…                |
| `computed()`                      | Categorías, porcentaje, progreso, anillo SVG             |
| `onMounted` / `onUnmounted`       | Cargar JSON, iniciar y limpiar el temporizador y teclado |
| `watch()`                         | Persistir el tema en `localStorage`                      |
| **Composables**                   | `useQuiz`, `useTimer`, `useAudio`, `useTheme`            |
| `props` (datos a hijos)           | `QuestionCard`, `OptionButton`, `ResultScreen`, etc.     |
| `defineEmits` (eventos a padres)  | `iniciar`, `elegir`, `terminar`, `revancha`…             |
| `provide` / `inject`              | Compartir `quiz` y `audio` sin prop-drilling             |
| `v-for`, `v-if`/`v-else-if`       | Opciones, categorías, ruteo de pantallas                 |
| `:class` / binding dinámico       | Estado visual de opciones, racha, urgencia del tiempo    |
| `<Transition>`                    | Cambios de pantalla y de pregunta                        |
| `fetch()`                         | Carga del archivo `public/data/preguntas.json`           |

---

## 🎬 Multimedia

- **Sonido (3 efectos):** acierto, error y resultado, **sintetizados con la Web
  Audio API** (osciladores) → producción propia. Se pueden sustituir por
  archivos `.mp3` en `public/audio/` sin tocar el código.
- **Imágenes/ilustraciones:** ilustración SVG del paisaje tico en la pantalla de
  inicio, anillo de resultados en SVG, favicon e íconos emoji por pregunta —
  todo de producción propia o glifos estándar.

---

## 📋 Cómo se juega

1. Elegí una categoría y tocá **¡Comenzar!**.
2. Respondé cada pregunta antes de que se acabe el tiempo (mouse o teclas 1-4).
3. Ganá más puntos respondiendo rápido y encadenando aciertos (racha 🔥).
4. Al final, revisá tu repaso y tratá de superar tu récord.

---

## 📸 Capturas de pantalla

> Inicio, juego y resultados (claro y oscuro). _Agregar imágenes en `docs/`._

---

*Proyecto para el curso IF7102 – Universidad de Costa Rica, Sede Regional de
Guanacaste, Recinto de Liberia.*
