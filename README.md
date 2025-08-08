# The Biblical Timeline (Refactor 2025)

Modernización del proyecto eliminando dependencias externas (jQuery, Backbone, Underscore, Flowplayer) y migrando a ES Modules + APIs nativas.

## Cambios Clave (Resumen)
- Eliminado jQuery → utilidades reemplazadas por `dom.js` (selección, delegación, fades, helpers AJAX).
- Eliminado Backbone.Router → router ligero propio (`router.js`) usando History API.
- Eliminado Underscore → métodos nativos (`Array.from`, `map`, `filter`, `reduce`, `Object.keys`, etc.).
- Eliminado Flowplayer → reproducción con `<video>` nativo (`video.js`).
- Modularización completa: separación en ES Modules (`timeline.js`, `events.js`, `periods.js`, `hover.js`, etc.).
- Refactor de hover: canvas pointer + barra de color + burbuja de año dinámica y línea vertical de precisión.
- Nuevo flujo de render: eventos se cargan completamente al primer clic de período (`renderAll()`), permitiendo scroll fluido multi-período.
- Barra de fechas (date-bar) sincronizada con scroll horizontal e interpolación de año precisa usando segmentos construidos desde eventos reales (`buildYearSegments()` + `interpolateYear()`).
- Footer y sidebar actualizan período activo en tiempo real mientras se arrastra (sin necesidad de soltar el mouse).
- Eliminado código muerto / stubs legacy y exposición controlada de funciones globales para compatibilidad.

## Evolución del Timeline Modernizado
1. Limpieza de dependencias externas y migración a módulos.
2. Implementación de un scroller ligero (basado en `Scroller.js`) para soporte X/Y con `translate3d`.
3. Re-estructura de periodos y eventos: se conserva `window.events` como fuente HTML; `events.js` introduce `renderAll()`.
4. Precisión temporal: se generan segmentos por período detectando posición (px) y años (`data-start` / `data-end`) de cada evento → mejor correlación píxeles ↔ años que el cálculo heurístico anterior.
5. Actualizaciones en vivo:
  - `updateIndicator()` detecta período por centro de la ventana y notifica a footer + sidebar.
  - `updateDateBar()` mueve listas y recalcula la burbuja de año central.
6. Hover enriquecido:
  - Al pasar sobre un evento: triángulo (canvas) + barra de color sobre la date-bar alineada al evento + burbuja de año muestra el inicio exacto del evento + línea vertical centrada bajo el evento.
  - Al salir: restauración del año interpolado central.
7. Accesibilidad visual: eliminación de reposicionamientos bruscos de la burbuja (mantiene layout CSS, sólo cambia contenido).

## Funciones / APIs Expuestas Globalmente
Para mantener compatibilidad con código inline legacy en `index.html` (u otros scripts externos) se exponen:
```js
window.updateFooter(period)
window.updateSidebar(period)
window.buildYearSegments()
window.updateDateBar(left)
```
Además: `window.scroller`, `window.currentPeriod`, `window.currentTop`, `window.period_offsets`, `window.periods`, `window.events`.

## Módulos Destacados
- `timeline.js`: Inicializa scroller, maneja scroll, interpolación y sincronización de UI.
- `events.js`: Renderizado incremental / completo de eventos.
- `periods.js`: Lógica de clic sobre períodos (centrado y primer render global).
- `hover.js`: Efectos visuales y sobre-escritura temporal de la burbuja de año.
- `footer.js`: Interacción y resaltado del período en la barra inferior.
- `video.js`: Control simple `<video>` (play/pause/cerrar) en reemplazo de Flowplayer.
- `dom.js`: Helpers DOM y utilidades genéricas.

## Flujo de Scroll y Cálculo de Año
1. Usuario arrastra / rueda → callback del scroller.
2. `updateIndicator()` determina período por `centerX` dentro de `period_offsets`.
3. Si cambia de período → `updateFooter()` y `updateSidebar()`.
4. `updateDateBar(left)` desplaza la lista y calcula año central con:
  - `buildYearSegments()` (si no existe cache): arma `[ { startX, endX, startYear, endYear } ]`.
  - `interpolateYear(centerX)` → interpolación lineal dentro del segmento relevante.
