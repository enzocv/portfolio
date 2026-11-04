/** Cómo se muestra el proyecto en el marco que cambia de forma. */
export type ProjectKind = 'Mobile' | 'Web';

/** Referencia configurable a un repositorio destacado. */
export interface FeaturedRepo {
  /** `owner/name` en GitHub. */
  readonly repo: string;
  readonly kind: ProjectKind;
  /**
   * Captura opcional: ruta dentro de `/public` (p. ej. `/shots/fintrack.webp`)
   * o URL absoluta. Tiene prioridad sobre la captura encontrada en el repo.
   */
  readonly screenshot?: string;
  /** Nombre a mostrar (por defecto, el nombre del repo). */
  readonly title?: string;
  /** Descripción a mostrar si la del repo en GitHub está vacía o no sirve. */
  readonly description?: string;
  /** Ruta de una imagen dentro del repo para usar como captura (en vez de la detección automática). */
  readonly cover?: string;
  /** Ruta del ícono dentro del repo, o `false` si el repo solo tiene un ícono genérico de plantilla. */
  readonly icon?: string | false;
}

/** Ajustes de imágenes que vienen de la configuración del portfolio. */
export interface MediaHints {
  readonly cover?: string;
  readonly icon?: string | false;
}

export interface Project {
  /** `owner/name` en GitHub. */
  readonly repo: string;
  readonly slug: string;
  readonly title: string;
  readonly kind: ProjectKind;
  readonly description: string;
  readonly techs: readonly string[];
  readonly language: string | null;
  readonly isPrivate: boolean;
  readonly defaultBranch: string;
  /** Imagen social de GitHub; `null` si el repo es privado (GitHub no la publica). */
  readonly socialImage: string | null;
  readonly screenshot?: string;
  readonly mediaHints?: MediaHints;
  readonly demoUrl: string | null;
  readonly codeUrl: string | null;
}

/** Imágenes del propio repo (logo/ícono y captura), ya listas para publicar. */
export interface ProjectMedia {
  readonly icon: Uint8Array | null;
  readonly cover: Uint8Array | null;
}

export const NO_MEDIA: ProjectMedia = { icon: null, cover: null };

export interface ProjectRepository {
  findByRef(ref: FeaturedRepo): Promise<Project>;
  /** Repos a los que tiene acceso la credencial configurada (vacío si no hay). */
  listAccessible(): Promise<Project[]>;
}

/** Busca imágenes dentro del repositorio. Devuelve los bytes originales. */
export interface MediaSource {
  findMedia(project: Project): Promise<ProjectMedia>;
}

/** Convierte imágenes al formato y tamaño que publica el sitio. */
export interface ImageOptimizer {
  icon(bytes: Uint8Array): Promise<Uint8Array>;
  cover(bytes: Uint8Array): Promise<Uint8Array>;
}

/** Imagen social que GitHub genera para cada repositorio. */
export const socialImageOf = (repo: string): string => `https://opengraph.githubassets.com/1/${repo}`;

const MOBILE_HINTS = /react[\s-]?native|\bexpo\b|android|\bios\b|kotlin multiplatform|\bkmp\b|flutter|swiftui|app m[oó]vil|\bmobile\b/i;
const MOBILE_LANGUAGES = new Set(['Kotlin', 'Swift', 'Dart', 'Objective-C']);

/** Decide si un repo descubierto se muestra como app móvil o como web. */
export function inferKind(name: string, description: string, topics: readonly string[], language: string | null): ProjectKind {
  if (language && MOBILE_LANGUAGES.has(language)) return 'Mobile';
  return MOBILE_HINTS.test([name, description, ...topics].join(' ')) ? 'Mobile' : 'Web';
}
