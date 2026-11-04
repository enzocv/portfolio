/** Cómo se muestra el proyecto en el marco que cambia de forma. */
export type ProjectKind = 'Mobile' | 'Web';

/** Referencia configurable a un repositorio destacado. */
export interface FeaturedRepo {
  /** `owner/name` en GitHub. */
  readonly repo: string;
  readonly kind: ProjectKind;
  /**
   * Captura opcional: ruta dentro de `/public` (p. ej. `/projects/fintrack.webp`)
   * o URL absoluta. Si falta, se usa la imagen social de GitHub (web) o una
   * pantalla generada con los datos del repo (mobile).
   */
  readonly screenshot?: string;
}

export interface Project {
  readonly slug: string;
  readonly title: string;
  readonly kind: ProjectKind;
  readonly description: string;
  readonly techs: readonly string[];
  readonly language: string | null;
  /** Imagen social de GitHub; `null` si el repo es privado (GitHub no la publica). */
  readonly socialImage: string | null;
  readonly screenshot?: string;
  readonly demoUrl: string | null;
  readonly codeUrl: string | null;
}

export interface ProjectRepository {
  findByRef(ref: FeaturedRepo): Promise<Project>;
}

/** Imagen social que GitHub genera para cada repositorio. */
export const socialImageOf = (repo: string): string => `https://opengraph.githubassets.com/1/${repo}`;
