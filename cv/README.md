# CV

Fuente única del CV en español e inglés. Los PDF que descarga el portfolio (`public/cv-enzo-catalan.pdf` y `public/cv-enzo-catalan-en.pdf`) se generan desde aquí.

| Archivo | Qué es |
| --- | --- |
| `cv.es.json` / `cv.en.json` | Contenido del CV (textos, experiencia, habilidades, proyectos). Edita aquí. |
| `build.py` | Genera `out/<archivo>.html` (para el PDF) y `out/<archivo>.docx`. |
| `pdf.cjs` | Convierte cada HTML en PDF con Chromium y copia el PDF a `public/`. |

## Regenerar

Requisitos: Python 3 con `python-docx`, Node con Playwright (Chromium) y la fuente Carlito instalada (`fonts-crosextra-carlito` en Debian/Ubuntu).

```bash
python3 cv/build.py   # HTML + DOCX de todos los cv.*.json
node cv/pdf.cjs       # PDF en cv/out/ y copia en public/
```

## Reglas de formato (para que pase los filtros ATS)

- Una sola columna, sin tablas, imágenes ni íconos; títulos de sección estándar.
- Fuente estática (Carlito): el PDF queda con fuentes TrueType, no Type 3.
- Viñetas como texto (`•`) y fechas numéricas (`08/2025 – Actualidad`).
- Máximo 2 páginas. Verifica con `pdfinfo public/cv-enzo-catalan.pdf`.
- Revisa el texto que lee un ATS con `pdftotext public/cv-enzo-catalan.pdf -`.
- Solo datos reales: nada de cifras ni tecnologías que no puedas defender en una entrevista.
