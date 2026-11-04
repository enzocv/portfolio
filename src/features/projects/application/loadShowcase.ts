import {
  NO_MEDIA,
  type FeaturedRepo,
  type ImageOptimizer,
  type MediaSource,
  type Project,
  type ProjectMedia,
  type ProjectRepository,
} from '../domain/Project';

export interface ShowcaseItem {
  readonly project: Project;
  readonly media: ProjectMedia;
}

export interface ShowcaseSettings {
  /** Repos fijos, en este orden, antes que los descubiertos. */
  readonly featured: readonly FeaturedRepo[];
  /** Agregar también los repos a los que tiene acceso el token. */
  readonly discover: boolean;
  /** Repos que nunca se muestran (`owner/name`). */
  readonly exclude: readonly string[];
  readonly maxProjects: number;
  /**
   * En modo estricto (CI o con token) un error al leer un repo destacado corta
   * el build, para no publicar el sitio con datos incompletos.
   */
  readonly strict: boolean;
}

interface Dependencies {
  readonly repository: ProjectRepository;
  readonly media: MediaSource;
  readonly optimizer: ImageOptimizer;
  readonly log?: (message: string) => void;
}

/** Proyecto mínimo para desarrollo local sin acceso a la API. */
const placeholderOf = (ref: FeaturedRepo): Project => {
  const name = ref.repo.split('/')[1];
  return {
    repo: ref.repo,
    slug: name,
    title: name,
    kind: ref.kind,
    description: '',
    techs: [],
    language: null,
    isPrivate: true,
    defaultBranch: 'main',
    socialImage: null,
    screenshot: ref.screenshot,
    demoUrl: null,
    codeUrl: null,
  };
};

const sameRepo = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

/** Arma la lista de proyectos del portfolio con sus imágenes. */
export async function loadShowcase(settings: ShowcaseSettings, deps: Dependencies): Promise<ShowcaseItem[]> {
  const log = deps.log ?? ((m: string) => console.warn(`[projects] ${m}`));

  const featured = await Promise.all(
    settings.featured.map(async (ref) => {
      try {
        return await deps.repository.findByRef(ref);
      } catch (error) {
        if (settings.strict) throw error;
        log(`${String(error)}. Usando datos locales para ${ref.repo}.`);
        return placeholderOf(ref);
      }
    }),
  );

  let discovered: Project[] = [];
  if (settings.discover) {
    try {
      discovered = (await deps.repository.listAccessible()).filter(
        (p) =>
          p.description.trim() !== '' &&
          !featured.some((f) => sameRepo(f.repo, p.repo)) &&
          !settings.exclude.some((e) => sameRepo(e, p.repo)),
      );
    } catch (error) {
      log(`No se pudieron listar los repos del token: ${String(error)}`);
    }
  }

  const projects = [...featured, ...discovered].slice(0, settings.maxProjects);
  return Promise.all(projects.map(async (project) => ({ project, media: await mediaOf(project, deps, log) })));
}

async function mediaOf(project: Project, deps: Dependencies, log: (m: string) => void): Promise<ProjectMedia> {
  try {
    const raw = await deps.media.findMedia(project);
    const [icon, cover] = await Promise.all([
      raw.icon ? deps.optimizer.icon(raw.icon).catch(() => null) : null,
      raw.cover ? deps.optimizer.cover(raw.cover).catch(() => null) : null,
    ]);
    return { icon, cover };
  } catch (error) {
    log(`Sin imágenes para ${project.repo}: ${String(error)}`);
    return NO_MEDIA;
  }
}
