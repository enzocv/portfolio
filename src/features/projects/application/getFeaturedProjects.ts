import { type FeaturedRepo, type Project, type ProjectRepository } from '../domain/Project';

interface Options {
  /**
   * En modo estricto (CI o con token) un error de la API corta el build,
   * para no publicar el sitio con datos incompletos.
   */
  readonly strict: boolean;
}

/** Proyecto mínimo para desarrollo local sin acceso a la API. */
const placeholderOf = (ref: FeaturedRepo): Project => ({
  slug: ref.repo.split('/')[1],
  title: ref.repo.split('/')[1],
  kind: ref.kind,
  description: '',
  techs: [],
  language: null,
  socialImage: null,
  screenshot: ref.screenshot,
  demoUrl: null,
  codeUrl: null,
});

export async function getFeaturedProjects(
  repository: ProjectRepository,
  refs: readonly FeaturedRepo[],
  { strict }: Options,
): Promise<Project[]> {
  return Promise.all(
    refs.map(async (ref) => {
      try {
        return await repository.findByRef(ref);
      } catch (error) {
        if (strict) throw error;
        console.warn(`[projects] ${String(error)}. Usando datos locales para ${ref.repo}.`);
        return placeholderOf(ref);
      }
    }),
  );
}
