# Plan i metodyka testowania BoulderLog

Dokumentacja do rozdziału 4 „Testowanie i ocena działania systemu” pracy inżynierskiej na kierunku Informatyka, Akademia WSB. Zakres stanowi aktualny kod repozytorium, a nie deklaracja certyfikacji jakości.

## Cel, obiekt i podział

Celem jest ocena zgodności wybranych algorytmów, funkcji, mechanizmów zapisu i trybu offline z jawnymi kryteriami. Chronione dane produkcyjne Supabase nie są modyfikowane przez procedurę raportowania.

| Kategoria | Zakres |
| --- | --- |
| T1 | Algorytmy i analityka |
| T2 | Funkcjonalności aplikacji i interfejs użytkownika |
| T3 | Baza danych, integralność i bezpieczeństwo |
| T4 | IndexedDB i synchronizacja offline |
| T5 | PWA, Service Worker i konfiguracja produkcyjna |
| T6 | Testy manualne i rzeczywiste treningi |

Przypadek należy do jednej kategorii głównej; powiązania manualne są informacyjne. Testy przypisano według faktycznych asercji, nie wyłącznie nazwy pliku. Oba katalogi src/test i src/lib są objęte przeglądem, a skan obejmuje wszystkie pliki src/**/*.{test,spec}.{ts,tsx} zgodnie z obecną konfiguracją Vitest.

## Poziomy i siła dowodu

- Jednostkowe: wywołują funkcje, reducery lub moduły aplikacji na kontrolowanych danych; mogą używać mocków zależności.
- Komponentowe: renderują rzeczywisty komponent w React Testing Library/jsdom i sprawdzają interakcje. Nie zastępują przeglądarki.
- Integracyjne: łączą moduły aplikacji albo wykonują SQL w lokalnym PostgreSQL/PGlite. Użyte symulacje i testowy schemat są jawne.
- Symulacyjne/deklaratywne: modele lokalne, kopie reguł, sztuczne CacheStorage/sieć lub placeholdery. PASS potwierdza ich asercje, nie automatycznie funkcję systemu.
- Manualne na rzeczywistym urządzeniu: mają niezależny protokół z datą, środowiskiem, wersją, wykonawcą i dowodem. Wykorzystanie treningowe wymaga dziennika rzeczywistego treningu.

## Kryteria statusów i zliczania

PASS nadawany jest wyłącznie konkretnemu testowi z passed w rzeczywistym raporcie albo kompletnemu, rzeczywiście wykonanemu protokołowi manualnemu. FAIL oznacza nieudaną asercję lub niezgodność obserwacji. SKIP oznacza jawne pominięcie/todo albo zarejestrowane pominięcie z przyczyną. NOT_RUN oznacza brak dowodu wykonania, brak gotowego środowiska lub błąd uniemożliwiający wykonanie.

Jednostką jest rozwinięty przypadek it/test; jedna pętla asercji wewnątrz testu nie tworzy osobnych przypadków. it.each generuje osobne ID dla każdej wartości. Numery ID są utrwalone w test-catalog.json i nie wynikają z chwilowego porządku reportera. Powodzenie = 100 × PASS / (PASS + FAIL); brak wykonanych przypadków daje „nie dotyczy”. Wynik npm run build i npm run lint nie zwiększa liczby przypadków T1–T6.

Błąd przygotowania pliku nie jest przedstawiany jako zbiór poprawnie pominiętych testów: przypadki bez wykonania otrzymują NOT_RUN z błędem pliku. Błędy hooków, kolekcji i nieobsłużone wyjątki pozostają w logach i kodzie wyjścia polecenia nawet przy zaliczonych asercjach.

## Wykonanie i odtworzenie

1. Użyj czystej, odizolowanej kopii badanego commita oraz zgodnych wersji Node/npm; odtwórz zależności przez npm ci z package-lock.json.
2. Sprawdź stan git status i porównaj wersje oraz source-manifest.json badanego przebiegu. Dla bieżącego przebiegu raport wskazuje także niezacommitowane pliki.
3. Uruchom npm run test:report. Skrypt wykonuje kolejno npm test (bez filtra, z dodatkowymi reporterami), npm run build i npm run lint. Nie zatrzymuje się po pierwszym błędzie kontroli.
4. Wyniki sprawdź w AUTOMATED_TEST_RESULTS.md, TEST_SUMMARY.md i TEST_RESULTS.csv. Otwórz wskazany w LATEST_RUN.txt katalog history i porównaj raw JSON oraz logi. Kod końcowy generatora jest niezerowy, jeżeli dowolna kontrola zawiedzie lub katalog nie jest kompletny.
5. Wykonaj scenariusze z MANUAL_TEST_CASES.md wyłącznie w przygotowanym środowisku i wpisz obserwacje do manual-results.json. Ponownie uruchom generator, aby utworzyć kolejny, zachowany w historii raport.

Skrypt można uruchomić również przez node scripts/testing-report.mjs. Tryb --capture-only zbiera dowody bez renderowania; --render <run_id> renderuje dotąd nierenderowany przebieg. Dodatkowe flagi przekazuj bezpośrednio do node, aby uniknąć różnic obsługi argumentów w powłokach npm. Wygenerowany katalog już opisanych przypadków nie jest automatycznie renumerowany. Po dodaniu testów trzeba opracować nowe wpisy test-catalog.json; generator sygnalizuje braki zamiast pomijać przypadki.

## Środowiska, bezpieczeństwo i dane

Dokładne wersje narzędzi i platformę zapisuje metadata.json. Standardem jest jsdom; dwa pliki wskazują node. PGlite odtwarza SQL na uproszczonym schemacie testowym, fake-indexeddb symuluje magazyn, a node:vm — workera. Dane są syntetyczne. Testy wykorzystują mocki Supabase i nie stanowią audytu produkcji. Build kompiluje lokalną konfigurację; procedura nie publikuje artefaktów ani nie uruchamia migracji chmurowych.

Nie zapisuj w historii plików .env, haseł ani tokenów. Manifest zawiera sumy jawnych plików źródłowych i konfiguracji, nie .env. Dowody manualne należy anonimizować. Dla RLS używaj ról użytkowników i publicznego klienta w projekcie testowym; service_role pomija RLS i nie jest poprawnym zamiennikiem użytkownika.

## Kryteria oceny i ograniczenia

Zaliczenie testów automatycznych, poprawna kompilacja, wynik linta i kompletne krytyczne scenariusze manualne są oddzielnymi przesłankami. Raport nie sprowadza ich do jednego zielonego statusu. Nie ma podstaw do akceptacji produkcyjnego RLS, instalowalności PWA, responsywności ani niezawodności treningowej, jeśli odpowiadające im protokoły pozostają NOT_RUN.

Nie wyznaczono pokrycia kodu ani istotności statystycznej. Wspólny wynik wielu podobnych lub deklaratywnych przypadków nie jest niezależną próbą statystyczną. Powtórzenia zestawu w historii służą odtwarzalności i analizie regresji, a nie mnożeniu mianownika liczby przypadków bieżącego przebiegu.
