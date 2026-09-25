import enStrings from '../i18n/en.json';
import esStrings from '../i18n/es.json';
import ptStrings from '../i18n/pt.json';
import blogManifest from '../data/blog-manifest.json';
import caseStudiesData from '../data/case-studies.json';

export type Locale = 'en' | 'es' | 'pt';
export const SUPPORTED_LOCALES: Locale[] = ['en', 'es', 'pt'];

export const SITE_URL = 'https://usewraith.xyz';
export const CACHE_CONTROL = 'public, max-age=0, s-maxage=300, stale-while-revalidate=60';

export const OG_LOCALE_TAGS: Record<Locale, string> = {
  en: 'en_US',
  es: 'es_ES',
  pt: 'pt_BR',
};

export interface OgImageConfig {
  title: string;
  subtitle?: string;
  chainBadge?: string;
}

interface StaticRouteContent {
  title: string;
  description: string;
  ogImage: OgImageConfig;
  ogType: 'website' | 'article';
}

type StaticRouteTable = Record<string, StaticRouteContent>;

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

export interface OgImageJob {
  slug: string;
  routePath: string;
  locale: Locale;
  file: string;
  title: string;
  subtitle: string;
  description: string;
  chainBadge?: string;
}

const ROUTE_CONTENT: Record<Locale, StaticRouteTable> = {
  en: enStrings.ogRoutes as unknown as StaticRouteTable,
  es: esStrings.ogRoutes as unknown as StaticRouteTable,
  pt: ptStrings.ogRoutes as unknown as StaticRouteTable,
};

const ROUTE_SLUGS: Record<string, string> = {
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

const LOCALE_OG_STRINGS: Record<
  Locale,
  { siteTitle: string; ogTitle: string; ogDescription: string }
> = {
  en: enStrings.og,
  es: esStrings.og,
  pt: ptStrings.og,
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

function getStaticRouteConfig(routePath: string, locale: Locale): StaticRouteContent | null {
  const localized = ROUTE_CONTENT[locale]?.[routePath];
  if (localized) return localized;
  return ROUTE_CONTENT.en[routePath] ?? null;
}

export function stripLocalePrefix(pathname: string): { pathname: string; locale: Locale } {
  for (const locale of SUPPORTED_LOCALES) {
    const prefix = `/${locale}`;
    if (pathname === prefix) {
      return { pathname: '/', locale };
    }
    if (pathname.startsWith(`${prefix}/`)) {
      return { pathname: pathname.slice(prefix.length), locale };
    }
  }
  return { pathname, locale: 'en' };
}

function localizedPath(locale: Locale, cleanPath: string): string {
  if (locale === 'en') return cleanPath;
  return cleanPath === '/' ? `/${locale}` : `/${locale}${cleanPath}`;
}

function canonicalUrlFor(locale: Locale, cleanPath: string): string {
  if (cleanPath === '/') {
    return locale === 'en' ? SITE_URL : `${SITE_URL}/${locale}`;
  }
  return `${SITE_URL}${localizedPath(locale, cleanPath)}`;
}

function localePrefixedSlug(locale: Locale, slug: string): string {
  return locale === 'en' ? slug : `${locale}-${slug}`;
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
    ogUrl = canonicalUrlFor(locale, '/');
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
    ogUrl = canonicalUrlFor(locale, `/blog/${slug}`);
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
    ogUrl = canonicalUrlFor(locale, `/case-studies/${slug}`);
  } else {
    const config = getStaticRouteConfig(routeBase, locale);
    if (!config) return null;
    title = config.title;
    description = config.description;
    ogImage = config.ogImage;
    ogType = config.ogType;
    ogUrl = canonicalUrlFor(locale, routeBase === '' ? '/' : routeBase);
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

  if (Object.prototype.hasOwnProperty.call(ROUTE_CONTENT.en, cleanPath)) {
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

export function ogImageSlugFor(pathname: string, locale: Locale): string | null {
  const { pathname: cleanPath } = stripLocalePrefix(pathname);

  if (!isIndexableRoute(pathname)) {
    return null;
  }

  const isDynamicBlog = cleanPath.match(/^\/blog\/(.+)$/);
  if (isDynamicBlog) {
    return localePrefixedSlug(locale, `blog-${isDynamicBlog[1]}`);
  }

  const isDynamicCaseStudy = cleanPath.match(/^\/case-studies\/(.+)$/);
  if (isDynamicCaseStudy) {
    return localePrefixedSlug(locale, `case-study-${isDynamicCaseStudy[1]}`);
  }

  const slug = ROUTE_SLUGS[cleanPath];
  return slug ? localePrefixedSlug(locale, slug) : null;
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
  if (locale !== 'en') {
    params.set('lang', locale);
  }

  return `${SITE_URL}/api/og?${params.toString()}`;
}

export function localeStrings(locale: Locale): {
  siteTitle: string;
  ogTitle: string;
  ogDescription: string;
} {
  const strings = LOCALE_OG_STRINGS[locale] ?? LOCALE_OG_STRINGS.en;
  return {
    siteTitle: strings.siteTitle,
    ogTitle: strings.ogTitle,
    ogDescription: strings.ogDescription,
  };
}

export function listOgImageJobs(): OgImageJob[] {
  const jobs: OgImageJob[] = [];

  for (const [routePath, slug] of Object.entries(ROUTE_SLUGS)) {
    for (const locale of SUPPORTED_LOCALES) {
      const config = getStaticRouteConfig(routePath, locale);
      if (!config) continue;
      jobs.push({
        slug,
        routePath,
        locale,
        file: `${localePrefixedSlug(locale, slug)}.png`,
        title: config.ogImage.title,
        subtitle: config.ogImage.subtitle || config.description,
        description: config.description,
        chainBadge: config.ogImage.chainBadge,
      });
    }
  }

  for (const post of blogManifestData) {
    for (const locale of SUPPORTED_LOCALES) {
      const slug = `blog-${post.slug}`;
      jobs.push({
        slug,
        routePath: `/blog/${post.slug}`,
        locale,
        file: `${localePrefixedSlug(locale, slug)}.png`,
        title: post.title,
        subtitle: post.excerpt,
        description: post.excerpt,
      });
    }
  }

  for (const study of caseStudyEntries) {
    for (const locale of SUPPORTED_LOCALES) {
      const slug = `case-study-${study.slug}`;
      const subtitle = study.summary || 'Built with Wraith stealth addresses.';
      jobs.push({
        slug,
        routePath: `/case-studies/${study.slug}`,
        locale,
        file: `${localePrefixedSlug(locale, slug)}.png`,
        title: study.org,
        subtitle,
        description: subtitle,
      });
    }
  }

  return jobs;
}
