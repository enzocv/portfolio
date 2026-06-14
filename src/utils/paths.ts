// Resuelve rutas absolutas (assets, anclas internas) respetando el `base` de astro.config.mjs.
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export function withBase(path: string): string {
  return `${base}${path}`;
}
