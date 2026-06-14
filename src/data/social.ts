// Punto único de configuración para enlaces y datos reutilizados en todo el portfolio.
// Actualiza estos valores cuando tengas tus URLs reales y tu CV en PDF.

import { withBase } from '../utils/paths';

export const SOCIAL_LINKS = {
  github: '#',
  linkedin: '#',
  email: 'enzocv96@gmail.com',
};

// Coloca tu CV en /public con este nombre para que el botón "CV" del navbar funcione.
export const RESUME_PATH = withBase('/cv-enzo-catalan.pdf');
