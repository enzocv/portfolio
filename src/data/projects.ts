import type { FeaturedRepo } from '../features/projects/domain/Project';

// Proyectos fijos, en este orden. `kind` decide la forma del marco: 'Mobile' = teléfono, 'Web' = navegador.
// `title` y `description` reemplazan el nombre y la descripción del repo cuando no sirven para mostrar.
// Las imágenes se buscan solas en cada repo (logo/ícono y captura). Para elegir una a mano:
//   cover: ruta de la captura dentro del repo · icon: ruta del ícono, o false si solo hay uno genérico.
export const FEATURED_REPOS: readonly FeaturedRepo[] = [
  {
    repo: 'enzocv/factura',
    title: 'Facturación SUNAT',
    kind: 'Web',
    description:
      'Microservicio multi-tenant de facturación electrónica para SUNAT: facturas, boletas y notas en UBL 2.1 firmado, envío a SUNAT con lectura de CDR, colas con reintentos, webhooks firmados y PDF con QR.',
  },
  {
    repo: 'enzocv/vibora',
    title: 'Víbora',
    kind: 'Web',
    description:
      'SaaS multi-tenant de reservas para clubes de pádel, tenis y pickleball en Chile: web de reservas con la marca del club, pagos y panel de administración. API en Go y web en Next.js.',
  },
  {
    repo: 'enzocv/podio',
    title: 'Podio',
    kind: 'Web',
    description:
      'SaaS para academias y torneos de deportes de combate: deportistas, inscripción, pesaje, llaves, combate en vivo y acta firmada, con sitio público por organización.',
  },
  {
    repo: 'enzocv/panel-jep-importaciones',
    title: 'JEP Importaciones',
    kind: 'Web',
    description:
      'Panel de gestión y tienda pública de JEP Importaciones: productos, inventario, leads, equipo de vendedores con tarjeta y QR, y reportes de ventas.',
    cover: '.bitacora/capturas/manuales/13-tienda-producto.png',
  },
  { repo: 'enzocv/babymind', title: 'BabyMind', kind: 'Mobile' },
  // El ícono del repo es el de la plantilla de Compose Multiplatform.
  {
    repo: 'enzocv/babymind-kmp',
    title: 'BabyMind KMP',
    kind: 'Mobile',
    description:
      'Reescritura nativa de BabyMind con Kotlin Multiplatform y Compose Multiplatform para Android e iOS, con sesión cifrada y caché sin conexión.',
    icon: false,
  },
  { repo: 'enzocv/hotelv2', title: 'Turismo Sin Fronteras', kind: 'Web' },
  { repo: 'enzocv/fintrack', title: 'FinTrack', kind: 'Mobile' },
];

export const PROJECTS_SETTINGS = {
  featured: FEATURED_REPOS,
  // Solo se muestran los repos de FEATURED_REPOS. No actives `discover`: la API de GitHub
  // devuelve también todos los repos públicos de la cuenta, no solo los que se le dieron al token.
  discover: false,
  exclude: ['enzocv/portfolio'],
} as const;
