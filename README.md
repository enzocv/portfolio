# Enzo Catalán · Portfolio

Portfolio personal hecho con Astro 6 y Tailwind CSS 4. Se publica en GitHub Pages: <https://enzocv.github.io/portfolio>.

Cada sección es una **escena de scroll**. Su escenario queda fijo (sticky) en pantalla mientras el scroll avanza la animación:

| Sección     | Escena                                                      |
| ----------- | ----------------------------------------------------------- |
| Portada     | Una terminal compila el sitio y se expande hasta ser el hero |
| Sobre mí    | Zoom a través de las letras caladas de "ENZO"               |
| Stack       | Capas de Clean Architecture en 3D que se separan            |
| Proyectos   | Un marco que cambia entre teléfono y navegador              |
| Experiencia | La carrera dibujada como `git log`                          |
| Servicios   | Corte diagonal entre la vista dev y la vista cliente        |
| Contacto    | Un request `POST` que responde `201 Created`                |

Con `prefers-reduced-motion` (o sin JavaScript) cada escena se muestra en su estado final, en una pantalla.

## Arquitectura

```text
src/
├── components/          # Una escena por sección (.astro) + Scene.astro (contenedor sticky)
├── data/                # Contenido editable: experiencia, stack, servicios, proyectos, textos
└── features/
    ├── scroll/
    │   ├── domain/          # ScrollScene y ProgressSource (interfaces)
    │   ├── application/     # SceneDirector: entrega el progreso 0 → 1 a cada escena
    │   ├── infrastructure/  # ViewportProgressSource (cálculo nativo + rAF)
    │   ├── scenes/          # Una clase por escena; solo saben dibujarse con un progreso
    │   └── shared/          # Easing y typewriter (funciones puras)
    ├── projects/            # Repositorio de proyectos (API de GitHub) y caso de uso
    └── experience/          # Conversión de la experiencia a commits de git
```

- **Agregar una escena:** crea una clase que implemente `ScrollScene`, un componente con `<Scene name="...">` y regístrala con `mountScenes`. El director no se modifica.
- **Cambiar el motor de scroll** (por ejemplo, GSAP o Lenis): implementa `ProgressSource`. Las escenas no cambian.

## Contenido

- Proyectos: `src/data/projects.ts`. Primero van los repos de `FEATURED_REPOS` y después, automáticamente, los repos a los que tiene acceso el secreto `GH_REPOS_TOKEN` (sin forks, archivados ni repos sin descripción; máximo `maxProjects`). Para ocultar uno, agrégalo a `exclude`. Si la API falla en local se usan datos mínimos y aparece un aviso; en CI el build falla.
- Imágenes de proyectos: en el build se busca en cada repo un logo o ícono (`app-icon`, `icon`, `logo`…) y una captura (la primera imagen del README o un archivo `screenshot`, `preview`, `cover`…). Se descargan con el token, se optimizan a WebP y se publican en `/projects/`, así funcionan aunque el repo sea privado. Para mostrar una captura, agrega por ejemplo `docs/screenshot.png` al repo.
- Experiencia: `src/data/experience.json`. Un puesto con `"git": { "branch": "..." }` se dibuja como una rama con merge.
- Stack, servicios y textos de las terminales: `src/data/stack.ts`, `src/data/services.ts` y `src/data/scripts.ts`.
- CV: coloca `public/cv-enzo-catalan.pdf` para que funcione el botón del menú.

## Comandos

| Comando           | Acción                                  |
| :---------------- | :-------------------------------------- |
| `npm install`     | Instala dependencias                    |
| `npm run dev`     | Servidor local en `localhost:4321`      |
| `npm run build`   | Genera el sitio en `./dist/`            |
| `npm run preview` | Sirve el build localmente               |
