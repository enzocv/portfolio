import { PROJECTS_SETTINGS } from '../../data/projects';
import { loadShowcase, type ShowcaseItem } from './application/loadShowcase';
import { GitHubClient } from './infrastructure/GitHubClient';
import { GitHubMediaSource } from './infrastructure/GitHubMediaSource';
import { GitHubProjectRepository } from './infrastructure/GitHubProjectRepository';
import { SharpImageOptimizer } from './infrastructure/SharpImageOptimizer';

/**
 * Composition root de proyectos. Se memoriza para que la página y el endpoint
 * de imágenes compartan una sola lectura de la API por build.
 */
let showcase: Promise<ShowcaseItem[]> | undefined;

export function getShowcase(): Promise<ShowcaseItem[]> {
  if (!showcase) {
    const token = import.meta.env.GH_REPOS_TOKEN as string | undefined;
    const client = new GitHubClient(token);
    showcase = loadShowcase(
      { ...PROJECTS_SETTINGS, strict: Boolean(token) || import.meta.env.CI === 'true' },
      {
        repository: new GitHubProjectRepository(client),
        media: new GitHubMediaSource(client),
        optimizer: new SharpImageOptimizer(),
      },
    );
  }
  return showcase;
}

/** Ruta pública (sin `base`) de una imagen publicada por `src/pages/projects/[asset].ts`. */
export const mediaPath = (slug: string, kind: 'icon' | 'cover'): string => `/projects/${slug}-${kind}.webp`;

export type { ShowcaseItem } from './application/loadShowcase';
