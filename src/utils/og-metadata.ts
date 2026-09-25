import enStrings from '../i18n/en.json';
import esStrings from '../i18n/es.json';
import blogManifest from '../data/blog-manifest.json';
import caseStudiesData from '../data/case-studies.json';

export type Locale = 'en' | 'es';
export const SUPPORTED_LOCALES: Locale[] = ['en', 'es'];

export const SITE_URL = 'https://usewraith.xyz';
export const CACHE_CONTROL = 'public, max-age=0, s-maxage=300, stale-while-revalidate=60';

export interface OgImageConfig {
  title: string;
  subtitle?: string;
  chainBadge?: string;
}

type LocalizedOgRoutes = Record<string, OgImageConfig>;

export interface RouteMetadata {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: OgImageConfig;
  ogUrl: string;
  ogType: 'website' | 'article';
  locale: Locale;
}

const STATIC_ROUTES: Record<
  string,
  {
    title: string;
    description: string;
    ogImage: OgImageConfig;
    ogType: 'website' | 'article';
  }
> = {
  '/': {
    title: 'Wraith Protocol',
    description:
      'Private payments for every chain. Stealth addresses, multichain SDK, and AI-powered privacy agents.',
    ogImage: {
      title: 'Wraith Protocol',
      subtitle: 'Private payments for every chain',
      chainBadge: 'EVM · Stellar',
    },
    ogType: 'website',
  },
  '/blog': {
    title: 'Blog — Wraith Protocol',
    description: 'Updates, guides, and deep dives from the Wraith team.',
    ogImage: {
      title: 'Blog',
      subtitle: 'Updates, guides, and deep dives from the Wraith team',
    },
    ogType: 'website',
  },
  '/case-studies': {
    title: 'Case Studies — Wraith Protocol',
    description:
      'Real-world privacy solutions built on Wraith Protocol. From payroll processors to DAOs.',
    ogImage: {
      title: 'Case Studies',
      subtitle: 'Real-world privacy solutions built on Wraith Protocol',
    },
    ogType: 'website',
  },
  '/careers': {
    title: 'Careers — Wraith Protocol',
    description: 'Open-source bounties and paid contract work at Wraith Protocol.',
    ogImage: {
      title: 'Careers',
      subtitle: 'Open-source bounties and paid contract work',
    },
    ogType: 'website',
  },
  '/contributors': {
    title: 'Contributors — Wraith Protocol',
    description: 'The people building and improving Wraith Protocol.',
    ogImage: {
      title: 'Contributors',
      subtitle: 'The people building and improving Wraith Protocol',
    },
    ogType: 'website',
  },
  '/faq': {
    title: 'FAQ — Wraith Protocol',
    description: 'Frequently asked questions about Wraith Protocol and stealth addresses.',
    ogImage: {
      title: 'FAQ',
      subtitle: 'Frequently asked questions about Wraith Protocol',
    },
    ogType: 'website',
  },
  '/grants': {
    title: 'Grants — Wraith Protocol',
    description:
      'Wraith Protocol runs a grant program for privacy infrastructure. Build private payments and get funded.',
    ogImage: {
      title: 'Grants',
      subtitle: 'Build private payments. Get funded.',
      chainBadge: 'Stellar · EVM',
    },
    ogType: 'website',
  },
  '/about': {
    title: 'About — Wraith Protocol',
    description: 'Building privacy-preserving payment infrastructure for everyone.',
    ogImage: {
      title: 'About',
      subtitle: 'Building privacy-preserving payment infrastructure for everyone',
    },
    ogType: 'website',
  },
  '/newsletter': {
    title: 'Newsletter — Wraith Protocol',
    description: 'Mainnet updates, security advisories, and grant news — no tracking.',
    ogImage: {
      title: 'Newsletter',
      subtitle: 'Mainnet updates, security advisories, and grant news',
    },
    ogType: 'website',
  },
  '/privacy': {
    title: 'Privacy Policy — Wraith Protocol',
    description: "How we handle your data — spoiler: we don't collect any.",
    ogImage: {
      title: 'Privacy Policy',
      subtitle: "How we handle your data — spoiler: we don't collect any",
    },
    ogType: 'website',
  },
  '/roadmap': {
    title: 'Roadmap — Wraith Protocol',
    description: 'The future of Wraith Protocol — a public roadmap of upcoming features.',
    ogImage: {
      title: 'Roadmap',
      subtitle: 'The future of Wraith',
    },
    ogType: 'website',
  },
  '/stellar': {
    title: 'Stellar Integration — Wraith Protocol',
    description: 'Native stealth address support on the Stellar network with memo-based metadata.',
    ogImage: {
      title: 'Stellar Integration',
      subtitle: 'Native stealth addresses on the Stellar network',
      chainBadge: 'Stellar',
    },
    ogType: 'website',
  },
  '/use-cases': {
    title: 'Use Cases — Wraith Protocol',
    description: 'Who uses Wraith Protocol and why — from payroll to DAOs.',
    ogImage: {
      title: 'Use Cases',
      subtitle: 'Who uses Wraith Protocol and why',
    },
    ogType: 'website',
  },
  '/vitals': {
    title: 'Web Vitals Dashboard — Wraith Protocol',
    description: 'Real-user performance telemetry for usewraith.xyz.',
    ogImage: {
      title: 'Web Vitals',
      subtitle: 'Real-user performance telemetry for usewraith.xyz',
    },
    ogType: 'website',
  },
};

