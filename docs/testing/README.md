# Dokumentacja testów BoulderLog

Główne dokumenty:

- [TEST_PLAN.md](TEST_PLAN.md) — zakres, poziomy dowodu i sposób zliczania.
- [AUTOMATED_TEST_RESULTS.md](AUTOMATED_TEST_RESULTS.md) — wyniki wszystkich przypadków i kontroli narzędziowych.
- [MANUAL_TEST_CASES.md](MANUAL_TEST_CASES.md) — protokoły do wykonania, w tym prawdziwe urządzenia i treningi.
- [TEST_SUMMARY.md](TEST_SUMMARY.md) — zestawienia oraz ograniczenia wnioskowania.
- [TEST_RESULTS.csv](TEST_RESULTS.csv) — UTF-8 z BOM, przecinek, pola w cudzysłowach, zakończenia CRLF. Do importu w arkuszu wybierz UTF-8 i separator przecinek. Każde ID występuje raz w bieżącym raporcie.

## Ponowne wykonanie

```powershell
npm ci
npm run test:report
npm run test:report:verify
```

Pierwsza komenda wymaga dostępu do rejestru pakietów i odtwarza zależności z lockfile. Generator uruchamia cały zestaw testów, build i lint oraz tworzy nowy katalog `history/<czas_UTC>_<commit>/`. Identyfikator aktualnego przebiegu znajduje się w `LATEST_RUN.txt`. Kod wyjścia generatora **1** jest oczekiwany, jeśli np. lint pozostaje FAIL; nie oznacza to, że nie zapisano raportu. Weryfikator sprawdza spójność dokumentów i danych, nie usuwa zgłoszonych błędów linta i nie uruchamia testów aplikacji ponownie.

Można też uruchomić `node scripts/testing-report.mjs` bezpośrednio (w środowisku z odnalezionym npm CLI). Dodatkowe opcje przekazuj bezpośrednio do `node`:

```powershell
node scripts/testing-report.mjs --capture-only
node scripts/testing-report.mjs --render <identyfikator_przebiegu>
```

Renderowanie jest dozwolone tylko dla przebiegu, który jeszcze nie ma raportów. Gotowych archiwów generator nie nadpisuje. Surowe wyniki i raporty z poprzednich wykonań pozostają w historii nawet po nieudanym uruchomieniu. Początkowy przebieg roboczy z budowy generatora ma dodatkową notatkę o pochodzeniu; bieżący raport wynika z pełnego uruchomienia gotowego skryptu.

## Dane wejściowe i historia

`test-catalog.json` utrwala ID, pełną nazwę, opis, cel, oczekiwanie i ograniczenia każdego przypadku. Nie modyfikuj ID przy zmianie kolejności testów. Nowym testom nadaj nowe ID i klucz `<ścieżka>::<pełna nazwa Vitest>`; generator wykazuje brak opracowania zamiast pomijać nieznany przypadek. Skrypty `catalog-seed.mjs` i `initialize-catalog.mjs` dokumentują jednorazową inicjalizację i nie są wykonywane podczas ponownych pomiarów. Inicjalizator odmawia nadpisania istniejącego katalogu.

Każdy pełny przebieg zachowuje:

- `metadata.json` — commit bazowy, niezacommitowane zmiany, czasy, wersje narzędzi, system, kody wyjścia i rzeczywiste argumenty poleceń.
- `vitest-results.json` oraz sześć plików `*.stdout.log` / `*.stderr.log` — surowe wyniki i diagnostyka.
- `inventory.json`, `source-manifest.json` — statyczna inwentaryzacja i SHA-256 jawnych źródeł. `.env` nie jest kopiowany ani odczytywany przez generator.
- `test-catalog.json`, `manual-results.json` — kopie katalogu i zadeklarowanych protokołów z danego przebiegu.
- `input-sources/` — kopie testów, konfiguracji i skryptów raportujących w momencie wykonania, także plików niezatwierdzonych w Git.
- `reporter-source/` — implementacja renderera w chwili generowania dokumentów.
- `results.json`, pięć raportów i `report-hashes.json` — wyniki znormalizowane i sumy dokumentów. W archiwalnym Markdown odnośniki są dostosowane do położenia archiwum.

Sumy kontrolne pozwalają wykryć przypadkową zmianę materiału; nie są zewnętrznym podpisem ani poświadczeniem czasu. Sam commit bazowy nie obejmuje niezacommitowanego generatora — dlatego zachowuje się również wejścia, stan drzewa i manifest.

Katalog `docs/testing/history/**` jest wyłączony z ESLint jako wygenerowany materiał dowodowy. Zawiera kopie plików TypeScript, które nie są kodem wykonywanej aplikacji. Oryginalne `src/` i testy nadal podlegają tej samej analizie; wykluczenie nie ukrywa ich błędów. Przebieg roboczy przed tym wykluczeniem zachowuje rzeczywisty wynik linta z pięcioma zduplikowanymi diagnostykami z kopii testów.

W CSV pole `executed_at` przypadków automatycznych oznacza początek wywołania całego zestawu, ponieważ standardowy JSON Vitest nie udostępnia osobnego czasu początku każdej asercji. `duration_ms` pochodzi z rekordu konkretnego przypadku. Dla testów manualnych `executed_at` pochodzi wyłącznie z protokołu użytkownika.

## Uzupełnianie testów manualnych

1. Wybierz ID w `MANUAL_TEST_CASES.md`, przygotuj odizolowane środowisko i wykonaj kroki na wskazanym rzeczywistym urządzeniu.
2. Zachowaj zanonimizowany dziennik, zrzut lub log. Nie wykonuj modyfikacji produkcyjnej bazy w ramach tej dokumentacji.
3. Wpisz obserwację w `manual-results.json`. Nie wpisuj PASS na podstawie symulacji, samego buildu ani wcześniejszych odpowiedzi w rozmowie.
4. Wypełnij `actual`, `date` (np. format `YYYY-MM-DDTHH:mm:ss+01:00`, z rzeczywistą strefą dla daty), `device`, `executor`, `evidence`, `environment` i `commit`; dopisz `notes`. Przykładowy format daty jest instrukcją, nie wynikiem wykonania.
5. Zmień `status` dopiero po porównaniu obserwacji z kryterium. `SKIP` wymaga przyczyny w `notes`; `NOT_RUN` pozostaje, gdy nie wykonano scenariusza.
6. Ponownie uruchom generator. Poprzedni snapshot protokołów zostanie zachowany. Jeśli wykonasz kolejne warianty tego samego scenariusza, zachowaj osobny dziennik wszystkich obserwacji; pojedynczy PASS nie potwierdza innych urządzeń.

Brak wymaganych pól protokołu PASS/FAIL powoduje NOT_RUN i zgłoszenie niespójności zamiast automatycznego uznania deklaracji.
