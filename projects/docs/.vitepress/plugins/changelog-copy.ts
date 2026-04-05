import type { Plugin } from 'vitepress';
import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';

export function changelogCopy(): Plugin {
  return {
    name: 'changelog-copy',
    enforce: 'pre',

    configResolved() {
      const src = resolve(process.cwd(), 'CHANGELOG.md');
      const destDir = resolve(process.cwd(), 'projects/docs/resources');
      const dest = resolve(destDir, 'changelog.md');

      if (!existsSync(src)) {
        console.warn('[changelog-copy] CHANGELOG.md not found:', src);
        return;
      }

      if (!existsSync(destDir)) {
        mkdirSync(destDir, { recursive: true });
      }

      copyFileSync(src, dest);
      console.log('[changelog-copy] Copied CHANGELOG.md to resources/changelog.md');
    },
  };
}
