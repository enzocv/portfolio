/**
 * Una escena ligada al scroll. Solo sabe dibujarse a partir de un progreso
 * normalizado (0 → 1); no sabe cómo se calcula ese progreso ni cuándo.
 */
export interface ScrollScene {
  /** Elemento `.scene` cuya altura define la duración de la escena. */
  readonly root: HTMLElement;

  /** Dibuja la escena para un progreso entre 0 y 1. */
  update(progress: number): void;

  /** Recalcula medidas que dependen del tamaño del viewport. */
  measure?(): void;

  /**
   * Prepara la versión estática (sin animación), usada con
   * `prefers-reduced-motion`. El layout estático lo resuelve el CSS;
   * aquí solo se completa lo que necesita JS (por ejemplo, trazos SVG).
   */
  renderStatic?(): void;
}
