import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

(function copyChangelog() {
  const projectRoot = process.cwd();
  const src = resolve(projectRoot, 'CHANGELOG.md');
  const destDir = resolve(projectRoot, 'projects/docs/resources');
  const dest = resolve(destDir, 'changelog.md');
  const configPath = resolve(projectRoot, 'projects/docs/.vitepress/config.ts');

  if (!existsSync(src)) {
    console.error('CHANGELOG.md not found:', src);
    process.exit(1);
  }

  if (!existsSync(destDir)) {
    mkdirSync(destDir, { recursive: true });
  }

  if (!existsSync(configPath)) {
    console.error('config.ts not found:', configPath);
    process.exit(1);
  }

  const configContent = readFileSync(configPath, 'utf-8');

  const textLinkRegex = /\{?\s*text:\s*['"]([^'"]+)['"]\s*,\s*link:\s*['"]([^'"]+)['"]/g;

  const utilityMap = new Map<string, string>();

  let match;

  while ((match = textLinkRegex.exec(configContent)) !== null) {
    const text = match[1];
    const link = match[2];
    utilityMap.set(text, link);
  }

  console.log(`Found ${utilityMap.size} utilities in sidebar`);

  function toPascalCase(camelCase: string): string {
    return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
  }

  function processInlineCode(content: string): string {
    const inlineCodeRegex = /`([a-z][a-zA-Z0-9]*)`/g;

    return content.replace(inlineCodeRegex, (fullMatch, code) => {
      const pascalCase = toPascalCase(code);
      const link = utilityMap.get(pascalCase);

      if (link) {
        return `[\`${code}\`](${link})`;
      }

      return fullMatch;
    });
  }

  const content = readFileSync(src, 'utf-8');
  const processedContent = processInlineCode(content);

  const frontmatter = `---
editLinkUrl: https://github.com/signalityjs/signality/blob/main/CHANGELOG.md
---

# Changelog

`;

  writeFileSync(dest, frontmatter + processedContent, 'utf-8');
  console.log('Copied CHANGELOG.md →', dest);
})();
