import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { sha256, slash } from './inventory.mjs';
import { manualCases } from './manual-cases.mjs';

export const categories = {
  T1: 'Algorytmy i analityka', T2: 'Funkcjonalności aplikacji i interfejs użytkownika',
  T3: 'Baza danych, integralność i bezpieczeństwo', T4: 'IndexedDB i synchronizacja offline',
  T5: 'PWA, Service Worker i konfiguracja produkcyjna', T6: 'Testy manualne i rzeczywiste treningi',
};
const readJson = path => JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, ''));
const text = path => existsSync(path) ? readFileSync(path, 'utf8') : '';
const escape = value => String(value ?? '').replaceAll('|', '\\|').replace(/\r?\n/g, '<br>');
const table = (headers, rows) => [headers, headers.map(() => '---'), ...rows].map(row => `| ${row.map(escape).join(' | ')} |`).join('\n');
const percentage = (pass, fail) => pass + fail ? (100 * pass / (pass + fail)).toFixed(2).replace('.', ',') + '%' : 'nie dotyczy';
const localDate = iso => new Intl.DateTimeFormat('pl-PL', { dateStyle: 'full', timeStyle: 'long', timeZone: 'Europe/Warsaw' }).format(new Date(iso));
const totals = rows => Object.fromEntries(['PASS', 'FAIL', 'SKIP', 'NOT_RUN'].map(status => [status, rows.filter(row => row.status === status).length]));

export function statusOf(assertion, definition, file) {
  if (!assertion) return { status: 'NOT_RUN', reason: 'Brak rekordu wykonania w raporcie Vitest; sprawdź kod wyjścia i logi polecenia npm test.' };
  if (assertion.status === 'passed') return { status: 'PASS', reason: 'Vitest zarejestrował passed dla tego konkretnego przypadku.' };
  if (assertion.status === 'failed') return { status: 'FAIL', reason: assertion.failureMessages?.join('\n') || 'Vitest zarejestrował failed; szczegóły w surowym JSON i logach.' };
  if (file?.status === 'failed' && file.message && !definition?.declaredSkip && !definition?.declaredTodo) {
    return { status: 'NOT_RUN', reason: `Błąd przygotowania lub kolekcji pliku: ${file.message}` };
  }
  if (['pending', 'skipped', 'todo'].includes(assertion.status)) {
    return { status: 'SKIP', reason: definition?.declaredSkip ? 'Jawne pominięcie skip w źródle.' : definition?.declaredTodo ? 'Jawne oznaczenie todo w źródle.' : `Reporter zwrócił ${assertion.status}; szczegółowa przyczyna nie została podana.` };
  }
  return { status: 'NOT_RUN', reason: `Brak potwierdzonego zakończenia: status reportera ${assertion.status}.` };
}

export function csvOf(rows) {
  const columns = ['run_id', 'id', 'category', 'kind', 'level', 'description', 'objective', 'expected', 'actual', 'status',
    'source', 'line', 'original_name', 'duration_ms', 'executed_at', 'commit', 'environment', 'device', 'executor', 'evidence', 'limitations', 'notes'];
  const quote = value => `"${String(value ?? '').replaceAll('"', '""')}"`;
  return '\uFEFF' + [columns, ...rows.map(row => columns.map(key => row[key] ?? ''))].map(row => row.map(quote).join(',')).join('\r\n') + '\r\n';
}

