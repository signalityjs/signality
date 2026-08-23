import { createContentLoader } from 'vitepress';

export interface UtilityItem {
  /** camelCase function name, e.g. `onClickOutside` */
  name: string;
  /** page link without extension, e.g. `/elements/on-click-outside` */
  link: string;
  /** one-line description extracted from the page's first paragraph */
  description: string;
  /** lowercase search haystack: name + slug words + description */
  haystack: string;
}

export interface UtilityCategory {
  name: string;
  slug: string;
  items: UtilityItem[];
}

export interface UtilitiesData {
  total: number;
  categories: UtilityCategory[];
}

const CATEGORY_ORDER: ReadonlyArray<readonly [slug: string, name: string]> = [
  ['browser', 'Browser'],
  ['elements', 'Elements'],
  ['observers', 'Observers'],
  ['reactivity', 'Reactivity'],
  ['scheduling', 'Scheduling'],
  ['router', 'Router'],
  ['forms', 'Forms'],
  ['utilities', 'Utilities'],
  ['cdk-interop', 'CDK Interop'],
];

declare const data: UtilitiesData;
export { data };

function toCamelCase(slug: string): string {
  return slug.replace(/-./g, match => match[1].toUpperCase());
}

/**
 * Extracts the first prose paragraph after the page's H1 and strips
 * markdown links and inline code so it reads as plain text.
 */
function extractDescription(src: string | undefined): string {
  if (!src) {
    return '';
  }

  const body = src.replace(/^---[\s\S]*?---\s*/, '');
  const lines = body.split(/\r?\n/);
  const paragraph: string[] = [];
  let afterTitle = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!afterTitle) {
      if (/^#\s/.test(line)) {
        afterTitle = true;
      }
      continue;
    }

    const isProse = line !== '' && !/^(<|:::|#|```)/.test(line);

    if (paragraph.length === 0) {
      if (isProse) {
        paragraph.push(line);
      }
      continue;
    }

    if (!isProse) {
      break;
    }
    paragraph.push(line);
  }

  return paragraph
    .join(' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

export default createContentLoader(
  CATEGORY_ORDER.map(([slug]) => `${slug}/*.md`),
  {
    includeSrc: true,
    transform(pages): UtilitiesData {
      const byCategory = new Map<string, UtilityItem[]>();

      for (const page of pages) {
        const link = page.url.replace(/\.html$/, '');
        const match = link.match(/^\/([^/]+)\/([^/]+)$/);

        if (!match) {
          // category index pages like `/utilities/` are not utilities
          continue;
        }

        const [, categorySlug, pageSlug] = match;
        const name = toCamelCase(pageSlug);
        const description = extractDescription(page.src);
        const item: UtilityItem = {
          name,
          link,
          description,
          haystack: `${name} ${pageSlug.replace(/-/g, ' ')} ${description}`.toLowerCase(),
        };

        const items = byCategory.get(categorySlug) ?? [];
        items.push(item);
        byCategory.set(categorySlug, items);
      }

      const categories: UtilityCategory[] = [];

      for (const [slug, name] of CATEGORY_ORDER) {
        const items = byCategory.get(slug);

        if (!items || items.length === 0) {
          continue;
        }

        items.sort((a, b) => a.name.localeCompare(b.name));
        categories.push({ name, slug, items });
      }

      const total = categories.reduce((sum, category) => sum + category.items.length, 0);

      return { total, categories };
    },
  },
);
