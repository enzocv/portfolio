import type { TypedToken } from '../features/scroll/shared/typewriter';
import { SOCIAL_LINKS } from './social';

// Textos que las escenas "escriben" con el scroll. `tone` es la clase de color.

export const BOOT_SCRIPT: readonly TypedToken[] = [
  { tone: 'pr', text: '~/enzo $ ' },
  { text: 'git clone github.com/enzocv/portfolio\n' },
  { tone: 'pr', text: '~/enzo $ ' },
  { text: 'cd portfolio && npm install\n' },
  { tone: 'dim', text: 'added 312 packages in 4s\n' },
  { tone: 'pr', text: '~/enzo/portfolio $ ' },
  { text: 'npm run build\n' },
  { tone: 'ok', text: '✓ Hero.astro\n✓ Experience.astro\n✓ Projects.astro\n' },
  { tone: 'pr', text: '~/enzo/portfolio $ ' },
  { text: 'npm run dev\n\n' },
  { tone: 'dim', text: '  astro  ready in 412 ms\n  ➜ Local   ' },
  { tone: 'url', text: 'http://localhost:4321/portfolio' },
];

export const CONTACT_REQUEST: readonly TypedToken[] = [
  { tone: 'key', text: 'POST' },
  { text: ' /api/proyectos HTTP/1.1\n' },
  { tone: 'dim', text: 'Host: enzocv.github.io\nContent-Type: application/json\n\n' },
  { text: '{\n  ' },
  { tone: 'key', text: '"de"' },
  { text: ': "tu-empresa",\n  ' },
  { tone: 'key', text: '"necesito"' },
  { text: ': "app móvil + API",\n  ' },
  { tone: 'key', text: '"stack"' },
  { text: ': ["React Native", "NestJS"],\n  ' },
  { tone: 'key', text: '"inicio"' },
  { text: ': "este mes"\n}' },
];

const handle = (url: string): string => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

export const CONTACT_RESPONSE: readonly TypedToken[] = [
  { tone: 'dim', text: 'HTTP/1.1 ' },
  { tone: 'ok', text: '201 Created\n' },
  { tone: 'dim', text: 'Content-Type: application/json\n\n' },
  { text: '{\n  ' },
  { tone: 'key', text: '"estado"' },
  { text: ': "disponible para proyectos",\n  ' },
  { tone: 'key', text: '"email"' },
  { text: `: "${SOCIAL_LINKS.email}",\n  ` },
  { tone: 'key', text: '"github"' },
  { text: `: "${handle(SOCIAL_LINKS.github)}",\n  ` },
  { tone: 'key', text: '"linkedin"' },
  { text: `: "${handle(SOCIAL_LINKS.linkedin).replace('linkedin.com/', '')}"\n}` },
];
