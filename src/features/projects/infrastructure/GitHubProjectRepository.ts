import { socialImageOf, type FeaturedRepo, type Project, type ProjectRepository } from '../domain/Project';

interface GitHubRepoResponse {
  name: string;
  description: string | null;
  topics?: string[];
  language: string | null;
  homepage: string | null;
  html_url: string;
  private: boolean;
}

/** Lee los proyectos desde la API REST de GitHub (en build time). */
export class GitHubProjectRepository implements ProjectRepository {
  constructor(
    private readonly token?: string,
    private readonly fetchFn: typeof fetch = fetch,
  ) {}

  async findByRef(ref: FeaturedRepo): Promise<Project> {
    let res = await this.request(ref.repo, this.token);

    // Token vencido o revocado: los repos públicos se pueden leer sin autenticación.
    if (res.status === 401 && this.token) {
      console.warn(`[projects] GH_REPOS_TOKEN rechazado (401) para ${ref.repo}; reintentando sin token. Renueva el secreto.`);
      res = await this.request(ref.repo);
    }
    if (!res.ok) throw new Error(`GitHub API error for ${ref.repo}: ${res.status}`);

    const data = (await res.json()) as GitHubRepoResponse;
    const topics = data.topics?.length ? data.topics : [data.language].filter((t): t is string => Boolean(t));

    return {
      slug: data.name,
      title: data.name,
      kind: ref.kind,
      description: data.description ?? '',
      techs: topics,
      language: data.language,
      socialImage: socialImageOf(ref.repo),
      screenshot: ref.screenshot,
      demoUrl: data.homepage || null,
      codeUrl: data.private ? null : data.html_url,
    };
  }

  private request(repo: string, token?: string): Promise<Response> {
    const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    return this.fetchFn(`https://api.github.com/repos/${repo}`, { headers });
  }
}
