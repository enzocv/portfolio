import type { ProgressSource } from '../domain/ProgressSource';
import type { ScrollScene } from '../domain/ScrollScene';

interface Entry {
  scene: ScrollScene;
  last: number;
}

/** Diferencia mínima de progreso para volver a dibujar una escena. */
const EPSILON = 0.0005;

/**
 * Coordina las escenas: pide el progreso a la fuente y se lo entrega a cada
 * escena. Agregar una escena nueva no requiere modificar esta clase.
 */
export class SceneDirector {
  private readonly entries: Entry[] = [];
  private started = false;

  constructor(
    private readonly source: ProgressSource,
    private readonly animated: boolean,
  ) {}

  register(scene: ScrollScene): void {
    scene.measure?.();

    if (!this.animated) {
      scene.renderStatic?.();
      return;
    }

    const entry: Entry = { scene, last: -1 };
    this.entries.push(entry);
    this.start();
    this.render(entry);
  }

  private start(): void {
    if (this.started) return;
    this.started = true;

    this.source.onFrame(() => this.renderAll());
    this.source.onResize(() => {
      for (const entry of this.entries) {
        entry.scene.measure?.();
        entry.last = -1;
      }
      this.renderAll();
    });
  }

  private renderAll(): void {
    for (const entry of this.entries) {
      if (this.source.isNearViewport(entry.scene.root)) this.render(entry);
    }
  }

  private render(entry: Entry): void {
    const progress = this.source.progressOf(entry.scene.root);
    if (Math.abs(progress - entry.last) < EPSILON) return;
    entry.last = progress;
    entry.scene.update(progress);
  }
}
