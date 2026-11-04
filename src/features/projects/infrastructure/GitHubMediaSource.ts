import { NO_MEDIA, type MediaSource, type Project, type ProjectMedia } from '../domain/Project';
import { pickCover, pickIcon, readmeImagePaths, type RepoFile } from '../domain/mediaRules';
import type { GitHubClient } from './GitHubClient';

interface TreeResponse {
  tree: Array<{ path: string; type: 'blob' | 'tree'; size?: number; sha: string }>;
}

interface ReadmeResponse {
  path: string;
  content: string;
  encoding: string;
}

/**
 * Busca el logo/ícono y una captura dentro del repo y descarga sus bytes con
 * la credencial del build, así funcionan también para repos privados.
 */
export class GitHubMediaSource implements MediaSource {
  constructor(private readonly client: GitHubClient) {}

  async findMedia(project: Project): Promise<ProjectMedia> {
    const tree = await this.client.json<TreeResponse>(
      `/repos/${project.repo}/git/trees/${encodeURIComponent(project.defaultBranch)}?recursive=1`,
    );
    const blobs = tree.tree.filter((t) => t.type === 'blob');
    if (blobs.length === 0) return NO_MEDIA;

    const files: RepoFile[] = blobs.map((b) => ({ path: b.path, size: b.size ?? 0 }));
    const shaOf = new Map(blobs.map((b) => [b.path, b.sha]));

    const hints = project.mediaHints ?? {};
    const icon =
      hints.icon === false ? null : hints.icon && shaOf.has(hints.icon) ? hints.icon : (pickIcon(files)?.path ?? null);
    const cover =
      hints.cover && shaOf.has(hints.cover)
        ? hints.cover
        : ((await this.readmeCover(project, shaOf)) ?? pickCover(files)?.path ?? null);
    if (hints.cover && !shaOf.has(hints.cover)) console.warn(`[projects] ${project.repo}: no existe ${hints.cover}`);

    const [iconBytes, coverBytes] = await Promise.all([
      icon ? this.download(project, shaOf.get(icon)!) : null,
      cover ? this.download(project, shaOf.get(cover)!) : null,
    ]);
    return { icon: iconBytes, cover: coverBytes };
  }

  /** Primera imagen local del README que exista en el repo. */
  private async readmeCover(project: Project, shaOf: Map<string, string>): Promise<string | null> {
    const res = await this.client.get(`/repos/${project.repo}/readme`);
    if (!res.ok) return null;
    const readme = (await res.json()) as ReadmeResponse;
    const markdown = readme.encoding === 'base64' ? decodeBase64(readme.content) : readme.content;
    return readmeImagePaths(markdown, readme.path).find((path) => shaOf.has(path)) ?? null;
  }

  private async download(project: Project, sha: string): Promise<Uint8Array | null> {
    try {
      return await this.client.bytes(`/repos/${project.repo}/git/blobs/${sha}`);
    } catch {
      return null;
    }
  }
}

const decodeBase64 = (value: string): string =>
  new TextDecoder().decode(Uint8Array.from(atob(value.replace(/\s/g, '')), (c) => c.charCodeAt(0)));
