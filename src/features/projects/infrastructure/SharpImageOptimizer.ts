import sharp from 'sharp';
import type { ImageOptimizer } from '../domain/Project';

const ICON = 192;
/** Proporción de píxeles opacos a partir de la cual la imagen ya es un ícono "lleno". */
const FULL_ICON_RATIO = 0.8;

/** Optimiza las imágenes con sharp (la misma librería que usa Astro). */
export class SharpImageOptimizer implements ImageOptimizer {
  /**
   * Siempre devuelve un cuadrado de 192 px: un ícono de app se escala a todo
   * el cuadro; un logo con transparencia se centra sobre una baldosa blanca.
   */
  async icon(bytes: Uint8Array): Promise<Uint8Array> {
    const trimmed = await sharp(bytes).ensureAlpha().trim({ threshold: 4 }).png().toBuffer();
    const opaque = await opaqueRatio(trimmed);

    const out =
      opaque >= FULL_ICON_RATIO
        ? await sharp(trimmed).resize(ICON, ICON, { fit: 'cover' }).webp({ quality: 88 }).toBuffer()
        : await sharp({ create: { width: ICON, height: ICON, channels: 4, background: '#ffffff' } })
            .composite([{ input: await sharp(trimmed).resize(ICON - 40, ICON - 40, { fit: 'inside' }).toBuffer(), gravity: 'center' }])
            .webp({ quality: 88 })
            .toBuffer();
    return new Uint8Array(out);
  }

  async cover(bytes: Uint8Array): Promise<Uint8Array> {
    const out = await sharp(bytes).resize({ width: 960, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
    return new Uint8Array(out);
  }
}

async function opaqueRatio(png: Uint8Array): Promise<number> {
  const { data, info } = await sharp(png).resize(64, 64, { fit: 'fill' }).raw().toBuffer({ resolveWithObject: true });
  let opaque = 0;
  for (let i = info.channels - 1; i < data.length; i += info.channels) if (data[i] > 200) opaque++;
  return opaque / (info.width * info.height);
}
