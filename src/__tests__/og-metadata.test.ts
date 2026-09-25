import { describe, expect, it } from 'vitest';
import {
  resolveRouteMetadata,
  isIndexableRoute,
  ogImageSlugFor,
  generateOgImageUrl,
  stripLocalePrefix,
  localeStrings,
  SITE_URL,
  CACHE_CONTROL,
  SUPPORTED_LOCALES,
} from '../utils/og-metadata';

describe('og-metadata: static routes', () => {
  it('resolves home route with correct title and description', () => {
    const meta = resolveRouteMetadata('/');
    expect(meta).not.toBeNull();
    expect(meta!.title).toBe('Wraith Protocol');
    expect(meta!.description).toBe(
      'Private payments for every chain. Stealth addresses, multichain SDK, and AI-powered privacy agents.',
    );
    expect(meta!.ogType).toBe('website');
    expect(meta!.ogUrl).toBe('https://usewraith.xyz');
  });

  it('resolves /blog route', () => {
    const meta = resolveRouteMetadata('/blog');
    expect(meta).not.toBeNull();
    expect(meta!.title).toBe('Blog — Wraith Protocol');
    expect(meta!.ogImage.title).toBe('Blog');
    expect(meta!.ogType).toBe('website');
  });

  it('resolves /grants route', () => {
    const meta = resolveRouteMetadata('/grants');
    expect(meta).not.toBeNull();
    expect(meta!.title).toContain('Grants');
    expect(meta!.ogImage.chainBadge).toBe('Stellar · EVM');
  });

  it('resolves /case-studies route', () => {
    const meta = resolveRouteMetadata('/case-studies');
    expect(meta).not.toBeNull();
    expect(meta!.title).toBe('Case Studies — Wraith Protocol');
  });

  it('resolves /stellar route with chain badge', () => {
    const meta = resolveRouteMetadata('/stellar');
    expect(meta).not.toBeNull();
    expect(meta!.title).toBe('Stellar Integration — Wraith Protocol');
    expect(meta!.ogImage.chainBadge).toBe('Stellar');
  });

  it('resolves /roadmap route', () => {
    const meta = resolveRouteMetadata('/roadmap');
    expect(meta).not.toBeNull();
    expect(meta!.title).toBe('Roadmap — Wraith Protocol');
  });

  it('resolves /use-cases route', () => {
    const meta = resolveRouteMetadata('/use-cases');
    expect(meta).not.toBeNull();
    expect(meta!.title).toBe('Use Cases — Wraith Protocol');
  });

  it('resolves /faq route', () => {
    const meta = resolveRouteMetadata('/faq');
    expect(meta).not.toBeNull();
    expect(meta!.title).toBe('FAQ — Wraith Protocol');
  });

  it('resolves /privacy route', () => {
    const meta = resolveRouteMetadata('/privacy');
    expect(meta).not.toBeNull();
    expect(meta!.title).toBe('Privacy Policy — Wraith Protocol');
  });

  it('resolves /careers route', () => {
    const meta = resolveRouteMetadata('/careers');
    expect(meta).not.toBeNull();
    expect(meta!.title).toBe('Careers — Wraith Protocol');
  });

  it('resolves /about route', () => {
    const meta = resolveRouteMetadata('/about');
    expect(meta).not.toBeNull();
    expect(meta!.title).toBe('About — Wraith Protocol');
  });

  it('resolves /newsletter route', () => {
    const meta = resolveRouteMetadata('/newsletter');
    expect(meta).not.toBeNull();
    expect(meta!.title).toBe('Newsletter — Wraith Protocol');
  });

  it('resolves /contributors route', () => {
    const meta = resolveRouteMetadata('/contributors');
    expect(meta).not.toBeNull();
    expect(meta!.title).toBe('Contributors — Wraith Protocol');
  });

  it('resolves /vitals route', () => {
    const meta = resolveRouteMetadata('/vitals');
    expect(meta).not.toBeNull();
    expect(meta!.title).toBe('Web Vitals Dashboard — Wraith Protocol');
  });
});

describe('og-metadata: dynamic routes', () => {
  it('resolves a known blog post by slug', () => {
    const meta = resolveRouteMetadata('/blog/wave-7-kickoff');
    expect(meta).not.toBeNull();
    expect(meta!.title).toBe('Wave 7 Kick-off + What We Shipped in Wave 6 — Wraith Protocol');
    expect(meta!.ogType).toBe('article');
    expect(meta!.ogUrl).toBe('https://usewraith.xyz/blog/wave-7-kickoff');
  });

  it('resolves a blog post from manifest', () => {
    const meta = resolveRouteMetadata('/blog/privacy-by-default');
    expect(meta).not.toBeNull();
    expect(meta!.title).toBe('Privacy by default — Wraith Protocol');
    expect(meta!.ogType).toBe('article');
  });

  it('falls back to generic metadata for unknown blog slug', () => {
    const meta = resolveRouteMetadata('/blog/nonexistent-post');
    expect(meta).not.toBeNull();
    expect(meta!.ogType).toBe('article');
    expect(meta!.ogUrl).toBe('https://usewraith.xyz/blog/nonexistent-post');
    expect(meta!.title).toBe('Blog — Wraith Protocol');
  });

  it('resolves a known case study by slug', () => {
    const meta = resolveRouteMetadata('/case-studies/payroll-processor');
    expect(meta).not.toBeNull();
    expect(meta!.title).toBe('Anonymous Payroll Provider — Wraith Protocol');
    expect(meta!.ogType).toBe('article');
    expect(meta!.ogUrl).toBe('https://usewraith.xyz/case-studies/payroll-processor');
  });

  it('falls back to generic metadata for unknown case study slug', () => {
    const meta = resolveRouteMetadata('/case-studies/nonexistent');
    expect(meta).not.toBeNull();
    expect(meta!.ogType).toBe('article');
    expect(meta!.ogUrl).toBe('https://usewraith.xyz/case-studies/nonexistent');
  });
});

