import type { FeaturedRepo } from '../features/projects/domain/Project';

// Repos a destacar: agrega, quita o reordena entradas para cambiar qué se muestra.
// `kind` decide la forma del marco: 'Mobile' = teléfono, 'Web' = navegador.
export const FEATURED_REPOS: readonly FeaturedRepo[] = [
  { repo: 'enzocv/fintrack', kind: 'Mobile' },
  { repo: 'enzocv/hotelv2', kind: 'Web' },
  { repo: 'enzocv/babymind', kind: 'Mobile' },
];
