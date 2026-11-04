export interface StackLayer {
  readonly name: string;
  /** Color de la capa (borde, brillo y etiqueta). */
  readonly color: string;
  /** Texto corto que se imprime sobre la capa isométrica. */
  readonly short: string;
  readonly items: readonly string[];
}

// Capas de Clean Architecture, de la más externa (UI) a la base (infraestructura).
export const STACK_LAYERS: readonly StackLayer[] = [
  {
    name: 'Presentación',
    color: '#8a97ff',
    short: 'react · next · angular · react native',
    items: ['React', 'Next.js', 'Angular', 'React Native', 'Astro', 'Tailwind CSS'],
  },
  {
    name: 'Aplicación',
    color: '#59c9e8',
    short: 'nestjs · node · rest · graphql',
    items: ['NestJS', 'Node.js', 'REST API', 'GraphQL', 'Python'],
  },
  {
    name: 'Dominio',
    color: '#ffb54d',
    short: 'typescript · entidades · reglas',
    items: ['TypeScript', 'Entidades', 'Reglas de negocio', 'SOLID'],
  },
  {
    name: 'Infraestructura',
    color: '#5fd6a0',
    short: 'postgres · mongo · redis · docker · aws',
    items: ['PostgreSQL', 'MongoDB', 'Redis', 'Firebase', 'Docker', 'AWS', 'Kubernetes', 'CI/CD', 'Git'],
  },
];
