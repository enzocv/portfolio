import { SceneDirector } from './application/SceneDirector';
import type { ScrollScene } from './domain/ScrollScene';
import { ViewportProgressSource } from './infrastructure/ViewportProgressSource';

/**
 * Composition root del módulo de scroll. El script inline del layout agrega
 * `html.motion` cuando el usuario no pidió reducir el movimiento.
 */
let director: SceneDirector | undefined;

function getDirector(): SceneDirector {
  if (!director) {
    const animated = document.documentElement.classList.contains('motion');
    director = new SceneDirector(new ViewportProgressSource(window), animated);
  }
  return director;
}

/** Busca cada `[data-scene="name"]` y registra la escena que crea `factory`. */
export function mountScenes(name: string, factory: (root: HTMLElement) => ScrollScene): void {
  document
    .querySelectorAll<HTMLElement>(`[data-scene="${name}"]`)
    .forEach((root) => getDirector().register(factory(root)));
}

export type { ScrollScene } from './domain/ScrollScene';