const LOCALE_TRANSLATIONS: Record<Locale, Record<string, string>> = {
  en: {
    '/': 'Wraith Protocol',
    '/blog': 'Blog — Wraith Protocol',
    '/case-studies': 'Case Studies — Wraith Protocol',
    '/careers': 'Careers — Wraith Protocol',
    '/contributors': 'Contributors — Wraith Protocol',
    '/faq': 'FAQ — Wraith Protocol',
    '/grants': 'Grants — Wraith Protocol',
    '/about': 'About — Wraith Protocol',
    '/newsletter': 'Newsletter — Wraith Protocol',
    '/privacy': 'Privacy Policy — Wraith Protocol',
    '/roadmap': 'Roadmap — Wraith Protocol',
    '/stellar': 'Stellar Integration — Wraith Protocol',
    '/use-cases': 'Use Cases — Wraith Protocol',
    '/vitals': 'Web Vitals Dashboard — Wraith Protocol',
  },
  es: {
    '/': 'Wraith Protocol',
    '/blog': 'Blog — Wraith Protocol',
    '/case-studies': 'Casos de Estudio — Wraith Protocol',
    '/careers': 'Carreras — Wraith Protocol',
    '/contributors': 'Colaboradores — Wraith Protocol',
    '/faq': 'Preguntas Frecuentes — Wraith Protocol',
    '/grants': 'Subvenciones — Wraith Protocol',
    '/about': 'Acerca de — Wraith Protocol',
    '/newsletter': 'Boletín — Wraith Protocol',
    '/privacy': 'Política de Privacidad — Wraith Protocol',
    '/roadmap': 'Hoja de Ruta — Wraith Protocol',
    '/stellar': 'Integración Stellar — Wraith Protocol',
    '/use-cases': 'Casos de Uso — Wraith Protocol',
    '/vitals': 'Panel de Web Vitals — Wraith Protocol',
  },
};

const blogManifestData =
  (blogManifest as Array<{
    slug: string;
    title: string;
    excerpt: string;
  }>) || [];

const caseStudyEntries = ((caseStudiesData as { entries?: unknown[] }).entries || []) as Array<{
  slug: string;
  org: string;
  summary: string;
}>;

function lookupLocaleTitle(routePath: string, locale: Locale): string | null {
  const translations = LOCALE_TRANSLATIONS[locale];
  return translations[routePath] ?? null;
}

function getStaticRouteConfig(routePath: string, locale: Locale) {
  const config = STATIC_ROUTES[routePath];
  if (!config) return null;

  const strings = locale === 'es' ? esStrings : enStrings;
  const localizedOgImage = (strings.og.routes as LocalizedOgRoutes)[routePath];

  let title = config.title;
  if (locale === 'es') {
    const translated = lookupLocaleTitle(routePath, 'es');
    if (translated) {
      title = translated;
    }
  }

  return {
    title,
    description: config.description,
    ogImage: localizedOgImage ?? config.ogImage,
    ogType: config.ogType,
  };
}

export function stripLocalePrefix(pathname: string): { pathname: string; locale: Locale } {
  if (pathname === '/es' || pathname.startsWith('/es/')) {
    return {
      pathname: pathname === '/es' ? '/' : pathname.slice(3),
      locale: 'es',
    };
  }
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    return {
      pathname: pathname === '/en' ? '/' : pathname.slice(3),
      locale: 'en',
    };
  }
  return { pathname, locale: 'en' };
}

