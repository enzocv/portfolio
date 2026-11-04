import type { ScrollScene } from '../domain/ScrollScene';
import { easeInOutCubic, lerp, segment } from '../shared/easing';

/**
 * Stack: un bloque isométrico de Clean Architecture que se separa en capas
 * y luego resalta cada una junto a su leyenda.
 *
 * Las capas del DOM van de abajo hacia arriba; la leyenda, de arriba hacia abajo.
 */
export class LayersScene implements ScrollScene {
  private readonly iso: HTMLElement;
  private readonly layers: HTMLElement[];
  private readonly legend: HTMLElement[];

  constructor(readonly root: HTMLElement) {
    this.iso = root.querySelector<HTMLElement>('[data-layers-iso]')!;
    this.layers = [...root.querySelectorAll<HTMLElement>('[data-layer]')];
    this.legend = [...root.querySelectorAll<HTMLElement>('[data-layer-legend]')];
  }

  update(p: number): void {
    const count = this.layers.length;
    const explode = easeInOutCubic(segment(p, 0, 0.35));
    const active = p < 0.38 ? -1 : Math.min(count - 1, Math.floor(segment(p, 0.38, 0.98) * count));
    this.draw(explode, active);
  }

  renderStatic(): void {
    this.draw(1, -1);
  }

  private draw(explode: number, active: number): void {
    const size = this.iso.clientWidth;
    const gap = lerp(size * 0.035, size * 0.3, explode);
    const count = this.layers.length;

    this.layers.forEach((layer, i) => {
      const legendIndex = count - 1 - i;
      const isActive = legendIndex === active;
      layer.style.setProperty('--z', `${i * gap + (isActive ? size * 0.08 : 0)}px`);
      layer.classList.toggle('is-active', isActive);
    });
    this.legend.forEach((item, i) => item.classList.toggle('is-active', i === active));
    this.iso.style.setProperty('--lift', `${gap * ((count - 1) / 2) * 0.8}px`);
  }
}
