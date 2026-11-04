import type { ScrollScene } from '../domain/ScrollScene';
import { easeInOutCubic, lerp, segment } from '../shared/easing';

/**
 * Servicios: un corte diagonal pasa de la vista "dev" (código) a la vista
 * "cliente" con el mismo layout, como una traducción línea por línea.
 */
export class DualViewScene implements ScrollScene {
  private readonly client: HTMLElement;
  private readonly devLabel: HTMLElement;
  private readonly clientLabel: HTMLElement;

  constructor(readonly root: HTMLElement) {
    this.client = root.querySelector<HTMLElement>('[data-dual-client]')!;
    this.devLabel = root.querySelector<HTMLElement>('[data-dual-mode="dev"]')!;
    this.clientLabel = root.querySelector<HTMLElement>('[data-dual-mode="client"]')!;
  }

  update(p: number): void {
    const wipe = easeInOutCubic(segment(p, 0.18, 0.78));
    const x = lerp(125, -5, wipe);
    this.client.style.clipPath = `polygon(${x}% 0, 100% 0, 100% 100%, ${x - 20}% 100%)`;

    const showingClient = wipe > 0.5;
    this.devLabel.classList.toggle('is-active', !showingClient);
    this.clientLabel.classList.toggle('is-active', showingClient);
    this.client.toggleAttribute('inert', !showingClient);
  }
}