export function resolveRouteMetadata(pathname: string): RouteMetadata | null {
  const { pathname: cleanPath, locale } = stripLocalePrefix(pathname);
  const routeBase = cleanPath.split('/').slice(0, 2).join('/') || '/';
  const isDynamicBlog = cleanPath.match(/^\/blog\/(.+)$/);
  const isDynamicCaseStudy = cleanPath.match(/^\/case-studies\/(.+)$/);

  let title: string;
  let description: string;
  let ogImage: OgImageConfig;
  let ogType: 'website' | 'article';
  let ogUrl: string;

  if (cleanPath === '/' || cleanPath === '') {
    const config = getStaticRouteConfig('/', locale);
    if (!config) return null;
    title = config.title;
    description = config.description;
    ogImage = config.ogImage;
    ogType = config.ogType;
    ogUrl = `${SITE_URL}`;
  } else if (isDynamicBlog) {
    const slug = isDynamicBlog[1];
    const post = blogManifestData.find((p) => p.slug === slug);
    if (post) {
      title = `${post.title} — Wraith Protocol`;
      description = post.excerpt;
      ogImage = { title: post.title, subtitle: post.excerpt };
      ogType = 'article';
    } else {
      const config = getStaticRouteConfig('/blog', locale);
      if (!config) return null;
      title = config.title;
      description = config.description;
      ogImage = config.ogImage;
      ogType = 'article';
    }
    ogUrl = `${SITE_URL}/blog/${slug}`;
  } else if (isDynamicCaseStudy) {
    const slug = isDynamicCaseStudy[1];
    const study = caseStudyEntries.find((e) => e.slug === slug);
    if (study) {
      title = `${study.org} — Wraith Protocol`;
      description = study.summary || 'Built with Wraith stealth addresses.';
      ogImage = { title: study.org, subtitle: study.summary || 'Case study' };
      ogType = 'article';
    } else {
      const config = getStaticRouteConfig('/case-studies', locale);
      if (!config) return null;
      title = config.title;
      description = config.description;
      ogImage = config.ogImage;
      ogType = 'article';
    }
    ogUrl = `${SITE_URL}/case-studies/${slug}`;
  } else {
    const config = getStaticRouteConfig(routeBase, locale);
    if (!config) return null;
    title = config.title;
    description = config.description;
    ogImage = config.ogImage;
    ogType = config.ogType;
    ogUrl = `${SITE_URL}${routeBase === '' ? '/' : routeBase}`;
  }

  return {
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogImage,
    ogUrl,
    ogType,
    locale,
  };
}

export function isIndexableRoute(pathname: string): boolean {
  const { pathname: cleanPath } = stripLocalePrefix(pathname);

  if (Object.prototype.hasOwnProperty.call(STATIC_ROUTES, cleanPath)) {
    return true;
  }

  if (cleanPath.match(/^\/blog\/(.+)$/)) {
    return true;
  }

  if (cleanPath.match(/^\/case-studies\/(.+)$/)) {
    return true;
  }

  return false;
}

function withLocalePrefix(locale: Locale, slug: string): string {
  return locale === 'en' ? slug : `${locale}-${slug}`;
}

export function ogImageSlugFor(pathname: string, locale: Locale): string | null {
  const { pathname: cleanPath } = stripLocalePrefix(pathname);

  if (!isIndexableRoute(pathname)) {
    return null;
  }

  const isDynamicBlog = cleanPath.match(/^\/blog\/(.+)$/);
  if (isDynamicBlog) {
    return withLocalePrefix(locale, `blog-${isDynamicBlog[1]}`);
  }

  const isDynamicCaseStudy = cleanPath.match(/^\/case-studies\/(.+)$/);
  if (isDynamicCaseStudy) {
    return withLocalePrefix(locale, `case-study-${isDynamicCaseStudy[1]}`);
  }

  const routeSlugMap: Record<string, string> = {
    '/': 'home',
    '/blog': 'blog',
    '/case-studies': 'case-studies',
    '/careers': 'careers',
    '/contributors': 'contributors',
    '/faq': 'faq',
    '/grants': 'grants',
    '/about': 'about',
    '/newsletter': 'newsletter',
    '/privacy': 'privacy',
    '/roadmap': 'roadmap',
    '/stellar': 'stellar',
    '/use-cases': 'use-cases',
    '/vitals': 'vitals',
  };

  const slug = routeSlugMap[cleanPath];
  return slug ? withLocalePrefix(locale, slug) : null;
}

export function generateOgImageUrl(ogImage: OgImageConfig, locale: Locale): string {
  const params = new URLSearchParams();
  params.set('title', ogImage.title);
  if (ogImage.subtitle) {
    params.set('subtitle', ogImage.subtitle);
  }
  if (ogImage.chainBadge) {
    params.set('badge', ogImage.chainBadge);
  }
  if (locale === 'es') {
    params.set('lang', 'es');
  }

  return `${SITE_URL}/api/og?${params.toString()}`;
}

export function localeStrings(locale: Locale): {
  siteTitle: string;
  ogTitle: string;
  ogDescription: string;
} {
  const strings = locale === 'es' ? esStrings.og : enStrings.og;
  return {
    siteTitle: strings.siteTitle,
    ogTitle: strings.ogTitle,
    ogDescription: strings.ogDescription,
  };
}
