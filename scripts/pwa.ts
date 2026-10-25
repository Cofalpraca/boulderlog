import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import type { Plugin } from 'vite';

// Build the worker from tracked source and precache the complete emitted app,
// including hashed JS/CSS chunks which are not known until generateBundle.
export function pwa(): Plugin {
  return {
    name: 'boulderlog-pwa',
    apply: 'build',
    generateBundle(_options, bundle) {
      const publicAssets = ['manifest.json', 'favicon.ico', 'favicon.png',
        'icon-192.png', 'icon-512.png', 'icon-boulder.png', 'icon-strength.png'];
      const emittedAssets = Object.keys(bundle).filter(name => !name.endsWith('.map'));
      const precache = ['/', ...emittedAssets.filter(name => name !== 'index.html').map(name => `/${name}`),
        ...publicAssets.map(name => `/${name}`)];
      const worker = readFileSync(new URL('../src/service-worker.js', import.meta.url), 'utf8');
      const hash = createHash('sha256').update(worker);
      for (const asset of Object.values(bundle)) {
        hash.update(asset.type === 'chunk' ? asset.code : asset.source);
      }
      for (const name of publicAssets) hash.update(readFileSync(new URL(`../public/${name}`, import.meta.url)));
      const source = worker.replace('__PRECACHE_ASSETS__', JSON.stringify(precache))
        .replace('__CACHE_VERSION__', JSON.stringify(hash.digest('hex').slice(0, 16)));
      this.emitFile({ type: 'asset', fileName: 'sw.js', source });
    },
  };
}
