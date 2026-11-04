import {
  inferKind,
  socialImageOf,
  type FeaturedRepo,
  type Project,
  type ProjectKind,
  type ProjectRepository,
} from '../domain/Project';
import type { GitHubClient } from './GitHubClient';

interface GitHubRepoResponse {
  name: string;
  full_name: string;
  description: string | null;
  topics?: string[];
  language: string | null;
  homepage: string | null;
  html_url: string;
  private: boolean;
  fork: boolean;
  archived: boolean;
  default_branch: string;
}

const PAGE_SIZE = 100;
const MAX_PAGES = 10;

/** Lee los proyectos desde la API REST de GitHub (en build time). */
export class GitHubProjectRepository implements ProjectRepository {
  constructor(private readonly client: GitHubClient) {}

  async findByRef(ref: FeaturedRepo): Promise<Project> {
    const data = await this.client.json<GitHubRepoResponse>(`/repos/${ref.repo}`);
    return { ...toProject(data, ref.kind), screenshot: ref.screenshot };
  }

  async listAccessible(): Promise<Project[]> {
    if (!this.client.hasToken) return [];
    // Con un token fine-grained, la lista incluye solo los repos que se le dieron.
    const repos: GitHubRepoResponse[] = [];
    for (let page = 1; page <= MAX_PAGES; page++) {
      const batch = await this.client.json<GitHubRepoResponse[]>(
        `/user/repos?affiliation=owner&sort=pushed&direction=desc&per_page=${PAGE_SIZE}&page=${page}`,
      );
      repos.push(...batch);
      if (batch.length < PAGE_SIZE) break;
    }
    return repos
      .filter((r) => !r.fork && !r.archived)
      .map((r) => toProject(r, inferKind(r.name, r.description ?? '', r.topics ?? [], r.language)));
  }
}

function toProject(data: GitHubRepoResponse, kind: ProjectKind): Project {
  const topics = data.topics?.length ? data.topics : [data.language].filter((t): t is string => Boolean(t));
  return {
    repo: data.full_name,
    slug: data.name.toLowerCase(),
    title: data.name,
    kind,
    description: data.description ?? '',
    techs: topics,
    language: data.language,
    isPrivate: data.private,
    defaultBranch: data.default_branch,
    socialImage: data.private ? null : socialImageOf(data.full_name),
    demoUrl: data.homepage || null,
    codeUrl: data.private ? null : data.html_url,
  };
}
