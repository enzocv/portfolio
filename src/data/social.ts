// Punto único de configuración para enlaces y datos reutilizados en todo el portfolio.

import { withBase } from '../utils/paths';

export const SOCIAL_LINKS = {
  github: 'https://github.com/enzocv',
  linkedin: 'https://www.linkedin.com/in/enzocatalan/',
  email: 'enzocv96@gmail.com',
};

// CVs que descarga el menú. Se generan con `cv/build.py` + `node cv/pdf.cjs` (ver cv/README.md).
export const RESUMES = [
  { lang: 'ES', label: 'Descargar CV (español)', href: withBase('/cv-enzo-catalan.pdf'), file: 'Enzo-Catalan-CV.pdf' },
  { lang: 'EN', label: 'Download CV (English)', href: withBase('/cv-enzo-catalan-en.pdf'), file: 'Enzo-Catalan-Resume.pdf' },
] as const;
