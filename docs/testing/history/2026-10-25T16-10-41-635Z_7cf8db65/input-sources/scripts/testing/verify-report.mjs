import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sha256 } from './inventory.mjs';
import { statusOf } from './render.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const docs = join(root, 'docs/testing');
const readJson = path => JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, ''));
const runId = readFileSync(join(docs, 'LATEST_RUN.txt'), 'utf8').trim();
const directory = join(docs, 'history', runId);
const metadata = readJson(join(directory, 'metadata.json'));
const result = readJson(join(directory, 'results.json'));
const raw = readJson(join(directory, 'vitest-results.json'));

function parseCSV(input) {
  const records = []; let row = []; let cell = ''; let quoted = false;
  const value = input.replace(/^\uFEFF/, '');
  for (let i = 0; i < value.length; i++) {
    const char = value[i];
    if (char === '"') {
      if (quoted && value[i + 1] === '"') { cell += '"'; i++; }
      else quoted = !quoted;
    } else if (!quoted && char === ',') { row.push(cell); cell = ''; }
    else if (!quoted && (char === '\n' || char === '\r')) {
      if (char === '\r' && value[i + 1] === '\n') i++;
      row.push(cell); if (row.some(item => item !== '')) records.push(row); row = []; cell = '';
    } else cell += char;
  }
  assert.equal(quoted, false, 'Niedomknięte pole CSV');
  if (cell || row.length) { row.push(cell); records.push(row); }
  const headers = records.shift();
  return records.map(fields => {
    assert.equal(fields.length, headers.length, 'Niezgodna liczba kolumn CSV');
    return Object.fromEntries(headers.map((header, index) => [header, fields[index]]));
  });
}
const csv = parseCSV(readFileSync(join(docs, 'TEST_RESULTS.csv'), 'utf8'));
assert.equal(csv.length, result.rows.length);
assert.equal(new Set(csv.map(row => row.id)).size, csv.length);
assert.match(metadata.commit, /^[0-9a-f]{40}$/);
assert.equal(result.integrityIssues.length, 0, result.integrityIssues.join('\n'));
const automatic = csv.filter(row => row.kind === 'automatyczny');
const manual = csv.filter(row => row.kind === 'manualny');
assert.equal(automatic.length, raw.numTotalTests);
assert.equal(automatic.filter(row => row.status === 'PASS').length, raw.numPassedTests);
assert.equal(automatic.filter(row => row.status === 'FAIL').length, raw.numFailedTests);
assert.equal(manual.length, result.manual.total);
const assertions = raw.testResults.flatMap(file => file.assertionResults.map(test => ({
  source: file.name.replaceAll('\\', '/'), fullName: test.fullName, status: test.status,
})));
for (const row of automatic) {
  const test = assertions.find(test => test.source.endsWith('/' + row.source) && test.fullName === row.original_name);
  if (row.status === 'PASS') assert.equal(test?.status, 'passed', row.id);
  if (row.status === 'FAIL') assert.equal(test?.status, 'failed', row.id);
  assert.ok(row.description && row.objective && row.expected && row.source && row.evidence, row.id);
}
for (const row of manual) {
  if (['PASS', 'FAIL'].includes(row.status)) assert.ok(row.actual && row.executed_at && row.device && row.executor && row.evidence && row.commit && row.environment, row.id);
  if (row.status === 'NOT_RUN') assert.equal(row.executed_at, '', row.id);
}
// Check status handling with synthetic reporter inputs; these are tool checks,
// not additional application cases and are not included in T1–T6 statistics.
assert.equal(statusOf(null).status, 'NOT_RUN');
assert.equal(statusOf({ status: 'passed' }).status, 'PASS');
assert.equal(statusOf({ status: 'failed', failureMessages: ['kontrolny błąd'] }).status, 'FAIL');
assert.equal(statusOf({ status: 'skipped' }, { declaredSkip: true }).status, 'SKIP');
assert.equal(statusOf({ status: 'skipped' }, {}, { status: 'failed', message: 'beforeAll failed' }).status, 'NOT_RUN');

const currentHashes = readJson(join(directory, 'report-hashes.json'));
for (const [name, hash] of Object.entries(currentHashes.current)) assert.equal(sha256(readFileSync(join(docs, name))), hash, `Bieżący dokument ${name}`);
let archivesVerified = 0;
for (const name of readdirSync(join(docs, 'history'))) {
  const archive = join(docs, 'history', name);
  const hashPath = join(archive, 'report-hashes.json');
  if (!existsSync(hashPath)) continue;
  const hashes = readJson(hashPath);
  for (const [file, hash] of Object.entries(hashes.archived || hashes)) assert.equal(sha256(readFileSync(join(archive, file))), hash, `Archiwum ${name}/${file}`);
  archivesVerified++;
}
const manifest = readJson(join(directory, 'source-manifest.json'));
for (const [source, hash] of Object.entries(manifest)) {
  if (source.startsWith('src/') || source.startsWith('supabase/migrations/')) assert.equal(sha256(readFileSync(join(root, source))), hash, `Źródło zmienione po badaniu: ${source}`);
}
for (const row of automatic) assert.ok(existsSync(join(directory, 'input-sources', row.source)), `Brak kopii wejścia: ${row.source}`);
const automatedText = readFileSync(join(docs, 'AUTOMATED_TEST_RESULTS.md'), 'utf8');
assert.equal((automatedText.match(/^### T[1-5]-/gm) || []).length, automatic.length);
const manualText = readFileSync(join(docs, 'MANUAL_TEST_CASES.md'), 'utf8');
assert.equal((manualText.match(/^## T6-MAN-/gm) || []).length, manual.length);
const audit = { verifiedAt: new Date().toISOString(), runId, automaticCasesVerified: automatic.length,
  manualProtocolsVerified: manual.length, controls: csv.filter(row => row.category === 'CONTROL').length,
  archivesVerified, status: 'PASS', scope: 'Spójność i integralność dokumentacji; nie jest ponownym wykonaniem testów aplikacji ani manualnych.' };
writeFileSync(join(directory, 'verification.json'), JSON.stringify(audit, null, 2) + '\n');
console.log(JSON.stringify(audit, null, 2));
