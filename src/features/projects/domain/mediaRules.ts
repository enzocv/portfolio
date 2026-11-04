/**
 * Reglas para elegir imágenes dentro de un repositorio (funciones puras).
 * Reciben rutas de archivos y devuelven la mejor candidata, o `null`.
 */

const RASTER = /\.(png|jpe?g|webp)$/i;
const IGNORED_DIRS = /(^|\/)(node_modules|vendor|dist|build|\.next|coverage|ios\/Pods|android\/app\/build)\//i;
/** Carpetas con logos de terceros (medios de pago, partners…), no del proyecto. */
const THIRD_PARTY_DIRS = /(^|\/)(logos|partners|brands|payments?|sponsors|flags|icons)\//i;

export interface RepoFile {
  readonly path: string;
  readonly size: number;
}

const basename = (path: string) => path.split('/').pop()!.replace(RASTER, '').toLowerCase();
const usable = (file: RepoFile, maxBytes: number) =>
  RASTER.test(file.path) && !IGNORED_DIRS.test(file.path) && file.size > 0 && file.size <= maxBytes;

function best(files: readonly RepoFile[], score: (file: RepoFile) => number): RepoFile | null {
  let winner: RepoFile | null = null;
  let top = 0;
  for (const file of files) {
    const s = score(file);
    if (s > top || (s === top && s > 0 && winner && file.size > winner.size)) {
      winner = file;
      top = s;
    }
  }
  return top > 0 ? winner : null;
}

/** Logo o ícono de la app: `app-icon`, `icon`, `logo`… (no favicons ni logos de terceros). */
export function pickIcon(files: readonly RepoFile[]): RepoFile | null {
  return best(
    files.filter((f) => usable(f, 2_000_000) && !THIRD_PARTY_DIRS.test(f.path)),
    (f) => {
      const name = basename(f.path);
      if (/favicon|splash|background|placeholder/.test(name)) return 0;
      let s = 0;
      if (/^app[-_]?icon/.test(name)) s = 40;
      else if (/^(ic_launcher|icon)(\b|[-_@])/.test(name) || name === 'icon') s = 30;
      else if (/^logo(\b|[-_@])/.test(name) || name === 'logo') s = 25;
      else if (/-icon$|_icon$/.test(name)) s = 15;
      if (s === 0) return 0;
      if (/white|light|mono|negative|inverse/.test(name)) s -= 12; // se pierde sobre fondo claro
      if (/@3x|lg|large|1024|512/.test(name)) s += 3;
      return s;
    },
  );
}

/** Captura del proyecto: `screenshot`, `preview`, `cover`, `og-image`… */
export function pickCover(files: readonly RepoFile[]): RepoFile | null {
  return best(
    files.filter((f) => usable(f, 8_000_000) && f.size > 15_000),
    (f) => {
      const name = basename(f.path);
      if (/^(screenshot|screen[-_]?shot|captura)/.test(name)) return 40;
      if (/^(preview|cover|banner|hero|mockup|showcase)/.test(name)) return 30;
      if (/^(og|social)[-_]?(image|preview|card)?$/.test(name)) return 25;
      if (/(^|\/)(screenshots?|capturas|previews?)\//i.test(f.path)) return 20;
      return 0;
    },
  );
}

/**
 * Rutas de imágenes locales referenciadas en un README (markdown o `<img>`),
 * resueltas desde la carpeta del README. Ignora badges y URLs externas.
 */
export function readmeImagePaths(markdown: string, readmePath = 'README.md'): string[] {
  const dir = readmePath.includes('/') ? readmePath.slice(0, readmePath.lastIndexOf('/') + 1) : '';
  const refs = [
    ...markdown.matchAll(/!\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g),
    ...markdown.matchAll(/<img[^>]+src=["']([^"']+)["']/gi),
  ].map((m) => m[1]);

  return refs
    .filter((src) => !/^(https?:)?\/\//i.test(src) && !src.startsWith('data:') && RASTER.test(src.split(/[?#]/)[0]))
    .map((src) => normalize(src.startsWith('/') ? src.slice(1) : dir + src.split(/[?#]/)[0]));
}

function normalize(path: string): string {
  const parts: string[] = [];
  for (const part of path.split('/')) {
    if (part === '..') parts.pop();
    else if (part && part !== '.') parts.push(part);
  }
  return parts.join('/');
}
