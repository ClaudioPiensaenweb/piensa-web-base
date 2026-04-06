# Piensa Web Base — Setup

Template base para webs corporativas Piensaenweb.
Stack: HTML estático + Directus 11 + vanilla JS.

---

## Arrancar en local (5 pasos)

### 1. Clonar y personalizar

```bash
git clone https://github.com/ClaudioPiensaenweb/piensa-web-base.git nombre-cliente
cd nombre-cliente
```

Edita `public/js/config.js` — cambia el nombre del proyecto:
```js
var PROYECTO = 'nombre-cliente';   // solo para referencia
var CMS_URL  = 'http://localhost:8055';  // no cambiar en local
```

### 2. Instalar y arrancar Directus

```bash
cd cms
cp .env.local.example .env
npm install
npx directus start
```

El CMS está en → http://localhost:8055/admin
Login: `admin@piensaenweb.com` / `Admin.123`

### 3. Crear las colecciones

En otra terminal (desde la raíz del proyecto):

```bash
node scripts/setup-directus.mjs
```

Esto crea: colecciones de marca (`estilo`, `empresa`, `seo`), blog (`posts`, `categories`) y carga datos de ejemplo.

### 4. Abrir la web

```bash
npx serve public
```

Web en → http://localhost:3000

### 5. Personalizar para el cliente

- **Contenido y marca**: desde el admin de Directus → colección `empresa` y `estilo`
- **HTML**: editar `public/index.html` y las demás páginas
- **Estilos**: los colores y fuentes se gestionan desde Directus, no desde el CSS

---

## Configurar el deploy

1. Crear repositorio en GitHub (en ClaudioPiensaenweb)
2. Añadir secrets en GitHub → Settings → Secrets → Actions:
   - `SSH_KEY` — clave privada SSH
   - `HOST` — 185.14.57.159
   - `USER` — usuario Plesk
   - `DOMAIN` — dominio del cliente (ej: micliente.com)
3. Crear la BD en Plesk: PostgreSQL, usuario y contraseña
4. Copiar `cms/.env.example` al servidor como `cms/.env` y rellenar los valores
5. Push a `main` → GitHub Actions despliega automáticamente

---

## Estructura del proyecto

```
public/               ← Web HTML estática
  index.html          ← Home
  .htaccess           ← URLs limpias + HTTPS + security headers
  css/style.css       ← Estilos base (las variables vienen de Directus)
  js/
    config.js         ← URL del CMS (único archivo que cambiar)
    dynamic-styles.js ← Carga marca desde Directus en runtime
    templates.js      ← Header y footer compartidos
    script.js         ← Animaciones (GSAP + Lenis)

cms/                  ← Directus CMS
  .env                ← Variables (no sube a git)
  ecosystem.config.cjs ← PM2 para producción

scripts/
  setup-directus.mjs  ← Crea colecciones y datos de ejemplo

.github/workflows/
  deploy.yml          ← Deploy automático al hacer push
```

---

## Añadir páginas nuevas

1. Duplicar `public/pagina-ejemplo.html`
2. Añadir la ruta en `public/.htaccess` (sección "URLs limpias")
3. Añadir el link en `public/js/templates.js` (nav)
4. Añadir fila en `scripts/setup-directus.mjs` → colección `seo` (opcional)