export async function renderReport(root, directory) {
  if (existsSync(join(directory, 'TEST_SUMMARY.md'))) throw new Error('Ten przebieg ma już raport. Historia jest niezmienna; wykonaj nowy przebieg zamiast nadpisywać poprzedni.');
  const docs = join(root, 'docs/testing');
  const metadata = readJson(join(directory, 'metadata.json'));
  const inventory = readJson(join(directory, 'inventory.json'));
  const catalog = readJson(join(docs, 'test-catalog.json'));
  const catalogMap = new Map(catalog.map(test => [test.key, test]));
  const evidenceDirectory = slash(relative(root, directory));
  const raw = existsSync(join(directory, 'vitest-results.json')) ? readJson(join(directory, 'vitest-results.json')) : null;
  const issues = [];
  const runtime = new Map();
  for (const file of raw?.testResults || []) {
    const source = slash(relative(root, file.name));
    for (const assertion of file.assertionResults) {
      const key = `${source}::${assertion.fullName}`;
      if (runtime.has(key)) issues.push(`Powtórzony klucz reportera: ${key}`);
      runtime.set(key, { assertion, file, source });
    }
  }
  const allDefinitions = new Map(inventory.cases.map(test => [test.key, test]));
  for (const [key, item] of runtime) if (!allDefinitions.has(key)) allDefinitions.set(key, {
    key, source: item.source, title: item.assertion.title, fullName: item.assertion.fullName,
    line: item.assertion.location?.line || '', environment: 'nieustalone',
  });
  const automatic = [];
  for (const [key, definition] of allDefinitions) {
    let entry = catalogMap.get(key);
    if (!entry) {
      issues.push(`Brak opracowania w katalogu: ${key}`);
      entry = { id: `T2-NEW-${sha256(key).slice(0, 12)}`, category: 'T2', level: 'nieustalony',
        description: `Przypadek wymagający opracowania: ${definition.title}`, objective: 'Uzupełnić analizę zakresu testu.',
        expected: 'Kryterium wymaga przeglądu asercji źródłowych.', limitations: 'Nowy przypadek nie ma zatwierdzonej klasyfikacji. Status pochodzi wyłącznie z reportera.' };
    }
    if (entry.reviewedSourceHash && definition.sourceHash && entry.reviewedSourceHash !== definition.sourceHash) issues.push(`Źródło zmienione od przeglądu: ${entry.id}`);
    const item = runtime.get(key);
    const outcome = statusOf(item?.assertion, definition, item?.file);
    automatic.push({ run_id: metadata.runId, ...entry, source: definition.source, line: item?.assertion.location?.line || definition.line,
      kind: 'automatyczny', original_name: definition.fullName, duration_ms: item?.assertion.duration ?? '',
      ...outcome, actual: outcome.reason, executed_at: ['PASS', 'FAIL'].includes(outcome.status) ? metadata.commands.find(c => c.name === 'test')?.startedAt : '',
      commit: metadata.commit, environment: definition.environment,
      device: 'host lokalny; bez rzeczywistej przeglądarki/telefonu', executor: 'Vitest',
      evidence: `${evidenceDirectory}/vitest-results.json :: ${definition.source} :: ${definition.fullName}`, notes: '' });
  }
  if (inventory.unsupported.length) issues.push(`Analizator statyczny nie rozpoznał ${inventory.unsupported.length} deklaracji; szczegóły w inventory.json.`);
  if (raw && raw.numTotalTests !== runtime.size) issues.push(`Niespójność liczby JSON: ${raw.numTotalTests} względem ${runtime.size} unikalnych rekordów.`);
  if (raw && automatic.length !== raw.numTotalTests) issues.push(`Inwentaryzacja: ${automatic.length}, reporter: ${raw.numTotalTests}. Niewykonane przypadki nie są pomijane.`);
  if (new Set(automatic.map(test => test.id)).size !== automatic.length) issues.push('Identyfikatory przypadków nie są unikalne.');
  const manualRecords = readJson(join(directory, 'manual-results.json'));
  const manualMap = new Map();
  for (const record of manualRecords) {
    if (manualMap.has(record.id)) issues.push(`Powtórzony wynik manualny: ${record.id}`);
    if (!manualCases.some(test => test.id === record.id)) issues.push(`Nieznany identyfikator wyniku manualnego: ${record.id}`);
    manualMap.set(record.id, record);
  }
  const manual = manualCases.map(test => {
    const record = manualMap.get(test.id) || {};
    let status = record.status || 'NOT_RUN';
    let notes = record.notes || '';
    if (!['PASS', 'FAIL', 'SKIP', 'NOT_RUN'].includes(status)) { issues.push(`Nieprawidłowy status manualny: ${test.id}`); status = 'NOT_RUN'; }
    if (['PASS', 'FAIL'].includes(status) && (!record.actual || !record.date || !Number.isFinite(Date.parse(record.date))
      || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?(?:Z|[+-]\d\d:\d\d)$/.test(record.date)
      || !record.device || !record.executor || !record.evidence || !record.environment || !record.commit)) {
      issues.push(`Niekompletny protokół ręczny: ${test.id}`); status = 'NOT_RUN'; notes += ' Niekompletny protokół; nie uznano deklaracji wykonania.';
    }
    if (status === 'SKIP' && !notes.trim()) { status = 'NOT_RUN'; issues.push(`Brak przyczyny pominięcia: ${test.id}`); }
    return { run_id: metadata.runId, ...test, kind: 'manualny', actual: record.actual || '', status,
      source: 'docs/testing/MANUAL_TEST_CASES.md', line: '', original_name: '', duration_ms: '',
      executed_at: ['PASS', 'FAIL'].includes(status) ? record.date : '', commit: record.commit || '',
      environment: record.environment || '', device: record.device || '', executor: record.executor || '', evidence: record.evidence || '', notes };
  });
  const checks = metadata.commands.map(command => ({ run_id: metadata.runId, id: `CTRL-${command.name.toUpperCase()}`, category: 'CONTROL',
    kind: 'kontrola narzędziowa', level: command.name === 'test' ? 'wykonanie zestawu' : command.name === 'build' ? 'kompilacja i pakowanie' : 'analiza statyczna',
    description: command.command, objective: 'Rejestracja rzeczywistego wyniku oddzielnej kontroli narzędziowej.', expected: 'Zakończenie polecenia z kodem 0.',
    actual: command.error || `Kod wyjścia: ${command.exitCode}; sygnał: ${command.signal || 'brak'}.`,
    status: command.error || command.exitCode === null ? 'NOT_RUN' : command.exitCode === 0 ? 'PASS' : 'FAIL',
    source: 'package.json', executed_at: command.startedAt, commit: metadata.commit, environment: `Node ${metadata.node}; ${metadata.system.platform}/${metadata.system.architecture}`,
    duration_ms: command.durationMs, evidence: `${evidenceDirectory}/${command.name}.stdout.log; ${evidenceDirectory}/${command.name}.stderr.log`,
    limitations: 'Kontrola narzędziowa nie jest przypadkiem funkcjonalnym. Nie jest wliczana do kategorii T1–T6 ani mianownika ich skuteczności.' }));
  const countsTable = rows => table(['Kategoria', 'Liczba', 'PASS', 'FAIL', 'SKIP', 'NOT_RUN', 'Wykonane', 'Powodzenie'], Object.entries(categories).map(([category, name]) => {
    const selected = rows.filter(row => row.category === category); const n = totals(selected);
    return [`${category}: ${name}`, selected.length, n.PASS, n.FAIL, n.SKIP, n.NOT_RUN, n.PASS + n.FAIL, percentage(n.PASS, n.FAIL)];
  }));
  const a = totals(automatic); const m = totals(manual);
  const lintText = text(join(directory, 'lint.stdout.log')) + text(join(directory, 'lint.stderr.log'));
  const lintCounts = lintText.match(/(\d+) problems? \((\d+) errors?, (\d+) warnings?\)/);
  const lintDiagnostics = [];
  let lintSource = '';
  for (const line of lintText.split(/\r?\n/)) {
    if (/^(?:[A-Za-z]:\\|\/)/.test(line.trim())) lintSource = slash(relative(root, line.trim()));
    const match = line.match(/^\s*(\d+):(\d+)\s+(error|warning)\s+(.*?)\s{2,}(\S+)\s*$/);
    if (match) lintDiagnostics.push([lintSource, `${match[1]}:${match[2]}`, match[3], match[5], match[4]]);
  }
  const linkedSource = (source, line = '') => `[${source}${line ? ':' + line : ''}](../../${source}${line ? '#L' + line : ''})`;
  const commandsTable = table(['Kontrola', 'Polecenie', 'Status', 'Kod', 'Czas [ms]', 'Początek UTC'], checks.map((check, i) => [check.id, check.description, check.status, metadata.commands[i].exitCode ?? 'brak', check.duration_ms, check.executed_at]));
  const filesTable = table(['Plik', 'Przypadki', 'PASS', 'FAIL', 'SKIP', 'NOT_RUN'], inventory.files.map(source => {
    const selected = automatic.filter(test => test.source === source); const n = totals(selected);
    return [linkedSource(source), selected.length, n.PASS, n.FAIL, n.SKIP, n.NOT_RUN];
  }));
  const runtimeSummary = table(['Właściwość', 'Wartość'], [
    ['Identyfikator przebiegu', metadata.runId], ['Czas początku (Europe/Warsaw)', localDate(metadata.startedAt)],
    ['Czas początku UTC', metadata.startedAt], ['Czas końca UTC', metadata.finishedAt || 'nie zarejestrowano'],
    ['Commit bazowy Git', metadata.commit], ['Gałąź', metadata.branch], ['Stan drzewa przed uruchomieniem', metadata.gitStatusBeforeRun || 'czysty'],
    ['Node.js / npm', `${metadata.node} / ${metadata.npmVersion}`],
    ['System', `${metadata.system.platform} ${metadata.system.release}; ${metadata.system.architecture}; logiczne CPU: ${metadata.system.logicalCpus}`],
    ['Strefa raportu', metadata.timezone], ['Domyślne środowisko', 'jsdom; wyjątki node: atomicSessionSave.test.ts i pwa.test.ts'],
    ['Suma manifestu SHA-256', metadata.sourceManifestHash],
    ...Object.entries(metadata.versions).map(([key, value]) => [key, value]),
  ]);
  const integrityText = issues.length ? issues.map(issue => `- ${issue}`).join('\n') : 'Inwentaryzacja, klucze pełnych nazw, liczba przypadków i katalog są zgodne. Nie pominięto istniejących przypadków.';
  const caseDetails = Object.entries(categories).filter(([category]) => category !== 'T6').map(([category, name]) => {
    const selected = automatic.filter(test => test.category === category);
    return `## ${category}: ${name}\n\n` + selected.map(test => `### ${test.id} — ${test.description}\n\n` +
      `- Cel: ${test.objective}\n- Wynik oczekiwany: ${test.expected}\n- Wynik rzeczywisty: **${test.status}**. ${test.status === 'FAIL' || test.status === 'NOT_RUN' ? escape(test.actual) : test.reason}\n` +
      `- Rodzaj: ${test.level}; środowisko: ${test.environment}. Czas raportera: ${test.duration_ms === '' ? 'nie podano' : Number(test.duration_ms).toFixed(3) + ' ms'}.\n` +
      `- Plik i linia: ${linkedSource(test.source, test.line)}.\n- Pełna nazwa w Vitest: \`${test.original_name.replaceAll('`', "'")}\`.\n` +
      `- Ograniczenia: ${test.limitations}\n`).join('\n');
  }).join('\n');
  const automatedDoc = `# Rzeczywiste wyniki testów automatycznych\n\n${runtimeSummary}\n\n` +
    `## Źródła dowodowe i zakres\n\nWyniki pochodzą z nowego uruchomienia, a nie z wcześniejszych odpowiedzi w rozmowie. Polecenie testowe nie zawiera filtra przypadków; dodatkowe parametry włączają wyłącznie reporter i lokalizacje.\n\n` +
    `Surowe dane: [JSON Vitest](${evidenceDirectory.replace('docs/testing/', '')}/vitest-results.json), [metadane](${evidenceDirectory.replace('docs/testing/', '')}/metadata.json), [manifest źródeł](${evidenceDirectory.replace('docs/testing/', '')}/source-manifest.json). ` +
    `Czas per przypadek pochodzi z Vitest i nie jest pomiarem szybkości aplikacji na telefonie. Commit oznacza punkt bazowy; pliki niezatwierdzone wskazuje stan drzewa i manifest.\n\n` +
    `## Oddzielne wyniki poleceń\n\n${commandsTable}\n\nZaliczenie asercji nie zmienia wyniku linta. Błąd buildu lub hooka pliku również nie znika przy wysokim odsetku PASS przypadków.\n\n` +
    `## Liczby według kategorii — wyłącznie automatyczne\n\n${countsTable(automatic)}\n\nOgółem: ${automatic.length} przypadków; PASS=${a.PASS}, FAIL=${a.FAIL}, SKIP=${a.SKIP}, NOT_RUN=${a.NOT_RUN}; powodzenie wykonanych: ${percentage(a.PASS, a.FAIL)}. Plików testowych: ${inventory.files.length}.\n\n` +
    `## Kompletność według plików\n\n${filesTable}\n\n${integrityText}\n\n` +
    `## Analiza statyczna i ostrzeżenia\n\n${lintCounts ? `Lint zgłosił ${lintCounts[1]} problemów: ${lintCounts[2]} błędów i ${lintCounts[3]} ostrzeżeń.` : 'Liczby diagnostyk należy odczytać z logów; wzorzec podsumowania nie został odnaleziony.'}\n\n${table(['Plik', 'Pozycja', 'Poziom', 'Reguła', 'Komunikat'], lintDiagnostics)}\n\n` +
    `Pełne logi testów, buildu i linta zapisano osobno jako *.stdout.log oraz *.stderr.log. Ostrzeżenia buildu (np. kolejność CSS @import, rozmiar bundla i dane Browserslist) nie są nieudanymi asercjami; ich aktualna treść znajduje się w logach. Ostrzeżenia React Router i opisów dialogów także wymagają odrębnej interpretacji.\n\n` +
    `## Katalog indywidualnych przypadków\n\nJednostką zliczania jest pojedyncze rozwinięte wywołanie it/test, nie pojedyncza asercja. Warianty it.each są osobnymi przypadkami i mają osobne identyfikatory.\n\n${caseDetails}`;
  const manualDoc = `# Scenariusze manualne i rzeczywiste treningi\n\n` +
    `Liczba scenariuszy: ${manual.length}. Stan według wprowadzonych protokołów: PASS=${m.PASS}, FAIL=${m.FAIL}, SKIP=${m.SKIP}, NOT_RUN=${m.NOT_RUN}. Generator nie wykonuje testów na urządzeniach. W ramach automatycznego przebiegu wykonano wyłącznie lokalne polecenia; T6 wymaga odrębnego wykonawcy, przygotowanego środowiska i fizycznego urządzenia.\n\n` +
    `## Zasady wykonania i uzupełniania\n\n1. Użyj kontrolowanego środowiska testowego/staging i kont testowych. Operacje modyfikujące Supabase wykonuj wyłącznie tam; ten plan nie upoważnia do zmiany produkcyjnych danych. W razie braku środowiska oznacz NOT_RUN i wpisz powód.\n` +
    `2. Zapisz wersję aplikacji/commit badanego wdrożenia, model fizycznego urządzenia, system, przeglądarkę, rozmiar widoku i warunki sieci. Emulacja w DevTools nie zastępuje fizycznego urządzenia.\n` +
    `3. Wykonaj wszystkie kroki, porównaj stan z niezależnym zapisem. Zachowaj zanonimizowane zrzuty, logi lub dziennik; nie zapisuj haseł, tokenów, kluczy service_role ani prywatnych danych medycznych.\n` +
    `4. Uzupełnij wpis danego ID w [manual-results.json](manual-results.json): status, actual, date (ISO 8601 ze strefą), device, executor, evidence, environment, commit i notes. Puste pola w tym dokumencie służą jako formularz roboczy.\n` +
    `5. PASS lub FAIL wymaga rzeczywistej obserwacji, daty, urządzenia, wykonawcy i odnośnika do dowodu. SKIP wymaga przyczyny w notes. Brak wykonania to NOT_RUN. Nie zastępuj obserwacji wynikiem automatycznym.\n` +
    `6. Po uzupełnieniu JSON uruchom npm run test:report. Powstanie nowa historia i aktualne raporty. Ręczne zmiany w wygenerowanym Markdown mogą zostać zastąpione; trwałym źródłem wyników jest manual-results.json.\n\n` +
    `Każdy scenariusz jest zliczany raz w T6; pole powiązań nie zwiększa liczebności T1–T5. Jeżeli wymagany wariant urządzenia nie został sprawdzony, nie przypisuj mu wyniku z innej platformy. Dalsze powtórzenia i warianty zapisuj jako osobne obserwacje w dowodzie; nie dodawaj ich automatycznie do mianownika.\n\n` +
    manual.map(test => `## ${test.id} — ${test.description}\n\n` +
      `- Rodzaj: ${test.level}. Powiązania merytoryczne: ${test.covers.join(', ')}.\n- Cel: ${test.objective}\n- Warunki wstępne: ${test.prerequisites}\n- Powiązane źródła: ${test.relatedSource}. Brak automatycznego pliku wykonującego ten scenariusz.\n\n` +
      test.steps.map((step, index) => `${index + 1}. ${step}`).join('\n') +
      `\n\nWynik oczekiwany: ${test.expected}\n\n` + table(['Pole protokołu', 'Wartość'], [
        ['Status', test.status], ['Wynik rzeczywisty', test.actual], ['Data i godzina wykonania', test.executed_at],
        ['Model urządzenia, OS, przeglądarka, widok', test.device], ['Środowisko i URL', test.environment],
        ['Wersja aplikacji / commit', test.commit], ['Wykonawca', test.executor], ['Dowód / plik dziennika', test.evidence], ['Uwagi / powód braku wykonania', test.notes],
      ]) + '\n').join('\n');
  const levels = [...new Set(automatic.map(test => test.level))];
  const levelTable = table(['Rodzaj dowodu automatycznego', 'Liczba', 'PASS', 'FAIL', 'SKIP', 'NOT_RUN'], levels.map(level => {
    const selected = automatic.filter(test => test.level === level); const n = totals(selected);
    return [level, selected.length, n.PASS, n.FAIL, n.SKIP, n.NOT_RUN];
  }));
  const summaryDoc = `# Podsumowanie testowania i ograniczenia\n\nPrzebieg: ${metadata.runId}. Data: ${localDate(metadata.startedAt)}. Commit bazowy: \`${metadata.commit}\`.\n\n` +
    `## Zestawienie kategorii\n\n${countsTable([...automatic, ...manual])}\n\n` +
    `Automatyczne: ${automatic.length}; manualne zaplanowane: ${manual.length}. Testy manualne zaliczone: ${m.PASS}. ` +
    `Automatyczne powodzenie: ${percentage(a.PASS, a.FAIL)}. Powodzenie manualnych wykonanych: ${percentage(m.PASS, m.FAIL)}. ` +
    `Mianownik powodzenia = PASS + FAIL. SKIP i NOT_RUN nie zwiększają mianownika. Gdy mianownik wynosi 0, wynikiem jest „nie dotyczy”, a nie 0% ani 100%.\n\n` +
    `## Rodzaje dowodów\n\n${levelTable}\n\nTest komponentowy działa w jsdom, nie na fizycznym urządzeniu. Test integracyjny może łączyć rzeczywiste moduły z fake-indexeddb lub mockiem RPC. Test symulacyjny obejmuje zarówno modele zachowania, jak i deklaracje/placeholdery; nie należy utożsamiać tych przypadków z dowodami działania pełnego systemu. Szczegóły każdego ograniczenia są przy ID w raporcie automatycznym.\n\n` +
    `## Oddzielna ocena narzędzi\n\n${commandsTable}\n\n` +
    `## Zidentyfikowane problemy i granice wnioskowania\n\n` +
    `- Wynik linta: ${checks.find(check => check.id === 'CTRL-LINT')?.status}; ${lintCounts ? lintCounts[2] + ' błędów i ' + lintCounts[3] + ' ostrzeżeń' : 'liczby w logach'}. Nie zmieniano logiki ani istniejących testów w celu wymuszenia PASS.\n` +
    `- auth.test.ts sprawdza lokalne deklaracje i mock nawigacji; nie wykonuje rzeczywistego logowania ani ochrony tras.\n` +
    `- templates.test.ts i listPager.test.ts sprawdzają kopie logiki. Zmiana produkcyjnej implementacji może nie spowodować ich niepowodzenia.\n` +
    `- sessionPersistence.test.ts używa mocka localStorage bez rzeczywistej nawigacji. Test braku śladów enumeruje obiekt metod mocka, a nie jego wewnętrzny magazyn; test zakończenia nie sprawdza zapisu do bazy.\n` +
    `- example.test.ts i test położenia toastu są asercjami true === true. Test opisany jako 3-sekundowe zamykanie toastu nie mierzy czasu.\n` +
    `- productionHardening.test.ts nie uruchamia wyzwalacza w pierwszych dwóch przypadkach. Jego lokalny model stref używa innych progów niż rzeczywista analityka.\n` +
    `- atomicSessionSave.test.ts uruchamia lokalny PostgreSQL/PGlite z rzeczywistą funkcją i wyzwalaczem, ale z uproszczonym schematem oraz politykami RLS z fixture. Nie jest audytem aktualnego schematu, uprawnień i RLS produkcyjnego Supabase.\n` +
    `- Testy offline nie sprawdzają trwałości na dysku fizycznego telefonu, limitów quota, przerwania procesu systemowego ani rzeczywistej sieci.\n` +
    `- Testy PWA wykonują build, lecz worker działa w node:vm z symulowaną siecią i cache. Instalacja PWA, aktualizacja na Android/iOS i responsywność wymagają T6.\n` +
    `- Brak pomiaru pokrycia instrukcji/gałęzi, obciążenia, dostępności WCAG, statystycznej niezawodności, trafności sportowej i klinicznej wskazówek. Odsetek PASS nie jest procentem pokrycia ani prawdopodobieństwem bezawaryjności.\n` +
    `- Wszystkie poprzednie deklaracje z rozmowy o produkcji lub treningach są poza dowodami tego przebiegu. Nie zostały przepisane jako wyniki manualne.\n\n` +
    `## Kompletność i odtwarzalność\n\n${integrityText}\n\n` +
    `Każdy przebieg zachowuje surowy JSON, wyjścia poleceń, metadane, inwentaryzację i manifest SHA-256. Raporty oraz snapshot wyników ręcznych są przechowywane w history/${metadata.runId}/. ` +
    `Plik LATEST_RUN.txt wskazuje bieżący przebieg; historia nie jest nadpisywana. Zmiana commita, zależności, systemu, czasu lub niezatwierdzonych plików może zmienić wynik.\n\n` +
    `## Wniosek do rozdziału 4\n\nW badanym lokalnym przebiegu wykonano ${a.PASS + a.FAIL} z ${automatic.length} zinwentaryzowanych przypadków automatycznych, z czego ${a.PASS} zakończyło się powodzeniem i ${a.FAIL} niepowodzeniem. ` +
    `Kontrole kompilacji i analizy statycznej oceniono oddzielnie. Wyniki potwierdzają spełnienie asercji w opisanym środowisku i zakresie, a nie pełną poprawność wdrożenia produkcyjnego. ` +
    `Bez uzupełnienia protokołów T6 nie można sformułować potwierdzonego wniosku o działaniu na rzeczywistych urządzeniach ani o wykorzystaniu podczas rzeczywistych treningów.\n`;
  const planDoc = `# Plan i metodyka testowania BoulderLog\n\n` +
    `Dokumentacja do rozdziału 4 „Testowanie i ocena działania systemu” pracy inżynierskiej na kierunku Informatyka, Akademia WSB. Zakres stanowi aktualny kod repozytorium, a nie deklaracja certyfikacji jakości.\n\n` +
    `## Cel, obiekt i podział\n\nCelem jest ocena zgodności wybranych algorytmów, funkcji, mechanizmów zapisu i trybu offline z jawnymi kryteriami. Chronione dane produkcyjne Supabase nie są modyfikowane przez procedurę raportowania.\n\n` +
    table(['Kategoria', 'Zakres'], Object.entries(categories)) + '\n\n' +
    `Przypadek należy do jednej kategorii głównej; powiązania manualne są informacyjne. Testy przypisano według faktycznych asercji, nie wyłącznie nazwy pliku. Oba katalogi src/test i src/lib są objęte przeglądem, a skan obejmuje wszystkie pliki src/**/*.{test,spec}.{ts,tsx} zgodnie z obecną konfiguracją Vitest.\n\n` +
    `## Poziomy i siła dowodu\n\n` +
    `- Jednostkowe: wywołują funkcje, reducery lub moduły aplikacji na kontrolowanych danych; mogą używać mocków zależności.\n` +
    `- Komponentowe: renderują rzeczywisty komponent w React Testing Library/jsdom i sprawdzają interakcje. Nie zastępują przeglądarki.\n` +
    `- Integracyjne: łączą moduły aplikacji albo wykonują SQL w lokalnym PostgreSQL/PGlite. Użyte symulacje i testowy schemat są jawne.\n` +
    `- Symulacyjne/deklaratywne: modele lokalne, kopie reguł, sztuczne CacheStorage/sieć lub placeholdery. PASS potwierdza ich asercje, nie automatycznie funkcję systemu.\n` +
    `- Manualne na rzeczywistym urządzeniu: mają niezależny protokół z datą, środowiskiem, wersją, wykonawcą i dowodem. Wykorzystanie treningowe wymaga dziennika rzeczywistego treningu.\n\n` +
    `## Kryteria statusów i zliczania\n\nPASS nadawany jest wyłącznie konkretnemu testowi z passed w rzeczywistym raporcie albo kompletnemu, rzeczywiście wykonanemu protokołowi manualnemu. FAIL oznacza nieudaną asercję lub niezgodność obserwacji. SKIP oznacza jawne pominięcie/todo albo zarejestrowane pominięcie z przyczyną. NOT_RUN oznacza brak dowodu wykonania, brak gotowego środowiska lub błąd uniemożliwiający wykonanie.\n\n` +
    `Jednostką jest rozwinięty przypadek it/test; jedna pętla asercji wewnątrz testu nie tworzy osobnych przypadków. it.each generuje osobne ID dla każdej wartości. Numery ID są utrwalone w test-catalog.json i nie wynikają z chwilowego porządku reportera. Powodzenie = 100 × PASS / (PASS + FAIL); brak wykonanych przypadków daje „nie dotyczy”. Wynik npm run build i npm run lint nie zwiększa liczby przypadków T1–T6.\n\n` +
    `Błąd przygotowania pliku nie jest przedstawiany jako zbiór poprawnie pominiętych testów: przypadki bez wykonania otrzymują NOT_RUN z błędem pliku. Błędy hooków, kolekcji i nieobsłużone wyjątki pozostają w logach i kodzie wyjścia polecenia nawet przy zaliczonych asercjach.\n\n` +
    `## Wykonanie i odtworzenie\n\n1. Użyj czystej, odizolowanej kopii badanego commita oraz zgodnych wersji Node/npm; odtwórz zależności przez npm ci z package-lock.json.\n` +
    `2. Sprawdź stan git status i porównaj wersje oraz source-manifest.json badanego przebiegu. Dla bieżącego przebiegu raport wskazuje także niezacommitowane pliki.\n` +
    `3. Uruchom npm run test:report. Skrypt wykonuje kolejno npm test (bez filtra, z dodatkowymi reporterami), npm run build i npm run lint. Nie zatrzymuje się po pierwszym błędzie kontroli.\n` +
    `4. Wyniki sprawdź w AUTOMATED_TEST_RESULTS.md, TEST_SUMMARY.md i TEST_RESULTS.csv. Otwórz wskazany w LATEST_RUN.txt katalog history i porównaj raw JSON oraz logi. Kod końcowy generatora jest niezerowy, jeżeli dowolna kontrola zawiedzie lub katalog nie jest kompletny.\n` +
    `5. Wykonaj scenariusze z MANUAL_TEST_CASES.md wyłącznie w przygotowanym środowisku i wpisz obserwacje do manual-results.json. Ponownie uruchom generator, aby utworzyć kolejny, zachowany w historii raport.\n\n` +
    `Skrypt można uruchomić również przez node scripts/testing-report.mjs. Tryb --capture-only zbiera dowody bez renderowania; --render <run_id> renderuje dotąd nierenderowany przebieg. Dodatkowe flagi przekazuj bezpośrednio do node, aby uniknąć różnic obsługi argumentów w powłokach npm. Wygenerowany katalog już opisanych przypadków nie jest automatycznie renumerowany. Po dodaniu testów trzeba opracować nowe wpisy test-catalog.json; generator sygnalizuje braki zamiast pomijać przypadki.\n\n` +
    `## Środowiska, bezpieczeństwo i dane\n\nDokładne wersje narzędzi i platformę zapisuje metadata.json. Standardem jest jsdom; dwa pliki wskazują node. PGlite odtwarza SQL na uproszczonym schemacie testowym, fake-indexeddb symuluje magazyn, a node:vm — workera. Dane są syntetyczne. Testy wykorzystują mocki Supabase i nie stanowią audytu produkcji. Build kompiluje lokalną konfigurację; procedura nie publikuje artefaktów ani nie uruchamia migracji chmurowych.\n\n` +
    `Nie zapisuj w historii plików .env, haseł ani tokenów. Manifest zawiera sumy jawnych plików źródłowych i konfiguracji, nie .env. Dowody manualne należy anonimizować. Dla RLS używaj ról użytkowników i publicznego klienta w projekcie testowym; service_role pomija RLS i nie jest poprawnym zamiennikiem użytkownika.\n\n` +
    `## Kryteria oceny i ograniczenia\n\nZaliczenie testów automatycznych, poprawna kompilacja, wynik linta i kompletne krytyczne scenariusze manualne są oddzielnymi przesłankami. Raport nie sprowadza ich do jednego zielonego statusu. Nie ma podstaw do akceptacji produkcyjnego RLS, instalowalności PWA, responsywności ani niezawodności treningowej, jeśli odpowiadające im protokoły pozostają NOT_RUN.\n\n` +
    `Nie wyznaczono pokrycia kodu ani istotności statystycznej. Wspólny wynik wielu podobnych lub deklaratywnych przypadków nie jest niezależną próbą statystyczną. Powtórzenia zestawu w historii służą odtwarzalności i analizie regresji, a nie mnożeniu mianownika liczby przypadków bieżącego przebiegu.\n`;

  const documents = { 'TEST_PLAN.md': planDoc, 'AUTOMATED_TEST_RESULTS.md': automatedDoc,
    'MANUAL_TEST_CASES.md': manualDoc, 'TEST_SUMMARY.md': summaryDoc,
    'TEST_RESULTS.csv': csvOf([...automatic, ...manual, ...checks]) };
  const archiveDocuments = {};
  for (const [name, content] of Object.entries(documents)) {
    const archived = name.endsWith('.md') ? content.replaceAll('](../../', '](../../../../')
      .replaceAll(`](${evidenceDirectory.replace('docs/testing/', '')}/`, '](') : content;
    archiveDocuments[name] = archived;
    writeFileSync(join(directory, name), archived);
    writeFileSync(join(docs, name), content);
  }
  copyFileSync(join(docs, 'test-catalog.json'), join(directory, 'test-catalog.json'));
  const rendererInputs = join(directory, 'reporter-source');
  mkdirSync(rendererInputs);
  for (const name of readdirSync(join(root, 'scripts/testing')).filter(name => name.endsWith('.mjs'))) copyFileSync(join(root, 'scripts/testing', name), join(rendererInputs, name));
  copyFileSync(join(root, 'scripts/testing-report.mjs'), join(rendererInputs, 'testing-report.mjs'));
  const summary = { runId: metadata.runId, automatic: { total: automatic.length, ...a }, manual: { total: manual.length, ...m },
    checks: checks.map(check => ({ id: check.id, status: check.status })), integrityIssues: issues,
    fileCount: inventory.files.length, rows: [...automatic, ...manual, ...checks], renderedAt: new Date().toISOString() };
  writeFileSync(join(directory, 'results.json'), JSON.stringify(summary, null, 2) + '\n');
  const hashes = { current: Object.fromEntries(Object.entries(documents).map(([name, content]) => [name, sha256(content)])),
    archived: Object.fromEntries(Object.entries(archiveDocuments).map(([name, content]) => [name, sha256(content)])) };
  writeFileSync(join(directory, 'report-hashes.json'), JSON.stringify(hashes, null, 2) + '\n');
  console.log(`Raport: ${automatic.length} automatycznych, ${manual.length} manualnych, ${checks.length} kontroli. PASS automatycznych=${a.PASS}; problemy spójności=${issues.length}.`);
  return { ok: checks.every(check => check.status === 'PASS') && !issues.length && !a.FAIL && !a.NOT_RUN && !m.FAIL };
}
