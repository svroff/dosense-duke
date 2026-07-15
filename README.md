# DSI · PACS

Portfolio de projectes d'infraestructura PACS del DSI de l'Hospital Clínic de Barcelona. Cada projecte documenta l'arquitectura, les decisions tècniques i els trade-offs perquè un altre sysadmin pugui aprendre com es va construir.

**El lloc web viu a [`portfolio/`](portfolio/)** — és un projecte Astro independent amb el seu propi `README` (instal·lació, estructura, com afegir un nou projecte, sistema de disseny). Comença per allà si vols córrer el lloc en local o afegir contingut.

## Estructura d'aquest repositori

```
.
├── portfolio/                          # El lloc — codi font, veure el seu README
├── design_handoff_dosense_frontend/    # Handoff de disseny original (referència històrica,
│                                        # ja implementat — no calen accions addicionals)
├── proyecto_esi_duke_ct_complet_CA.md  # Notes font en català del projecte Dosense, base del
│                                        # contingut de src/content/projects/dosense/index.mdx
└── .github/workflows/deploy.yml        # CI: build + desplegament a GitHub Pages a cada push a main
```

## Desplegament

Cada push a `main` dispara el workflow de GitHub Actions (`.github/workflows/deploy.yml`), que construeix `portfolio/` amb Astro i publica `dist/` a GitHub Pages. No cal cap pas manual.