5. Burbuja actualiza su contenido (no su posición CSS base).

## Render de Eventos
`renderAll()` concatena todos los eventos ordenados por período para permitir desplazamiento continuo; tras insertar DOM ejecuta `buildYearSegments()` para recalibrar la relación píxeles-años según el layout final.

## Hover Avanzado
- Canvas pointer triangular dimensionado según espacio libre hasta la date-bar.
- Línea vertical centrada en el evento (precisión visual de alineación con ticks de la date-bar).
- Burbuja de año: almacena HTML previo en `data-prev` y lo restaura al salir.

## Performance Considerations
- Construcción de segmentos (O(n) en número de eventos) se hace sólo tras `renderAll()` o si se invalida manualmente (`buildYearSegments()`).
- Transformaciones usan `translate3d` para mayor suavidad (GPU).
- Eliminación de librerías reduce peso y parse time inicial.

## Compatibilidad / Técnicas Legacy
Se mantuvieron ciertos nombres globales para evitar reescritura masiva de datos embebidos. Siguiente paso recomendado: encapsular en un namespace y retirar dependencias de variables globales.

## Testing (Pendiente Futuro)
Recomendado agregar:
- Pruebas de interpolación (`interpolateYear` con casos límite inicio/fin de segmento).
- Pruebas de detección de período por `centerX`.
- Snapshot simple de render de eventos.

## Limitaciones Conocidas
- Último período extrapola `endYear` si no hay suficientes eventos (fallback simple). Puede mejorarse añadiendo metadatos explícitos.
- No se han optimizado imágenes (posible lazy-loading posterior).
- Faltan polyfills para navegadores muy antiguos (no objetivo actual tras remover jQuery/Backbone).

## Guía Rápida de Uso
1. Servir el directorio raíz con un servidor estático.
2. Abrir `index.html`.
3. Click en un período de la landing → se cargan todos los eventos y se hace scroll hasta el centro del período.
4. Desplazarse horizontalmente: footer y sidebar siguen el período activo; la burbuja muestra el año interpolado.
5. Hover sobre un evento: se muestran año exacto de inicio, línea vertical y pointer.

## Desarrollo Local
Proyecto es estático + endpoints PHP (no incluidos). Servir con un server simple:
```bash
python -m http.server 8000
```
Visitar: `http://localhost:8000/`

## Estructura Principal
```
js/
  dom.js
  router.js
  app.js
  landing.js
  menu.js
  event-detail.js
  auth.js
  search.js
  tooltip.js
  video.js
  hover.js
  footer.js
  facts.js
  seo.js
  scroller/ (lógica de scrolling de terceros conservada)
```

## Inicialización
`app.js` actúa como bootstrap: importa módulos y ejecuta inicializadores tras `window.load`.

## Globals Conservados (por compatibilidad)
Algunas variables legacy aún asumidas como globales (p.ej. `period_offsets`, `scroller`, `currentTop`, `currentPeriod`). Se recomienda encapsularlas en un futuro módulo `timeline.js`.

## Próximos Pasos Recomendados
1. Encapsular timeline principal y sidebar (recrear funciones eliminadas de `scroller_init.js`).
2. Eliminar stubs legacy una vez migrado todo.
3. Añadir pruebas (unitarias simples para helpers y smoke test de módulos críticos).
4. Optimizar carga diferida de detalles de eventos/imágenes.

> En Windows (cmd) el comando es el mismo si Python está en PATH.

## Utilidades DOM Clave
- `qs(sel,scope)` / `qsa(sel,scope)`
- `on(target, type, selector, handler)` delegación
- `fadeIn(el, ms)` / `fadeOut(el, ms)`
- `fetchJSON(url, params)` wrapper sencillo

## Accesibilidad & Rendimiento (Resumen)
- Animaciones via CSS/`transform` (GPU friendly).
- Menor JS inicial → menos tiempo de parseo/bloqueo.
- Eliminación de plugins de video externos reduce listeners y reflows.

## Licencia
Mantener la licencia original del proyecto (no incluida en este archivo).
