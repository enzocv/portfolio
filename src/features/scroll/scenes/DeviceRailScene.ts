import type { ScrollScene } from '../domain/ScrollScene';
import { lerp, segment, smoothstep } from '../shared/easing';

interface Frame {
  width: number;
  height: number;
  radius: number;
}

/**
 * Proyectos: un único marco recorre los proyectos en horizontal y cambia de
 * forma según el tipo (`data-kind="phone" | "browser"`).
 */
export class DeviceRailScene implements ScrollScene {
  private readonly wrap: HTMLElement;
  private readonly device: HTMLElement;
  private readonly strip: HTMLElement;
  private readonly bar: HTMLElement;
  private readonly notch: HTMLElement;
  private readonly counter: HTMLElement;
  private readonly progress: HTMLElement;
  private readonly items: HTMLElement[];
  private readonly kinds: number[];
  private phone: Frame = { width: 260, height: 520, radius: 38 };
  private browser: Frame = { width: 620, height: 400, radius: 14 };
  private lastIndex = -1;

  constructor(readonly root: HTMLElement) {
    const q = (sel: string) => root.querySelector<HTMLElement>(sel)!;
    this.wrap = q('[data-rail-wrap]');
    this.device = q('[data-rail-device]');
    this.strip = q('[data-rail-strip]');
    this.bar = q('[data-rail-bar]');
    this.notch = q('[data-rail-notch]');
    this.counter = q('[data-rail-counter]');
    this.progress = q('[data-rail-progress]');
    this.items = [...root.querySelectorAll<HTMLElement>('[data-rail-item]')];
    this.kinds = this.items.map((item) => (item.dataset.kind === 'browser' ? 1 : 0));
  }

  measure(): void {
    const w = this.wrap.clientWidth;
    const h = this.wrap.clientHeight;
    const phoneHeight = Math.max(260, Math.min(540, h * 0.94));
    this.phone = { width: phoneHeight * 0.5, height: phoneHeight, radius: phoneHeight * 0.075 };
    const browserWidth = Math.min(680, w * 0.98);
    this.browser = { width: browserWidth, height: Math.min(browserWidth * 0.64, h * 0.86), radius: 14 };
  }

  update(p: number): void {
    const steps = Math.max(1, this.items.length - 1);
    const travel = segment(p, 0.04, 0.92) * steps;
    const from = Math.min(steps - 1, Math.floor(travel));
    const local = smoothstep(0.25, 0.75, travel - from);
    const position = this.items.length > 1 ? from + local : 0;
    const to = Math.min(this.items.length - 1, from + 1);
    const browserness = lerp(this.kinds[from] ?? 0, this.kinds[to] ?? 0, local);

    this.device.style.width = `${lerp(this.phone.width, this.browser.width, browserness)}px`;
    this.device.style.height = `${lerp(this.phone.height, this.browser.height, browserness)}px`;
    this.device.style.borderRadius = `${lerp(this.phone.radius, this.browser.radius, browserness)}px`;
    this.bar.style.opacity = String(smoothstep(0.5, 0.9, browserness));
    this.notch.style.opacity = String(1 - smoothstep(0.1, 0.5, browserness));
    this.strip.style.transform = `translateX(${(-position * 100) / this.items.length}%)`;
    this.progress.style.transform = `scaleX(${p})`;

    this.activate(Math.round(position));
  }

  private activate(index: number): void {
    if (index === this.lastIndex) return;
    this.lastIndex = index;
    this.items.forEach((item, i) => {
      const active = i === index;
      item.classList.toggle('is-active', active);
      item.toggleAttribute('inert', !active);
    });
    this.counter.textContent = String(index + 1).padStart(2, '0');
  }
}
