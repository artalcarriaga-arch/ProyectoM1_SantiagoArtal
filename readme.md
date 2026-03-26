# Colorfly Studio — Generador de Paleta de Colores

Proyecto Integrador del Módulo 1 — Soy Henry  
Autor: Santiago Artal

---

## Índice

1. [Descripción general](#descripción-general)
2. [Manual de usuario — Instrucciones de uso](#manual-de-usuario--instrucciones-de-uso)
3. [Decisiones técnicas — Manual técnico](#decisiones-técnicas--manual-técnico)
4. [Estructura del proyecto](#estructura-del-proyecto)
5. [Pasos para descargar y ejecutar en local](#pasos-para-descargar-y-ejecutar-en-local)
6. [Pasos para desplegar la aplicación](#pasos-para-desplegar-la-aplicación)

---

## Descripción general

**Colorfly Studio** es una aplicación web para generar paletas de colores aleatorias. Permite al usuario elegir entre distintos tamaños de paleta, visualizar cada color en formato HSL y HEX, copiar los valores al portapapeles con un clic, y persistir la última paleta generada entre sesiones de navegador.

La aplicación corre completamente en el navegador: no requiere servidor, base de datos ni instalación de dependencias.

---

## Manual de usuario — Instrucciones de uso

### Pantalla principal

| Elemento | Descripción |
|---|---|
| **Título "Colorfly Studio"** | Identifica la aplicación |
| **Subtítulo** | Describe la función de la app |
| **Botón "Generar Paleta"** | Genera una nueva paleta aleatoria |
| **Selector de tamaño** | Permite elegir cuántos colores tendrá la paleta |
| **Tarjetas de color (swatches)** | Muestran cada color generado con sus valores |

### Generar una paleta

1. (Opcional) Elegir el **tamaño de la paleta** en el selector desplegable:
   - `6` → 6 colores en 3 columnas
   - `8` → 8 colores en 4 columnas
   - `9` → 9 colores en 3 columnas
2. Hacer clic en el botón **"Generar Paleta"**.
3. Se mostrarán las tarjetas de color con sus valores en formato **HSL** y **HEX**.
4. Aparecerá una notificación breve confirmando que la paleta fue generada.

### Copiar un color

Cada tarjeta muestra dos filas de información:

- `HSL: H, S%, L%` — valor en modelo HSL
- `HEX: #RRGGBB` — valor hexadecimal

A la derecha de cada valor hay un botón **⎘ (copiar)**. Al presionarlo:
- El valor se copia al portapapeles del sistema.
- Aparece una notificación central: **"Color copiado"**.

### Persistencia automática

La última paleta generada se guarda automáticamente en el navegador. Al recargar la página o volver a abrirla, **la paleta anterior se restaura** sin necesidad de hacer ninguna acción.

---

## Decisiones técnicas — Manual técnico

### Lenguajes y tecnologías

| Tecnología | Uso |
|---|---|
| HTML5 | Estructura semántica y accesibilidad |
| CSS3 | Estilos, layout, animaciones y responsividad |
| JavaScript (ES6+) | Lógica de negocio, DOM, eventos, APIs del navegador |

No se utilizan librerías ni frameworks externos. El proyecto es 100 % vanilla.

---

### Generación de colores en modelo HSL

Se eligió el espacio de color **HSL (Hue, Saturation, Lightness)** porque permite controlar la calidad visual de los colores generados de forma predecible:

```js
const h = Math.floor(Math.random() * 360);      // Tono: cualquier ángulo del círculo cromático
const s = Math.floor(Math.random() * 61) + 40;  // Saturación: 40–100% (colores vivos, sin grisáceos)
const l = Math.floor(Math.random() * 41) + 30;  // Luminosidad: 30–70% (sin blancos ni negros)
```

Esto garantiza que todos los colores generados sean **perceptualmente vistosos** y evita extremos como blancos, negros o grises sin saturación.

---

### Conversión HSL → HEX (`hslToHex`)

La función `hslToHex(h, s, l)` implementa la conversión matemática del espacio HSL al hexadecimal RGB sin dependencias externas.

El algoritmo:
1. Normaliza `s` y `l` a rango `[0, 1]`.
2. Calcula el coeficiente de crominancia `a = s * min(l, 1 - l)`.
3. Aplica una función de onda triangular `f(n)` para cada canal (R, G, B).
4. Convierte cada canal a dos dígitos hexadecimales con `padStart(2, '0')`.

```js
function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;
    const k     = n => (n + h / 30) % 12;
    const a     = s * Math.min(l, 1 - l);
    const f     = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    const toHex = x => Math.round(x * 255).toString(16).padStart(2, '0');
    return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}
```

---

### Layout con CSS Grid dinámico

El número de columnas de la grilla se controla mediante clases CSS que se asignan dinámicamente desde JavaScript según el tamaño elegido:

```js
palette.className = `size-${size}`;
```

```css
#palette.size-6 { grid-template-columns: repeat(3, 1fr); }
#palette.size-8 { grid-template-columns: repeat(4, 1fr); }
#palette.size-9 { grid-template-columns: repeat(3, 1fr); }
```

---

### Persistencia con `localStorage`

Al generar una paleta, los valores HSL de cada color se serializan a JSON y se almacenan:

```js
localStorage.setItem('savedPalette', JSON.stringify(colors));
```

Al cargar la página, se llama a `loadSavedPalette()`, que recupera y renderiza la paleta guardada si existe. Esto brinda una experiencia continua sin necesidad de backend.

---

### Copiado al portapapeles

Se utiliza la API moderna **`navigator.clipboard.writeText()`**, que es asíncrona y opera en contextos seguros (HTTPS o `localhost`). Al presionar un botón de copia, el valor correspondiente (HSL o HEX) se envía al portapapeles del sistema.

---

### Sistema de notificaciones (Toast)

El toast es un elemento `<div>` fijo en el centro de la pantalla con `opacity: 0` por defecto. Se activa añadiendo la clase `.show` (que establece `opacity: 1` y una transición CSS) y se oculta con un `setTimeout` de 2 segundos. Un `clearTimeout` previo evita que múltiples copias rápidas se solapten.

---

### Variables CSS (`custom properties`)

Todos los colores de la UI están centralizados en variables CSS dentro de `:root`, lo que facilita el mantenimiento y la personalización del tema:

```css
:root {
    --bg:            #333333;
    --bg-dark:       #2a1a3a;
    --accent:        #6b4a8a;
    --btn-bg:        #3d2255;
    --text:          #ffffff;
    --text-muted:    #cccccc;
    --swatch-border: rgba(255, 255, 255, 0.15);
    --radius:        0.75rem;
}
```

---

### Accesibilidad (a11y)

- `aria-live="polite"` en el contenedor de la paleta y en el toast para anunciar cambios a lectores de pantalla.
- `aria-label` en cada swatch con el valor HEX del color.
- `aria-label` en los botones de copia indicando qué formato se copia.
- Estilos de foco visibles (`focus-visible`) en botones y select.
- Unidades relativas (`rem`) para escalar con el tamaño de fuente del sistema.

---

### Diseño responsivo

Una media query en `48rem` (768 px) colapsa todas las variantes de grilla a una sola columna para pantallas pequeñas:

```css
@media (max-width: 48rem) {
    #palette,
    #palette.size-6,
    #palette.size-8,
    #palette.size-9 {
        grid-template-columns: 1fr;
    }
}
```

---

## Estructura del proyecto

```
ProyectoM1_SantiagoArtal/
├── index.html    # Estructura HTML de la aplicación
├── styles.css    # Estilos, layout y animaciones
├── script.js     # Lógica de la aplicación
└── readme.md     # Este archivo
```

---

## Pasos para descargar y ejecutar en local

### Requisitos previos

- Un navegador moderno (Chrome 89+, Firefox 90+, Edge 89+, Safari 15+).
- (Recomendado) [Visual Studio Code](https://code.visualstudio.com/) con la extensión **Live Server**.
- Git instalado (opcional, para clonar el repositorio).

### Opción A — Clonar con Git

```bash
git clone https://github.com/artalcarriaga-arch/ProyectoM1_SantiagoArtal.git
cd ProyectoM1_SantiagoArtal
```

### Opción B — Descargar el ZIP

1. Ir al [repositorio en GitHub](https://github.com/artalcarriaga-arch/ProyectoM1_SantiagoArtal).
2. Hacer clic en **Code → Download ZIP**.
3. Descomprimir el archivo descargado.
4. Abrir la carpeta resultante.

### Ejecutar la aplicación

#### Con VS Code + Live Server (recomendado)

1. Abrir la carpeta del proyecto en VS Code.
2. Instalar la extensión **Live Server** (ritwickdey.LiveServer) si no está instalada.
3. Hacer clic derecho sobre `index.html` → **"Open with Live Server"**.
4. El navegador abrirá `http://127.0.0.1:5500/index.html` automáticamente.

> **Nota:** Live Server es necesario para que `navigator.clipboard` funcione correctamente, ya que la API del portapapeles requiere un contexto seguro (`localhost` o HTTPS).

#### Abriendo el archivo directamente

1. Navegar hasta la carpeta del proyecto en el explorador de archivos.
2. Hacer doble clic sobre `index.html`.

> La app cargará y se podrá generar paletas. El botón de copia puede no funcionar en algunos navegadores al abrir el archivo con `file://` por restricciones de seguridad del navegador.

---

## Pasos para desplegar la aplicación

Al ser un proyecto completamente estático (HTML + CSS + JS sin backend), puede desplegarse en cualquier servicio de hosting estático.

### GitHub Pages (recomendado, gratuito)

1. Subir el proyecto a un repositorio de GitHub.
2. Ir a **Settings → Pages** en el repositorio.
3. En **Source**, seleccionar la rama `main` (o `master`) y la carpeta `/ (root)`.
4. Hacer clic en **Save**.
5. GitHub generará una URL pública del tipo:
   ```
   https://<usuario>.github.io/<nombre-del-repositorio>/
   ```

El proyecto ya está desplegado en:
👉 https://artalcarriaga-arch.github.io/ProyectoM1_SantiagoArtal/

### Netlify (gratuito, drag & drop)

1. Ir a [netlify.com](https://netlify.com) e iniciar sesión.
2. En el dashboard, arrastrar la carpeta del proyecto al área de **"Deploy manually"**.
3. Netlify generará una URL pública en segundos.
4. (Opcional) Conectar el repositorio de GitHub para despliegue continuo automático.

### Vercel (gratuito)

1. Ir a [vercel.com](https://vercel.com) e iniciar sesión con GitHub.
2. Hacer clic en **"Add New Project"** y seleccionar el repositorio.
3. Vercel detectará que es un proyecto estático y lo desplegará automáticamente.
4. Se generará una URL pública del tipo `https://<nombre>.vercel.app`.

### Consideraciones de seguridad para el despliegue

- La API `navigator.clipboard` requiere **HTTPS**. Todos los servicios mencionados proveen HTTPS automáticamente.
- No se transmiten datos a servidores externos. Toda la información (paleta guardada) se almacena localmente en el `localStorage` del navegador del usuario.
- No hay credenciales, tokens ni datos sensibles en el código fuente.

---

*Proyecto desarrollado como parte del curso de Desarrollo Full Stack en Soy Henry.*
