const API = 'https://api.github.com';

/**
 * Cliente mínimo de la API REST de GitHub. Si el token es rechazado (401),
 * sigue sin autenticación el resto del build: los repos públicos se pueden leer igual.
 */
export class GitHubClient {
  private tokenRejected = false;

  constructor(
    private readonly token?: string,
    private readonly fetchFn: typeof fetch = fetch,
  ) {}

  get hasToken(): boolean {
    return Boolean(this.token) && !this.tokenRejected;
  }

  async get(path: string, accept = 'application/vnd.github+json'): Promise<Response> {
    let res = await this.fetchFn(`${API}${path}`, { headers: this.headers(accept, this.hasToken) });
    if (res.status === 401 && this.hasToken) {
      this.tokenRejected = true;
      console.warn('[projects] GH_REPOS_TOKEN rechazado (401); se continúa sin token. Renueva el secreto.');
      res = await this.fetchFn(`${API}${path}`, { headers: this.headers(accept, false) });
    }
    return res;
  }

  async json<T>(path: string): Promise<T> {
    const res = await this.get(path);
    if (!res.ok) throw new Error(`GitHub API error for ${path}: ${res.status}`);
    return (await res.json()) as T;
  }

  async bytes(path: string): Promise<Uint8Array> {
    const res = await this.get(path, 'application/vnd.github.raw');
    if (!res.ok) throw new Error(`GitHub API error for ${path}: ${res.status}`);
    return new Uint8Array(await res.arrayBuffer());
  }

  private headers(accept: string, withToken: boolean): Record<string, string> {
    const headers: Record<string, string> = { Accept: accept, 'X-GitHub-Api-Version': '2022-11-28' };
    if (withToken && this.token) headers.Authorization = `Bearer ${this.token}`;
    return headers;
  }
}
