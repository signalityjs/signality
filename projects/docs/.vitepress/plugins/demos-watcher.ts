import type { Plugin } from 'vitepress';
import { watch, existsSync } from 'fs';
import { resolve } from 'path';

export function demosWatcher(): Plugin {
  return {
    name: 'demos-watcher',
    apply: 'serve',
    configureServer(server) {
      const demosPath = resolve(process.cwd(), 'projects/docs/public/demos');

      if (!existsSync(demosPath)) {
        console.warn(`[demos-watcher] Demos directory not found: ${demosPath}`);
        return;
      }

      const watcher = watch(demosPath, { recursive: true }, (_, filename) => {
        if (filename && (filename.endsWith('.js') || filename.endsWith('.js.map'))) {
          server.ws.send({ type: 'full-reload' });
          console.log(`[demos-watcher] Detected change in ${filename}, reloading page...`);
        }
      });

      watcher.on('error', error => {
        console.error('[demos-watcher] Error watching demos directory:', error);
      });

      server.httpServer?.once('close', () => {
        watcher.close();
      });
    },
  };
}
