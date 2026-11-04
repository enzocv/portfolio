import type { ScrollScene } from '../domain/ScrollScene';
import { segment } from '../shared/easing';

const SVG_NS = 'http://www.w3.org/2000/svg';

interface Branch {
  path: SVGPathElement;
  length: number;
  /** Fila donde sale de main y fila donde vuelve (merge). */
  from: number;
  to: number;
}

/**
 * Experiencia: un grafo de commits que se dibuja con el scroll. Las filas con
 * `data-lane="1"` forman ramas que salen de la fila anterior y vuelven en la siguiente.
 */
export class GitLogScene implements ScrollScene {
  private readonly body: HTMLElement;
  private readonly svg: SVGSVGElement;
  private readonly main: SVGPathElement;
  private readonly rows: HTMLElement[];
  private readonly dots: SVGCircleElement[];
  private branches: Branch[] = [];
  private mainLength = 0;

  constructor(readonly root: HTMLElement) {
    this.body = root.querySelector<HTMLElement>('[data-git-body]')!;
    this.svg = root.querySelector<SVGSVGElement>('[data-git-svg]')!;
    this.main = root.querySelector<SVGPathElement>('[data-git-main]')!;
    this.rows = [...root.querySelectorAll<HTMLElement>('[data-git-row]')];
    this.dots = this.rows.map((row) => {
      const dot = document.createElementNS(SVG_NS, 'circle');
      dot.setAttribute('r', '6');
      dot.setAttribute('class', `git-dot lane-${row.dataset.lane}`);
      this.svg.appendChild(dot);
      return dot;
    });
  }

  measure(): void {
    const wide = window.innerWidth > 760;
    const lane = (n: number) => (n === 1 ? (wide ? 50 : 40) : wide ? 18 : 14);
    const top = this.body.getBoundingClientRect().top;
    const ys = this.rows.map((row) => {
      const box = row.getBoundingClientRect();
      return box.top - top + Math.min(box.height / 2, 20);
    });

    this.svg.setAttribute('viewBox', `0 0 ${this.svg.clientWidth} ${this.body.clientHeight}`);
    this.main.setAttribute('d', `M${lane(0)} ${ys[0]} V${ys[ys.length - 1]}`);
    this.mainLength = this.main.getTotalLength();
    this.main.style.strokeDasharray = String(this.mainLength);

    this.branches.forEach((b) => b.path.remove());
    this.branches = this.findBranches().map(({ from, to }) => {
      const path = document.createElementNS(SVG_NS, 'path');
      path.setAttribute('class', 'git-branch');
      const [a, b, c, d] = [ys[from], ys[from + 1], ys[to - 1], ys[to]];
      path.setAttribute(
        'd',
        `M${lane(0)} ${a} C${lane(0)} ${(a + b) / 2} ${lane(1)} ${(a + b) / 2} ${lane(1)} ${b} ` +
          `V${c} C${lane(1)} ${(c + d) / 2} ${lane(0)} ${(c + d) / 2} ${lane(0)} ${d}`,
      );
      this.svg.insertBefore(path, this.dots[0]);
      const length = path.getTotalLength();
      path.style.strokeDasharray = String(length);
      return { path, length, from, to };
    });

    this.dots.forEach((dot, i) => {
      dot.setAttribute('cx', String(lane(Number(this.rows[i].dataset.lane))));
      dot.setAttribute('cy', String(ys[i]));
    });
  }

  update(p: number): void {
    this.draw(segment(p, 0.04, 0.9) * (this.rows.length - 1));
  }

  renderStatic(): void {
    this.draw(this.rows.length - 1);
  }

  private draw(cursor: number): void {
    const last = this.rows.length - 1;
    this.main.style.strokeDashoffset = String(this.mainLength * (1 - cursor / last));
    for (const b of this.branches) {
      b.path.style.strokeDashoffset = String(b.length * (1 - segment(cursor, b.from, b.to)));
    }

    const head = Math.floor(cursor + 0.001);
    this.rows.forEach((row, i) => {
      row.classList.toggle('is-on', i <= head);
      row.classList.toggle('is-head', i === head);
    });
    this.dots.forEach((dot, i) => {
      dot.classList.toggle('is-on', i <= head);
      dot.classList.toggle('is-hidden', i > head + 1);
    });
  }

  /** Tramos consecutivos de filas en el carril 1, con la fila de salida y la de merge. */
  private findBranches(): Array<{ from: number; to: number }> {
    const result: Array<{ from: number; to: number }> = [];
    let start = -1;
    this.rows.forEach((row, i) => {
      const onBranch = row.dataset.lane === '1';
      if (onBranch && start < 0) start = i;
      if (!onBranch && start >= 0) {
        result.push({ from: Math.max(0, start - 1), to: i });
        start = -1;
      }
    });
    return result;
  }
}
