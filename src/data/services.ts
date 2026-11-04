export interface Service {
  /** Etiqueta corta del ícono en la vista cliente. */
  readonly badge: string;
  /** Vista "dev": cómo lo construyo. */
  readonly dev: {
    readonly fn: string;
    readonly stack: string;
    readonly signature: string;
    readonly result: string;
  };
  /** Vista "cliente": qué gana el negocio. */
  readonly client: {
    readonly title: string;
    readonly description: string;
  };
}

export const SERVICES: readonly Service[] = [
  {
    badge: 'web',
    dev: { fn: 'web', stack: 'Next.js · React · Astro', signature: 'SSR + SEO técnico', result: 'Lighthouse alto' },
    client: {
      title: 'Una web rápida que Google encuentra',
      description: 'Carga al instante, se ve bien en el celular y atrae clientes desde el buscador.',
    },
  },
  {
    badge: 'app',
    dev: { fn: 'mobile', stack: 'React Native', signature: "Platform<'ios' | 'android'>", result: 'un solo código' },
    client: {
      title: 'Tu app en iOS y Android',
      description: 'Un solo desarrollo para las dos tiendas, así inviertes una vez y llegas a todos.',
    },
  },
  {
    badge: 'api',
    dev: { fn: 'backend', stack: 'NestJS · PostgreSQL', signature: 'Rest | GraphQL · Docker', result: 'escala horizontal' },
    client: {
      title: 'El sistema que sostiene tu operación',
      description: 'Datos seguros, integraciones con otros servicios y lugar para crecer.',
    },
  },
];
