import type { ScrollScene } from '../domain/ScrollScene';
import { easeInOutCubic, segment } from '../shared/easing';
import { renderTyped, typedLength, type TypedToken } from '../shared/typewriter';

const MIN_CHARS = 36;

/**
 * Contacto: el scroll escribe un request HTTP y, al terminar, aparece la
 * respuesta `201 Created` con los datos de contacto.
 */
export class RequestScene implements ScrollScene {
  private readonly output: HTMLElement;
  private readonly response: HTMLElement;
  private readonly total: number;
  private lastChars = -1;

  constructor(
    readonly root: HTMLElement,
    private readonly tokens: readonly TypedToken[],
  ) {
    this.output = root.querySelector<HTMLElement>('[data-request-text]')!;
    this.response = root.querySelector<HTMLElement>('[data-request-response]')!;
    this.total = typedLength(tokens);
  }

  update(p: number): void {
    const chars = Math.max(MIN_CHARS, Math.round(this.total * segment(p, 0.02, 0.6)));
    if (chars !== this.lastChars) {
      this.lastChars = chars;
      const cursor = chars < this.total ? '<span class="cursor"></span>' : '';
      this.output.innerHTML = renderTyped(this.tokens, chars) + cursor;
    }

    const reveal = easeInOutCubic(segment(p, 0.64, 0.82));
    this.response.style.opacity = String(reveal);
    this.response.style.transform = `translateY(${(1 - reveal) * 24}px)`;
    this.response.toggleAttribute('inert', reveal < 0.5);
  }
}
