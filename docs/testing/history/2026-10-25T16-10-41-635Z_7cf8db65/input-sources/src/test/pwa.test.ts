// @vitest-environment node
import { build } from 'vite';
import type { RollupOutput } from 'rollup';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { beforeAll, describe, expect, it, vi } from 'vitest';

let files: Map<string, string | Uint8Array>;
let worker: string;
const origin = 'https://boulderlog.test';
beforeAll(async () => {
  // Build in memory: these assertions check what a clean production build emits.
  const output = await build({ logLevel: 'silent', build: { write: false } }) as RollupOutput;
  files = new Map(output.output.map(asset => [`/${asset.fileName}`, asset.type === 'chunk' ? asset.code : asset.source]));
  files.set('/', files.get('/index.html')!);
  const manifest = JSON.parse(readFileSync(new URL('../../public/manifest.json', import.meta.url), 'utf8'));
  for (const name of ['manifest.json', 'favicon.ico', 'favicon.png',
    ...manifest.icons.map(icon => icon.src.slice(1)),
    ...manifest.shortcuts.flatMap(shortcut => shortcut.icons.map(icon => icon.src.slice(1)))]) {
    files.set(`/${name}`, readFileSync(new URL(`../../public/${name}`, import.meta.url)));
  }
  worker = String(files.get('/sw.js'));
}, 60000);

function harness() {
  const listeners = new Map<string, (event: object) => void>();
  const stores = new Map<string, Map<string, Response>>();
  const path = (request: string | { url: string }) => new URL(typeof request === 'string' ? request : request.url, origin).pathname;
  const network = vi.fn(async (request: string | { url: string }) => {
    const body = files.get(path(request));
    return body === undefined ? new Response('Not found', { status: 404 }) : new Response(body);
  });
  const caches = {
    keys: async () => [...stores.keys()],
    delete: async (name: string) => stores.delete(name),
    open: async (name: string) => {
      if (!stores.has(name)) stores.set(name, new Map());
      const store = stores.get(name)!;
      return {
        match: async (request: string | { url: string }) => store.get(path(request))?.clone(),
        addAll: async (urls: string[]) => {
          const responses = await Promise.all(urls.map(async url => {
            const response = await network(url);
            if (!response.ok) throw new Error(`Precache failed: ${url}`);
            return [url, response] as const;
          }));
          for (const [url, response] of responses) store.set(url, response);
        },
      };
    },
  };
  const postMessage = vi.fn();
  const clients = { claim: vi.fn(), matchAll: async () => [{ postMessage }] };
  runInNewContext(worker, {
    self: { addEventListener: (name: string, listener: (event: object) => void) => listeners.set(name, listener),
      location: { origin }, clients, skipWaiting: vi.fn() },
    caches, fetch: network, URL, Response,
  });
  const dispatch = async (name: string, fields: object = {}) => {
    let response: Promise<Response> | undefined;
    let lifetime: Promise<unknown> | undefined;
    listeners.get(name)!({ ...fields,
      waitUntil: (promise: Promise<unknown>) => { lifetime = promise; },
      respondWith: (promise: Promise<Response>) => { response = promise; },
    });
    await lifetime;
    return response;
  };
  const request = (pathname: string, mode = 'cors', method = 'GET') => ({ url: `${origin}${pathname}`, method, mode });
  return { dispatch, request, network, caches, stores, postMessage };
}

describe('production PWA', () => {
  it('emits executable sw.js with no build placeholders and matching icon files and dimensions', () => {
    expect(worker).toContain('boulderlog-');
    expect(worker).not.toMatch(/__PRECACHE_ASSETS__|__CACHE_VERSION__/);
    const manifest = JSON.parse(readFileSync(new URL('../../public/manifest.json', import.meta.url), 'utf8'));
    for (const icon of [...manifest.icons, ...manifest.shortcuts.flatMap(shortcut => shortcut.icons)]) {
      const bytes = Buffer.from(files.get(icon.src)!);
      expect(bytes.subarray(1, 4).toString()).toBe('PNG');
      expect(`${bytes.readUInt32BE(16)}x${bytes.readUInt32BE(20)}`).toBe(icon.sizes);
    }
    expect(String(files.get('/index.html'))).toContain('/manifest.json');
  });
  it('precaches every emitted JS/CSS/image and serves the app and scripts after losing the network', async () => {
    const h = harness();
    await h.dispatch('install');
    const paths = [...files.keys()].filter(path => path.startsWith('/assets/'));
    expect(paths.some(path => path.endsWith('.js'))).toBe(true);
    expect(paths.some(path => path.endsWith('.css'))).toBe(true);
    h.network.mockRejectedValue(new Error('Offline'));
    const navigation = await h.dispatch('fetch', { request: h.request('/session/new?type=off_wall', 'navigate') });
    expect(await navigation?.text()).toBe(String(files.get('/index.html')));
    for (const pathname of paths) {
      const response = await h.dispatch('fetch', { request: h.request(pathname) });
      expect(response?.ok).toBe(true);
      expect((await response!.arrayBuffer()).byteLength).toBeGreaterThan(0);
    }
  });
  it('fails installation if a precache resource is missing', async () => {
    const h = harness();
    h.network.mockResolvedValue(new Response('Missing', { status: 404 }));
    await expect(h.dispatch('install')).rejects.toThrow('Precache failed');
  });
  it('leaves Supabase, cross-origin, non-GET and same-origin API requests to the network', async () => {
    const h = harness();
    for (const request of [
      { url: 'https://example.supabase.co/rest/v1/sessions', method: 'GET', mode: 'cors' },
      { url: 'https://fonts.googleapis.com/test.css', method: 'GET', mode: 'cors' },
      h.request('/api/private'), h.request('/assets/test.js', 'cors', 'POST'),
    ]) expect(await h.dispatch('fetch', { request })).toBeUndefined();
    expect(h.network).not.toHaveBeenCalled();
  });
  it('cleans up only app caches and forwards background sync to the app', async () => {
    const h = harness();
    await h.caches.open('unrelated-app');
    await h.caches.open('climbtrack-v2');
    await h.dispatch('install');
    await h.dispatch('activate');
    expect(await h.caches.keys()).toContain('unrelated-app');
    expect(await h.caches.keys()).not.toContain('climbtrack-v2');
    await h.dispatch('sync', { tag: 'sync-sessions' });
    expect(h.postMessage).toHaveBeenCalledWith({ type: 'SYNC_SESSIONS' });
  });
});
