/**
 * Texto con clases de color que se "escribe" carácter a carácter.
 * Función pura: se usa en el servidor (primer frame) y en el cliente (scroll).
 */
export interface TypedToken {
  /** Clase CSS del fragmento (vacía = texto normal). */
  readonly tone?: string;
  readonly text: string;
}

const escapeHtml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const typedLength = (tokens: readonly TypedToken[]): number =>
  tokens.reduce((total, token) => total + token.text.length, 0);

/** HTML de los primeros `chars` caracteres de `tokens`. */
export function renderTyped(tokens: readonly TypedToken[], chars: number): string {
  let remaining = chars;
  let html = '';

  for (const { tone, text } of tokens) {
    if (remaining <= 0) break;
    const part = text.slice(0, remaining);
    remaining -= part.length;
    html += tone ? `<span class="${tone}">${escapeHtml(part)}</span>` : escapeHtml(part);
  }

  return html;
}
