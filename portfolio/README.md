# PACS Portfolio — Infraestructura d'Imatge Mèdica Clínica

Portfolio estàtic de projectes d'infraestructura PACS. Cada projecte documenta l'arquitectura, les decisions tècniques i els trade-offs perquè un altre sysadmin pugui aprendre com es va construir.

## Requisits

- [Node.js](https://nodejs.org/) ≥ 18 (recomanat: última LTS)
- npm (inclòs amb Node.js)

## Instal·lació i arrencada

```bash
# 1. Instal·la dependències
npm install

# 2. Arrenca el servidor de desenvolupament
npm run dev

# 3. Construeix per a producció (genera fitxers estàtics a dist/)
npm run build

# 4. Preview de la build de producció
npm run preview
```

## Estructura del projecte

```
portfolio/
├── astro.config.mjs          # Configuració d'Astro (MDX + React + Tailwind)
├── tsconfig.json              # TypeScript strict mode amb path aliases
├── package.json
├── public/
│   └── favicon.svg
└── src/
    ├── content.config.ts      # Definició de Content Collections + Zod schema
    ├── styles/
    │   └── global.css         # Tailwind + Tokyo Night design tokens
    ├── layouts/
    │   ├── BaseLayout.astro   # HTML shell (fonts, nav, footer)
    │   └── ProjectLayout.astro # Detall de projecte (sidebar TOC + scroll-spy)
    ├── components/
    │   ├── mdx/               # Components reutilitzables per a MDX
    │   │   ├── Callout.astro       # Notes/avisos (info, warning, danger, etc.)
    │   │   ├── SpecTable.astro     # Taules de ports/especificacions
    │   │   ├── DecisionLog.astro   # Registre de decisions Q&A
    │   │   ├── Accordion.astro     # Secció col·lapsable (zero JS, <details>)
    │   │   └── StatusBadge.astro   # Badge d'estat del projecte
    │   └── islands/           # Components React interactius (client:visible)
    │       └── DosenseFlowSimulation.tsx
    ├── content/
    │   └── projects/
    │       └── dosense/
    │           └── index.mdx  # Primer projecte (contingut complet)
    └── pages/
        ├── index.astro        # Home — grid de projectes
        └── projects/
            └── [slug].astro   # Ruta dinàmica per projectes
```

## Com afegir un nou projecte

### Pas 1: Crea el directori

```bash
mkdir src/content/projects/NOM-DEL-PROJECTE
```

### Pas 2: Crea `index.mdx`

Crea `src/content/projects/NOM-DEL-PROJECTE/index.mdx` amb el frontmatter obligatori:

```mdx
---
title: "Títol del projecte"
slug: "nom-del-projecte"
summary: "Descripció d'una línia per a la card de la home."
status: "desplegament"       # planificació | desplegament | producció | completat | arxivat
dateUpdated: "2026-07-07"    # ISO date
techStack: ["Docker", "MongoDB", "DICOM"]
tags: ["PACS", "contenidors"]
---

import Callout from "../../../components/mdx/Callout.astro";
import SpecTable from "../../../components/mdx/SpecTable.astro";
import DecisionLog from "../../../components/mdx/DecisionLog.astro";
import Accordion from "../../../components/mdx/Accordion.astro";

## Primera secció tècnica

Contingut del projecte...

<Callout type="info" title="Nota important">
  Text de la nota.
</Callout>

<SpecTable
  title="Ports"
  headers={["Port", "Servei", "Notes"]}
  rows={[
    ["104", "DICOM", "Receptor"],
    ["27017", "MongoDB", "Base de dades"],
  ]}
/>

<DecisionLog
  title="Q&A amb el proveïdor"
  entries={[
    { q: "Pregunta?", a: "Resposta." },
  ]}
/>

<Accordion title="Detalls opcionals">
  Contingut col·lapsat per defecte.
</Accordion>
```

### Pas 3: Afegeix un island interactiu (opcional)

1. Crea un component React a `src/components/islands/NomComponent.tsx`.
2. Importa'l al teu MDX:
   ```mdx
   import NomComponent from "../../../components/islands/NomComponent.tsx";
   
   <NomComponent client:visible />
   ```
   El `client:visible` fa que React només es carregui quan el component és visible al viewport.

### Pas 4: Verifica

```bash
npm run dev
```
El nou projecte apareixerà automàticament a la home i tindrà la seva pròpia URL a `/projects/nom-del-projecte`.

## Components MDX disponibles

| Component | Ús | Props |
|---|---|---|
| `Callout` | Notes/avisos | `type` (info\|warning\|danger\|success\|note), `title` |
| `SpecTable` | Taules d'especificacions | `title`, `headers` (string[]), `rows` (string[][]) |
| `DecisionLog` | Registre Q&A/decisions | `title`, `entries` ({q, a}[]) |
| `Accordion` | Secció col·lapsable | `title`, `open` (boolean, default false) |
| `StatusBadge` | Badge d'estat | `status` |

## Design system — Tokyo Night

Paleta exposada com a CSS custom properties i tokens de Tailwind:

| Token | Color | Ús |
|---|---|---|
| `--color-bg` | #1a1b26 | Fons principal |
| `--color-surface` | #24283b | Cards, sidebars |
| `--color-border` | #363b54 | Bordes |
| `--color-text` | #c0caf5 | Text principal |
| `--color-text-muted` | #565f89 | Text secundari |
| `--color-cyan` | #7dcfff | Accents, enllaços |
| `--color-purple` | #bb9af7 | Headings, accents |
| `--color-green` | #9ece6a | Èxit, confirmacions |
| `--color-yellow` | #e0af68 | Advertències |
| `--color-red` | #f7768e | Errors, perill |

**Fonts:** JetBrains Mono (codi/labels tècnics), Space Grotesk (headings), Inter (cos).

## Desplegament

Genera els fitxers estàtics:

```bash
npm run build
```

El directori `dist/` conté el site complet. Puja'l a qualsevol hosting estàtic:
- **GitHub Pages:** Puja `dist/` o configura una GitHub Action.
- **Netlify/Vercel:** Connecta el repo i configura `npm run build` com a build command, `dist` com a publish directory.
- **Servei estàtic intern:** Copia `dist/` a qualsevol servidor web (nginx, Apache, IIS).

## Stack

- **Astro 5** — Framework de sites estàtics, islands architecture, zero JS per defecte.
- **TypeScript** — Strict mode, type-safe content collections.
- **Tailwind CSS 4** — Utilitats CSS amb tokens personalitzats.
- **MDX** — Markdown + components JSX per a contingut ric.
- **React 19** — Només per a islands interactius (hydrate on visible).
- **Zod** — Validació de frontmatter a les content collections.
