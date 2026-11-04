import type { ScrollScene } from '../domain/ScrollScene';
import { easeInOutCubic, lerp, segment } from '../shared/easing';
import { renderTyped, typedLength, type TypedToken } from '../shared/typewriter';

/** Caracteres visibles desde el primer frame, para que la terminal nunca esté vacía. */
export const BOOT_MIN_CHARS = 48;

/**
 * Hero: una terminal escribe los comandos de build y luego se expande con
 * `clip-path` hasta convertirse en la portada.
 */
export class BootScene implements ScrollScene {
  private readonly stage: HTMLElement;
  private readonly term: HTMLElement;
  private readonly text: HTMLElement;
  private readonly hero: HTMLElement;
  private readonly content: HTMLElement;
  private readonly name: HTMLElement;
  private readonly total: number;
  private inset = { top: 0, right: 0, bottom: 0, left: 0 };
  private lastChars = -1;

  constructor(
    readonly root: HTMLElement,
    private readonly tokens: readonly TypedToken[],
  ) {
    const q = (sel: string) => root.querySelector<HTMLElement>(sel)!;
    this.stage = q('[data-stage]');
    this.term = q('[data-boot-term]');
    this.text = q('[data-boot-text]');
    this.hero = q('[data-boot-hero]');
    this.content = q('[data-boot-content]');
    this.name = q('[data-boot-name]');
    this.total = typedLength(tokens);
  }

  measure(): void {
    const s = this.stage.getBoundingClientRect();
    const t = this.term.getBoundingClientRect();
    this.inset = {
      top: t.top - s.top,
      right: s.right - t.right,
      bottom: s.bottom - t.bottom,
      left: t.left - s.left,
    };
  }

  update(p: number): void {
    this.type(Math.max(BOOT_MIN_CHARS, Math.round(this.total * segment(p, 0, 0.5))));

    const open = easeInOutCubic(segment(p, 0.55, 0.8));
    const k = 1 - open;
    const { top, right, bottom, left } = this.inset;
    this.hero.style.clipPath =
      p < 0.55
        ? 'inset(50% 50% 50% 50%)'
        : `inset(${top * k}px ${right * k}px ${bottom * k}px ${left * k}px round ${14 * k}px)`;

    this.term.style.opacity = String(1 - segment(p, 0.74, 0.82));

    const reveal = segment(p, 0.64, 0.86);
    this.content.style.opacity = String(reveal);
    this.content.style.transform = `translateY(${(1 - reveal) * 30}px)`;

    const maxWidth = window.innerWidth < 640 ? 100 : 128;
    this.name.style.setProperty('--wdth', lerp(55, maxWidth, easeInOutCubic(segment(p, 0.7, 1))).toFixed(1));
  }

  private type(chars: number): void {
    if (chars === this.lastChars) return;
    this.lastChars = chars;
    this.text.innerHTML = renderTyped(this.tokens, chars);
  }
}
