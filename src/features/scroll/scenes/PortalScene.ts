import type { ScrollScene } from '../domain/ScrollScene';
import { easeInOutCubic, lerp, segment } from '../shared/easing';

/** Escala final del zoom: suficiente para que un trazo de la letra cubra la pantalla. */
const MAX_SCALE = 160;

/**
 * Sobre mí: el nombre está calado sobre la escena siguiente. El scroll hace
 * zoom hacia el trazo vertical de la primera letra hasta atravesarla.
 */
export class PortalScene implements ScrollScene {
  private readonly svg: SVGSVGElement;
  private readonly word: SVGTextElement;
  private readonly copy: HTMLElement;
  private target = { x: 0, y: 0 };

  constructor(readonly root: HTMLElement) {
    this.svg = root.querySelector<SVGSVGElement>('[data-portal-mask]')!;
    this.word = root.querySelector<SVGTextElement>('[data-portal-word]')!;
    this.copy = root.querySelector<HTMLElement>('[data-portal-copy]')!;
  }

  measure(): void {
    const w = this.svg.clientWidth;
    const h = this.svg.clientHeight;
    const fontSize = Math.min(w * 0.3, h * 0.55);
    this.svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    this.word.setAttribute('x', String(w / 2));
    this.word.setAttribute('y', String(h / 2));
    this.word.setAttribute('font-size', String(fontSize));
    this.word.removeAttribute('transform');

    // Punto de destino: el trazo vertical de la primera letra.
    const fallback = { x: w / 2 - fontSize * 1.05, y: h / 2 };
    try {
      const box = this.word.getExtentOfChar(0);
      this.target = box.width > 0 ? { x: box.x + box.width * 0.2, y: box.y + box.height / 2 } : fallback;
    } catch {
      this.target = fallback;
    }
  }

  update(p: number): void {
    const zoom = easeInOutCubic(segment(p, 0.08, 0.72));
    const scale = Math.exp(lerp(0, Math.log(MAX_SCALE), zoom));
    const { x, y } = this.target;
    this.word.setAttribute('transform', `translate(${x} ${y}) scale(${scale}) translate(${-x} ${-y})`);
    this.svg.style.opacity = String(1 - segment(p, 0.66, 0.74));

    const reveal = easeInOutCubic(segment(p, 0.62, 0.9));
    this.copy.style.opacity = String(reveal);
    this.copy.style.transform = `translateY(${(1 - reveal) * 30}px)`;
  }
}