describe('og-metadata: localization', () => {
  it('resolves Spanish locale from /es prefix', () => {
    const meta = resolveRouteMetadata('/es/blog/wave-7-kickoff');
    expect(meta).not.toBeNull();
    expect(meta!.locale).toBe('es');
  });

  it('resolves Spanish locale for /es/stellar', () => {
    const meta = resolveRouteMetadata('/es/stellar');
    expect(meta).not.toBeNull();
    expect(meta!.locale).toBe('es');
    expect(meta!.title).toBe('Integración Stellar — Wraith Protocol');
  });

  it('resolves Spanish locale for /es/grants', () => {
    const meta = resolveRouteMetadata('/es/grants');
    expect(meta).not.toBeNull();
    expect(meta!.locale).toBe('es');
    expect(meta!.title).toBe('Subvenciones — Wraith Protocol');
  });

  it('resolves localized OG image content without changing the public URL', () => {
    const english = resolveRouteMetadata('/grants');
    const spanish = resolveRouteMetadata('/es/grants');

    expect(english).not.toBeNull();
    expect(spanish).not.toBeNull();
    expect(english!.locale).toBe('en');
    expect(spanish!.locale).toBe('es');
    expect(english!.ogImage.title).toBe('Grants');
    expect(english!.ogImage.subtitle).toBe('Build private payments. Get funded.');
    expect(spanish!.ogImage.title).toBe('Subvenciones');
    expect(spanish!.ogImage.title).not.toBe(english!.ogImage.title);
    expect(spanish!.ogImage.subtitle).toBe('Construye pagos privados. Obtén financiación.');
    expect(spanish!.ogImage.subtitle).not.toBe(english!.ogImage.subtitle);
    expect(spanish!.ogUrl).toBe(english!.ogUrl);
    expect(ogImageSlugFor('/es/grants', spanish!.locale)).toBe('es-grants');
  });

  it('resolves English locale for /en/ prefix', () => {
    const meta = resolveRouteMetadata('/en/blog/wave-7-kickoff');
    expect(meta).not.toBeNull();
    expect(meta!.locale).toBe('en');
  });

  it('defaults to English for no locale prefix', () => {
    const meta = resolveRouteMetadata('/blog/wave-7-kickoff');
    expect(meta).not.toBeNull();
    expect(meta!.locale).toBe('en');
  });

  it('strips locale prefixes correctly', () => {
    expect(stripLocalePrefix('/es/blog/test')).toEqual({
      pathname: '/blog/test',
      locale: 'es',
    });
    expect(stripLocalePrefix('/en/stellar')).toEqual({
      pathname: '/stellar',
      locale: 'en',
    });
    expect(stripLocalePrefix('/es')).toEqual({
      pathname: '/',
      locale: 'es',
    });
    expect(stripLocalePrefix('/blog/test')).toEqual({
      pathname: '/blog/test',
      locale: 'en',
    });
  });

  it('returns Spanish locale strings', () => {
    const strings = localeStrings('es');
    expect(strings.ogTitle).toBe('Wraith Protocol');
    expect(strings.siteTitle).toBe('Wraith Protocol — Pagos privados para cada cadena');
  });

  it('returns English locale strings', () => {
    const strings = localeStrings('en');
    expect(strings.ogTitle).toBe('Wraith Protocol');
    expect(strings.siteTitle).toBe('Wraith Protocol — Private payments for every chain');
  });

  it('supports only en and es locales', () => {
    expect(SUPPORTED_LOCALES).toEqual(['en', 'es']);
  });
});

