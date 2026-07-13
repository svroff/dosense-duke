# Handoff: Dosense PACS Portfolio + Live Monitor

## Overview
Front end complet per al portfolio d'infraestructura PACS de l'Hospital Clínic de Barcelona, en l'estil "Monitor Phosphor" (tema fosc, accent ambre, tipografia mono/display). Inclou dues peces:

1. **Portfolio** — Home (hero + graella de projectes) i pàgina de detall del projecte Dosense (TOC lateral + documentació tècnica: arquitectura, specs VM, flux DICOM, discos, seguretat, Q&A, riscos, pròxims passos).
2. **Monitor en viu** — consola de monitorització del desplegament (KPIs, pipeline DICOM animat, estat de contenidors, discos, mapa de ports, consola de log).

## About the Design Files
Els fitxers `.dc.html` d'aquest paquet són **referències de disseny fetes en HTML** — prototips que mostren l'aspecte i el comportament previstos, **no codi de producció per copiar directament**. La tasca és **recrear aquests dissenys dins del codebase existent** (l'Astro portfolio que ja teniu: `Dosense/portfolio/`), fent servir els seus patrons establerts.

**Aquest projecte JA té entorn**: Astro 5 + Tailwind CSS 4 + MDX + React 19 (islands) + TypeScript strict + Zod content collections. **No cal triar framework** — recreeu el disseny amb aquests patrons:
- Home → `src/pages/index.astro`
- Detall projecte → `src/layouts/ProjectLayout.astro` + `src/content/projects/dosense/index.mdx`
- Monitor en viu → nou React island a `src/components/islands/` (com `DosenseFlowSimulation.tsx`), muntat amb `client:visible`, o una nova pàgina `src/pages/monitor.astro`.
- Tokens de color → ja existeixen a `src/styles/global.css` (`@theme` block).

## Fidelity
**High-fidelity (hifi)**. Colors, tipografia, espaiat i interaccions són finals. Recreeu la UI amb precisió fent servir les utilitats de Tailwind i els tokens del `@theme` que ja teniu. Els valors exactes són a sota.

⚠️ **Nota important sobre el naming de tokens**: al `global.css` actual els noms de token NO coincideixen amb el color real (herència del tema "Tokyo Night"). Per exemple `--color-cyan` val `#e8a33d` (ambre), `--color-purple` val `#4f8a8b` (teal). El disseny fa servir noms semàntics nous (`--amber`, `--teal`). En implementar, o bé (a) renombreu els tokens del `@theme` a `--color-amber` / `--color-teal` / etc., o bé (b) mapejeu: amber→`cyan`, teal→`purple`. Recomanat (a) per claredat.

---

## Design Tokens

### Colors (tema 1a — Monitor Phosphor, fosc)
| Token disseny | Hex | Ús |
|---|---|---|
| `--bg` | `#0b0d0e` | Fons de pàgina (warm near-black) |
| `--surface` | `#15181a` | Cards, panells |
| `--surface2` | `#101315` | Panells recessed, nodes, log console |
| `--border` | `#2a2f32` | Bordes 1px |
| `--text` | `#e9e6df` | Text principal |
| `--muted` | `#7d8790` | Text secundari, labels |
| `--amber` | `#e8a33d` | Accent primari, enllaços, actiu |
| `--teal` | `#5aa9aa` | Accent secundari, hover d'enllaç |
| `--green` | `#7bb05f` | Estat OK / RUNNING |
| `--yellow` | `#c79f45` | Advertència |
| `--red` | `#c85f5a` | Error / risc / perill |
| `--track` | `#20252a` | Fons de barres de progrés |

Fons neutre del canvas (només al fitxer d'opcions, no a producció): `#d7d3c7`.

### Colors (tema 1b — variant clara, NO seleccionada)
Descartada pel client. Es conserva al fitxer `Dosense Monitor.dc.html` com a segona opció per si es vol un mode clar més endavant: `--bg:#eceae3; --surface:#ffffff; --surface2:#f6f4ee; --border:#dcd8cc; --text:#26241e; --muted:#8a8578; --amber:#b3701a; --teal:#2f6f70; --green:#4d7a37; --yellow:#946f1f; --red:#b0433d; --track:#e6e1d5;`

### Typography
- **Display / headings**: `Space Grotesk`, weights 500/600/700.
- **Body**: `Inter`, weights 400/500/600. `line-height: 1.7`.
- **Mono / labels tècnics**: `JetBrains Mono`, weights 400/500/600.
- Càrrega: Google Fonts (`family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&family=Space+Grotesk:wght@500;600;700`).

Escala tipogràfica (px):
| Rol | Mida / weight / família |
|---|---|
| Hero H1 | 58px / 700 / Space Grotesk, `letter-spacing:-.01em`, `line-height:1.1` |
| Detall H1 | 42px / 700 / Space Grotesk |
| H2 secció | 28px / 600 / Space Grotesk, color `--amber`, `border-bottom:1px --border`, `padding-bottom:10px` |
| Card títol | 17–26px / 600 / Space Grotesk |
| KPI número | 42px / 700 / Space Grotesk |
| Body | 15–19px / 400 / Inter |
| Label mono | 11–12px / 500 / JetBrains Mono, `letter-spacing:.12–.16em`, `text-transform:uppercase` |

### Spacing & shape
- Radius: cards grans 16–18px, cards mitjanes 10–12px, chips/badges 5–6px, pills 20px, punts 50%.
- Max-width contingut: `1200px`, centrat, padding lateral `40px`.
- Bordes: sempre `1px solid var(--border)` (excepte nodes del pipeline `1.5px`, callouts `border-left:4px`).
- Grid detall: `grid-template-columns: 240px 1fr; gap: 44px`.

### Animacions (CSS keyframes)
| Nom | Ús | Definició |
|---|---|---|
| `nodeWave` | Onada de llum que recorre els nodes del pipeline | `4.9s linear infinite`; per node `animation-delay` escalonat (~0.82s entre nodes). A 0/18/100% border=`--border` sense ombra; a 5% border=`var(--nc)` + `box-shadow:0 0 0 1px var(--nc), 0 0 26px -6px var(--nc)`. `--nc` = color accent del node. |
| `flowMove` | Guions que flueixen pels connectors | `background:repeating-linear-gradient(90deg,var(--muted) 0 6px,transparent 6px 15px)`, `background-size:15px 100%`, `animation:.7s linear infinite`, `opacity:.45`; keyframe `to{background-position:15px 0}`. |
| `hb` (heartbeat) | Punts d'estat que bateguen | `1.9s ease-in-out infinite`; 0/100% `opacity:1 scale(1)`, 50% `opacity:.35 scale(.7)`. |
| `blink` | Cursor de la consola de log | `1.1s step-end infinite`; 0/100% `opacity:1`, 50% `opacity:0`. |
| `riskGlow` | Barra de disc "Dades" (risc #1) | `2.2s ease-in-out infinite`; 50% `box-shadow:0 0 14px -2px var(--amber)`. |
- Hover cards de projecte: `transition:border-color .2s, background .2s, transform .2s`; hover → border ambre 55%, `background:--surface`, `translateY(-2px)`.

---

## Screens / Views

### 1. Home (`index.astro`)
- **Purpose**: entrada del portfolio; llistar projectes d'infraestructura.
- **Layout** (dins max-width 1200, padding 80px 40px 40px):
  - **Nav sticky** (top:0, z:50): `border-bottom 1px`, fons `color-mix(--bg 82%, transparent)` + `backdrop-filter:blur(10px)`. Esquerra: punt ambre amb glow + wordmark mono `~/pacs-portfolio`. Dreta: enllaços `Projectes`, `Dosense`, `Monitor en viu ↗`, `GitHub ↗` (14px, color `--muted`, hover `--amber`).
  - **Hero** (max-width 820): eyebrow mono teal en majúscules → H1 58px amb "PACS" en `--amber` → paràgraf 19px `--muted`.
  - **Stats strip**: 4 pills flex (gap 14px) `border 1px`, `background --surface2`, radius 10px, padding 12px 18px. Número 24px/700 Space Grotesk + label mono 11px uppercase. Valors: `1 projecte actiu`, `3 contenidors`, `200 estudis CT/dia`, `Fase 1 EuroSafe × Duke` (aquest número amb `white-space:nowrap`).
  - **Graella de projectes**: `grid 1.6fr 1fr, gap 20px`. Card destacada (enllaç a #projecte-dosense) + card placeholder amb `border:1px dashed`.
- **Card projecte destacada**: títol 26px, badge d'estat "desplegament" (pill ambre amb punt `hb`), paràgraf `--muted`, chips de stack (mono teal, border, fons `--bg`), CTA "Veure projecte →" ambre.
- **Footer**: `border-top`, text mono 12px centrat `--muted`.

### 2. Detall del projecte Dosense (`ProjectLayout.astro` + `dosense.mdx`)
- **Purpose**: documentació tècnica completa del desplegament.
- **Layout**: `grid 240px 1fr, gap 44px`, padding 56px 40px, `border-top` respecte a Home.
  - **Aside TOC** (`position:sticky; top:92px`): label "Contingut" mono → 9 enllaços amb `border-left:2px` (hover ambre). Ancoratge a cada secció (els H2 tenen `scroll-margin-top:92px`).
  - **Article** (min-width:0): header (badge estat + data + H1 42px + summary + chips) i 9 seccions.
- **Seccions** (cada H2 28px ambre amb border-bottom):
  1. **Resum** — 2 paràgrafs + callout teal "Context HCPB".
  2. **Arquitectura** — grid de 3 cards (dcm4chee / Dosense / MongoDB), cadascuna amb eyebrow mono, títol, descripció.
  3. **Especificacions VM** — taula 3 col (`grid 1fr 1fr 2.2fr`) header `--surface2` mono; valors clau en ambre mono.
  4. **Flux de xarxa i DICOM** — panell amb el **pipeline animat** (6 nodes + connectors `flow`) + taula de ports (`grid 1.4fr .8fr 2fr`) + callout teal "Comunicació per disc".
  5. **Discos** — grid 2×2 de cards amb barres de progrés; card "Dades" ressaltada (border ambre + barra `riskGlow`) + callout groc "Risc #1".
  6. **Seguretat i RGPD** — llista amb marcadors ✓ (verd) / ! (vermell) mono.
  7. **Q&A amb Duke** — 4 cards Q/R (P teal, R ambre).
  8. **Riscos operatius** — 4 files numerades (01 vermell, 02–04 groc).
  9. **Pròxims passos** — 5 items amb fletxa teal `→`.
  - Peu: enllaç "← Tornar" + "Obrir monitor en viu ↗".

### 3. Monitor en viu (`Dosense Monitor.dc.html` → nou island/pàgina)
Consola de monitorització del desplegament, amplada de disseny **1440px**. Panell arrel `border-radius:18px`, padding 26px.
- **Top bar**: wordmark DOSENSE + tag "METIS 2" + "HCPB · Hospital Clínic de Barcelona"; a la dreta pill verd "OPERATIU" (punt `hb`) + rellotge en viu (mono 15px, format `ca-ES` 24h, actualitza cada 1s via JS).
- **KPI row**: 4 cards flex — `200` estudis avui, `1.300` estudis/setmana, `~2 min` (ambre) temps/sèrie, `6` estudis en cua.
- **Pipeline** (panell): 7 nodes (Modalitat CT → dcm4chee → Volum compartit → Dosense → MongoDB → Neteja → Exportació CSV) amb `nodeWave` escalonat (`animation-delay` i×0.7s) i connectors `flow`. Cada node té `--nc` (CT ambre, dcm4chee teal, Volum groc, Dosense verd, MongoDB verd, Neteja vermell, CSV teal).
- **3 columnes inferiors**:
  - **Contenidors**: 3 files (dcm4chee RUNNING verd, Dosense PROCESSANT ambre CPU 71%, MongoDB RUNNING verd) amb punt `hb` + CPU/RAM; strip de chips `6 vCPU / 64 GB RAM / SLES`.
  - **Discos**: 4 barres (Sistema 32% verd, Dades 67% ambre + `riskGlow` + "⚠ risc #1", BBDD 4% teal, Logs 2% verd) + nota mono.
  - **Ports + Log**: mapa de ports (104 ENTRADA ambre, 27017 INTERN teal, Sortida CAP vermell) + consola de log `--surface2` amb 4 línies (timestamp muted, node acolorit, missatge) i cursor `blink` a l'última.

> NOTA: al portfolio la versió del pipeline té **6 nodes** (sense "Neteja") i delays de ~0.82s; al monitor en té **7** amb delays de 0.7s. Unifiqueu-ho si voleu una sola font de veritat (recomanat un component `<Pipeline>` parametritzat per la llista de nodes).

---

## Interactions & Behavior
- **Navegació**: enllaços d'àncora (`#home`, `#projecte-dosense`, `#sec-*`) amb `scroll-behavior:smooth`. A Astro, Home i detall poden ser dues rutes separades (`/` i `/projects/dosense`) enllaçades amb `<a href>` en lloc d'àncores dins la mateixa pàgina.
- **Monitor en viu**: enllaç `Dosense Monitor.dc.html` → a producció, ruta `/monitor` o secció dins el detall.
- **Rellotge**: `setInterval(…, 1000)` a l'island React (`useEffect` + `useState`), `new Date().toLocaleTimeString('ca-ES',{hour12:false})`. Netejar l'interval a l'unmount.
- **Hover**: cards de projecte (elevació + border ambre), enllaços de nav i TOC (color/border ambre).
- Totes les animacions són decoratives i en loop; no depenen d'estat excepte el rellotge.

## State Management
Mínim. Només el **monitor** necessita estat client: `clock` (string, actualitzat cada segon). El `DosenseFlowSimulation.tsx` existent ja té el patró de play/pause/step/log si voleu una versió interactiva del pipeline en lloc de la purament CSS.

## Assets
Cap imatge ni icona externa. Tots els "icones" són glyphs Unicode/text (`↗ → ← ✓ ⚠ ✎ ▍ ℹ`) i formes CSS (punts, barres). El punt ambre del logo és un `<span>` amb `border-radius:50%` + `box-shadow` glow. `favicon.svg` ja existeix a `public/`.

## Files
Fitxers de disseny inclosos en aquest paquet (referència):
- `Dosense Portfolio.dc.html` — Home + detall del projecte (tema 1a, el seleccionat).
- `Dosense Monitor.dc.html` — monitor en viu; conté **1a (fosc, seleccionat)** i **1b (clar, descartat)** de costat per comparar.

Fitxers del codebase objectiu a modificar/crear:
- `src/styles/global.css` — renombrar/afegir tokens (`--amber`, `--teal`, …).
- `src/pages/index.astro` — Home.
- `src/layouts/ProjectLayout.astro` — layout de detall (TOC + header).
- `src/content/projects/dosense/index.mdx` — contingut de les 9 seccions.
- `src/components/mdx/*` — Callout, SpecTable, DecisionLog, StatusBadge ja existeixen; ajustar estils als tokens finals.
- `src/components/islands/` — nou island per al monitor (o reutilitzar/estendre `DosenseFlowSimulation.tsx`).
