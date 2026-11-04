/**
 * Fuente del progreso de scroll. Abstrae el cálculo para poder cambiar la
 * implementación (cálculo nativo, GSAP ScrollTrigger, Lenis…) sin tocar
 * las escenas ni el director.
 */
export interface ProgressSource {
  /** Progreso 0 → 1 del elemento mientras su escenario está fijo en pantalla. */
  progressOf(el: HTMLElement): number;

  /** Indica si vale la pena redibujar el elemento (está cerca del viewport). */
  isNearViewport(el: HTMLElement): boolean;

  /** Llama a `cb` una vez por frame cuando hubo scroll. Devuelve cómo cancelar. */
  onFrame(cb: () => void): () => void;

  /** Llama a `cb` cuando cambia el tamaño del viewport o cargan las fuentes. */
  onResize(cb: () => void): () => void;
}
