import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { definitions, limitations } from './catalog-seed.mjs';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const target = join(root, 'docs/testing/test-catalog.json');
if (existsSync(target)) throw new Error('Katalog już istnieje. Aktualizuj wpisy według pełnej nazwy; inicjalizacja nie nadpisuje identyfikatorów.');
const runId = readFileSync(join(root, 'docs/testing/LATEST_RUN.txt'), 'utf8').trim();
const inventory = JSON.parse(readFileSync(join(root, 'docs/testing/history', runId, 'inventory.json'), 'utf8'));
const catalog = [];
for (const [source, [category, prefix, defaultLevel, data]] of Object.entries(definitions)) {
  const cases = inventory.cases.filter(test => test.source === source);
  const descriptions = data.trim().split('\n').map(line => line.trim().split('|'));
  if (cases.length !== descriptions.length) throw new Error(`${source}: ${cases.length} przypadków, ${descriptions.length} opisów`);
  cases.forEach((test, index) => {
    const [description, expected] = descriptions[index];
    let assignedCategory = category;
    let level = defaultLevel;
    let limitation = limitations[source] || limitations.jednostkowy;
    if (source.endsWith('productionHardening.test.ts')) {
      if (index >= 2) assignedCategory = 'T1';
      if (index >= 2 && index <= 5) { level = 'jednostkowy'; limitation = limitations.jednostkowy; }
      else limitation = index === 6 ? 'Lokalna kopia reguł z progami baseline-2 i baseline+1; nie wywołuje produkcyjnej funkcji stref i nie potwierdza zgodności jej progów.' : 'Sprawdza lokalny obiekt lub filtrowanie tablicy. Mimo nazwy testu nie uruchamia wyzwalacza ani zapytania historii.';
    }
    if (source.endsWith('importHistory.test.ts') && index >= 6) {
      level = 'symulacyjny'; limitation = 'Deklaratywny przykład danych lub lokalne filtrowanie; nie uruchamia importu do bazy, historii, agregacji ani kompletnego obliczenia poziomu.';
    }
    if (source === 'src/lib/analytics.test.ts' && index === 23) { level = 'symulacyjny'; limitation = 'Sprawdzana jest jedynie pusta tablica w lokalnym obiekcie; brak rzeczywistego filtra obiektu lub zapytania.'; }
    if (source.endsWith('toast.test.ts') && index === 0) limitation += ' Nazwa sugeruje 3000 ms, lecz test nie używa zegara ani asercji opóźnienia.';
    if (source.endsWith('toast.test.ts') && index === 4) { level = 'symulacyjny'; limitation = 'Placeholder expect(true).toBe(true); nie sprawdza CSS, DOM ani responsywności.'; }
    if (source.endsWith('pwa.test.ts') && index === 0) level = 'integracyjny';
    if (source.endsWith('userLevelCache.test.ts') && index === 2) level = 'symulacyjny';
    catalog.push({ id: `${assignedCategory}-${prefix}-${String(index + 1).padStart(3, '0')}`,
      key: test.key, source, fullName: test.fullName, originalTitle: test.title,
      category: assignedCategory, level, description, objective: `Weryfikacja: ${description.toLocaleLowerCase('pl-PL')}.`,
      expected, limitations: limitation, sourceLineAtReview: test.line });
  });
}
if (catalog.length !== inventory.cases.length || new Set(catalog.map(test => test.id)).size !== catalog.length) throw new Error('Niekompletny lub nieunikalny katalog.');
writeFileSync(target, JSON.stringify(catalog, null, 2) + '\n');
console.log(`Zapisano ${catalog.length} unikalnych opisanych przypadków: ${target}`);
