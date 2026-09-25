import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { buildRssFeed, getPosts } from '../../scripts/gen-rss.mjs';
import { slugifyTag } from '../../scripts/feed-utils.mjs';

/**
 * Sitemap and RSS regression tests.
 *
 * Both files are generated during `pnpm build`, so nothing caught a duplicate
 * URL, a malformed date, a post missing from a feed, or a preview route leaking
 * into production metadata. They run against the committed artifacts, which
 * means a content change that is not followed by a rebuild fails here.
 */

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const publicDir = join(rootDir, 'public');
const siteUrl = 'https://usewraith.xyz';

const posts = getPosts();
const sitemapXml = readFileSync(join(publicDir, 'sitemap.xml'), 'utf8');
const feedXml = readFileSync(join(publicDir, 'feed.xml'), 'utf8');

function parseXml(xml: string, label: string): Document {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  const error = doc.querySelector('parsererror');
  if (error) {
    throw new Error(`${label} is not well-formed XML: ${error.textContent?.trim()}`);
  }
  return doc;
}

function textOf(node: Element, tag: string): string {
  return node.getElementsByTagName(tag)[0]?.textContent?.trim() ?? '';
}

function childrenOf(node: Element, tag: string): Element[] {
  return Array.from(node.getElementsByTagName(tag));
}

const sitemapUrls = childrenOf(parseXml(sitemapXml, 'sitemap.xml'), 'url').map((node) => ({
  loc: textOf(node, 'loc'),
  lastmod: textOf(node, 'lastmod'),
  changefreq: textOf(node, 'changefreq'),
  priority: textOf(node, 'priority'),
}));

const locs = sitemapUrls.map((entry) => entry.loc);

const tagFeedFiles = existsSync(join(publicDir, 'feed', 'tag'))
  ? readdirSync(join(publicDir, 'feed', 'tag')).filter((file) => file.endsWith('.xml'))
  : [];

const expectedTags = new Map<string, string[]>();
for (const post of posts) {
  for (const tag of post.tags ?? []) {
    const key = slugifyTag(tag);
    expectedTags.set(key, [...(expectedTags.get(key) ?? []), post.slug]);
  }
}

function stripBuildDate(xml: string): string {
  return xml.replace(/<lastBuildDate>[\s\S]*?<\/lastBuildDate>/, '<lastBuildDate/>');
}

// ─── Sitemap ────────────────────────────────────────────────────────────────

describe('sitemap.xml', () => {
  it('is a well-formed urlset with entries', () => {
    const root = parseXml(sitemapXml, 'sitemap.xml').documentElement;

    expect(root.nodeName).toBe('urlset');
    expect(sitemapUrls.length).toBeGreaterThan(0);
  });

  it('lists every URL exactly once', () => {
    const duplicates = locs.filter((loc, index) => locs.indexOf(loc) !== index);

    expect(duplicates).toEqual([]);
  });

  it('uses absolute canonical URLs on the production host', () => {
    const offsite = locs.filter((loc) => !loc.startsWith(`${siteUrl}/`) && loc !== siteUrl);

    expect(offsite).toEqual([]);
  });

  it('carries a valid lastmod, changefreq and priority on every entry', () => {
    const today = new Date().toISOString().slice(0, 10);
    const invalid = sitemapUrls.filter(
      (entry) =>
        !/^\d{4}-\d{2}-\d{2}$/.test(entry.lastmod) ||
        entry.lastmod > today ||
        !/^(daily|weekly|monthly|yearly|always|never|hourly)$/.test(entry.changefreq) ||
        !/^(0\.\d|1\.0)$/.test(entry.priority),
    );

    expect(invalid.map((entry) => entry.loc)).toEqual([]);
  });

  it('does not leak preview, staging, error or image routes', () => {
    const leaked = locs.filter(
      (loc) => /\/(preview|staging|404)(\/|$)/.test(loc) || loc.includes('/og/'),
    );

    expect(leaked).toEqual([]);
  });

  it('includes every published blog post exactly once', () => {
    const missing = posts
      .map((post) => `${siteUrl}/blog/${post.slug}`)
      .filter((url) => !locs.includes(url));

    expect(missing).toEqual([]);
  });

  it('includes a route for every tag feed', () => {
    const missing = tagFeedFiles
      .map((file) => `${siteUrl}/blog/tag/${file.replace(/\.xml$/, '')}`)
      .filter((url) => !locs.includes(url));

    expect(missing).toEqual([]);
  });
});

