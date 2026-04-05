const { existsSync, mkdirSync, readFileSync, writeFileSync } = require('fs');
const { resolve } = require('path');

const projectRoot = process.cwd();
const src = resolve(projectRoot, 'CHANGELOG.md');
const destDir = resolve(projectRoot, 'projects/docs/resources');
const dest = resolve(destDir, 'changelog.md');

if (!existsSync(src)) {
  console.error('CHANGELOG.md not found:', src);
  process.exit(1);
}

if (!existsSync(destDir)) {
  mkdirSync(destDir, { recursive: true });
}

const content = readFileSync(src, 'utf-8');
const frontmatter = `---
editLinkUrl: https://github.com/signalityjs/signality/blob/main/CHANGELOG.md
---

# Changelog

`;

writeFileSync(dest, frontmatter + content, 'utf-8');
console.log('Copied CHANGELOG.md →', dest);
