import type { ProgressSource } from '../domain/ProgressSource';
import { clamp } from '../shared/easing';

/**
 * Implementación nativa: calcula el progreso con `getBoundingClientRect`
 * y agrupa los eventos de scroll en un único `requestAnimationFrame`.
 */
export class ViewportProgressSource implements ProgressSource {
  private readonly frameListeners = new Set<() => void>();
  private queued = false;

  constructor(private readonly win: Window = window) {
    win.addEventListener('scroll', this.request, { passive: true });
  }

  progressOf(el: HTMLElement): number {
    const rect = el.getBoundingClientRect();
    const travel = rect.height - this.win.innerHeight;
    return travel <= 0 ? 0 : clamp(-rect.top / travel);
  }

  isNearViewport(el: HTMLElement): boolean {
    const rect = el.getBoundingClientRect();
    const vh = this.win.innerHeight;
    return rect.bottom > -vh && rect.top < vh * 2;
  }

  onFrame(cb: () => void): () => void {
    this.frameListeners.add(cb);
    return () => this.frameListeners.delete(cb);
  }

  onResize(cb: () => void): () => void {
    let lastWidth = this.win.innerWidth;
    let lastHeight = this.win.innerHeight;
    let timer: ReturnType<typeof setTimeout> | undefined;

    // En móvil la barra de direcciones cambia la altura al hacer scroll:
    // solo se recalcula si el cambio es real (ancho o salto grande de alto).
    const handler = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const w = this.win.innerWidth;
        const h = this.win.innerHeight;
        if (w === lastWidth && Math.abs(h - lastHeight) < 120) return;
        lastWidth = w;
        lastHeight = h;
        cb();
      }, 120);
    };

    this.win.addEventListener('resize', handler);
    this.win.document.fonts?.ready.then(cb);
    return () => this.win.removeEventListener('resize', handler);
  }

  private readonly request = (): void => {
    if (this.queued) return;
    this.queued = true;
    this.win.requestAnimationFrame(() => {
      this.queued = false;
      this.frameListeners.forEach((cb) => cb());
    });
  };
}