// ─── RSS ────────────────────────────────────────────────────────────────────

describe('feed.xml', () => {
  const channel = parseXml(feedXml, 'feed.xml').documentElement;
  const items = childrenOf(channel, 'item');

  it('is a well-formed rss document with channel metadata', () => {
    expect(parseXml(feedXml, 'feed.xml').documentElement.nodeName).toBe('rss');
    expect(textOf(channel, 'title')).not.toBe('');
    expect(textOf(channel, 'link')).toBe(`${siteUrl}/blog`);
    expect(textOf(channel, 'description')).not.toBe('');
  });

  it('lists every published post exactly once', () => {
    const links = items.map((item) => textOf(item, 'link'));
    const expected = posts.map((post) => post.url);

    expect(links).toEqual(expected);
    expect(new Set(links).size).toBe(links.length);
  });

  it('uses valid publication dates that match the post metadata', () => {
    const bySlug = new Map(posts.map((post) => [post.slug, post]));

    for (const item of items) {
      const slug = textOf(item, 'link').split('/blog/')[1] ?? '';
      const post = bySlug.get(slug);
      expect(post, `feed item ${slug} has no matching post`).toBeDefined();

      const pubDate = new Date(textOf(item, 'pubDate'));
      expect(Number.isNaN(pubDate.getTime()), `invalid pubDate for ${slug}`).toBe(false);
      expect(pubDate.toISOString().slice(0, 10)).toBe(
        new Date(post!.publishedAt).toISOString().slice(0, 10),
      );
    }
  });

  it('is fresh: lastBuildDate is not older than the newest post', () => {
    const buildDate = new Date(textOf(channel, 'lastBuildDate'));
    const newest = Math.max(...posts.map((post) => new Date(post.publishedAt).getTime()));

    expect(Number.isNaN(buildDate.getTime())).toBe(false);
    expect(buildDate.getTime()).toBeGreaterThanOrEqual(newest);
  });

  it('matches a freshly generated feed', () => {
    expect(stripBuildDate(feedXml)).toBe(stripBuildDate(buildRssFeed(posts, siteUrl)));
  });
});

// ─── Tag feeds ──────────────────────────────────────────────────────────────

describe('tag feeds', () => {
  it('has exactly one feed per tag used by a post', () => {
    expect(tagFeedFiles.map((file) => file.replace(/\.xml$/, '')).sort()).toEqual(
      [...expectedTags.keys()].sort(),
    );
  });

  it('only lists posts carrying that tag and links to itself', () => {
    for (const [slug, postSlugs] of expectedTags) {
      const xml = readFileSync(join(publicDir, 'feed', 'tag', `${slug}.xml`), 'utf8');
      const doc = parseXml(xml, `${slug}.xml`);
      const links = childrenOf(doc.documentElement, 'item').map((item) => textOf(item, 'link'));

      expect(links.map((link) => link.split('/blog/')[1])).toEqual(postSlugs);
      expect(xml).toContain(`href="${siteUrl}/feed/tag/${slug}.xml"`);
    }
  });

  it('matches freshly generated tag feeds', () => {
    for (const [slug, postSlugs] of expectedTags) {
      const file = join(publicDir, 'feed', 'tag', `${slug}.xml`);
      const committed = readFileSync(file, 'utf8');
      const tag = posts
        .find((post) => postSlugs.includes(post.slug))!
        .tags!.find((candidate) => slugifyTag(candidate) === slug)!;
      const expected = buildRssFeed(
        posts.filter((post) => (post.tags ?? []).includes(tag)),
        siteUrl,
        { tag },
      );

      expect(stripBuildDate(committed)).toBe(stripBuildDate(expected));
    }
  });
});
