import { spawn, spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'node:fs';
import { join, dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { platform, release, arch, cpus, totalmem } from 'node:os';
import { stripVTControlCharacters } from 'node:util';
import { discover, walk, slash, sha256 } from './testing/inventory.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const docs = join(root, 'docs/testing');
const history = join(docs, 'history');
const timezone = 'Europe/Warsaw';
const json = (path, data) => writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
const readJson = path => JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, ''));
const git = (...args) => {
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8', windowsHide: true });
  if (result.status !== 0) throw new Error(`git ${args.join(' ')}: ${result.stderr}`);
  return result.stdout.trim();
};
const args = process.argv.slice(2);
if (args[0] === '--render') {
  const runId = args[1] === 'latest' ? readFileSync(join(docs, 'LATEST_RUN.txt'), 'utf8').trim() : args[1];
  if (!runId || !/^[A-Za-z0-9_.-]+$/.test(runId)) throw new Error('Nieprawidłowy identyfikator przebiegu.');
  const { renderReport } = await import('./testing/render.mjs');
  const result = await renderReport(root, join(history, runId));
  process.exitCode = result.ok ? 0 : 1;
} else {
  const inventory = discover(root);
  const startedAt = new Date().toISOString();
  const runId = `${startedAt.replace(/[:.]/g, '-')}_${git('rev-parse', '--short=8', 'HEAD')}`;
  const statusBefore = git('status', '--porcelain=v1');
  mkdirSync(history, { recursive: true });
  const directory = join(history, runId);
  mkdirSync(directory); // Refuse to overwrite a previous run.
  const sourcePaths = ['src', 'scripts', 'supabase/migrations', 'public'].flatMap(path => walk(join(root, path)));
  sourcePaths.push(...['package.json', 'package-lock.json', 'vitest.config.ts', 'vite.config.ts', 'eslint.config.js'].map(path => join(root, path)));
  const manifest = Object.fromEntries(sourcePaths.sort().map(path => [slash(relative(root, path)), sha256(readFileSync(path))]));
  json(join(directory, 'source-manifest.json'), manifest);
  json(join(directory, 'inventory.json'), inventory);
  const versions = {};
  for (const name of ['vitest', 'vite', 'jsdom', '@testing-library/react', '@electric-sql/pglite', 'fake-indexeddb', 'typescript', 'eslint']) {
    versions[name] = readJson(join(root, 'node_modules', name, 'package.json')).version;
  }
  const metadata = {
    schemaVersion: 1, runId, startedAt, timezone, commit: git('rev-parse', 'HEAD'),
    branch: git('branch', '--show-current'), gitStatusBeforeRun: statusBefore,
    node: process.version, npm: process.env.npm_config_user_agent || null,
    system: { platform: platform(), release: release(), architecture: arch(), logicalCpus: cpus().length, totalMemoryBytes: totalmem() },
    versions, testEnvironment: { default: 'jsdom', overrides: 'node dla atomicSessionSave.test.ts i pwa.test.ts',
      database: 'PGlite; izolowany schemat testowy, lokalny PostgreSQL/WASM, testowe role RLS',
      indexedDB: 'fake-indexeddb; bez rzeczywistej przeglądarki', serviceWorker: 'node:vm; symulowane CacheStorage i sieć' },
    sourceManifestHash: sha256(JSON.stringify(manifest)), commands: [],
  };
  json(join(directory, 'metadata.json'), metadata);
  const manualPath = join(docs, 'manual-results.json');
  json(join(directory, 'manual-results.json'), existsSync(manualPath) ? readJson(manualPath) : []);
  const npmCli = process.env.npm_execpath || join(dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js');
  if (!existsSync(npmCli)) throw new Error('Nie znaleziono npm CLI. Uruchom przez npm run test:report.');
  const npmVersion = spawnSync(process.execPath, [npmCli, '--version'], { encoding: 'utf8', windowsHide: true });
  metadata.npmVersion = npmVersion.stdout?.trim() || null;
  async function run(name, npmArgs, display) {
    const command = { name, command: display, argv: [process.execPath, npmCli, ...npmArgs],
      startedAt: new Date().toISOString(), exitCode: null, signal: null, error: null };
    metadata.commands.push(command);
    json(join(directory, 'metadata.json'), metadata);
    console.log(`\n[${runId}] ${display}`);
    const chunks = { stdout: [], stderr: [] };
    const result = await new Promise(resolveRun => {
      const child = spawn(process.execPath, [npmCli, ...npmArgs], {
        cwd: root, windowsHide: true, env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0' },
      });
      for (const channel of ['stdout', 'stderr']) child[channel].on('data', chunk => {
        chunks[channel].push(chunk);
        process[channel].write(chunk);
      });
      child.on('error', error => { command.error = error.message; });
      child.on('close', (code, signal) => resolveRun({ code, signal }));
    });
    command.exitCode = result.code;
    command.signal = result.signal;
    command.finishedAt = new Date().toISOString();
    command.durationMs = Date.parse(command.finishedAt) - Date.parse(command.startedAt);
    for (const channel of ['stdout', 'stderr']) {
      const text = stripVTControlCharacters(Buffer.concat(chunks[channel]).toString('utf8'));
      writeFileSync(join(directory, `${name}.${channel}.log`), text);
    }
    json(join(directory, 'metadata.json'), metadata);
  }
  await run('test', ['test', '--', '--reporter=default', '--reporter=json',
    `--outputFile.json=${slash(relative(root, join(directory, 'vitest-results.json')))}`, '--includeTaskLocation'],
    'npm test -- --reporter=default --reporter=json --outputFile.json=<przebieg>/vitest-results.json --includeTaskLocation');
  await run('build', ['run', 'build'], 'npm run build');
  await run('lint', ['run', 'lint'], 'npm run lint');
  metadata.finishedAt = new Date().toISOString();
  json(join(directory, 'metadata.json'), metadata);
  writeFileSync(join(docs, 'LATEST_RUN.txt'), runId + '\n');
  console.log(`\nSurowe wyniki: ${slash(relative(root, directory))}`);
  if (!args.includes('--capture-only')) {
    const { renderReport } = await import('./testing/render.mjs');
    const result = await renderReport(root, directory);
    process.exitCode = result.ok ? 0 : 1;
  } else process.exitCode = metadata.commands.some(command => command.exitCode !== 0) ? 1 : 0;
}
