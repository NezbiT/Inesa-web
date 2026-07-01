<p align="center">
  <img src="public/logo-inesa.png" alt="INESA~C.A" width="220" />
</p>

<h1 align="center">INESA~C.A — Sitio Web</h1>

<p align="center">
  <strong>Instituto de Evaluación Sensorial Alimentos</strong><br />
  Houston, TX · USA
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Nuxt-4.4-00DC82?style=flat-square&logo=nuxt.js&logoColor=white" alt="Nuxt 4" />
  <img src="https://img.shields.io/badge/Vue-3.5-4FC08D?style=flat-square&logo=vue.js&logoColor=white" alt="Vue 3" />
  <img src="https://img.shields.io/badge/i18n-ES%20%7C%20EN%20%7C%20FR-e94f1d?style=flat-square" alt="i18n" />
  <img src="https://img.shields.io/badge/Galería-118%20fotos-555?style=flat-square" alt="Gallery" />
</p>

---

Sitio institucional de **INESA~C.A**, reconstruido con **Nuxt 4** y preparado para una futura plataforma de capacitaciones online. Incluye información de servicios, galería fotográfica de eventos y laboratorio, y contacto en tres idiomas.

## Vista previa

<p align="center">
  <img src="public/images/gallery/featured/featured-04.jpg" alt="Evento INESA" width="32%" />
  <img src="public/images/gallery/featured/featured-09.jpg" alt="Capacitación sensorial" width="32%" />
  <img src="public/images/gallery/analysis/DSC_5112.JPG" alt="Laboratorio de análisis" width="32%" />
</p>

## Características

- **Multilingüe** — Español (por defecto), inglés y francés con `@nuxtjs/i18n`
- **Galería interactiva** — 118 fotos en categorías: destacadas, eventos, análisis e institucional
- **Diseño responsive** — Navegación móvil, hero, tarjetas de servicios y lightbox
- **Capacitaciones** — Página `/courses` lista para integrar LMS
- **SEO y branding** — Meta tags, favicon y logo transparente INESA

## Páginas

| Ruta | Descripción |
|------|-------------|
| `/` | Inicio — hero, servicios, galería y contacto |
| `/about` | Quiénes somos — misión, enfoque y valores |
| `/services` | Servicios de evaluación sensorial y consultoría |
| `/gallery` | Galería completa con filtros y lightbox |
| `/courses` | Capacitaciones online (próximamente) |
| `/contact` | Formulario y datos de contacto |

Rutas en inglés y francés: `/en/...`, `/fr/...`

## Galería

<p align="center">
  <img src="public/images/gallery/events/5515487916_891be202bc_m.jpg" alt="Evento" width="24%" />
  <img src="public/images/gallery/events/5515561404_6b150f4c19_m.jpg" alt="Seminario" width="24%" />
  <img src="public/images/gallery/institutional/prof OMahony.jpg" alt="Prof. O'Mahony" width="24%" />
  <img src="public/images/gallery/analysis/DSC_5130.JPG" alt="Análisis sensorial" width="24%" />
</p>

## Stack tecnológico

| Tecnología | Uso |
|------------|-----|
| [Nuxt 4](https://nuxt.com) | Framework full-stack |
| [Vue 3](https://vuejs.org) | UI reactiva |
| [@nuxtjs/i18n](https://i18n.nuxtjs.org) | Internacionalización |
| CSS custom | Diseño institucional (Enriqueta + Muli) |

## Inicio rápido

```bash
# Clonar el repositorio
git clone https://github.com/NezbiT/Inesa-web.git
cd Inesa-web

# Instalar dependencias
npm install

# Servidor de desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) (Nuxt elige otro puerto si 3000 está ocupado).

### Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Build de producción |
| `npm run preview` | Vista previa del build |
| `npm run generate` | Sitio estático (SSG) |

## Estructura del proyecto

```
├── app/
│   ├── pages/           # Rutas: index, about, services, gallery, courses, contact
│   ├── components/      # Layout, home, gallery
│   ├── composables/     # useGallery, useLocaleArray
│   ├── layouts/         # default.vue
│   └── assets/css/      # Estilos globales
├── i18n/locales/        # es.json, en.json, fr.json
├── public/
│   ├── logo-inesa.png   # Logo transparente (favicon + branding)
│   └── images/gallery/  # 118 fotos del instituto
├── shared/
│   ├── data/            # gallery.ts, courses.ts
│   └── types/           # Tipos TypeScript
└── nuxt.config.ts
```

## Contacto

- **Email:** yamilaec@yahoo.com
- **Ubicación:** Houston, TX, USA

## Licencia

Proyecto privado de INESA~C.A. Todos los derechos reservados.

---

<p align="center">
  <img src="public/logo-inesa.png" alt="INESA" width="120" /><br />
  <em>Excelencia en evaluación sensorial y ciencia del consumidor</em>
</p>