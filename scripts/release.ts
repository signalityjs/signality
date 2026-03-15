import { releaseChangelog, releaseVersion } from 'nx/release';
import * as yargs from 'yargs';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

(async () => {
  const options = await yargs
    .version(false)
    .option('version', {
      description: 'Explicit version specifier to use, if overriding conventional commits',
      type: 'string',
    })
    .option('dryRun', {
      alias: 'd',
      description: 'Whether or not to perform a dry-run of the release process, defaults to true',
      type: 'boolean',
      default: true,
    })
    .option('verbose', {
      description: 'Whether or not to enable verbose logging, defaults to false',
      type: 'boolean',
      default: true,
    })
    .parseAsync();

  const { workspaceVersion, projectsVersionData } = await releaseVersion({
    specifier: options.version,
    dryRun: options.dryRun,
    verbose: options.verbose,
  });

  const { newVersion } = projectsVersionData.kit;

  if (!options.dryRun) {
    updateVersionFile(newVersion!);
  }

  const result = await releaseChangelog({
    versionData: projectsVersionData,
    version: workspaceVersion,
    dryRun: options.dryRun,
    verbose: options.verbose,
  });

  process.exit(Object.values(result).every(result => result.code === 0) ? 0 : 1);
})();

function updateVersionFile(version: string): void {
  const versionFilePath = path.join(__dirname, '../projects/core/version.ts');
  const content = `// This file is generated automatically. Do not edit manually!
export const VERSION = '${version}';
`;

  fs.writeFileSync(versionFilePath, content);

  execSync(`git add ${versionFilePath}`, { stdio: 'inherit' });
}
