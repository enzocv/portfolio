import type { FeaturedRepo } from '../features/projects/domain/Project';

// Repos fijos, en este orden. `kind` decide la forma del marco: 'Mobile' = teléfono, 'Web' = navegador.
export const FEATURED_REPOS: readonly FeaturedRepo[] = [
  { repo: 'enzocv/fintrack', kind: 'Mobile' },
  { repo: 'enzocv/hotelv2', kind: 'Web' },
  { repo: 'enzocv/babymind', kind: 'Mobile' },
];

export const PROJECTS_SETTINGS = {
  featured: FEATURED_REPOS,
  // Después de los fijos se agregan TODOS los repos a los que tiene acceso GH_REPOS_TOKEN
  // (sin forks ni archivados), del más reciente al más antiguo.
  // Para mostrar uno nuevo, dale acceso en el token; para ocultarlo, agrégalo a `exclude`.
  // Si algún día quieres un tope, agrega por ejemplo `maxProjects: 8`.
  discover: true,
  exclude: ['enzocv/portfolio'],
} as const;
