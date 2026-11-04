import type { APIRoute, GetStaticPaths } from 'astro';
import { getShowcase, mediaPath } from '../../features/projects';

/**
 * Publica como archivos estáticos las imágenes descargadas de cada repo
 * (`/projects/<slug>-icon.webp` y `/projects/<slug>-cover.webp`).
 */
export const getStaticPaths = (async () => {
  const items = await getShowcase();
  return items.flatMap(({ project, media }) =>
    (['icon', 'cover'] as const)
      .filter((kind) => media[kind])
      .map((kind) => ({
        params: { asset: mediaPath(project.slug, kind).split('/').pop()! },
        props: { bytes: media[kind]! },
      })),
  );
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) =>
  new Response(props.bytes as Uint8Array<ArrayBuffer>, { headers: { 'Content-Type': 'image/webp' } });