describe('og-metadata: OG image URLs', () => {
  it('generates deterministic image slug for home', () => {
    expect(ogImageSlugFor('/', 'en')).toBe('home');
  });

  it('generates deterministic image slug for blog', () => {
    expect(ogImageSlugFor('/blog', 'en')).toBe('blog');
  });

  it('generates deterministic image slug for blog post', () => {
    expect(ogImageSlugFor('/blog/wave-7-kickoff', 'en')).toBe('blog-wave-7-kickoff');
  });

  it('generates deterministic image slug for case study', () => {
    expect(ogImageSlugFor('/case-studies/payroll-processor', 'en')).toBe(
      'case-study-payroll-processor',
    );
  });

  it('generates deterministic image slug for grants', () => {
    expect(ogImageSlugFor('/grants', 'en')).toBe('grants');
  });

  it('generates deterministic image slug for stellar', () => {
    expect(ogImageSlugFor('/stellar', 'en')).toBe('stellar');
  });

  it('generates deterministic image slug for roadmap', () => {
    expect(ogImageSlugFor('/roadmap', 'en')).toBe('roadmap');
  });

  it('generates deterministic image slug for use-cases', () => {
    expect(ogImageSlugFor('/use-cases', 'en')).toBe('use-cases');
  });

  it('returns null for non-indexable routes', () => {
    expect(ogImageSlugFor('/nonexistent', 'en')).toBeNull();
  });

  it('returns null for non-indexable Spanish routes', () => {
    expect(ogImageSlugFor('/es/nonexistent', 'es')).toBeNull();
    expect(ogImageSlugFor('/es/admin', 'es')).toBeNull();
  });

  it('prefixes slug with locale for Spanish static routes', () => {
    expect(ogImageSlugFor('/es', 'es')).toBe('es-home');
    expect(ogImageSlugFor('/es/grants', 'es')).toBe('es-grants');
    expect(ogImageSlugFor('/es/stellar', 'es')).toBe('es-stellar');
    expect(ogImageSlugFor('/es/blog', 'es')).toBe('es-blog');
  });

  it('prefixes slug with locale for Spanish dynamic routes', () => {
    expect(ogImageSlugFor('/es/blog/wave-7-kickoff', 'es')).toBe('es-blog-wave-7-kickoff');
    expect(ogImageSlugFor('/es/case-studies/payroll-processor', 'es')).toBe(
      'es-case-study-payroll-processor',
    );
  });

  it('does not share a slug between locales (no English fallback)', () => {
    expect(ogImageSlugFor('/grants', 'en')).not.toBe(ogImageSlugFor('/es/grants', 'es'));
    expect(ogImageSlugFor('/blog/wave-7-kickoff', 'en')).not.toBe(
      ogImageSlugFor('/es/blog/wave-7-kickoff', 'es'),
    );
  });

  it('generates OG image URL with proper encoding', () => {
    const meta = resolveRouteMetadata('/blog/wave-7-kickoff');
    expect(meta).not.toBeNull();
    const url = generateOgImageUrl(meta!.ogImage, 'en');
    expect(url).toContain('title=');
    expect(url).toContain('subtitle=');
    expect(url).toContain(SITE_URL);
    expect(() => new URL(url)).not.toThrow();
  });

  it('handles special characters in titles safely', () => {
    const url = generateOgImageUrl(
      { title: 'Test "quoted" <unsafe>', subtitle: 'desc with & special' },
      'en',
    );
    expect(() => new URL(url)).not.toThrow();
  });

  it('does not allow open redirects in OG image URLs', () => {
    const url = generateOgImageUrl({ title: 'Test', subtitle: 'desc' }, 'en');
    expect(url).toMatch(/^https:\/\/usewraith\.xyz\/api\/og\?/);
  });

  it('appends lang parameter for Spanish locale', () => {
    const url = generateOgImageUrl({ title: 'Test', subtitle: 'desc' }, 'es');
    expect(url).toContain('lang=es');
  });

  it('appends badge parameter when chainBadge is present', () => {
    const url = generateOgImageUrl(
      { title: 'Test', subtitle: 'desc', chainBadge: 'Stellar' },
      'en',
    );
    expect(url).toContain('badge=');
  });
});

describe('og-metadata: route indexability', () => {
  it('identifies indexable routes', () => {
    expect(isIndexableRoute('/')).toBe(true);
    expect(isIndexableRoute('/blog')).toBe(true);
    expect(isIndexableRoute('/blog/wave-7-kickoff')).toBe(true);
    expect(isIndexableRoute('/case-studies/payroll-processor')).toBe(true);
    expect(isIndexableRoute('/stellar')).toBe(true);
    expect(isIndexableRoute('/roadmap')).toBe(true);
    expect(isIndexableRoute('/use-cases')).toBe(true);
  });

  it('identifies non-indexable routes', () => {
    expect(isIndexableRoute('/nonexistent')).toBe(false);
    expect(isIndexableRoute('/settings')).toBe(false);
    expect(isIndexableRoute('/admin')).toBe(false);
  });

  it('identifies localized indexable routes', () => {
    expect(isIndexableRoute('/es/blog')).toBe(true);
    expect(isIndexableRoute('/es/stellar')).toBe(true);
    expect(isIndexableRoute('/en/case-studies/payroll-processor')).toBe(true);
  });

  it('identifies localized non-indexable routes', () => {
    expect(isIndexableRoute('/es/nonexistent')).toBe(false);
    expect(isIndexableRoute('/en/admin')).toBe(false);
  });
});

describe('og-metadata: cache control', () => {
  it('provides appropriate cache control header', () => {
    expect(CACHE_CONTROL).toBeTruthy();
    expect(CACHE_CONTROL).toContain('max-age=0');
    expect(CACHE_CONTROL).toContain('s-maxage');
  });
});
