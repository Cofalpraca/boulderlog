# Rzeczywiste wyniki testów automatycznych

| Właściwość | Wartość |
| --- | --- |
| Identyfikator przebiegu | 2026-10-25T16-10-41-635Z_7cf8db65 |
| Czas początku (Europe/Warsaw) | niedziela, 25 października 2026 17:10:41 CET |
| Czas początku UTC | 2026-10-25T16:10:41.635Z |
| Czas końca UTC | 2026-10-25T16:11:28.474Z |
| Commit bazowy Git | 7cf8db659eb627a0e2a3014c2a3ad50d1e5875e0 |
| Gałąź | main |
| Stan drzewa przed uruchomieniem | M  .gitignore<br> M package.json<br>?? docs/<br>?? scripts/testing-report.mjs<br>?? scripts/testing/ |
| Node.js / npm | v22.14.0 / 10.9.2 |
| System | win32 10.0.26200; x64; logiczne CPU: 16 |
| Strefa raportu | Europe/Warsaw |
| Domyślne środowisko | jsdom; wyjątki node: atomicSessionSave.test.ts i pwa.test.ts |
| Suma manifestu SHA-256 | a1884ca81eaa18d8e3554fc1cfa8270e7d2dd22dc4e9a3c9ca8c21039a41c7d8 |
| vitest | 3.2.4 |
| vite | 5.4.19 |
| jsdom | 20.0.3 |
| @testing-library/react | 16.3.1 |
| @electric-sql/pglite | 0.5.11 |
| fake-indexeddb | 6.2.6 |
| typescript | 5.8.3 |
| eslint | 9.32.0 |

## Źródła dowodowe i zakres

Wyniki pochodzą z nowego uruchomienia, a nie z wcześniejszych odpowiedzi w rozmowie. Polecenie testowe nie zawiera filtra przypadków; dodatkowe parametry włączają wyłącznie reporter i lokalizacje.

Surowe dane: [JSON Vitest](vitest-results.json), [metadane](metadata.json), [manifest źródeł](source-manifest.json). Czas per przypadek pochodzi z Vitest i nie jest pomiarem szybkości aplikacji na telefonie. Commit oznacza punkt bazowy; pliki niezatwierdzone wskazuje stan drzewa i manifest.

## Oddzielne wyniki poleceń

| Kontrola | Polecenie | Status | Kod | Czas [ms] | Początek UTC |
| --- | --- | --- | --- | --- | --- |
| CTRL-TEST | npm test -- --reporter=default --reporter=json --outputFile.json=<przebieg>/vitest-results.json --includeTaskLocation | PASS | 0 | 25148 | 2026-10-25T16:10:42.459Z |
| CTRL-BUILD | npm run build | PASS | 0 | 14406 | 2026-10-25T16:11:07.610Z |
| CTRL-LINT | npm run lint | FAIL | 1 | 6453 | 2026-10-25T16:11:22.018Z |

Zaliczenie asercji nie zmienia wyniku linta. Błąd buildu lub hooka pliku również nie znika przy wysokim odsetku PASS przypadków.

## Liczby według kategorii — wyłącznie automatyczne

| Kategoria | Liczba | PASS | FAIL | SKIP | NOT_RUN | Wykonane | Powodzenie |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T1: Algorytmy i analityka | 158 | 158 | 0 | 0 | 0 | 158 | 100,00% |
| T2: Funkcjonalności aplikacji i interfejs użytkownika | 101 | 101 | 0 | 0 | 0 | 101 | 100,00% |
| T3: Baza danych, integralność i bezpieczeństwo | 13 | 13 | 0 | 0 | 0 | 13 | 100,00% |
| T4: IndexedDB i synchronizacja offline | 14 | 14 | 0 | 0 | 0 | 14 | 100,00% |
| T5: PWA, Service Worker i konfiguracja produkcyjna | 6 | 6 | 0 | 0 | 0 | 6 | 100,00% |
| T6: Testy manualne i rzeczywiste treningi | 0 | 0 | 0 | 0 | 0 | 0 | nie dotyczy |

Ogółem: 292 przypadków; PASS=292, FAIL=0, SKIP=0, NOT_RUN=0; powodzenie wykonanych: 100,00%. Plików testowych: 22.

## Kompletność według plików

| Plik | Przypadki | PASS | FAIL | SKIP | NOT_RUN |
| --- | --- | --- | --- | --- | --- |
| [src/lib/analytics.test.ts](../../../../src/lib/analytics.test.ts) | 24 | 24 | 0 | 0 | 0 |
| [src/lib/importParser.test.ts](../../../../src/lib/importParser.test.ts) | 25 | 25 | 0 | 0 | 0 |
| [src/lib/volumeByGrade.test.ts](../../../../src/lib/volumeByGrade.test.ts) | 9 | 9 | 0 | 0 | 0 |
| [src/test/analytics.test.ts](../../../../src/test/analytics.test.ts) | 15 | 15 | 0 | 0 | 0 |
| [src/test/atomicSessionSave.test.ts](../../../../src/test/atomicSessionSave.test.ts) | 11 | 11 | 0 | 0 | 0 |
| [src/test/auth.test.ts](../../../../src/test/auth.test.ts) | 13 | 13 | 0 | 0 | 0 |
| [src/test/developmentZones.test.ts](../../../../src/test/developmentZones.test.ts) | 14 | 14 | 0 | 0 | 0 |
| [src/test/example.test.ts](../../../../src/test/example.test.ts) | 1 | 1 | 0 | 0 | 0 |
| [src/test/importHistory.test.ts](../../../../src/test/importHistory.test.ts) | 13 | 13 | 0 | 0 | 0 |
| [src/test/listPager.test.ts](../../../../src/test/listPager.test.ts) | 11 | 11 | 0 | 0 | 0 |
| [src/test/mappingHealth.test.ts](../../../../src/test/mappingHealth.test.ts) | 10 | 10 | 0 | 0 | 0 |
| [src/test/offlineIndicator.test.tsx](../../../../src/test/offlineIndicator.test.tsx) | 2 | 2 | 0 | 0 | 0 |
| [src/test/offlineSync.test.tsx](../../../../src/test/offlineSync.test.tsx) | 12 | 12 | 0 | 0 | 0 |
| [src/test/painInsights.test.ts](../../../../src/test/painInsights.test.ts) | 17 | 17 | 0 | 0 | 0 |
| [src/test/productionHardening.test.ts](../../../../src/test/productionHardening.test.ts) | 7 | 7 | 0 | 0 | 0 |
| [src/test/pwa.test.ts](../../../../src/test/pwa.test.ts) | 5 | 5 | 0 | 0 | 0 |
| [src/test/sessionPersistence.test.ts](../../../../src/test/sessionPersistence.test.ts) | 12 | 12 | 0 | 0 | 0 |
| [src/test/strengthCompletion.test.tsx](../../../../src/test/strengthCompletion.test.tsx) | 5 | 5 | 0 | 0 | 0 |
| [src/test/templates.test.ts](../../../../src/test/templates.test.ts) | 17 | 17 | 0 | 0 | 0 |
| [src/test/toast.test.ts](../../../../src/test/toast.test.ts) | 5 | 5 | 0 | 0 | 0 |
| [src/test/userLevel.test.ts](../../../../src/test/userLevel.test.ts) | 61 | 61 | 0 | 0 | 0 |
| [src/test/userLevelCache.test.ts](../../../../src/test/userLevelCache.test.ts) | 3 | 3 | 0 | 0 | 0 |

Inwentaryzacja, klucze pełnych nazw, liczba przypadków i katalog są zgodne. Nie pominięto istniejących przypadków.

## Analiza statyczna i ostrzeżenia

Lint zgłosił 28 problemów: 16 błędów i 12 ostrzeżeń.

| Plik | Pozycja | Poziom | Reguła | Komunikat |
| --- | --- | --- | --- | --- |
| docs/testing/history/2026-10-25T16-10-41-635Z_7cf8db65/input-sources/src/test/mappingHealth.test.ts | 60:23 | error | @typescript-eslint/no-explicit-any | Unexpected any. Specify a different type |
| docs/testing/history/2026-10-25T16-10-41-635Z_7cf8db65/input-sources/src/test/mappingHealth.test.ts | 74:23 | error | @typescript-eslint/no-explicit-any | Unexpected any. Specify a different type |
| docs/testing/history/2026-10-25T16-10-41-635Z_7cf8db65/input-sources/src/test/mappingHealth.test.ts | 87:23 | error | @typescript-eslint/no-explicit-any | Unexpected any. Specify a different type |
| docs/testing/history/2026-10-25T16-10-41-635Z_7cf8db65/input-sources/src/test/mappingHealth.test.ts | 101:23 | error | @typescript-eslint/no-explicit-any | Unexpected any. Specify a different type |
| docs/testing/history/2026-10-25T16-10-41-635Z_7cf8db65/input-sources/src/test/toast.test.ts | 34:35 | error | @typescript-eslint/no-explicit-any | Unexpected any. Specify a different type |
| src/components/ui/badge.tsx | 29:17 | warning | react-refresh/only-export-components | Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components |
| src/components/ui/button.tsx | 47:18 | warning | react-refresh/only-export-components | Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components |
| src/components/ui/command.tsx | 24:11 | error | @typescript-eslint/no-empty-object-type | An interface declaring no members is equivalent to its supertype |
| src/components/ui/form.tsx | 129:10 | warning | react-refresh/only-export-components | Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components |
| src/components/ui/navigation-menu.tsx | 111:3 | warning | react-refresh/only-export-components | Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components |
| src/components/ui/sidebar.tsx | 636:3 | warning | react-refresh/only-export-components | Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components |
| src/components/ui/sonner.tsx | 28:19 | warning | react-refresh/only-export-components | Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components |
| src/components/ui/textarea.tsx | 5:18 | error | @typescript-eslint/no-empty-object-type | An interface declaring no members is equivalent to its supertype |
| src/components/ui/toggle.tsx | 37:18 | warning | react-refresh/only-export-components | Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components |
| src/contexts/ActiveSessionContext.tsx | 112:17 | warning | react-refresh/only-export-components | Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components |
| src/contexts/AuthContext.tsx | 75:17 | warning | react-refresh/only-export-components | Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components |
| src/contexts/ThemeContext.tsx | 75:17 | warning | react-refresh/only-export-components | Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components |
| src/pages/Analytics.tsx | 307:32 | error | @typescript-eslint/no-explicit-any | Unexpected any. Specify a different type |
| src/pages/Analytics.tsx | 308:31 | error | @typescript-eslint/no-explicit-any | Unexpected any. Specify a different type |
| src/pages/Analytics.tsx | 309:30 | error | @typescript-eslint/no-explicit-any | Unexpected any. Specify a different type |
| src/pages/BoulderSession.tsx | 269:6 | warning | react-hooks/exhaustive-deps | React Hook useEffect has a missing dependency: 'boulders.length'. Either include it or remove the dependency array |
| src/pages/StrengthSession.tsx | 151:6 | warning | react-hooks/exhaustive-deps | React Hook useEffect has a missing dependency: 'user'. Either include it or remove the dependency array |
| src/test/mappingHealth.test.ts | 60:23 | error | @typescript-eslint/no-explicit-any | Unexpected any. Specify a different type |
| src/test/mappingHealth.test.ts | 74:23 | error | @typescript-eslint/no-explicit-any | Unexpected any. Specify a different type |
| src/test/mappingHealth.test.ts | 87:23 | error | @typescript-eslint/no-explicit-any | Unexpected any. Specify a different type |
| src/test/mappingHealth.test.ts | 101:23 | error | @typescript-eslint/no-explicit-any | Unexpected any. Specify a different type |
| src/test/toast.test.ts | 34:35 | error | @typescript-eslint/no-explicit-any | Unexpected any. Specify a different type |
| tailwind.config.ts | 152:13 | error | @typescript-eslint/no-require-imports | A `require()` style import is forbidden |

Pełne logi testów, buildu i linta zapisano osobno jako *.stdout.log oraz *.stderr.log. Ostrzeżenia buildu (np. kolejność CSS @import, rozmiar bundla i dane Browserslist) nie są nieudanymi asercjami; ich aktualna treść znajduje się w logach. Ostrzeżenia React Router i opisów dialogów także wymagają odrębnej interpretacji.

## Katalog indywidualnych przypadków

Jednostką zliczania jest pojedyncze rozwinięte wywołanie it/test, nie pojedyncza asercja. Warianty it.each są osobnymi przypadkami i mają osobne identyfikatory.

## T1: Algorytmy i analityka

### T1-ANL-001 — Indeksowanie stopni V-Scale

- Cel: Weryfikacja: indeksowanie stopni v-scale.
- Wynik oczekiwany: V0, V5 i V10 otrzymują indeksy 0, 5 i 10.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 2.885 ms.
- Plik i linia: [src/lib/analytics.test.ts:37](../../../../src/lib/analytics.test.ts#L37).
- Pełna nazwa w Vitest: `Grade Normalization getVScaleIndex returns correct index for V-Scale grades`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-ANL-002 — Odrzucanie nieprawidłowego zapisu V-Scale

- Cel: Weryfikacja: odrzucanie nieprawidłowego zapisu v-scale.
- Wynik oczekiwany: Brak wartości, zapis Font i nieznany stopień dają -1.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.566 ms.
- Plik i linia: [src/lib/analytics.test.ts:43](../../../../src/lib/analytics.test.ts#L43).
- Pełna nazwa w Vitest: `Grade Normalization getVScaleIndex returns -1 for invalid grades`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-ANL-003 — Indeksowanie stopni Font

- Cel: Weryfikacja: indeksowanie stopni font.
- Wynik oczekiwany: Stopnie 4, 6a i 7a otrzymują indeksy zgodne z kolejnością tabeli.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 11.845 ms.
- Plik i linia: [src/lib/analytics.test.ts:51](../../../../src/lib/analytics.test.ts#L51).
- Pełna nazwa w Vitest: `Grade Normalization getFontIndex returns correct index for Font grades`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-ANL-004 — Odrzucanie nieprawidłowego zapisu Font

- Cel: Weryfikacja: odrzucanie nieprawidłowego zapisu font.
- Wynik oczekiwany: Brak wartości, V5 i nieznany stopień dają -1.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 1.375 ms.
- Plik i linia: [src/lib/analytics.test.ts:57](../../../../src/lib/analytics.test.ts#L57).
- Pełna nazwa w Vitest: `Grade Normalization getFontIndex returns -1 for invalid grades`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-ANL-005 — Normalizacja na podstawie przedziału V-Scale

- Cel: Weryfikacja: normalizacja na podstawie przedziału v-scale.
- Wynik oczekiwany: Wynik przykładowego mapowania jest dodatni i mniejszy od 20.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 3.413 ms.
- Plik i linia: [src/lib/analytics.test.ts:65](../../../../src/lib/analytics.test.ts#L65).
- Pełna nazwa w Vitest: `Grade Normalization getMappingDifficulty uses V-Scale for normalization when available`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-ANL-006 — Zapasowa normalizacja na podstawie Font

- Cel: Weryfikacja: zapasowa normalizacja na podstawie font.
- Wynik oczekiwany: Przy braku granic V-Scale obliczona trudność jest dodatnia.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.884 ms.
- Plik i linia: [src/lib/analytics.test.ts:72](../../../../src/lib/analytics.test.ts#L72).
- Pełna nazwa w Vitest: `Grade Normalization getMappingDifficulty falls back to Font when V-Scale not available`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-ANL-007 — Normalizacja przy użyciu order_index

- Cel: Weryfikacja: normalizacja przy użyciu order_index.
- Wynik oczekiwany: Przy braku skal wynik przykładowego mapowania wynosi 50.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 15.918 ms.
- Plik i linia: [src/lib/analytics.test.ts:78](../../../../src/lib/analytics.test.ts#L78).
- Pełna nazwa w Vitest: `Grade Normalization getMappingDifficulty falls back to order_index when no grades available`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-ANL-008 — Strefy rozwoju dla pustego dziennika

- Cel: Weryfikacja: strefy rozwoju dla pustego dziennika.
- Wynik oczekiwany: Wszystkie trzy udziały stref wynoszą 0.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 1.641 ms.
- Plik i linia: [src/lib/analytics.test.ts:96](../../../../src/lib/analytics.test.ts#L96).
- Pełna nazwa w Vitest: `Development Zones computeSessionZones returns zeros for empty logs`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-ANL-009 — Strefy dla nierozpoznanych stopni bez mapowań

- Cel: Weryfikacja: strefy dla nierozpoznanych stopni bez mapowań.
- Wynik oczekiwany: Wszystkie trzy udziały wynoszą 0.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 3.406 ms.
- Plik i linia: [src/lib/analytics.test.ts:101](../../../../src/lib/analytics.test.ts#L101).
- Pełna nazwa w Vitest: `Development Zones computeSessionZones returns zeros for empty mappings with unmappable grades`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-ANL-010 — Klasyfikacja stopni Font z tabeli kanonicznej

- Cel: Weryfikacja: klasyfikacja stopni font z tabeli kanonicznej.
- Wynik oczekiwany: Comfort, Growth i Limit mają dodatnie udziały.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 1.586 ms.
- Plik i linia: [src/lib/analytics.test.ts:107](../../../../src/lib/analytics.test.ts#L107).
- Pełna nazwa w Vitest: `Development Zones computeSessionZones classifies Font grades correctly using canonical table`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-ANL-011 — Rozkład stref dla zróżnicowanego zbioru

- Cel: Weryfikacja: rozkład stref dla zróżnicowanego zbioru.
- Wynik oczekiwany: Growth jest mniejsze od 100%, a Comfort i Limit są dodatnie.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 2.089 ms.
- Plik i linia: [src/lib/analytics.test.ts:125](../../../../src/lib/analytics.test.ts#L125).
- Pełna nazwa w Vitest: `Development Zones computeSessionZones does NOT collapse all grades into Growth for mixed dataset`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-ANL-012 — Suma udziałów stref

- Cel: Weryfikacja: suma udziałów stref.
- Wynik oczekiwany: Suma trzech udziałów wynosi 100%.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.985 ms.
- Plik i linia: [src/lib/analytics.test.ts:149](../../../../src/lib/analytics.test.ts#L149).
- Pełna nazwa w Vitest: `Development Zones computeSessionZones percentages sum to 100 for mixed sessions`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-ANL-013 — Wykorzystanie przekazanego poziomu odniesienia

- Cel: Weryfikacja: wykorzystanie przekazanego poziomu odniesienia.
- Wynik oczekiwany: Każda strefa przykładowej sesji ma udział większy od 25%.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 1.116 ms.
- Plik i linia: [src/lib/analytics.test.ts:162](../../../../src/lib/analytics.test.ts#L162).
- Pełna nazwa w Vitest: `Development Zones computeSessionZones uses provided baseline for zone thresholds`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-ANL-014 — Wpływ poziomu użytkownika na klasyfikację

- Cel: Weryfikacja: wpływ poziomu użytkownika na klasyfikację.
- Wynik oczekiwany: Ta sama trudność daje 100% Comfort dla wysokiego poziomu i 100% Limit dla niskiego.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.858 ms.
- Plik i linia: [src/lib/analytics.test.ts:176](../../../../src/lib/analytics.test.ts#L176).
- Pełna nazwa w Vitest: `Development Zones computeSessionZones respects user baseline for relative zone classification`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-ANL-015 — Profil trudności dla pustej listy sesji

- Cel: Weryfikacja: profil trudności dla pustej listy sesji.
- Wynik oczekiwany: difficulty_bias i samples_count wynoszą 0.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.600 ms.
- Plik i linia: [src/lib/analytics.test.ts:199](../../../../src/lib/analytics.test.ts#L199).
- Pełna nazwa w Vitest: `Gym Difficulty Profile computeGymDifficultyProfile returns zeros for empty sessions`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-ANL-016 — Profil obiektu z łatwiejszymi problemami

- Cel: Weryfikacja: profil obiektu z łatwiejszymi problemami.
- Wynik oczekiwany: difficulty_bias jest dodatni, a liczba próbek wynosi 10.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.516 ms.
- Plik i linia: [src/lib/analytics.test.ts:204](../../../../src/lib/analytics.test.ts#L204).
- Pełna nazwa w Vitest: `Gym Difficulty Profile computeGymDifficultyProfile correctly calculates bias for easier gym`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-ANL-017 — Liczba próbek profilu obiektu

- Cel: Weryfikacja: liczba próbek profilu obiektu.
- Wynik oczekiwany: samples_count wynosi 10 dla danych kontrolnych.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.391 ms.
- Plik i linia: [src/lib/analytics.test.ts:217](../../../../src/lib/analytics.test.ts#L217).
- Pełna nazwa w Vitest: `Gym Difficulty Profile computeGymDifficultyProfile correctly updates samples_count`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-ANL-018 — Kierunek zmiany profilu przy zmianie próbek

- Cel: Weryfikacja: kierunek zmiany profilu przy zmianie próbek.
- Wynik oczekiwany: Profil łatwiejszych próbek ma większy bias niż profil trudniejszych.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.476 ms.
- Plik i linia: [src/lib/analytics.test.ts:233](../../../../src/lib/analytics.test.ts#L233).
- Pełna nazwa w Vitest: `Gym Difficulty Profile computeGymDifficultyProfile bias moves correctly with controlled samples`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-ANL-019 — Maksymalny stopień dla pustych logów

- Cel: Weryfikacja: maksymalny stopień dla pustych logów.
- Wynik oczekiwany: Funkcja zwraca null.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.475 ms.
- Plik i linia: [src/lib/analytics.test.ts:269](../../../../src/lib/analytics.test.ts#L269).
- Pełna nazwa w Vitest: `Max Grade Calculation getMaxGrade returns null for empty logs`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-ANL-020 — Maksymalny stopień bez mapowań

- Cel: Weryfikacja: maksymalny stopień bez mapowań.
- Wynik oczekiwany: Funkcja zwraca null.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.224 ms.
- Plik i linia: [src/lib/analytics.test.ts:273](../../../../src/lib/analytics.test.ts#L273).
- Pełna nazwa w Vitest: `Max Grade Calculation getMaxGrade returns null for empty mappings`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-ANL-021 — Najtrudniejszy stopień z dodatnią liczbą przejść

- Cel: Weryfikacja: najtrudniejszy stopień z dodatnią liczbą przejść.
- Wynik oczekiwany: Dla danych testowych wynikiem jest Blue.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.340 ms.
- Plik i linia: [src/lib/analytics.test.ts:278](../../../../src/lib/analytics.test.ts#L278).
- Pełna nazwa w Vitest: `Max Grade Calculation getMaxGrade returns the highest grade with count > 0`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-ANL-022 — Pomijanie stopni nieobecnych w mapowaniach

- Cel: Weryfikacja: pomijanie stopni nieobecnych w mapowaniach.
- Wynik oczekiwany: Nieznany stopień nie wypiera poprawnego wyniku Yellow.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.222 ms.
- Plik i linia: [src/lib/analytics.test.ts:287](../../../../src/lib/analytics.test.ts#L287).
- Pełna nazwa w Vitest: `Max Grade Calculation getMaxGrade ignores grades not in mappings`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-ANL-023 — Obliczanie stref dla przykładu OFF-WALL bez obiektu

- Cel: Weryfikacja: obliczanie stref dla przykładu off-wall bez obiektu.
- Wynik oczekiwany: Wywołanie analityki bez rozpoznanych stopni zwraca udziały 0.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.827 ms.
- Plik i linia: [src/lib/analytics.test.ts:298](../../../../src/lib/analytics.test.ts#L298).
- Pełna nazwa w Vitest: `OFF-WALL Session Handling OFF-WALL sessions work without session_gyms`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-ANL-024 — Przykładowa struktura OFF-WALL bez powiązania z obiektem

- Cel: Weryfikacja: przykładowa struktura off-wall bez powiązania z obiektem.
- Wynik oczekiwany: Lokalny obiekt testowy ma pustą tablicę session_gyms.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 1.501 ms.
- Plik i linia: [src/lib/analytics.test.ts:308](../../../../src/lib/analytics.test.ts#L308).
- Pełna nazwa w Vitest: `OFF-WALL Session Handling OFF-WALL sessions are not filtered out by gym selection`.
- Ograniczenia: Sprawdzana jest jedynie pusta tablica w lokalnym obiekcie; brak rzeczywistego filtra obiektu lub zapytania.

### T1-VOL-001 — Agregacja objętości dla pustego dziennika

- Cel: Weryfikacja: agregacja objętości dla pustego dziennika.
- Wynik oczekiwany: Wynik jest pustą tablicą.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 5.735 ms.
- Plik i linia: [src/lib/volumeByGrade.test.ts:28](../../../../src/lib/volumeByGrade.test.ts#L28).
- Pełna nazwa w Vitest: `aggregateVolumeByGrade basic aggregation returns empty array for empty logs`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-VOL-002 — Agregacja objętości bez mapowań

- Cel: Weryfikacja: agregacja objętości bez mapowań.
- Wynik oczekiwany: Wynik jest pustą tablicą.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.691 ms.
- Plik i linia: [src/lib/volumeByGrade.test.ts:34](../../../../src/lib/volumeByGrade.test.ts#L34).
- Pełna nazwa w Vitest: `aggregateVolumeByGrade basic aggregation returns empty array for empty mappings`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-VOL-003 — Agregacja jednego stopnia

- Cel: Weryfikacja: agregacja jednego stopnia.
- Wynik oczekiwany: Powstaje jeden wynik o oczekiwanej liczbie przejść.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 2.803 ms.
- Plik i linia: [src/lib/volumeByGrade.test.ts:40](../../../../src/lib/volumeByGrade.test.ts#L40).
- Pełna nazwa w Vitest: `aggregateVolumeByGrade basic aggregation aggregates single grade correctly`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-VOL-004 — Scalanie wielu logów Yellow

- Cel: Weryfikacja: scalanie wielu logów yellow.
- Wynik oczekiwany: Powstaje dokładnie jeden słupek Yellow z sumą przejść.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 1.322 ms.
- Plik i linia: [src/lib/volumeByGrade.test.ts:56](../../../../src/lib/volumeByGrade.test.ts#L56).
- Pełna nazwa w Vitest: `aggregateVolumeByGrade CRITICAL: duplicate prevention produces exactly ONE bar for Yellow with total sum when multiple logs have same grade`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-VOL-005 — Rozróżnianie jednakowych nazw w różnych obiektach

- Cel: Weryfikacja: rozróżnianie jednakowych nazw w różnych obiektach.
- Wynik oczekiwany: Etykiety wyników są unikalne mimo tej samej nazwy stopnia.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.839 ms.
- Plik i linia: [src/lib/volumeByGrade.test.ts:74](../../../../src/lib/volumeByGrade.test.ts#L74).
- Pełna nazwa w Vitest: `aggregateVolumeByGrade CRITICAL: duplicate prevention produces unique labels when multiple gyms have same grade name`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-VOL-006 — Agregacja mieszanych stopni i obiektów

- Cel: Weryfikacja: agregacja mieszanych stopni i obiektów.
- Wynik oczekiwany: Liczby i rozróżnienie wyników odpowiadają danym testowym.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 1.211 ms.
- Plik i linia: [src/lib/volumeByGrade.test.ts:96](../../../../src/lib/volumeByGrade.test.ts#L96).
- Pełna nazwa w Vitest: `aggregateVolumeByGrade CRITICAL: duplicate prevention handles mixed grades from multiple gyms correctly`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-VOL-007 — Sortowanie objętości według order_index

- Cel: Weryfikacja: sortowanie objętości według order_index.
- Wynik oczekiwany: Wyniki mają oczekiwaną kolejność stopni.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.867 ms.
- Plik i linia: [src/lib/volumeByGrade.test.ts:129](../../../../src/lib/volumeByGrade.test.ts#L129).
- Pełna nazwa w Vitest: `aggregateVolumeByGrade ordering orders results by order_index`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-VOL-008 — Pomijanie wpisów o zerowej liczbie przejść

- Cel: Weryfikacja: pomijanie wpisów o zerowej liczbie przejść.
- Wynik oczekiwany: Wpis z count równym 0 nie trafia do wyników.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.869 ms.
- Plik i linia: [src/lib/volumeByGrade.test.ts:149](../../../../src/lib/volumeByGrade.test.ts#L149).
- Pełna nazwa w Vitest: `aggregateVolumeByGrade filtering excludes grades with zero count`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-VOL-009 — Pomijanie stopni bez mapowania w agregacji

- Cel: Weryfikacja: pomijanie stopni bez mapowania w agregacji.
- Wynik oczekiwany: Nieznany stopień nie tworzy wyniku agregacji.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.983 ms.
- Plik i linia: [src/lib/volumeByGrade.test.ts:166](../../../../src/lib/volumeByGrade.test.ts#L166).
- Pełna nazwa w Vitest: `aggregateVolumeByGrade filtering excludes grades not in mappings`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-ORD-001 — Porządek Font: 6c+ i 6c

- Cel: Weryfikacja: porządek font: 6c+ i 6c.
- Wynik oczekiwany: Maksymalnym stopniem jest 6c+.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 2.296 ms.
- Plik i linia: [src/test/analytics.test.ts:25](../../../../src/test/analytics.test.ts#L25).
- Pełna nazwa w Vitest: `getMaxGrade Font grade ordering with + variants should correctly identify 6c+ > 6c`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-ORD-002 — Porządek Font: 7a i 6c+

- Cel: Weryfikacja: porządek font: 7a i 6c+.
- Wynik oczekiwany: Maksymalnym stopniem jest 7a.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.338 ms.
- Plik i linia: [src/test/analytics.test.ts:39](../../../../src/test/analytics.test.ts#L39).
- Pełna nazwa w Vitest: `getMaxGrade Font grade ordering with + variants should correctly identify 7a > 6c+`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-ORD-003 — Porządek Font: 6a+ i 6a

- Cel: Weryfikacja: porządek font: 6a+ i 6a.
- Wynik oczekiwany: Maksymalnym stopniem jest 6a+.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.282 ms.
- Plik i linia: [src/test/analytics.test.ts:53](../../../../src/test/analytics.test.ts#L53).
- Pełna nazwa w Vitest: `getMaxGrade Font grade ordering with + variants should correctly handle 6a+ > 6a`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-ORD-004 — Porządek V-Scale: V7 i V6

- Cel: Weryfikacja: porządek v-scale: v7 i v6.
- Wynik oczekiwany: Maksymalnym stopniem jest V7.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.325 ms.
- Plik i linia: [src/test/analytics.test.ts:69](../../../../src/test/analytics.test.ts#L69).
- Pełna nazwa w Vitest: `getMaxGrade V-Scale ordering should correctly identify V7 > V6`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-ORD-005 — Porządek pełnego zakresu V-Scale w próbce

- Cel: Weryfikacja: porządek pełnego zakresu v-scale w próbce.
- Wynik oczekiwany: Najwyższy stopień odpowiada maksimum danych testowych.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.383 ms.
- Plik i linia: [src/test/analytics.test.ts:83](../../../../src/test/analytics.test.ts#L83).
- Pełna nazwa w Vitest: `getMaxGrade V-Scale ordering should correctly handle full V-scale range`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-ORD-006 — Porządkowanie etykiet przez normalizację V-Scale

- Cel: Weryfikacja: porządkowanie etykiet przez normalizację v-scale.
- Wynik oczekiwany: Wynik wskazuje stopień o największej znormalizowanej trudności.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.300 ms.
- Plik i linia: [src/test/analytics.test.ts:101](../../../../src/test/analytics.test.ts#L101).
- Pełna nazwa w Vitest: `getMaxGrade Color/Numeric grading should correctly identify max using V-scale normalization`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-ORD-007 — Zapasowe porządkowanie przez Font

- Cel: Weryfikacja: zapasowe porządkowanie przez font.
- Wynik oczekiwany: Brak V-Scale nie blokuje wyznaczenia maksimum z granic Font.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.576 ms.
- Plik i linia: [src/test/analytics.test.ts:118](../../../../src/test/analytics.test.ts#L118).
- Pełna nazwa w Vitest: `getMaxGrade Color/Numeric grading should use Font fallback when V-scale not available`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-ORD-008 — Maksimum bez logów

- Cel: Weryfikacja: maksimum bez logów.
- Wynik oczekiwany: Wynikiem jest null.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.290 ms.
- Plik i linia: [src/test/analytics.test.ts:136](../../../../src/test/analytics.test.ts#L136).
- Pełna nazwa w Vitest: `getMaxGrade Edge cases should return null for empty logs`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-ORD-009 — Maksimum bez mapowań

- Cel: Weryfikacja: maksimum bez mapowań.
- Wynik oczekiwany: Wynikiem jest null.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.515 ms.
- Plik i linia: [src/test/analytics.test.ts:141](../../../../src/test/analytics.test.ts#L141).
- Pełna nazwa w Vitest: `getMaxGrade Edge cases should return null for empty mappings`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-ORD-010 — Wykluczenie count równego 0 z maksimum

- Cel: Weryfikacja: wykluczenie count równego 0 z maksimum.
- Wynik oczekiwany: Stopień bez przejść nie jest wybierany jako maksimum.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.396 ms.
- Plik i linia: [src/test/analytics.test.ts:146](../../../../src/test/analytics.test.ts#L146).
- Pełna nazwa w Vitest: `getMaxGrade Edge cases should skip logs with count 0`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-ORD-011 — Wykluczenie niemapowanych stopni z maksimum

- Cel: Weryfikacja: wykluczenie niemapowanych stopni z maksimum.
- Wynik oczekiwany: Niemapowany wpis nie zmienia maksimum poprawnych danych.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.338 ms.
- Plik i linia: [src/test/analytics.test.ts:160](../../../../src/test/analytics.test.ts#L160).
- Pełna nazwa w Vitest: `getMaxGrade Edge cases should skip logs with unmapped grades`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-ORD-012 — Indeksy stopni V-Scale

- Cel: Weryfikacja: indeksy stopni v-scale.
- Wynik oczekiwany: Przykładowe stopnie mają oczekiwane indeksy liczbowe.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.296 ms.
- Plik i linia: [src/test/analytics.test.ts:177](../../../../src/test/analytics.test.ts#L177).
- Pełna nazwa w Vitest: `Grade ordering functions getVScaleIndex should return correct index for V-scale grades`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-ORD-013 — Niepoprawne indeksy V-Scale

- Cel: Weryfikacja: niepoprawne indeksy v-scale.
- Wynik oczekiwany: Niepoprawny zapis zwraca -1.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.147 ms.
- Plik i linia: [src/test/analytics.test.ts:184](../../../../src/test/analytics.test.ts#L184).
- Pełna nazwa w Vitest: `Grade ordering functions getVScaleIndex should return -1 for invalid grades`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-ORD-014 — Kolejność Font z wariantami plus

- Cel: Weryfikacja: kolejność font z wariantami plus.
- Wynik oczekiwany: Indeksy zachowują porządek stopni podstawowych i wariantów plus.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.332 ms.
- Plik i linia: [src/test/analytics.test.ts:191](../../../../src/test/analytics.test.ts#L191).
- Pełna nazwa w Vitest: `Grade ordering functions getFontIndex should return correct order for Font grades with + variants`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-ORD-015 — Niepoprawne indeksy Font

- Cel: Weryfikacja: niepoprawne indeksy font.
- Wynik oczekiwany: Niepoprawny zapis zwraca -1.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.146 ms.
- Plik i linia: [src/test/analytics.test.ts:201](../../../../src/test/analytics.test.ts#L201).
- Pełna nazwa w Vitest: `Grade ordering functions getFontIndex should return -1 for invalid grades`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-ZONE-001 — Granica Comfort względem poziomu użytkownika

- Cel: Weryfikacja: granica comfort względem poziomu użytkownika.
- Wynik oczekiwany: Próbka daje Comfort=67%, Growth=33%, Limit=0%.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 6.691 ms.
- Plik i linia: [src/test/developmentZones.test.ts:32](../../../../src/test/developmentZones.test.ts#L32).
- Pełna nazwa w Vitest: `computeSessionZones - User Level Relative Classification Basic zone distribution with explicit user level should classify grades below userLevel - 1 as Comfort`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-ZONE-002 — Granica Limit powyżej poziomu użytkownika

- Cel: Weryfikacja: granica limit powyżej poziomu użytkownika.
- Wynik oczekiwany: Próbka daje Comfort=30%, Growth=50%, Limit=20%.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 2.209 ms.
- Plik i linia: [src/test/developmentZones.test.ts:57](../../../../src/test/developmentZones.test.ts#L57).
- Pełna nazwa w Vitest: `computeSessionZones - User Level Relative Classification Basic zone distribution with explicit user level should classify grades above userLevel + 1.5 as Limit`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-ZONE-003 — V7 przy poziomie V6

- Cel: Weryfikacja: v7 przy poziomie v6.
- Wynik oczekiwany: Wszystkie przejścia próbki trafiają do Growth.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 1.329 ms.
- Plik i linia: [src/test/developmentZones.test.ts:81](../../../../src/test/developmentZones.test.ts#L81).
- Pełna nazwa w Vitest: `computeSessionZones - User Level Relative Classification Basic zone distribution with explicit user level should have V7 in Growth when userLevel is V6 (within +1.5 threshold)`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-ZONE-004 — Zrównoważona próbka treningu

- Cel: Weryfikacja: zrównoważona próbka treningu.
- Wynik oczekiwany: Comfort i Growth przekraczają 40%, a Limit jest mniejsze od 10%.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 1.841 ms.
- Plik i linia: [src/test/developmentZones.test.ts:99](../../../../src/test/developmentZones.test.ts#L99).
- Pełna nazwa w Vitest: `computeSessionZones - User Level Relative Classification Real-world example: User at 6c/V5-V6 level should produce balanced distribution for typical climbing session`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-ZONE-005 — Regresja zawyżonego Growth dla łatwych przejść

- Cel: Weryfikacja: regresja zawyżonego growth dla łatwych przejść.
- Wynik oczekiwany: Comfort przekracza 70%, Growth jest mniejsze od 25%, Limit mniejsze od 5%.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 1.821 ms.
- Plik i linia: [src/test/developmentZones.test.ts:146](../../../../src/test/developmentZones.test.ts#L146).
- Pełna nazwa w Vitest: `computeSessionZones - User Level Relative Classification Regression test: Original bug scenario should NOT classify 80%+ as Growth when many grades are below user level`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-ZONE-006 — Zróżnicowana objętość a udział Growth

- Cel: Weryfikacja: zróżnicowana objętość a udział growth.
- Wynik oczekiwany: Dla przygotowanej próbki Growth jest mniejsze od 70%.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 9.072 ms.
- Plik i linia: [src/test/developmentZones.test.ts:204](../../../../src/test/developmentZones.test.ts#L204).
- Pełna nazwa w Vitest: `computeSessionZones - User Level Relative Classification Sanity checks should be impossible for Growth > 70% with large diverse volume`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-ZONE-007 — Obecność Comfort dla zróżnicowanej historii

- Cel: Weryfikacja: obecność comfort dla zróżnicowanej historii.
- Wynik oczekiwany: Udział Comfort jest większy od 0.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 1.481 ms.
- Plik i linia: [src/test/developmentZones.test.ts:229](../../../../src/test/developmentZones.test.ts#L229).
- Pełna nazwa w Vitest: `computeSessionZones - User Level Relative Classification Sanity checks should have Comfort > 0 for users with diverse climbing history`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-ZONE-008 — Relacja Limit do Growth w przykładowej sesji

- Cel: Weryfikacja: relacja limit do growth w przykładowej sesji.
- Wynik oczekiwany: Limit ma mniejszy udział niż Growth.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 1.013 ms.
- Plik i linia: [src/test/developmentZones.test.ts:249](../../../../src/test/developmentZones.test.ts#L249).
- Pełna nazwa w Vitest: `computeSessionZones - User Level Relative Classification Sanity checks should have Limit < Growth in typical session`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-ZONE-009 — Puste logi w klasyfikacji stref

- Cel: Weryfikacja: puste logi w klasyfikacji stref.
- Wynik oczekiwany: Wszystkie udziały stref wynoszą 0.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 2.118 ms.
- Plik i linia: [src/test/developmentZones.test.ts:270](../../../../src/test/developmentZones.test.ts#L270).
- Pełna nazwa w Vitest: `computeSessionZones - User Level Relative Classification Edge cases should return all zeros for empty logs`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-ZONE-010 — Zapasowa obsługa V-Scale bez mapowań

- Cel: Weryfikacja: zapasowa obsługa v-scale bez mapowań.
- Wynik oczekiwany: Rozpoznany stopień V-Scale nadal jest klasyfikowany.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.941 ms.
- Plik i linia: [src/test/developmentZones.test.ts:277](../../../../src/test/developmentZones.test.ts#L277).
- Pełna nazwa w Vitest: `computeSessionZones - User Level Relative Classification Edge cases should handle empty mappings with V-scale fallback`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-ZONE-011 — Brak jawnego poziomu odniesienia

- Cel: Weryfikacja: brak jawnego poziomu odniesienia.
- Wynik oczekiwany: Funkcja korzysta z maksimum sesji i zwraca oczekiwany rozkład.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 1.004 ms.
- Plik i linia: [src/test/developmentZones.test.ts:289](../../../../src/test/developmentZones.test.ts#L289).
- Pełna nazwa w Vitest: `computeSessionZones - User Level Relative Classification Edge cases should use session max as fallback when userLevel not provided`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-ZONE-012 — Przejścia dokładnie na poziomie użytkownika

- Cel: Weryfikacja: przejścia dokładnie na poziomie użytkownika.
- Wynik oczekiwany: Próbka trafia w całości do Growth.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.877 ms.
- Plik i linia: [src/test/developmentZones.test.ts:309](../../../../src/test/developmentZones.test.ts#L309).
- Pełna nazwa w Vitest: `computeSessionZones - User Level Relative Classification Edge cases should handle all boulders at exact user level`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-ZONE-013 — Strefy dla mapowań kolorów

- Cel: Weryfikacja: strefy dla mapowań kolorów.
- Wynik oczekiwany: Stopnie kolorowe są klasyfikowane według przypisanych trudności V-Scale.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.926 ms.
- Plik i linia: [src/test/developmentZones.test.ts:322](../../../../src/test/developmentZones.test.ts#L322).
- Pełna nazwa w Vitest: `computeSessionZones - User Level Relative Classification Color/Numeric grading systems should work with color grades using V-scale mappings`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-ZONE-014 — Strefy dla mapowań numerycznych

- Cel: Weryfikacja: strefy dla mapowań numerycznych.
- Wynik oczekiwany: Stopnie numeryczne dają rozkład zgodny z mapowaniami.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 1.140 ms.
- Plik i linia: [src/test/developmentZones.test.ts:350](../../../../src/test/developmentZones.test.ts#L350).
- Pełna nazwa w Vitest: `computeSessionZones - User Level Relative Classification Color/Numeric grading systems should work with numeric grades`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-MAP-001 — Kompletne mapowania stopni

- Cel: Weryfikacja: kompletne mapowania stopni.
- Wynik oczekiwany: Normalizowalność wynosi 100%, bez braków i flagi problemów.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 4.661 ms.
- Plik i linia: [src/test/mappingHealth.test.ts:9](../../../../src/test/mappingHealth.test.ts#L9).
- Pełna nazwa w Vitest: `Mapping Health Computation analyzeGymMappingHealth should return 100% normalizable when all grades have valid mappings`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-MAP-002 — Identyfikacja brakującego mapowania

- Cel: Weryfikacja: identyfikacja brakującego mapowania.
- Wynik oczekiwany: Purple ma przyczynę missing_mapping i liczbę 3; normalizowalność wynosi 63%.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.739 ms.
- Plik i linia: [src/test/mappingHealth.test.ts:35](../../../../src/test/mappingHealth.test.ts#L35).
- Pełna nazwa w Vitest: `Mapping Health Computation analyzeGymMappingHealth should identify unmapped grades as missing_mapping`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-MAP-003 — Puste logi a kondycja mapowań

- Cel: Weryfikacja: puste logi a kondycja mapowań.
- Wynik oczekiwany: Liczba logów wynosi 0, wskaźnik 100%, brak flagi problemów.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.470 ms.
- Plik i linia: [src/test/mappingHealth.test.ts:58](../../../../src/test/mappingHealth.test.ts#L58).
- Pełna nazwa w Vitest: `Mapping Health Computation analyzeGymMappingHealth should handle empty boulder logs`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-MAP-004 — Font bez mapowania specyficznego dla obiektu

- Cel: Weryfikacja: font bez mapowania specyficznego dla obiektu.
- Wynik oczekiwany: Standardowe stopnie Font są rozpoznawane w 100%.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.390 ms.
- Plik i linia: [src/test/mappingHealth.test.ts:69](../../../../src/test/mappingHealth.test.ts#L69).
- Pełna nazwa w Vitest: `Mapping Health Computation analyzeGymMappingHealth should recognize standard Font grades without gym mapping`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-MAP-005 — V-Scale bez mapowania specyficznego dla obiektu

- Cel: Weryfikacja: v-scale bez mapowania specyficznego dla obiektu.
- Wynik oczekiwany: Standardowe stopnie V-Scale są rozpoznawane w 100%.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.398 ms.
- Plik i linia: [src/test/mappingHealth.test.ts:82](../../../../src/test/mappingHealth.test.ts#L82).
- Pełna nazwa w Vitest: `Mapping Health Computation analyzeGymMappingHealth should recognize V-scale grades without gym mapping`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-MAP-006 — Sortowanie nierozpoznanych stopni

- Cel: Weryfikacja: sortowanie nierozpoznanych stopni.
- Wynik oczekiwany: Kolejność jest malejąca według liczby: B, C, A.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.488 ms.
- Plik i linia: [src/test/mappingHealth.test.ts:95](../../../../src/test/mappingHealth.test.ts#L95).
- Pełna nazwa w Vitest: `Mapping Health Computation analyzeGymMappingHealth should sort unmappable grades by count descending`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-MAP-007 — Zbiorcza kondycja kilku obiektów

- Cel: Weryfikacja: zbiorcza kondycja kilku obiektów.
- Wynik oczekiwany: Dwa obiekty, jeden problematyczny i 90% normalizowalności odpowiadają próbce.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.805 ms.
- Plik i linia: [src/test/mappingHealth.test.ts:112](../../../../src/test/mappingHealth.test.ts#L112).
- Pełna nazwa w Vitest: `Mapping Health Computation getMappingHealthSummary should aggregate results from multiple gyms`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-MAP-008 — Brak wyników kondycji obiektów

- Cel: Weryfikacja: brak wyników kondycji obiektów.
- Wynik oczekiwany: Liczby obiektów i problemów wynoszą 0, wskaźnik 100%.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.357 ms.
- Plik i linia: [src/test/mappingHealth.test.ts:144](../../../../src/test/mappingHealth.test.ts#L144).
- Pełna nazwa w Vitest: `Mapping Health Computation getMappingHealthSummary should return 100% when no results provided`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-MAP-009 — Łączenie braków o tej samej nazwie

- Cel: Weryfikacja: łączenie braków o tej samej nazwie.
- Wynik oczekiwany: Wpisy X z dwóch obiektów dają łączną liczbę 7.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.550 ms.
- Plik i linia: [src/test/mappingHealth.test.ts:152](../../../../src/test/mappingHealth.test.ts#L152).
- Pełna nazwa w Vitest: `Mapping Health Computation getMappingHealthSummary should combine unmappable grades across gyms`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-MAP-010 — Obsługa pustych danych zwróconych przez wywołującego

- Cel: Weryfikacja: obsługa pustych danych zwróconych przez wywołującego.
- Wynik oczekiwany: Brak danych nie powoduje błędu, wynik ma 0 logów i brak problemów.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.436 ms.
- Plik i linia: [src/test/mappingHealth.test.ts:191](../../../../src/test/mappingHealth.test.ts#L191).
- Pełna nazwa w Vitest: `Mapping Health Error Handling should handle empty array responses gracefully`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-PAIN-001 — Znacznik bólu o wartości false

- Cel: Weryfikacja: znacznik bólu o wartości false.
- Wynik oczekiwany: Funkcja rozpoznawania bólu zwraca false.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 1.553 ms.
- Plik i linia: [src/test/painInsights.test.ts:21](../../../../src/test/painInsights.test.ts#L21).
- Pełna nazwa w Vitest: `Pain Insights sessionHasPain returns false when pain_flag is false`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-PAIN-002 — Znacznik bólu o wartości true

- Cel: Weryfikacja: znacznik bólu o wartości true.
- Wynik oczekiwany: Funkcja rozpoznawania bólu zwraca true.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.193 ms.
- Plik i linia: [src/test/painInsights.test.ts:25](../../../../src/test/painInsights.test.ts#L25).
- Pełna nazwa w Vitest: `Pain Insights sessionHasPain returns true when pain_flag is true`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-PAIN-003 — Brak wartości znacznika bólu

- Cel: Weryfikacja: brak wartości znacznika bólu.
- Wynik oczekiwany: Wartość null jest traktowana jako brak bólu.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.121 ms.
- Plik i linia: [src/test/painInsights.test.ts:29](../../../../src/test/painInsights.test.ts#L29).
- Pełna nazwa w Vitest: `Pain Insights sessionHasPain returns false when pain_flag is null`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-PAIN-004 — Brak sesji w ocenie bólu

- Cel: Weryfikacja: brak sesji w ocenie bólu.
- Wynik oczekiwany: Wynikiem jest false.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.159 ms.
- Plik i linia: [src/test/painInsights.test.ts:35](../../../../src/test/painInsights.test.ts#L35).
- Pełna nazwa w Vitest: `Pain Insights hasPainInPeriod returns false for empty sessions`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-PAIN-005 — Lista sesji bez bólu

- Cel: Weryfikacja: lista sesji bez bólu.
- Wynik oczekiwany: Wynikiem jest false.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.145 ms.
- Plik i linia: [src/test/painInsights.test.ts:39](../../../../src/test/painInsights.test.ts#L39).
- Pełna nazwa w Vitest: `Pain Insights hasPainInPeriod returns false when no sessions have pain`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-PAIN-006 — Lista zawierająca sesję z bólem

- Cel: Weryfikacja: lista zawierająca sesję z bólem.
- Wynik oczekiwany: Wynikiem jest true.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.185 ms.
- Plik i linia: [src/test/painInsights.test.ts:47](../../../../src/test/painInsights.test.ts#L47).
- Pełna nazwa w Vitest: `Pain Insights hasPainInPeriod returns true when at least one session has pain`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-PAIN-007 — Brak przesłanek do wskazówek bólowych

- Cel: Weryfikacja: brak przesłanek do wskazówek bólowych.
- Wynik oczekiwany: Lista wskazówek jest pusta.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 1.118 ms.
- Plik i linia: [src/test/painInsights.test.ts:57](../../../../src/test/painInsights.test.ts#L57).
- Pełna nazwa w Vitest: `Pain Insights generatePainInsights returns empty array when no pain sessions`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-PAIN-008 — Reguła zmniejszenia obciążenia po bólu

- Cel: Weryfikacja: reguła zmniejszenia obciążenia po bólu.
- Wynik oczekiwany: Wynik zawiera wskazówkę deload dla danych testowych.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.381 ms.
- Plik i linia: [src/test/painInsights.test.ts:63](../../../../src/test/painInsights.test.ts#L63).
- Pełna nazwa w Vitest: `Pain Insights generatePainInsights returns deload insight when pain reported recently`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-PAIN-009 — Reguła małej liczby sesji OFF-WALL przy bólu

- Cel: Weryfikacja: reguła małej liczby sesji off-wall przy bólu.
- Wynik oczekiwany: Wynik zawiera wskazówkę dotyczącą udziału OFF-WALL.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.493 ms.
- Plik i linia: [src/test/painInsights.test.ts:70](../../../../src/test/painInsights.test.ts#L70).
- Pełna nazwa w Vitest: `Pain Insights generatePainInsights returns low off-wall insight when pain + few off-wall sessions`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-PAIN-010 — Reguła wysokiej intensywności przy bólu

- Cel: Weryfikacja: reguła wysokiej intensywności przy bólu.
- Wynik oczekiwany: Wynik zawiera wskazówkę dotyczącą wysokiego RPE.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.325 ms.
- Plik i linia: [src/test/painInsights.test.ts:77](../../../../src/test/painInsights.test.ts#L77).
- Pełna nazwa w Vitest: `Pain Insights generatePainInsights returns high intensity insight when pain + high RPE`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-PAIN-011 — Podsumowanie sesji bez bólu

- Cel: Weryfikacja: podsumowanie sesji bez bólu.
- Wynik oczekiwany: Wynikiem jest null.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.183 ms.
- Plik i linia: [src/test/painInsights.test.ts:86](../../../../src/test/painInsights.test.ts#L86).
- Pełna nazwa w Vitest: `Pain Insights getPainSummary returns null when no pain`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-PAIN-012 — Podsumowanie bólu bez szczegółów

- Cel: Weryfikacja: podsumowanie bólu bez szczegółów.
- Wynik oczekiwany: Wynik ma tekst Pain reported.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.102 ms.
- Plik i linia: [src/test/painInsights.test.ts:90](../../../../src/test/painInsights.test.ts#L90).
- Pełna nazwa w Vitest: `Pain Insights getPainSummary returns "Pain reported" for pain without details`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-PAIN-013 — Podsumowanie poziomu i obszaru bólu

- Cel: Weryfikacja: podsumowanie poziomu i obszaru bólu.
- Wynik oczekiwany: Tekst zawiera przekazane nasilenie i obszar.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.106 ms.
- Plik i linia: [src/test/painInsights.test.ts:94](../../../../src/test/painInsights.test.ts#L94).
- Pełna nazwa w Vitest: `Pain Insights getPainSummary includes level and area when provided`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-PAIN-014 — Brak sesji w badanym tygodniu

- Cel: Weryfikacja: brak sesji w badanym tygodniu.
- Wynik oczekiwany: Funkcja weekHasPain zwraca false.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.117 ms.
- Plik i linia: [src/test/painInsights.test.ts:105](../../../../src/test/painInsights.test.ts#L105).
- Pełna nazwa w Vitest: `Pain Insights weekHasPain returns false when no sessions in week`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-PAIN-015 — Tydzień z sesjami bez bólu

- Cel: Weryfikacja: tydzień z sesjami bez bólu.
- Wynik oczekiwany: Funkcja weekHasPain zwraca false.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.123 ms.
- Plik i linia: [src/test/painInsights.test.ts:109](../../../../src/test/painInsights.test.ts#L109).
- Pełna nazwa w Vitest: `Pain Insights weekHasPain returns false when sessions in week have no pain`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-PAIN-016 — Tydzień z co najmniej jedną sesją z bólem

- Cel: Weryfikacja: tydzień z co najmniej jedną sesją z bólem.
- Wynik oczekiwany: Funkcja weekHasPain zwraca true.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.100 ms.
- Plik i linia: [src/test/painInsights.test.ts:119](../../../../src/test/painInsights.test.ts#L119).
- Pełna nazwa w Vitest: `Pain Insights weekHasPain returns true when at least one session in week has pain`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-PAIN-017 — Wykluczanie sesji poza tygodniem

- Cel: Weryfikacja: wykluczanie sesji poza tygodniem.
- Wynik oczekiwany: Sesja z bólem spoza badanego zakresu nie zmienia wyniku tygodnia.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.099 ms.
- Plik i linia: [src/test/painInsights.test.ts:129](../../../../src/test/painInsights.test.ts#L129).
- Pełna nazwa w Vitest: `Pain Insights weekHasPain ignores sessions outside the week range`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-HARD-003 — Normalizowalność poprawnie zmapowanych stopni

- Cel: Weryfikacja: normalizowalność poprawnie zmapowanych stopni.
- Wynik oczekiwany: Osiem przejść jest normalizowalnych w 100%, bez braków.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.938 ms.
- Plik i linia: [src/test/productionHardening.test.ts:45](../../../../src/test/productionHardening.test.ts#L45).
- Pełna nazwa w Vitest: `Mapping Health correctly identifies normalizable grades`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-HARD-004 — Wykrycie nieznanego stopnia w próbce

- Cel: Weryfikacja: wykrycie nieznanego stopnia w próbce.
- Wynik oczekiwany: Osiem przejść daje 5 poprawnych i 3 brakujące, czyli 63% normalizowalności.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 1.053 ms.
- Plik i linia: [src/test/productionHardening.test.ts:60](../../../../src/test/productionHardening.test.ts#L60).
- Pełna nazwa w Vitest: `Mapping Health correctly identifies unmapped grades`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-HARD-005 — Kanoniczne rozpoznawanie Font bez mapowań

- Cel: Weryfikacja: kanoniczne rozpoznawanie font bez mapowań.
- Wynik oczekiwany: Pięć przejść Font jest poprawnie normalizowanych.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.403 ms.
- Plik i linia: [src/test/productionHardening.test.ts:77](../../../../src/test/productionHardening.test.ts#L77).
- Pełna nazwa w Vitest: `Mapping Health Font grades are normalizable without gym mapping`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-HARD-006 — Agregacja zdrowia mapowań kilku obiektów

- Cel: Weryfikacja: agregacja zdrowia mapowań kilku obiektów.
- Wynik oczekiwany: Wynik wskazuje dwa obiekty, jeden z problemami i 93% normalizowalności.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.693 ms.
- Plik i linia: [src/test/productionHardening.test.ts:89](../../../../src/test/productionHardening.test.ts#L89).
- Pełna nazwa w Vitest: `Mapping Health summary aggregates multiple gyms correctly`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-HARD-007 — Lokalny model różnicowania stref

- Cel: Weryfikacja: lokalny model różnicowania stref.
- Wynik oczekiwany: Ręcznie zdefiniowane progi rozdzielają próbkę do co najmniej dwóch stref.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 0.589 ms.
- Plik i linia: [src/test/productionHardening.test.ts:104](../../../../src/test/productionHardening.test.ts#L104).
- Pełna nazwa w Vitest: `Zone Distribution mixed grades must not collapse into single zone`.
- Ograniczenia: Lokalna kopia reguł z progami baseline-2 i baseline+1; nie wywołuje produkcyjnej funkcji stref i nie potwierdza zgodności jej progów.

### T1-LEVEL-001 — Kompletność kanonicznej tabeli Font

- Cel: Weryfikacja: kompletność kanonicznej tabeli font.
- Wynik oczekiwany: Tabela zawiera mapowania dla wszystkich stopni wymienionych w teście.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 5.961 ms.
- Plik i linia: [src/test/userLevel.test.ts:53](../../../../src/test/userLevel.test.ts#L53).
- Pełna nazwa w Vitest: `DEFAULT_FONT_TO_V Canonical Mapping has mappings for all standard Font grades`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-002 — Wartości kanonicznych przeliczeń Font na V-score

- Cel: Weryfikacja: wartości kanonicznych przeliczeń font na v-score.
- Wynik oczekiwany: Przykładowe stopnie mają wartości wskazane przez asercje, np. 6a=3 i 7a=7.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 1.259 ms.
- Plik i linia: [src/test/userLevel.test.ts:86](../../../../src/test/userLevel.test.ts#L86).
- Pełna nazwa w Vitest: `DEFAULT_FONT_TO_V Canonical Mapping maps Font grades to expected V-scores`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-003 — Brak pustych wartości w tabeli Font

- Cel: Weryfikacja: brak pustych wartości w tabeli font.
- Wynik oczekiwany: Każdy wynik jest liczbą nieujemną, różną od null i undefined.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 5.480 ms.
- Plik i linia: [src/test/userLevel.test.ts:114](../../../../src/test/userLevel.test.ts#L114).
- Pełna nazwa w Vitest: `DEFAULT_FONT_TO_V Canonical Mapping no Font grade resolves to null or undefined`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-004 — Kompletność odwrotnej tabeli V-score

- Cel: Weryfikacja: kompletność odwrotnej tabeli v-score.
- Wynik oczekiwany: Dla indeksów 0–17 istnieją tekstowe odpowiedniki Font.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 1.887 ms.
- Plik i linia: [src/test/userLevel.test.ts:125](../../../../src/test/userLevel.test.ts#L125).
- Pełna nazwa w Vitest: `V_SCORE_TO_FONT Inverse Mapping has mappings for V-scores 0 through 17`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-005 — Wartości odwrotnej tabeli Font

- Cel: Weryfikacja: wartości odwrotnej tabeli font.
- Wynik oczekiwany: Kontrolne wartości V-score mają oczekiwane etykiety Font.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.385 ms.
- Plik i linia: [src/test/userLevel.test.ts:132](../../../../src/test/userLevel.test.ts#L132).
- Pełna nazwa w Vitest: `V_SCORE_TO_FONT Inverse Mapping maps V-scores to expected Font grades`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-006 — Funkcja przeliczania Font według tabeli

- Cel: Weryfikacja: funkcja przeliczania font według tabeli.
- Wynik oczekiwany: Dla próbek zwracane są oczekiwane wyniki, np. 5a=1 i 7a=7.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.696 ms.
- Plik i linia: [src/test/userLevel.test.ts:146](../../../../src/test/userLevel.test.ts#L146).
- Pełna nazwa w Vitest: `fontGradeToVScore converts Font grades to V-scores using canonical table`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-007 — Niezależność konwersji Font od wielkości liter

- Cel: Weryfikacja: niezależność konwersji font od wielkości liter.
- Wynik oczekiwany: Zapisy 6A i 7A+ dają odpowiednio 3 i 8.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.616 ms.
- Plik i linia: [src/test/userLevel.test.ts:154](../../../../src/test/userLevel.test.ts#L154).
- Pełna nazwa w Vitest: `fontGradeToVScore is case-insensitive`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-008 — Odrzucanie nieprawidłowych stopni Font

- Cel: Weryfikacja: odrzucanie nieprawidłowych stopni font.
- Wynik oczekiwany: Null, pusty tekst, nieznany zapis i V5 dają -1.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.637 ms.
- Plik i linia: [src/test/userLevel.test.ts:159](../../../../src/test/userLevel.test.ts#L159).
- Pełna nazwa w Vitest: `fontGradeToVScore returns -1 for invalid grades`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-009 — Konwersja wszystkich obsługiwanych stopni Font

- Cel: Weryfikacja: konwersja wszystkich obsługiwanych stopni font.
- Wynik oczekiwany: Żaden obsługiwany stopień nie daje null ani undefined; wyniki są nieujemne.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 3.346 ms.
- Plik i linia: [src/test/userLevel.test.ts:166](../../../../src/test/userLevel.test.ts#L166).
- Pełna nazwa w Vitest: `fontGradeToVScore handles all Font grades without returning null/undefined`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-010 — Indeksy poprawnych stopni V-Scale

- Cel: Weryfikacja: indeksy poprawnych stopni v-scale.
- Wynik oczekiwany: V0, V5, V10 i V16 dają odpowiadające liczby.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.598 ms.
- Plik i linia: [src/test/userLevel.test.ts:182](../../../../src/test/userLevel.test.ts#L182).
- Pełna nazwa w Vitest: `V-Scale Index Conversion returns correct index for valid V grades`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-011 — Odrzucanie nieprawidłowych stopni V-Scale

- Cel: Weryfikacja: odrzucanie nieprawidłowych stopni v-scale.
- Wynik oczekiwany: Null, pusty tekst, nieznany zapis i 6a dają -1.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.455 ms.
- Plik i linia: [src/test/userLevel.test.ts:189](../../../../src/test/userLevel.test.ts#L189).
- Pełna nazwa w Vitest: `V-Scale Index Conversion returns -1 for invalid grades`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-012 — Środek przedziału V-Scale w mapowaniu

- Cel: Weryfikacja: środek przedziału v-scale w mapowaniu.
- Wynik oczekiwany: Wynik próbki mapowania wynosi 4.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.504 ms.
- Plik i linia: [src/test/userLevel.test.ts:202](../../../../src/test/userLevel.test.ts#L202).
- Pełna nazwa w Vitest: `Mapping to V-Score calculates midpoint of V-scale range`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-013 — Mapowanie z pojedynczą granicą V-Scale

- Cel: Weryfikacja: mapowanie z pojedynczą granicą v-scale.
- Wynik oczekiwany: Granica minimalna lub maksymalna daje odpowiednio 2 lub 4.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.361 ms.
- Plik i linia: [src/test/userLevel.test.ts:207](../../../../src/test/userLevel.test.ts#L207).
- Pełna nazwa w Vitest: `Mapping to V-Score handles single-bound mappings`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-014 — Zapasowe granice Font w mapowaniu

- Cel: Weryfikacja: zapasowe granice font w mapowaniu.
- Wynik oczekiwany: Przy braku V-Scale wynik próbki wynosi 4.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.346 ms.
- Plik i linia: [src/test/userLevel.test.ts:215](../../../../src/test/userLevel.test.ts#L215).
- Pełna nazwa w Vitest: `Mapping to V-Score falls back to Font grades when V-scale bounds missing`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-015 — Mapowanie z pojedynczą granicą Font

- Cel: Weryfikacja: mapowanie z pojedynczą granicą font.
- Wynik oczekiwany: Kontrolne granice dają wyniki 7 i 6.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.427 ms.
- Plik i linia: [src/test/userLevel.test.ts:224](../../../../src/test/userLevel.test.ts#L224).
- Pełna nazwa w Vitest: `Mapping to V-Score handles Font-only single bound mappings`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-016 — Mapowanie bez żadnych granic trudności

- Cel: Weryfikacja: mapowanie bez żadnych granic trudności.
- Wynik oczekiwany: Wynikiem jest -1.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.336 ms.
- Plik i linia: [src/test/userLevel.test.ts:232](../../../../src/test/userLevel.test.ts#L232).
- Pełna nazwa w Vitest: `Mapping to V-Score returns -1 for missing all bounds`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-017 — Pierwszeństwo V-Scale wobec Font

- Cel: Weryfikacja: pierwszeństwo v-scale wobec font.
- Wynik oczekiwany: Przy obu skalach wybierany jest wynik V-Scale równy 6.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.455 ms.
- Plik i linia: [src/test/userLevel.test.ts:237](../../../../src/test/userLevel.test.ts#L237).
- Pełna nazwa w Vitest: `Mapping to V-Score prioritizes V-scale over Font when both present`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-018 — Budowanie słownika mapowań obiektu

- Cel: Weryfikacja: budowanie słownika mapowań obiektu.
- Wynik oczekiwany: Yellow, Green i Blue mają wartości 0,5, 2,5 i 4,5.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 2.924 ms.
- Plik i linia: [src/test/userLevel.test.ts:260](../../../../src/test/userLevel.test.ts#L260).
- Pełna nazwa w Vitest: `Build Grade Lookup builds lookup map from mappings`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-019 — Dodawanie mapowań zawierających wyłącznie Font

- Cel: Weryfikacja: dodawanie mapowań zawierających wyłącznie font.
- Wynik oczekiwany: Słownik zawiera etykietę FontOnly z wynikiem 8.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.905 ms.
- Plik i linia: [src/test/userLevel.test.ts:273](../../../../src/test/userLevel.test.ts#L273).
- Pełna nazwa w Vitest: `Build Grade Lookup includes Font-only mappings`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-020 — Odrzucanie mapowania bez poprawnych granic

- Cel: Weryfikacja: odrzucanie mapowania bez poprawnych granic.
- Wynik oczekiwany: Red jest pomijane, a poprawne Blue pozostaje w słowniku.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 1.684 ms.
- Plik i linia: [src/test/userLevel.test.ts:283](../../../../src/test/userLevel.test.ts#L283).
- Pełna nazwa w Vitest: `Build Grade Lookup excludes mappings without any valid bounds`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-021 — Kanoniczne stopnie Font dostępne bez etykiet obiektu

- Cel: Weryfikacja: kanoniczne stopnie font dostępne bez etykiet obiektu.
- Wynik oczekiwany: Słownik zawiera kontrolne stopnie Font i oczekiwane wartości.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 1.610 ms.
- Plik i linia: [src/test/userLevel.test.ts:295](../../../../src/test/userLevel.test.ts#L295).
- Pełna nazwa w Vitest: `Build Grade Lookup includes canonical Font grades directly (regression fix)`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-022 — Kanoniczne stopnie V-Scale dostępne bez etykiet obiektu

- Cel: Weryfikacja: kanoniczne stopnie v-scale dostępne bez etykiet obiektu.
- Wynik oczekiwany: Słownik zawiera V0, V1, V5 i V10 z oczekiwanymi wartościami.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.930 ms.
- Plik i linia: [src/test/userLevel.test.ts:314](../../../../src/test/userLevel.test.ts#L314).
- Pełna nazwa w Vitest: `Build Grade Lookup includes V-Scale grades directly`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-023 — Pierwszeństwo mapowania obiektu przed tabelą kanoniczną

- Cel: Weryfikacja: pierwszeństwo mapowania obiektu przed tabelą kanoniczną.
- Wynik oczekiwany: Nadpisane mapowanie 6a ma wartość 11.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.872 ms.
- Plik i linia: [src/test/userLevel.test.ts:326](../../../../src/test/userLevel.test.ts#L326).
- Pełna nazwa w Vitest: `Build Grade Lookup gym mappings take priority over canonical grades`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-024 — Rozwijanie przejść według count

- Cel: Weryfikacja: rozwijanie przejść według count.
- Wynik oczekiwany: Trzy i dwa przejścia tworzą pięć próbek o oczekiwanych trudnościach.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 3.037 ms.
- Plik i linia: [src/test/userLevel.test.ts:344](../../../../src/test/userLevel.test.ts#L344).
- Pełna nazwa w Vitest: `Extract Scores extracts scores expanded by count`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-025 — Pomijanie stopni spoza słownika

- Cel: Weryfikacja: pomijanie stopni spoza słownika.
- Wynik oczekiwany: Pozostają tylko dwie poprawnie rozpoznane próbki.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 5.231 ms.
- Plik i linia: [src/test/userLevel.test.ts:360](../../../../src/test/userLevel.test.ts#L360).
- Pełna nazwa w Vitest: `Extract Scores ignores grades not in lookup`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-026 — Interpolacja percentyla 75

- Cel: Weryfikacja: interpolacja percentyla 75.
- Wynik oczekiwany: Dla kontrolnej posortowanej tablicy wynik wynosi 6,25.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.391 ms.
- Plik i linia: [src/test/userLevel.test.ts:377](../../../../src/test/userLevel.test.ts#L377).
- Pełna nazwa w Vitest: `Percentile Calculation calculates 75th percentile correctly`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-027 — Percentyl pustego zbioru

- Cel: Weryfikacja: percentyl pustego zbioru.
- Wynik oczekiwany: Wynikiem jest -1.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.175 ms.
- Plik i linia: [src/test/userLevel.test.ts:382](../../../../src/test/userLevel.test.ts#L382).
- Pełna nazwa w Vitest: `Percentile Calculation returns -1 for empty array`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-028 — Percentyl zbioru jednoelementowego

- Cel: Weryfikacja: percentyl zbioru jednoelementowego.
- Wynik oczekiwany: Dla próbki [5] wynik wynosi 5.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.128 ms.
- Plik i linia: [src/test/userLevel.test.ts:386](../../../../src/test/userLevel.test.ts#L386).
- Pełna nazwa w Vitest: `Percentile Calculation returns single value for single-element array`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-029 — Skrajne percentyle

- Cel: Weryfikacja: skrajne percentyle.
- Wynik oczekiwany: Percentyle 0 i 1 zwracają odpowiednio minimum 1 i maksimum 5.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.154 ms.
- Plik i linia: [src/test/userLevel.test.ts:390](../../../../src/test/userLevel.test.ts#L390).
- Pełna nazwa w Vitest: `Percentile Calculation handles edge percentiles`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-030 — Maksymalna trudność próbki

- Cel: Weryfikacja: maksymalna trudność próbki.
- Wynik oczekiwany: Maksimum tablicy kontrolnej wynosi 8.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.196 ms.
- Plik i linia: [src/test/userLevel.test.ts:398](../../../../src/test/userLevel.test.ts#L398).
- Pełna nazwa w Vitest: `Max Calculation returns max score`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-031 — Maksimum pustego zbioru

- Cel: Weryfikacja: maksimum pustego zbioru.
- Wynik oczekiwany: Wynikiem jest -1.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.149 ms.
- Plik i linia: [src/test/userLevel.test.ts:402](../../../../src/test/userLevel.test.ts#L402).
- Pełna nazwa w Vitest: `Max Calculation returns -1 for empty array`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-032 — Zaokrąglanie wyniku do etykiety V-Scale

- Cel: Weryfikacja: zaokrąglanie wyniku do etykiety v-scale.
- Wynik oczekiwany: Kontrolne wyniki dają V0, V4, V5 i V10.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.475 ms.
- Plik i linia: [src/test/userLevel.test.ts:412](../../../../src/test/userLevel.test.ts#L412).
- Pełna nazwa w Vitest: `Score to Grade Conversion converts V-score to V-grade`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-033 — Ograniczanie zakresu etykiet V-Scale

- Cel: Weryfikacja: ograniczanie zakresu etykiet v-scale.
- Wynik oczekiwany: Wynik ujemny daje null, a 20 jest ograniczane do V17.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.221 ms.
- Plik i linia: [src/test/userLevel.test.ts:419](../../../../src/test/userLevel.test.ts#L419).
- Pełna nazwa w Vitest: `Score to Grade Conversion clamps out-of-range scores`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-034 — Przeliczanie wyniku na etykietę Font

- Cel: Weryfikacja: przeliczanie wyniku na etykietę font.
- Wynik oczekiwany: Kontrolne wartości dają 4, 5a i 7a; wynik ujemny daje null.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.302 ms.
- Plik i linia: [src/test/userLevel.test.ts:424](../../../../src/test/userLevel.test.ts#L424).
- Pełna nazwa w Vitest: `Score to Grade Conversion converts V-score to Font grade using canonical table`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-035 — Dobór etykiety obiektu według trudności

- Cel: Weryfikacja: dobór etykiety obiektu według trudności.
- Wynik oczekiwany: Kontrolne wyniki dają Yellow i Blue.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.426 ms.
- Plik i linia: [src/test/userLevel.test.ts:431](../../../../src/test/userLevel.test.ts#L431).
- Pełna nazwa w Vitest: `Score to Grade Conversion converts V-score to gym label`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-036 — Formatowanie według preferowanej skali V-Scale

- Cel: Weryfikacja: formatowanie według preferowanej skali v-scale.
- Wynik oczekiwany: Wynik 5 daje V5.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.378 ms.
- Plik i linia: [src/test/userLevel.test.ts:448](../../../../src/test/userLevel.test.ts#L448).
- Pełna nazwa w Vitest: `Score to Grade by Scale uses v_scale correctly`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-037 — Formatowanie według preferowanej skali Font

- Cel: Weryfikacja: formatowanie według preferowanej skali font.
- Wynik oczekiwany: Wynik 5 daje 6b.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.274 ms.
- Plik i linia: [src/test/userLevel.test.ts:452](../../../../src/test/userLevel.test.ts#L452).
- Pełna nazwa w Vitest: `Score to Grade by Scale uses font correctly`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-038 — Formatowanie kolorów przy dostępnych mapowaniach

- Cel: Weryfikacja: formatowanie kolorów przy dostępnych mapowaniach.
- Wynik oczekiwany: Wynik 4,5 daje Blue.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.237 ms.
- Plik i linia: [src/test/userLevel.test.ts:456](../../../../src/test/userLevel.test.ts#L456).
- Pełna nazwa w Vitest: `Score to Grade by Scale uses colors with gym mappings`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-039 — Zapasowe formatowanie kolorów bez mapowań

- Cel: Weryfikacja: zapasowe formatowanie kolorów bez mapowań.
- Wynik oczekiwany: Wynik 5 daje etykietę V5.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.206 ms.
- Plik i linia: [src/test/userLevel.test.ts:460](../../../../src/test/userLevel.test.ts#L460).
- Pełna nazwa w Vitest: `Score to Grade by Scale falls back to v_scale for colors without mappings`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-040 — Poziom wspinacza w formacie Font i V-Scale

- Cel: Weryfikacja: poziom wspinacza w formacie font i v-scale.
- Wynik oczekiwany: Oba formaty są niepuste i mają oczekiwany wzorzec tekstowy.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 4.524 ms.
- Plik i linia: [src/test/userLevel.test.ts:488](../../../../src/test/userLevel.test.ts#L488).
- Pełna nazwa w Vitest: `Compute User Level computes level with dual format (V-Scale and Font)`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-041 — Poziom wspinacza dla wystarczających danych ON-WALL

- Cel: Weryfikacja: poziom wspinacza dla wystarczających danych on-wall.
- Wynik oczekiwany: Rozpoznawanych jest 14 przejść, a poziom jest dodatni i ma etykiety obu skal.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 2.481 ms.
- Plik i linia: [src/test/userLevel.test.ts:507](../../../../src/test/userLevel.test.ts#L507).
- Pełna nazwa w Vitest: `Compute User Level computes level from ON-WALL sessions with at least MIN_BOULDERS_FOR_LEVEL`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-042 — Wykluczenie sesji OFF-WALL z poziomu wspinacza

- Cel: Weryfikacja: wykluczenie sesji off-wall z poziomu wspinacza.
- Wynik oczekiwany: Sesje siłowe nie dostarczają przejść; hasData=false i totalBoulders=0.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 1.351 ms.
- Plik i linia: [src/test/userLevel.test.ts:539](../../../../src/test/userLevel.test.ts#L539).
- Pełna nazwa w Vitest: `Compute User Level excludes OFF-WALL sessions`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-043 — Wykluczenie sesji spoza 90 dni

- Cel: Weryfikacja: wykluczenie sesji spoza 90 dni.
- Wynik oczekiwany: Dane spoza okna nie wystarczają do wyznaczenia poziomu.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 1.513 ms.
- Plik i linia: [src/test/userLevel.test.ts:555](../../../../src/test/userLevel.test.ts#L555).
- Pełna nazwa w Vitest: `Compute User Level excludes sessions outside 90-day window`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-044 — Próg minimalnej liczby przejść poniżej minimum

- Cel: Weryfikacja: próg minimalnej liczby przejść poniżej minimum.
- Wynik oczekiwany: Dla minimum minus jeden hasData=false i brak etykiety poziomu.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 1.322 ms.
- Plik i linia: [src/test/userLevel.test.ts:570](../../../../src/test/userLevel.test.ts#L570).
- Pełna nazwa w Vitest: `Compute User Level returns hasData=false when boulder count < MIN_BOULDERS_FOR_LEVEL`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-045 — Próg minimalnej liczby przejść dokładnie na minimum

- Cel: Weryfikacja: próg minimalnej liczby przejść dokładnie na minimum.
- Wynik oczekiwany: Dla minimalnej liczby przejść hasData=true i istnieje etykieta poziomu.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 1.732 ms.
- Plik i linia: [src/test/userLevel.test.ts:589](../../../../src/test/userLevel.test.ts#L589).
- Pełna nazwa w Vitest: `Compute User Level returns hasData=true when boulder count >= MIN_BOULDERS_FOR_LEVEL`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-046 — Brak historii do wyznaczenia poziomu

- Cel: Weryfikacja: brak historii do wyznaczenia poziomu.
- Wynik oczekiwany: hasData=false; etykieta poziomu i maksimum mają null.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 1.612 ms.
- Plik i linia: [src/test/userLevel.test.ts:606](../../../../src/test/userLevel.test.ts#L606).
- Pełna nazwa w Vitest: `Compute User Level returns hasData=false for no data`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-047 — Częściowo brakujące mapowania poziomu

- Cel: Weryfikacja: częściowo brakujące mapowania poziomu.
- Wynik oczekiwany: Dziesięć rozpoznanych przejść wystarcza do obliczenia poziomu.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 2.592 ms.
- Plik i linia: [src/test/userLevel.test.ts:614](../../../../src/test/userLevel.test.ts#L614).
- Pełna nazwa w Vitest: `Compute User Level handles missing mappings gracefully`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-048 — Wybór najtrudniejszych przejść do poziomu

- Cel: Weryfikacja: wybór najtrudniejszych przejść do poziomu.
- Wynik oczekiwany: Z 35 przejść wybierane jest TOP_BOULDERS_COUNT; levelScore≈4,5 i maxScore=6,5.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 1.835 ms.
- Plik i linia: [src/test/userLevel.test.ts:634](../../../../src/test/userLevel.test.ts#L634).
- Pełna nazwa w Vitest: `Compute User Level selects top N boulders by difficulty`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-049 — Użycie wszystkich danych poniżej limitu próbek

- Cel: Weryfikacja: użycie wszystkich danych poniżej limitu próbek.
- Wynik oczekiwany: Wykorzystywanych jest 12 przejść, a levelScore wynosi 4,5.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 1.374 ms.
- Plik i linia: [src/test/userLevel.test.ts:659](../../../../src/test/userLevel.test.ts#L659).
- Pełna nazwa w Vitest: `Compute User Level uses all boulders when fewer than TOP_BOULDERS_COUNT exist`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-050 — Prezentacja poziomu zgodnie z preferencją

- Cel: Weryfikacja: prezentacja poziomu zgodnie z preferencją.
- Wynik oczekiwany: Skala V-Scale daje etykietę V, a kolory dają Blue.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 1.728 ms.
- Plik i linia: [src/test/userLevel.test.ts:677](../../../../src/test/userLevel.test.ts#L677).
- Pełna nazwa w Vitest: `Compute User Level formats grades according to preferred scale`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-051 — Diagnostyka braku mapowań

- Cel: Weryfikacja: diagnostyka braku mapowań.
- Wynik oczekiwany: missingMappings=true i hasData=false dla danych testowych.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 1.354 ms.
- Plik i linia: [src/test/userLevel.test.ts:699](../../../../src/test/userLevel.test.ts#L699).
- Pełna nazwa w Vitest: `Compute User Level sets missingMappings flag when no mappings provided`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-052 — Poprawność wyników obiektu korzystającego tylko z Font

- Cel: Weryfikacja: poprawność wyników obiektu korzystającego tylko z font.
- Wynik oczekiwany: Co najmniej trzy etykiety mają nieujemne V-score.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 1.068 ms.
- Plik i linia: [src/test/userLevel.test.ts:721](../../../../src/test/userLevel.test.ts#L721).
- Pełna nazwa w Vitest: `Font-Only Gym Support Font-only gyms always produce valid V-scores`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-053 — Poziom wspinacza w obiekcie korzystającym tylko z Font

- Cel: Weryfikacja: poziom wspinacza w obiekcie korzystającym tylko z font.
- Wynik oczekiwany: Dziesięć przejść daje dane i niepuste etykiety Font oraz V-Scale.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 1.392 ms.
- Plik i linia: [src/test/userLevel.test.ts:737](../../../../src/test/userLevel.test.ts#L737).
- Pełna nazwa w Vitest: `Font-Only Gym Support computes User Level correctly for Font-only gym`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-054 — Poziom wspinacza na podstawie kolorów

- Cel: Weryfikacja: poziom wspinacza na podstawie kolorów.
- Wynik oczekiwany: Etykietą poziomu jest Green, a oba formaty liczbowe mają poprawny wzorzec.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 1.449 ms.
- Plik i linia: [src/test/userLevel.test.ts:767](../../../../src/test/userLevel.test.ts#L767).
- Pełna nazwa w Vitest: `Color Grade Support color grades with mapping produce valid User Level`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-055 — Poziom wspinacza na podstawie skali numerycznej

- Cel: Weryfikacja: poziom wspinacza na podstawie skali numerycznej.
- Wynik oczekiwany: Etykietą poziomu jest 3, a oba formaty liczbowe mają poprawny wzorzec.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 1.173 ms.
- Plik i linia: [src/test/userLevel.test.ts:798](../../../../src/test/userLevel.test.ts#L798).
- Pełna nazwa w Vitest: `Numeric Grade Support numeric grades with mapping produce valid User Level`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-056 — Odporność analityki na częściowe braki mapowań

- Cel: Weryfikacja: odporność analityki na częściowe braki mapowań.
- Wynik oczekiwany: Brak wyjątku; dziesięć rozpoznanych przejść daje hasData=true.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 3.143 ms.
- Plik i linia: [src/test/userLevel.test.ts:834](../../../../src/test/userLevel.test.ts#L834).
- Pełna nazwa w Vitest: `Missing Mappings Handling missing mappings do not crash analytics`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-057 — Całkowicie nierozpoznane przejścia

- Cel: Weryfikacja: całkowicie nierozpoznane przejścia.
- Wynik oczekiwany: hasData=false, totalBoulders=0, a obie etykiety poziomu mają null.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 1.175 ms.
- Plik i linia: [src/test/userLevel.test.ts:860](../../../../src/test/userLevel.test.ts#L860).
- Pełna nazwa w Vitest: `Missing Mappings Handling returns graceful result when all boulders are unmappable`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-058 — Regresja odczytu Font bezpośrednio z grade_raw

- Cel: Weryfikacja: regresja odczytu font bezpośrednio z grade_raw.
- Wynik oczekiwany: Dwadzieścia przejść Font jest użytych do poziomu i daje obie etykiety.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 1.628 ms.
- Plik i linia: [src/test/userLevel.test.ts:885](../../../../src/test/userLevel.test.ts#L885).
- Pełna nazwa w Vitest: `Font grades in grade_raw regression fix computes user level when grade_raw contains Font grades like 6b+`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-059 — Regresja mieszanych stopni Font

- Cel: Weryfikacja: regresja mieszanych stopni font.
- Wynik oczekiwany: Dwadzieścia przejść daje levelScore≈5 i etykietę V5.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 1.328 ms.
- Plik i linia: [src/test/userLevel.test.ts:918](../../../../src/test/userLevel.test.ts#L918).
- Pełna nazwa w Vitest: `Font grades in grade_raw regression fix computes user level with mixed Font grades (real-world scenario)`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-060 — Regresja odczytu V-Scale bezpośrednio z grade_raw

- Cel: Weryfikacja: regresja odczytu v-scale bezpośrednio z grade_raw.
- Wynik oczekiwany: Dwadzieścia przejść daje etykietę poziomu V6.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 1.106 ms.
- Plik i linia: [src/test/userLevel.test.ts:944](../../../../src/test/userLevel.test.ts#L944).
- Pełna nazwa w Vitest: `Font grades in grade_raw regression fix computes user level with V-scale grades in grade_raw`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-LEVEL-061 — Diagnostyka niewystarczających rozpoznanych danych

- Cel: Weryfikacja: diagnostyka niewystarczających rozpoznanych danych.
- Wynik oczekiwany: hasData=false, rawLogsFound=2, unmappedLogs=1, totalBoulders=5.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 1.103 ms.
- Plik i linia: [src/test/userLevel.test.ts:966](../../../../src/test/userLevel.test.ts#L966).
- Pełna nazwa w Vitest: `Font grades in grade_raw regression fix provides diagnostic info when insufficient boulders are mapped`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T1-CACHE-001 — Odczyt nieistniejącego cache poziomu

- Cel: Weryfikacja: odczyt nieistniejącego cache poziomu.
- Wynik oczekiwany: Funkcja przy zamockowanym Supabase zwraca null.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 47.314 ms.
- Plik i linia: [src/test/userLevelCache.test.ts:51](../../../../src/test/userLevelCache.test.ts#L51).
- Pełna nazwa w Vitest: `userLevelCache fetchUserLevelCache returns null when no cache exists`.
- Ograniczenia: Klient Supabase i computeUserLevel są zamockowane; nie jest badany rzeczywisty cache bazy danych.

### T1-CACHE-002 — Typ rezultatu aktualizacji cache poziomu

- Cel: Weryfikacja: typ rezultatu aktualizacji cache poziomu.
- Wynik oczekiwany: Wynik rzeczywistej funkcji z mockami ma typ boolean; wartość ani zapis nie są sprawdzane.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 3.126 ms.
- Plik i linia: [src/test/userLevelCache.test.ts:59](../../../../src/test/userLevelCache.test.ts#L59).
- Pełna nazwa w Vitest: `userLevelCache updateUserLevelCache returns boolean result`.
- Ograniczenia: Klient Supabase i computeUserLevel są zamockowane; nie jest badany rzeczywisty cache bazy danych.

### T1-CACHE-003 — Deklarowany kształt danych cache

- Cel: Weryfikacja: deklarowany kształt danych cache.
- Wynik oczekiwany: Lokalny obiekt zawiera level_score, obie etykiety i computed_at.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 0.953 ms.
- Plik i linia: [src/test/userLevelCache.test.ts:69](../../../../src/test/userLevelCache.test.ts#L69).
- Pełna nazwa w Vitest: `userLevelCache types cache data structure has expected fields`.
- Ograniczenia: Klient Supabase i computeUserLevel są zamockowane; nie jest badany rzeczywisty cache bazy danych.

## T2: Funkcjonalności aplikacji i interfejs użytkownika

### T2-PAR-001 — Parsowanie daty DD.MM.YYYY

- Cel: Weryfikacja: parsowanie daty dd.mm.yyyy.
- Wynik oczekiwany: Otrzymana data ma oczekiwany dzień, miesiąc i rok.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 3.624 ms.
- Plik i linia: [src/lib/importParser.test.ts:12](../../../../src/lib/importParser.test.ts#L12).
- Pełna nazwa w Vitest: `parseDate should parse DD.MM.YYYY format`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T2-PAR-002 — Parsowanie daty YYYY-MM-DD

- Cel: Weryfikacja: parsowanie daty yyyy-mm-dd.
- Wynik oczekiwany: Otrzymana data odpowiada zapisowi ISO.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 1.041 ms.
- Plik i linia: [src/lib/importParser.test.ts:20](../../../../src/lib/importParser.test.ts#L20).
- Pełna nazwa w Vitest: `parseDate should parse YYYY-MM-DD format`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T2-PAR-003 — Parsowanie jednocyfrowego dnia i miesiąca

- Cel: Weryfikacja: parsowanie jednocyfrowego dnia i miesiąca.
- Wynik oczekiwany: Krótki zapis daty jest rozpoznawany poprawnie.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.693 ms.
- Plik i linia: [src/lib/importParser.test.ts:28](../../../../src/lib/importParser.test.ts#L28).
- Pełna nazwa w Vitest: `parseDate should handle single-digit day/month`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T2-PAR-004 — Odrzucanie nieprawidłowych dat

- Cel: Weryfikacja: odrzucanie nieprawidłowych dat.
- Wynik oczekiwany: Nieobsługiwane lub niepoprawne zapisy dają null.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.949 ms.
- Plik i linia: [src/lib/importParser.test.ts:35](../../../../src/lib/importParser.test.ts#L35).
- Pełna nazwa w Vitest: `parseDate should reject invalid dates`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T2-PAR-005 — Parsowanie liczby przejść i stopnia

- Cel: Weryfikacja: parsowanie liczby przejść i stopnia.
- Wynik oczekiwany: Poprawny token daje oczekiwane count i grade_raw.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 2.136 ms.
- Plik i linia: [src/lib/importParser.test.ts:45](../../../../src/lib/importParser.test.ts#L45).
- Pełna nazwa w Vitest: `parseGradeToken should parse standard grade tokens`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T2-PAR-006 — Parsowanie stopnia oznaczonego kolorem

- Cel: Weryfikacja: parsowanie stopnia oznaczonego kolorem.
- Wynik oczekiwany: Nazwa koloru zostaje zachowana w grade_raw.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.781 ms.
- Plik i linia: [src/lib/importParser.test.ts:51](../../../../src/lib/importParser.test.ts#L51).
- Pełna nazwa w Vitest: `parseGradeToken should parse color grades`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T2-PAR-007 — Parsowanie stopnia numerycznego

- Cel: Weryfikacja: parsowanie stopnia numerycznego.
- Wynik oczekiwany: Stopień numeryczny zostaje zachowany jako tekst.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.573 ms.
- Plik i linia: [src/lib/importParser.test.ts:56](../../../../src/lib/importParser.test.ts#L56).
- Pełna nazwa w Vitest: `parseGradeToken should parse numeric grades`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T2-PAR-008 — Rozpoznawanie wielkiej litery X w tokenie

- Cel: Weryfikacja: rozpoznawanie wielkiej litery x w tokenie.
- Wynik oczekiwany: Token z X daje poprawną liczbę i stopień.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.493 ms.
- Plik i linia: [src/lib/importParser.test.ts:61](../../../../src/lib/importParser.test.ts#L61).
- Pełna nazwa w Vitest: `parseGradeToken should handle uppercase X`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T2-PAR-009 — Odrzucanie niepoprawnych tokenów

- Cel: Weryfikacja: odrzucanie niepoprawnych tokenów.
- Wynik oczekiwany: Niepoprawne tokeny nie tworzą poprawnego wpisu.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 1.797 ms.
- Plik i linia: [src/lib/importParser.test.ts:65](../../../../src/lib/importParser.test.ts#L65).
- Pełna nazwa w Vitest: `parseGradeToken should reject invalid tokens`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T2-PAR-010 — Parsowanie kompletnego wiersza importu

- Cel: Weryfikacja: parsowanie kompletnego wiersza importu.
- Wynik oczekiwany: Wiersz daje sesję z oczekiwaną datą i listą stopni.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 3.242 ms.
- Plik i linia: [src/lib/importParser.test.ts:75](../../../../src/lib/importParser.test.ts#L75).
- Pełna nazwa w Vitest: `parseLine should parse a valid line`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T2-PAR-011 — Parsowanie wiersza rozdzielanego spacjami

- Cel: Weryfikacja: parsowanie wiersza rozdzielanego spacjami.
- Wynik oczekiwany: Parser rozpoznaje datę i tokeny bez przecinków.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 1.528 ms.
- Plik i linia: [src/lib/importParser.test.ts:87](../../../../src/lib/importParser.test.ts#L87).
- Pełna nazwa w Vitest: `parseLine should parse with space-only separation`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T2-PAR-012 — Parsowanie wiersza z datą ISO

- Cel: Weryfikacja: parsowanie wiersza z datą iso.
- Wynik oczekiwany: Data i tokeny wiersza zostają poprawnie odczytane.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.850 ms.
- Plik i linia: [src/lib/importParser.test.ts:95](../../../../src/lib/importParser.test.ts#L95).
- Pełna nazwa w Vitest: `parseLine should parse YYYY-MM-DD format`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T2-PAR-013 — Wykrywanie błędnej daty w wierszu

- Cel: Weryfikacja: wykrywanie błędnej daty w wierszu.
- Wynik oczekiwany: Parser zwraca błąd zamiast poprawnej sesji.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.385 ms.
- Plik i linia: [src/lib/importParser.test.ts:104](../../../../src/lib/importParser.test.ts#L104).
- Pełna nazwa w Vitest: `parseLine should return error for invalid date`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T2-PAR-014 — Wykrywanie wiersza bez stopni

- Cel: Weryfikacja: wykrywanie wiersza bez stopni.
- Wynik oczekiwany: Wiersz bez poprawnych przejść daje błąd.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.582 ms.
- Plik i linia: [src/lib/importParser.test.ts:112](../../../../src/lib/importParser.test.ts#L112).
- Pełna nazwa w Vitest: `parseLine should return error for no grades`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T2-PAR-015 — Obsługa pustego wiersza na poziomie parseLine

- Cel: Weryfikacja: obsługa pustego wiersza na poziomie parseline.
- Wynik oczekiwany: Pusty wiersz nie daje poprawnej sesji.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.299 ms.
- Plik i linia: [src/lib/importParser.test.ts:117](../../../../src/lib/importParser.test.ts#L117).
- Pełna nazwa w Vitest: `parseLine should return error for empty line`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T2-PAR-016 — Pomijanie błędnego tokenu przy poprawnych tokenach

- Cel: Weryfikacja: pomijanie błędnego tokenu przy poprawnych tokenach.
- Wynik oczekiwany: Poprawne tokeny zostają zachowane mimo tokenu błędnego.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.670 ms.
- Plik i linia: [src/lib/importParser.test.ts:122](../../../../src/lib/importParser.test.ts#L122).
- Pełna nazwa w Vitest: `parseLine should skip invalid tokens but keep valid ones`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T2-PAR-017 — Import wielu wierszy

- Cel: Weryfikacja: import wielu wierszy.
- Wynik oczekiwany: Powstaje oczekiwana liczba sesji bez błędów dla poprawnych danych.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 1.051 ms.
- Plik i linia: [src/lib/importParser.test.ts:132](../../../../src/lib/importParser.test.ts#L132).
- Pełna nazwa w Vitest: `parseImportText should parse multiple lines`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T2-PAR-018 — Pomijanie pustych wierszy w całym imporcie

- Cel: Weryfikacja: pomijanie pustych wierszy w całym imporcie.
- Wynik oczekiwany: Puste wiersze nie zwiększają liczby błędów ani sesji.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.633 ms.
- Plik i linia: [src/lib/importParser.test.ts:141](../../../../src/lib/importParser.test.ts#L141).
- Pełna nazwa w Vitest: `parseImportText should skip empty lines silently`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T2-PAR-019 — Zbieranie błędów poszczególnych wierszy

- Cel: Weryfikacja: zbieranie błędów poszczególnych wierszy.
- Wynik oczekiwany: Poprawne sesje i diagnostyka błędnych wierszy są zwracane oddzielnie.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.943 ms.
- Plik i linia: [src/lib/importParser.test.ts:151](../../../../src/lib/importParser.test.ts#L151).
- Pełna nazwa w Vitest: `parseImportText should collect errors for invalid lines`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T2-PAR-020 — Obsługa wiersza zawierającego wyłącznie datę

- Cel: Weryfikacja: obsługa wiersza zawierającego wyłącznie datę.
- Wynik oczekiwany: Wiersz bez przejść zostaje zgłoszony jako niepoprawny.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.925 ms.
- Plik i linia: [src/lib/importParser.test.ts:162](../../../../src/lib/importParser.test.ts#L162).
- Pełna nazwa w Vitest: `parseImportText should handle lines with only date`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T2-PAR-021 — Wyszukiwanie stopni bez mapowania

- Cel: Weryfikacja: wyszukiwanie stopni bez mapowania.
- Wynik oczekiwany: Wynik zawiera stopnie nieobecne na dostępnej liście.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 2.041 ms.
- Plik i linia: [src/lib/importParser.test.ts:173](../../../../src/lib/importParser.test.ts#L173).
- Pełna nazwa w Vitest: `findUnmappedGrades should find grades not in available list`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T2-PAR-022 — Brak brakujących mapowań

- Cel: Weryfikacja: brak brakujących mapowań.
- Wynik oczekiwany: Dla kompletnych mapowań wynik jest pustą tablicą.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.659 ms.
- Plik i linia: [src/lib/importParser.test.ts:186](../../../../src/lib/importParser.test.ts#L186).
- Pełna nazwa w Vitest: `findUnmappedGrades should return empty for all mapped grades`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T2-PAR-023 — Dopasowanie mapowań niezależnie od wielkości liter

- Cel: Weryfikacja: dopasowanie mapowań niezależnie od wielkości liter.
- Wynik oczekiwany: Różna wielkość liter nie tworzy fałszywego braku mapowania.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.460 ms.
- Plik i linia: [src/lib/importParser.test.ts:195](../../../../src/lib/importParser.test.ts#L195).
- Pełna nazwa w Vitest: `findUnmappedGrades should be case-insensitive for matching`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T2-PAR-024 — Podsumowanie importu

- Cel: Weryfikacja: podsumowanie importu.
- Wynik oczekiwany: Liczba sesji, łączna liczba przejść i rozkład stopni odpowiadają danym wejściowym.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.738 ms.
- Plik i linia: [src/lib/importParser.test.ts:206](../../../../src/lib/importParser.test.ts#L206).
- Pełna nazwa w Vitest: `calculateImportSummary should calculate correct totals`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T2-PAR-025 — Podsumowanie pustego importu

- Cel: Weryfikacja: podsumowanie pustego importu.
- Wynik oczekiwany: Liczba sesji i przejść wynosi 0, a rozkład jest pusty.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.432 ms.
- Plik i linia: [src/lib/importParser.test.ts:219](../../../../src/lib/importParser.test.ts#L219).
- Pełna nazwa w Vitest: `calculateImportSummary should handle empty sessions`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T2-AUTH-001 — Model przekierowania po rejestracji

- Cel: Weryfikacja: model przekierowania po rejestracji.
- Wynik oczekiwany: Ręcznie wywołany mock nawigacji otrzymuje /login i replace=true.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 6.487 ms.
- Plik i linia: [src/test/auth.test.ts:31](../../../../src/test/auth.test.ts#L31).
- Pełna nazwa w Vitest: `Auth Flow - Separate Pages Registration Flow should navigate to /login after successful signUp`.
- Ograniczenia: Test deklaratywny: lokalne stałe, obiekty lub mock nawigacji. Nie renderuje stron i nie testuje Supabase Auth ani ochrony tras.

### T2-AUTH-002 — Model pustych pól logowania

- Cel: Weryfikacja: model pustych pól logowania.
- Wynik oczekiwany: Lokalne stałe email i password są pustymi tekstami.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 1.070 ms.
- Plik i linia: [src/test/auth.test.ts:45](../../../../src/test/auth.test.ts#L45).
- Pełna nazwa w Vitest: `Auth Flow - Separate Pages Registration Flow should not auto-fill login form after redirect`.
- Ograniczenia: Test deklaratywny: lokalne stałe, obiekty lub mock nawigacji. Nie renderuje stron i nie testuje Supabase Auth ani ochrony tras.

### T2-AUTH-003 — Deklaracja przeznaczenia strony logowania

- Cel: Weryfikacja: deklaracja przeznaczenia strony logowania.
- Wynik oczekiwany: Lokalna flaga obsługi wyłącznie logowania ma wartość true.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 0.493 ms.
- Plik i linia: [src/test/auth.test.ts:61](../../../../src/test/auth.test.ts#L61).
- Pełna nazwa w Vitest: `Auth Flow - Separate Pages Login Page should only handle sign-in (no toggle to signup)`.
- Ograniczenia: Test deklaratywny: lokalne stałe, obiekty lub mock nawigacji. Nie renderuje stron i nie testuje Supabase Auth ani ochrony tras.

### T2-AUTH-004 — Deklaracja odnośnika rejestracji

- Cel: Weryfikacja: deklaracja odnośnika rejestracji.
- Wynik oczekiwany: Lokalna ścieżka ma wartość /register.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 0.384 ms.
- Plik i linia: [src/test/auth.test.ts:68](../../../../src/test/auth.test.ts#L68).
- Pełna nazwa w Vitest: `Auth Flow - Separate Pages Login Page should link to /register for new accounts`.
- Ograniczenia: Test deklaratywny: lokalne stałe, obiekty lub mock nawigacji. Nie renderuje stron i nie testuje Supabase Auth ani ochrony tras.

### T2-AUTH-005 — Deklaracja odnośnika resetu hasła

- Cel: Weryfikacja: deklaracja odnośnika resetu hasła.
- Wynik oczekiwany: Lokalna ścieżka ma wartość /forgot-password.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 0.599 ms.
- Plik i linia: [src/test/auth.test.ts:74](../../../../src/test/auth.test.ts#L74).
- Pełna nazwa w Vitest: `Auth Flow - Separate Pages Login Page should link to /forgot-password for password reset`.
- Ograniczenia: Test deklaratywny: lokalne stałe, obiekty lub mock nawigacji. Nie renderuje stron i nie testuje Supabase Auth ani ochrony tras.

### T2-AUTH-006 — Deklaracja przeznaczenia strony rejestracji

- Cel: Weryfikacja: deklaracja przeznaczenia strony rejestracji.
- Wynik oczekiwany: Lokalna flaga obsługi wyłącznie rejestracji ma wartość true.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 0.588 ms.
- Plik i linia: [src/test/auth.test.ts:82](../../../../src/test/auth.test.ts#L82).
- Pełna nazwa w Vitest: `Auth Flow - Separate Pages Register Page should only handle sign-up (no toggle to login)`.
- Ograniczenia: Test deklaratywny: lokalne stałe, obiekty lub mock nawigacji. Nie renderuje stron i nie testuje Supabase Auth ani ochrony tras.

### T2-AUTH-007 — Deklaracja odnośnika logowania

- Cel: Weryfikacja: deklaracja odnośnika logowania.
- Wynik oczekiwany: Lokalna ścieżka ma wartość /login.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 0.439 ms.
- Plik i linia: [src/test/auth.test.ts:88](../../../../src/test/auth.test.ts#L88).
- Pełna nazwa w Vitest: `Auth Flow - Separate Pages Register Page should link to /login for existing accounts`.
- Ograniczenia: Test deklaratywny: lokalne stałe, obiekty lub mock nawigacji. Nie renderuje stron i nie testuje Supabase Auth ani ochrony tras.

### T2-AUTH-008 — Model izolacji danych formularzy

- Cel: Weryfikacja: model izolacji danych formularzy.
- Wynik oczekiwany: Zmiana lokalnego obiektu logowania nie zmienia osobnego obiektu rejestracji.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 0.779 ms.
- Plik i linia: [src/test/auth.test.ts:96](../../../../src/test/auth.test.ts#L96).
- Pełna nazwa w Vitest: `Auth Flow - Separate Pages State Isolation Login and Register pages have isolated state`.
- Ograniczenia: Test deklaratywny: lokalne stałe, obiekty lub mock nawigacji. Nie renderuje stron i nie testuje Supabase Auth ani ochrony tras.

### T2-AUTH-009 — Model świeżego stanu formularza

- Cel: Weryfikacja: model świeżego stanu formularza.
- Wynik oczekiwany: Nowo utworzony lokalny obiekt ma puste pola.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 1.154 ms.
- Plik i linia: [src/test/auth.test.ts:109](../../../../src/test/auth.test.ts#L109).
- Pełna nazwa w Vitest: `Auth Flow - Separate Pages State Isolation navigating between pages resets form state`.
- Ograniczenia: Test deklaratywny: lokalne stałe, obiekty lub mock nawigacji. Nie renderuje stron i nie testuje Supabase Auth ani ochrony tras.

### T2-AUTH-010 — Deklaracja trasy logowania

- Cel: Weryfikacja: deklaracja trasy logowania.
- Wynik oczekiwany: Lokalna tablica ścieżek zawiera /login.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 1.466 ms.
- Plik i linia: [src/test/auth.test.ts:120](../../../../src/test/auth.test.ts#L120).
- Pełna nazwa w Vitest: `Auth Flow - Separate Pages Route Configuration should have /login route`.
- Ograniczenia: Test deklaratywny: lokalne stałe, obiekty lub mock nawigacji. Nie renderuje stron i nie testuje Supabase Auth ani ochrony tras.

### T2-AUTH-011 — Deklaracja trasy rejestracji

- Cel: Weryfikacja: deklaracja trasy rejestracji.
- Wynik oczekiwany: Lokalna tablica ścieżek zawiera /register.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 0.576 ms.
- Plik i linia: [src/test/auth.test.ts:125](../../../../src/test/auth.test.ts#L125).
- Pełna nazwa w Vitest: `Auth Flow - Separate Pages Route Configuration should have /register route`.
- Ograniczenia: Test deklaratywny: lokalne stałe, obiekty lub mock nawigacji. Nie renderuje stron i nie testuje Supabase Auth ani ochrony tras.

### T2-AUTH-012 — Deklaracja przekierowania starej trasy /auth

- Cel: Weryfikacja: deklaracja przekierowania starej trasy /auth.
- Wynik oczekiwany: Lokalna flaga przekierowania ma wartość true.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 0.310 ms.
- Plik i linia: [src/test/auth.test.ts:130](../../../../src/test/auth.test.ts#L130).
- Pełna nazwa w Vitest: `Auth Flow - Separate Pages Route Configuration should redirect /auth to /login`.
- Ograniczenia: Test deklaratywny: lokalne stałe, obiekty lub mock nawigacji. Nie renderuje stron i nie testuje Supabase Auth ani ochrony tras.

### T2-AUTH-013 — Deklaracja ochrony tras

- Cel: Weryfikacja: deklaracja ochrony tras.
- Wynik oczekiwany: Lokalna ścieżka przekierowania ma wartość /login.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 0.404 ms.
- Plik i linia: [src/test/auth.test.ts:136](../../../../src/test/auth.test.ts#L136).
- Pełna nazwa w Vitest: `Auth Flow - Separate Pages Route Configuration protected routes should redirect unauthenticated users to /login`.
- Ograniczenia: Test deklaratywny: lokalne stałe, obiekty lub mock nawigacji. Nie renderuje stron i nie testuje Supabase Auth ani ochrony tras.

### T2-IMP-001 — Parsowanie dwóch historycznych treningów

- Cel: Weryfikacja: parsowanie dwóch historycznych treningów.
- Wynik oczekiwany: Parser zwraca dwie sesje z właściwymi datami, liczbami i stopniami, bez błędów.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 6.830 ms.
- Plik i linia: [src/test/importHistory.test.ts:6](../../../../src/test/importHistory.test.ts#L6).
- Pełna nazwa w Vitest: `Boulder History Import parseImportText parses valid session lines correctly`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T2-IMP-002 — Historyczny import z datą ISO

- Cel: Weryfikacja: historyczny import z datą iso.
- Wynik oczekiwany: Powstaje jedna sesja z datą 2025-01-15.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.921 ms.
- Plik i linia: [src/test/importHistory.test.ts:27](../../../../src/test/importHistory.test.ts#L27).
- Pełna nazwa w Vitest: `Boulder History Import parseImportText handles YYYY-MM-DD date format`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T2-IMP-003 — Wskazanie błędnego wiersza importu

- Cel: Weryfikacja: wskazanie błędnego wiersza importu.
- Wynik oczekiwany: Dwie poprawne sesje pozostają, a błąd wskazuje drugi wiersz.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.940 ms.
- Plik i linia: [src/test/importHistory.test.ts:35](../../../../src/test/importHistory.test.ts#L35).
- Pełna nazwa w Vitest: `Boulder History Import parseImportText reports errors for invalid lines`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T2-IMP-004 — Pusty tekst importu

- Cel: Weryfikacja: pusty tekst importu.
- Wynik oczekiwany: Lista sesji i lista błędów są puste.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.875 ms.
- Plik i linia: [src/test/importHistory.test.ts:47](../../../../src/test/importHistory.test.ts#L47).
- Pełna nazwa w Vitest: `Boulder History Import parseImportText handles empty input`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T2-IMP-005 — Sumowanie historii importowanej

- Cel: Weryfikacja: sumowanie historii importowanej.
- Wynik oczekiwany: Dwie sesje dają 10 przejść, w tym 7 dla 6a i 3 dla 6b.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 1.002 ms.
- Plik i linia: [src/test/importHistory.test.ts:55](../../../../src/test/importHistory.test.ts#L55).
- Pełna nazwa w Vitest: `Boulder History Import calculateImportSummary calculates correct totals`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T2-IMP-006 — Brakujące mapowanie historii

- Cel: Weryfikacja: brakujące mapowanie historii.
- Wynik oczekiwany: Wynik zawiera 7a z liczbą 3.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.924 ms.
- Plik i linia: [src/test/importHistory.test.ts:71](../../../../src/test/importHistory.test.ts#L71).
- Pełna nazwa w Vitest: `Boulder History Import findUnmappedGrades identifies grades not in mapping`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T2-IMP-007 — Deklarowany status importowanej sesji

- Cel: Weryfikacja: deklarowany status importowanej sesji.
- Wynik oczekiwany: Lokalny obiekt ma completed, date_end i notatkę rozpoczynającą się od Imported:.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 0.730 ms.
- Plik i linia: [src/test/importHistory.test.ts:86](../../../../src/test/importHistory.test.ts#L86).
- Pełna nazwa w Vitest: `Boulder History Import Imported sessions should appear in history imported sessions have status=completed`.
- Ograniczenia: Deklaratywny przykład danych lub lokalne filtrowanie; nie uruchamia importu do bazy, historii, agregacji ani kompletnego obliczenia poziomu.

### T2-IMP-008 — Model filtra historii dla importu

- Cel: Weryfikacja: model filtra historii dla importu.
- Wynik oczekiwany: Lokalny obiekt spełnia warunek completed i niepustego date_end.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 0.378 ms.
- Plik i linia: [src/test/importHistory.test.ts:102](../../../../src/test/importHistory.test.ts#L102).
- Pełna nazwa w Vitest: `Boulder History Import Imported sessions should appear in history Session History filters include imported sessions with status=completed`.
- Ograniczenia: Deklaratywny przykład danych lub lokalne filtrowanie; nie uruchamia importu do bazy, historii, agregacji ani kompletnego obliczenia poziomu.

### T2-IMP-009 — Przykładowe dane do agregacji tygodniowej

- Cel: Weryfikacja: przykładowe dane do agregacji tygodniowej.
- Wynik oczekiwany: Lokalny obiekt ma on_wall, dodatnią liczbę przejść i dateStart.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 1.189 ms.
- Plik i linia: [src/test/importHistory.test.ts:121](../../../../src/test/importHistory.test.ts#L121).
- Pełna nazwa w Vitest: `Boulder History Import Imported sessions must be included in analytics imported sessions contribute to weekly aggregates`.
- Ograniczenia: Deklaratywny przykład danych lub lokalne filtrowanie; nie uruchamia importu do bazy, historii, agregacji ani kompletnego obliczenia poziomu.

### T2-IMP-010 — Przykładowe logi wejściowe poziomu wspinacza

- Cel: Weryfikacja: przykładowe logi wejściowe poziomu wspinacza.
- Wynik oczekiwany: Lokalne logi mają grade_raw i dodatni count.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 0.685 ms.
- Plik i linia: [src/test/importHistory.test.ts:139](../../../../src/test/importHistory.test.ts#L139).
- Pełna nazwa w Vitest: `Boulder History Import Imported sessions must be included in analytics imported boulder logs have required fields for User Level computation`.
- Ograniczenia: Deklaratywny przykład danych lub lokalne filtrowanie; nie uruchamia importu do bazy, historii, agregacji ani kompletnego obliczenia poziomu.

### T2-IMP-011 — Przykładowe podsumowanie stref po imporcie

- Cel: Weryfikacja: przykładowe podsumowanie stref po imporcie.
- Wynik oczekiwany: Wpisane do lokalnego obiektu udziały sumują się do 100%.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 0.343 ms.
- Plik i linia: [src/test/importHistory.test.ts:154](../../../../src/test/importHistory.test.ts#L154).
- Pełna nazwa w Vitest: `Boulder History Import Imported sessions must be included in analytics imported sessions have zone summaries computed`.
- Ograniczenia: Deklaratywny przykład danych lub lokalne filtrowanie; nie uruchamia importu do bazy, historii, agregacji ani kompletnego obliczenia poziomu.

### T2-IMP-012 — Deklaracja filtrów analityki bez oznaczenia importu

- Cel: Weryfikacja: deklaracja filtrów analityki bez oznaczenia importu.
- Wynik oczekiwany: Lokalny obiekt nie zawiera is_imported ani source.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 1.532 ms.
- Plik i linia: [src/test/importHistory.test.ts:167](../../../../src/test/importHistory.test.ts#L167).
- Pełna nazwa w Vitest: `Boulder History Import Imported sessions must be included in analytics Analytics query does NOT filter by any import flag`.
- Ograniczenia: Deklaratywny przykład danych lub lokalne filtrowanie; nie uruchamia importu do bazy, historii, agregacji ani kompletnego obliczenia poziomu.

### T2-IMP-013 — Model obecności importu w oknie 90 dni

- Cel: Weryfikacja: model obecności importu w oknie 90 dni.
- Wynik oczekiwany: Przykładowa sesja sprzed 7 dni mieści się w oknie i ma typ on_wall.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 0.514 ms.
- Plik i linia: [src/test/importHistory.test.ts:180](../../../../src/test/importHistory.test.ts#L180).
- Pełna nazwa w Vitest: `Boulder History Import Imported sessions must be included in analytics imported sessions within 90-day window count toward User Level`.
- Ograniczenia: Deklaratywny przykład danych lub lokalne filtrowanie; nie uruchamia importu do bazy, historii, agregacji ani kompletnego obliczenia poziomu.

### T2-PAGE-001 — Model pierwszej strony listy

- Cel: Weryfikacja: model pierwszej strony listy.
- Wynik oczekiwany: Pierwsza strona zawiera elementy 0–9 i ma indeks 0.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 5.222 ms.
- Plik i linia: [src/test/listPager.test.ts:30](../../../../src/test/listPager.test.ts#L30).
- Pełna nazwa w Vitest: `Pagination Logic basic pagination returns first page of items by default`.
- Ograniczenia: Test lokalnej kopii funkcji paginate; nie uruchamia usePagination ani komponentu listy.

### T2-PAGE-002 — Model liczby stron

- Cel: Weryfikacja: model liczby stron.
- Wynik oczekiwany: 55 elementów przy rozmiarze 10 daje 6 stron.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 0.642 ms.
- Plik i linia: [src/test/listPager.test.ts:40](../../../../src/test/listPager.test.ts#L40).
- Pełna nazwa w Vitest: `Pagination Logic basic pagination calculates total pages correctly`.
- Ograniczenia: Test lokalnej kopii funkcji paginate; nie uruchamia usePagination ani komponentu listy.

### T2-PAGE-003 — Model stronicowania pustej tablicy

- Cel: Weryfikacja: model stronicowania pustej tablicy.
- Wynik oczekiwany: Indeks wynosi 0, liczba stron 1, wynik jest pusty.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 0.918 ms.
- Plik i linia: [src/test/listPager.test.ts:47](../../../../src/test/listPager.test.ts#L47).
- Pełna nazwa w Vitest: `Pagination Logic basic pagination handles empty array`.
- Ograniczenia: Test lokalnej kopii funkcji paginate; nie uruchamia usePagination ani komponentu listy.

### T2-PAGE-004 — Model stronicowania undefined

- Cel: Weryfikacja: model stronicowania undefined.
- Wynik oczekiwany: Indeks wynosi 0, liczba stron 1, wynik jest pusty.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 1.029 ms.
- Plik i linia: [src/test/listPager.test.ts:55](../../../../src/test/listPager.test.ts#L55).
- Pełna nazwa w Vitest: `Pagination Logic basic pagination handles undefined items`.
- Ograniczenia: Test lokalnej kopii funkcji paginate; nie uruchamia usePagination ani komponentu listy.

### T2-PAGE-005 — Model drugiej strony

- Cel: Weryfikacja: model drugiej strony.
- Wynik oczekiwany: Strona o indeksie 1 rozpoczyna się od elementu 10.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 0.742 ms.
- Plik i linia: [src/test/listPager.test.ts:65](../../../../src/test/listPager.test.ts#L65).
- Pełna nazwa w Vitest: `Pagination Logic navigation second page shows correct items`.
- Ograniczenia: Test lokalnej kopii funkcji paginate; nie uruchamia usePagination ani komponentu listy.

### T2-PAGE-006 — Model ograniczania zbyt dużego indeksu

- Cel: Weryfikacja: model ograniczania zbyt dużego indeksu.
- Wynik oczekiwany: Żądana strona 10 zostaje ograniczona do ostatniej strony o indeksie 2.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 0.705 ms.
- Plik i linia: [src/test/listPager.test.ts:73](../../../../src/test/listPager.test.ts#L73).
- Pełna nazwa w Vitest: `Pagination Logic navigation clamps page to valid range`.
- Ograniczenia: Test lokalnej kopii funkcji paginate; nie uruchamia usePagination ani komponentu listy.

### T2-PAGE-007 — Model wskaźnika następnej strony

- Cel: Weryfikacja: model wskaźnika następnej strony.
- Wynik oczekiwany: hasNextPage jest true przed ostatnią stroną i false na ostatniej.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 0.633 ms.
- Plik i linia: [src/test/listPager.test.ts:80](../../../../src/test/listPager.test.ts#L80).
- Pełna nazwa w Vitest: `Pagination Logic navigation reports hasNextPage correctly`.
- Ograniczenia: Test lokalnej kopii funkcji paginate; nie uruchamia usePagination ani komponentu listy.

### T2-PAGE-008 — Model wskaźnika poprzedniej strony

- Cel: Weryfikacja: model wskaźnika poprzedniej strony.
- Wynik oczekiwany: hasPrevPage jest false na pierwszej stronie i true na kolejnych.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 0.649 ms.
- Plik i linia: [src/test/listPager.test.ts:88](../../../../src/test/listPager.test.ts#L88).
- Pełna nazwa w Vitest: `Pagination Logic navigation reports hasPrevPage correctly`.
- Ograniczenia: Test lokalnej kopii funkcji paginate; nie uruchamia usePagination ani komponentu listy.

### T2-PAGE-009 — Model indeksów zakresu

- Cel: Weryfikacja: model indeksów zakresu.
- Wynik oczekiwany: Pierwsze dwa zakresy wynoszą 0–10 i 10–20.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 1.065 ms.
- Plik i linia: [src/test/listPager.test.ts:98](../../../../src/test/listPager.test.ts#L98).
- Pełna nazwa w Vitest: `Pagination Logic index calculations calculates start and end index correctly`.
- Ograniczenia: Test lokalnej kopii funkcji paginate; nie uruchamia usePagination ani komponentu listy.

### T2-PAGE-010 — Model niepełnej ostatniej strony

- Cel: Weryfikacja: model niepełnej ostatniej strony.
- Wynik oczekiwany: Ostatnia strona próbki ma 5 elementów i zakres 20–25.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 0.768 ms.
- Plik i linia: [src/test/listPager.test.ts:110](../../../../src/test/listPager.test.ts#L110).
- Pełna nazwa w Vitest: `Pagination Logic index calculations handles last page with fewer items`.
- Ograniczenia: Test lokalnej kopii funkcji paginate; nie uruchamia usePagination ani komponentu listy.

### T2-PAGE-011 — Model różnych rozmiarów strony

- Cel: Weryfikacja: model różnych rozmiarów strony.
- Wynik oczekiwany: Rozmiary 25 i 5 dają odpowiednio 2 i 10 stron.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 0.915 ms.
- Plik i linia: [src/test/listPager.test.ts:121](../../../../src/test/listPager.test.ts#L121).
- Pełna nazwa w Vitest: `Pagination Logic page size variations works with different page sizes`.
- Ograniczenia: Test lokalnej kopii funkcji paginate; nie uruchamia usePagination ani komponentu listy.

### T2-STATE-001 — Model zapisu aktywnej sesji w localStorage

- Cel: Weryfikacja: model zapisu aktywnej sesji w localstorage.
- Wynik oczekiwany: Serializowany obiekt można odczytać z oczekiwanym identyfikatorem, typem i nazwą obiektu.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 4.024 ms.
- Plik i linia: [src/test/sessionPersistence.test.ts:21](../../../../src/test/sessionPersistence.test.ts#L21).
- Pełna nazwa w Vitest: `Session Persistence should store active session data in localStorage`.
- Ograniczenia: Bezpośrednie operacje na mocku localStorage; brak rzeczywistych zdarzeń przeglądarki, hooka trwałości i zapisu do bazy.

### T2-STATE-002 — Model usunięcia aktywnej sesji

- Cel: Weryfikacja: model usunięcia aktywnej sesji.
- Wynik oczekiwany: Po removeItem odczyt klucza zwraca null.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 1.290 ms.
- Plik i linia: [src/test/sessionPersistence.test.ts:43](../../../../src/test/sessionPersistence.test.ts#L43).
- Pełna nazwa w Vitest: `Session Persistence should clear active session data`.
- Ograniczenia: Bezpośrednie operacje na mocku localStorage; brak rzeczywistych zdarzeń przeglądarki, hooka trwałości i zapisu do bazy.

### T2-STATE-003 — Model stanu sesji ze znacznikiem czasu

- Cel: Weryfikacja: model stanu sesji ze znacznikiem czasu.
- Wynik oczekiwany: Odczyt odtwarza listę przejść, notatki, RPE i czas aktualizacji.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 2.741 ms.
- Plik i linia: [src/test/sessionPersistence.test.ts:58](../../../../src/test/sessionPersistence.test.ts#L58).
- Pełna nazwa w Vitest: `Session Persistence should persist session state with timestamp`.
- Ograniczenia: Bezpośrednie operacje na mocku localStorage; brak rzeczywistych zdarzeń przeglądarki, hooka trwałości i zapisu do bazy.

### T2-STATE-004 — Model przywrócenia po przełączeniu karty

- Cel: Weryfikacja: model przywrócenia po przełączeniu karty.
- Wynik oczekiwany: Dane zapisane w mocku pamięci pozostają dostępne do odczytu.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 1.228 ms.
- Plik i linia: [src/test/sessionPersistence.test.ts:80](../../../../src/test/sessionPersistence.test.ts#L80).
- Pełna nazwa w Vitest: `Session Persistence should restore session state after tab switch`.
- Ograniczenia: Bezpośrednie operacje na mocku localStorage; brak rzeczywistych zdarzeń przeglądarki, hooka trwałości i zapisu do bazy.

### T2-STATE-005 — Model identyfikacji sesji offline

- Cel: Weryfikacja: model identyfikacji sesji offline.
- Wynik oczekiwany: Lokalny zapis zachowuje isOffline i prefiks offline- identyfikatora.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 0.727 ms.
- Plik i linia: [src/test/sessionPersistence.test.ts:115](../../../../src/test/sessionPersistence.test.ts#L115).
- Pełna nazwa w Vitest: `Session Persistence should handle offline sessions`.
- Ograniczenia: Bezpośrednie operacje na mocku localStorage; brak rzeczywistych zdarzeń przeglądarki, hooka trwałości i zapisu do bazy.

### T2-STATE-006 — Model zachowania danych po nawigacji wstecz

- Cel: Weryfikacja: model zachowania danych po nawigacji wstecz.
- Wynik oczekiwany: W mocku pamięci nadal są metadane i trzy przejścia; rzeczywista nawigacja nie jest wykonywana.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 1.058 ms.
- Plik i linia: [src/test/sessionPersistence.test.ts:133](../../../../src/test/sessionPersistence.test.ts#L133).
- Pełna nazwa w Vitest: `Session Persistence should not lose data on browser back navigation`.
- Ograniczenia: Bezpośrednie operacje na mocku localStorage; brak rzeczywistych zdarzeń przeglądarki, hooka trwałości i zapisu do bazy.

### T2-STATE-007 — Model porzucenia sesji

- Cel: Weryfikacja: model porzucenia sesji.
- Wynik oczekiwany: Oba ręcznie usuwane klucze sesji zwracają null.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 0.845 ms.
- Plik i linia: [src/test/sessionPersistence.test.ts:176](../../../../src/test/sessionPersistence.test.ts#L176).
- Pełna nazwa w Vitest: `Session Discard Lifecycle should clear all localStorage keys when session is discarded`.
- Ograniczenia: Bezpośrednie operacje na mocku localStorage; brak rzeczywistych zdarzeń przeglądarki, hooka trwałości i zapisu do bazy.

### T2-STATE-008 — Deklaracja braku pozostałości po porzuceniu

- Cel: Weryfikacja: deklaracja braku pozostałości po porzuceniu.
- Wynik oczekiwany: Asercja nie znajduje kluczy sesji w Object.keys(localStorageMock); nie bada wewnętrznego magazynu mocka.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 1.055 ms.
- Plik i linia: [src/test/sessionPersistence.test.ts:212](../../../../src/test/sessionPersistence.test.ts#L212).
- Pełna nazwa w Vitest: `Session Discard Lifecycle discard should leave no traces of session data`.
- Ograniczenia: Bezpośrednie operacje na mocku localStorage; brak rzeczywistych zdarzeń przeglądarki, hooka trwałości i zapisu do bazy.

### T2-STATE-009 — Model kontynuacji sesji

- Cel: Weryfikacja: model kontynuacji sesji.
- Wynik oczekiwany: Odczyt zachowuje identyfikator, nazwę obiektu, trzy przejścia i notatkę.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 1.765 ms.
- Plik i linia: [src/test/sessionPersistence.test.ts:250](../../../../src/test/sessionPersistence.test.ts#L250).
- Pełna nazwa w Vitest: `Session Discard Lifecycle continue session should preserve all session data`.
- Ograniczenia: Bezpośrednie operacje na mocku localStorage; brak rzeczywistych zdarzeń przeglądarki, hooka trwałości i zapisu do bazy.

### T2-STATE-010 — Model porzucenia sesji offline

- Cel: Weryfikacja: model porzucenia sesji offline.
- Wynik oczekiwany: Oba klucze z identyfikatorem tymczasowym zostają ręcznie usunięte.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 0.771 ms.
- Plik i linia: [src/test/sessionPersistence.test.ts:295](../../../../src/test/sessionPersistence.test.ts#L295).
- Pełna nazwa w Vitest: `Session Discard Lifecycle offline session discard should clear offline temp id data`.
- Ograniczenia: Bezpośrednie operacje na mocku localStorage; brak rzeczywistych zdarzeń przeglądarki, hooka trwałości i zapisu do bazy.

### T2-STATE-011 — Model lokalnego czyszczenia po zakończeniu

- Cel: Weryfikacja: model lokalnego czyszczenia po zakończeniu.
- Wynik oczekiwany: Odczyt kluczy po removeItem zwraca null; rzeczywisty zapis do bazy nie jest sprawdzany.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 0.707 ms.
- Plik i linia: [src/test/sessionPersistence.test.ts:323](../../../../src/test/sessionPersistence.test.ts#L323).
- Pełna nazwa w Vitest: `Session Discard Lifecycle session finish should clear active session but data was already saved to DB`.
- Ograniczenia: Bezpośrednie operacje na mocku localStorage; brak rzeczywistych zdarzeń przeglądarki, hooka trwałości i zapisu do bazy.

### T2-STATE-012 — Izolacja lokalnego stanu dwóch sesji

- Cel: Weryfikacja: izolacja lokalnego stanu dwóch sesji.
- Wynik oczekiwany: Usunięcie kluczy drugiej sesji pozostawia stan pierwszej sesji.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 0.640 ms.
- Plik i linia: [src/test/sessionPersistence.test.ts:356](../../../../src/test/sessionPersistence.test.ts#L356).
- Pełna nazwa w Vitest: `Session Discard Lifecycle multiple sessions should not interfere with each other during discard`.
- Ograniczenia: Bezpośrednie operacje na mocku localStorage; brak rzeczywistych zdarzeń przeglądarki, hooka trwałości i zapisu do bazy.

### T2-UI-001 — Zakończenie OFF-WALL przez rzeczywisty komponent

- Cel: Weryfikacja: zakończenie off-wall przez rzeczywisty komponent.
- Wynik oczekiwany: RPC otrzymuje completed, date_end, protokół i serię; po potwierdzeniu następuje nawigacja i czyszczenie stanu.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: komponentowy; środowisko: jsdom. Czas raportera: 524.742 ms.
- Plik i linia: [src/test/strengthCompletion.test.tsx:56](../../../../src/test/strengthCompletion.test.tsx#L56).
- Pełna nazwa w Vitest: `StrengthSession completion through the UI submits completed status, end time, protocol and sets, then navigates after confirmation`.
- Ograniczenia: Rzeczywisty komponent StrengthSession w jsdom; mocki Supabase, uwierzytelnienia i trwałości, dane z cache QueryClient. Bez rzeczywistego serwera i urządzenia.

### T2-UI-002 — Błąd bazy podczas kończenia OFF-WALL

- Cel: Weryfikacja: błąd bazy podczas kończenia off-wall.
- Wynik oczekiwany: Widok i stan odtwarzania pozostają, widoczny jest błąd; poprawne ponowienie prowadzi do analityki.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: komponentowy; środowisko: jsdom. Czas raportera: 381.544 ms.
- Plik i linia: [src/test/strengthCompletion.test.tsx:69](../../../../src/test/strengthCompletion.test.tsx#L69).
- Pełna nazwa w Vitest: `StrengthSession completion through the UI keeps the form and recovery data after database error and permits retry`.
- Ograniczenia: Rzeczywisty komponent StrengthSession w jsdom; mocki Supabase, uwierzytelnienia i trwałości, dane z cache QueryClient. Bez rzeczywistego serwera i urządzenia.

### T2-UI-003 — Brak potwierdzenia podczas kończenia OFF-WALL

- Cel: Weryfikacja: brak potwierdzenia podczas kończenia off-wall.
- Wynik oczekiwany: Formularz i stan pozostają do ponowienia; późniejsze potwierdzenie kończy sesję.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: komponentowy; środowisko: jsdom. Czas raportera: 318.431 ms.
- Plik i linia: [src/test/strengthCompletion.test.tsx:69](../../../../src/test/strengthCompletion.test.tsx#L69).
- Pełna nazwa w Vitest: `StrengthSession completion through the UI keeps the form and recovery data after no confirmation and permits retry`.
- Ograniczenia: Rzeczywisty komponent StrengthSession w jsdom; mocki Supabase, uwierzytelnienia i trwałości, dane z cache QueryClient. Bez rzeczywistego serwera i urządzenia.

### T2-UI-004 — Oczekiwanie komponentu na potwierdzenie serwera

- Cel: Weryfikacja: oczekiwanie komponentu na potwierdzenie serwera.
- Wynik oczekiwany: Przycisk jest zablokowany; przed odpowiedzią nie ma nawigacji ani czyszczenia stanu.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: komponentowy; środowisko: jsdom. Czas raportera: 313.139 ms.
- Plik i linia: [src/test/strengthCompletion.test.tsx:82](../../../../src/test/strengthCompletion.test.tsx#L82).
- Pełna nazwa w Vitest: `StrengthSession completion through the UI does not clear recovery data or navigate before the server confirms success`.
- Ograniczenia: Rzeczywisty komponent StrengthSession w jsdom; mocki Supabase, uwierzytelnienia i trwałości, dane z cache QueryClient. Bez rzeczywistego serwera i urządzenia.

### T2-UI-005 — Odrzucenie pustego treningu w widoku OFF-WALL

- Cel: Weryfikacja: odrzucenie pustego treningu w widoku off-wall.
- Wynik oczekiwany: RPC nie jest wywoływane, stan nie jest czyszczony i pojawia się komunikat błędu.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: komponentowy; środowisko: jsdom. Czas raportera: 139.341 ms.
- Plik i linia: [src/test/strengthCompletion.test.tsx:94](../../../../src/test/strengthCompletion.test.tsx#L94).
- Pełna nazwa w Vitest: `StrengthSession completion through the UI rejects an empty session without calling the server`.
- Ograniczenia: Rzeczywisty komponent StrengthSession w jsdom; mocki Supabase, uwierzytelnienia i trwałości, dane z cache QueryClient. Bez rzeczywistego serwera i urządzenia.

### T2-TPL-001 — Model braku ćwiczeń w szablonie ON-WALL

- Cel: Weryfikacja: model braku ćwiczeń w szablonie on-wall.
- Wynik oczekiwany: Lokalna funkcja shouldShowAddExercise zwraca false.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 1.655 ms.
- Plik i linia: [src/test/templates.test.ts:78](../../../../src/test/templates.test.ts#L78).
- Pełna nazwa w Vitest: `ON-WALL Templates shouldShowAddExercise should return false for ON-WALL templates`.
- Ograniczenia: Test kopii funkcji i lokalnych przykładowych szablonów zdefiniowanych w pliku testowym; brak importu logiki szablonów aplikacji.

### T2-TPL-002 — Model obsługi ćwiczeń w szablonie OFF-WALL

- Cel: Weryfikacja: model obsługi ćwiczeń w szablonie off-wall.
- Wynik oczekiwany: Lokalna funkcja shouldShowAddExercise zwraca true.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 0.293 ms.
- Plik i linia: [src/test/templates.test.ts:89](../../../../src/test/templates.test.ts#L89).
- Pełna nazwa w Vitest: `ON-WALL Templates shouldShowAddExercise should return true for OFF-WALL templates`.
- Ograniczenia: Test kopii funkcji i lokalnych przykładowych szablonów zdefiniowanych w pliku testowym; brak importu logiki szablonów aplikacji.

### T2-TPL-003 — Model ON-WALL z nieoczekiwaną listą ćwiczeń

- Cel: Weryfikacja: model on-wall z nieoczekiwaną listą ćwiczeń.
- Wynik oczekiwany: Lokalna funkcja nadal zwraca false.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 0.201 ms.
- Plik i linia: [src/test/templates.test.ts:100](../../../../src/test/templates.test.ts#L100).
- Pełna nazwa w Vitest: `ON-WALL Templates shouldShowAddExercise should return false for ON-WALL templates regardless of items`.
- Ograniczenia: Test kopii funkcji i lokalnych przykładowych szablonów zdefiniowanych w pliku testowym; brak importu logiki szablonów aplikacji.

### T2-TPL-004 — Model trasy sesji z szablonu ON-WALL

- Cel: Weryfikacja: model trasy sesji z szablonu on-wall.
- Wynik oczekiwany: Lokalna funkcja daje /session/sess-123/boulders.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 0.267 ms.
- Plik i linia: [src/test/templates.test.ts:114](../../../../src/test/templates.test.ts#L114).
- Pełna nazwa w Vitest: `ON-WALL Templates getSessionRoute should route ON-WALL templates to boulder session`.
- Ograniczenia: Test kopii funkcji i lokalnych przykładowych szablonów zdefiniowanych w pliku testowym; brak importu logiki szablonów aplikacji.

### T2-TPL-005 — Model trasy sesji z szablonu OFF-WALL

- Cel: Weryfikacja: model trasy sesji z szablonu off-wall.
- Wynik oczekiwany: Lokalna funkcja daje /session/sess-456/strength.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 0.166 ms.
- Plik i linia: [src/test/templates.test.ts:119](../../../../src/test/templates.test.ts#L119).
- Pełna nazwa w Vitest: `ON-WALL Templates getSessionRoute should route OFF-WALL templates to strength session`.
- Ograniczenia: Test kopii funkcji i lokalnych przykładowych szablonów zdefiniowanych w pliku testowym; brak importu logiki szablonów aplikacji.

### T2-TPL-006 — Model walidacji pełnego szablonu ON-WALL

- Cel: Weryfikacja: model walidacji pełnego szablonu on-wall.
- Wynik oczekiwany: Przygotowana poprawna konfiguracja daje true.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 0.551 ms.
- Plik i linia: [src/test/templates.test.ts:126](../../../../src/test/templates.test.ts#L126).
- Pełna nazwa w Vitest: `ON-WALL Templates isValidOnWallConfig should validate correct config`.
- Ograniczenia: Test kopii funkcji i lokalnych przykładowych szablonów zdefiniowanych w pliku testowym; brak importu logiki szablonów aplikacji.

### T2-TPL-007 — Model walidacji braku konfiguracji

- Cel: Weryfikacja: model walidacji braku konfiguracji.
- Wynik oczekiwany: Wartość null daje false.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 0.182 ms.
- Plik i linia: [src/test/templates.test.ts:139](../../../../src/test/templates.test.ts#L139).
- Pełna nazwa w Vitest: `ON-WALL Templates isValidOnWallConfig should reject null config`.
- Ograniczenia: Test kopii funkcji i lokalnych przykładowych szablonów zdefiniowanych w pliku testowym; brak importu logiki szablonów aplikacji.

### T2-TPL-008 — Model walidacji sumy stref

- Cel: Weryfikacja: model walidacji sumy stref.
- Wynik oczekiwany: Rozkład sumujący się do 150% daje false.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 0.160 ms.
- Plik i linia: [src/test/templates.test.ts:143](../../../../src/test/templates.test.ts#L143).
- Pełna nazwa w Vitest: `ON-WALL Templates isValidOnWallConfig should reject invalid zone distribution`.
- Ograniczenia: Test kopii funkcji i lokalnych przykładowych szablonów zdefiniowanych w pliku testowym; brak importu logiki szablonów aplikacji.

### T2-TPL-009 — Model zakresu grade_focus

- Cel: Weryfikacja: model zakresu grade_focus.
- Wynik oczekiwany: Wartość 5 poza zakresem -2 do 2 daje false.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 0.511 ms.
- Plik i linia: [src/test/templates.test.ts:151](../../../../src/test/templates.test.ts#L151).
- Pełna nazwa w Vitest: `ON-WALL Templates isValidOnWallConfig should reject out-of-range grade focus`.
- Ograniczenia: Test kopii funkcji i lokalnych przykładowych szablonów zdefiniowanych w pliku testowym; brak importu logiki szablonów aplikacji.

### T2-TPL-010 — Model zakresu długości treningu

- Cel: Weryfikacja: model zakresu długości treningu.
- Wynik oczekiwany: Wartość 500 minut przekraczająca limit 300 daje false.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 0.258 ms.
- Plik i linia: [src/test/templates.test.ts:159](../../../../src/test/templates.test.ts#L159).
- Pełna nazwa w Vitest: `ON-WALL Templates isValidOnWallConfig should reject unreasonable duration`.
- Ograniczenia: Test kopii funkcji i lokalnych przykładowych szablonów zdefiniowanych w pliku testowym; brak importu logiki szablonów aplikacji.

### T2-TPL-011 — Model pól opcjonalnych szablonu

- Cel: Weryfikacja: model pól opcjonalnych szablonu.
- Wynik oczekiwany: Minimalna konfiguracja z focus=custom daje true.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 0.145 ms.
- Plik i linia: [src/test/templates.test.ts:167](../../../../src/test/templates.test.ts#L167).
- Pełna nazwa w Vitest: `ON-WALL Templates isValidOnWallConfig should accept config without optional fields`.
- Ograniczenia: Test kopii funkcji i lokalnych przykładowych szablonów zdefiniowanych w pliku testowym; brak importu logiki szablonów aplikacji.

### T2-TPL-012 — Deklarowana liczba szablonów systemowych

- Cel: Weryfikacja: deklarowana liczba szablonów systemowych.
- Wynik oczekiwany: Lokalna tablica zawiera pięć wpisów.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 1.481 ms.
- Plik i linia: [src/test/templates.test.ts:185](../../../../src/test/templates.test.ts#L185).
- Pełna nazwa w Vitest: `ON-WALL Templates System Presets should have 5 system presets`.
- Ograniczenia: Test kopii funkcji i lokalnych przykładowych szablonów zdefiniowanych w pliku testowym; brak importu logiki szablonów aplikacji.

### T2-TPL-013 — Deklarowany typ szablonów systemowych

- Cel: Weryfikacja: deklarowany typ szablonów systemowych.
- Wynik oczekiwany: Wszystkie lokalne wpisy mają on_wall.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 0.571 ms.
- Plik i linia: [src/test/templates.test.ts:189](../../../../src/test/templates.test.ts#L189).
- Pełna nazwa w Vitest: `ON-WALL Templates System Presets should all be ON-WALL type`.
- Ograniczenia: Test kopii funkcji i lokalnych przykładowych szablonów zdefiniowanych w pliku testowym; brak importu logiki szablonów aplikacji.

### T2-TPL-014 — Deklarowany znacznik szablonów systemowych

- Cel: Weryfikacja: deklarowany znacznik szablonów systemowych.
- Wynik oczekiwany: Wszystkie lokalne wpisy mają is_system=true.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 0.420 ms.
- Plik i linia: [src/test/templates.test.ts:195](../../../../src/test/templates.test.ts#L195).
- Pełna nazwa w Vitest: `ON-WALL Templates System Presets should all be marked as system templates`.
- Ograniczenia: Test kopii funkcji i lokalnych przykładowych szablonów zdefiniowanych w pliku testowym; brak importu logiki szablonów aplikacji.

### T2-TPL-015 — Model ochrony szablonu systemowego przed usunięciem

- Cel: Weryfikacja: model ochrony szablonu systemowego przed usunięciem.
- Wynik oczekiwany: Lokalny predykat canDelete zwraca false dla przygotowanych wpisów.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 0.283 ms.
- Plik i linia: [src/test/templates.test.ts:201](../../../../src/test/templates.test.ts#L201).
- Pełna nazwa w Vitest: `ON-WALL Templates System Presets should not allow deletion of system templates`.
- Ograniczenia: Test kopii funkcji i lokalnych przykładowych szablonów zdefiniowanych w pliku testowym; brak importu logiki szablonów aplikacji.

### T2-TPL-016 — Model dodawania ćwiczeń w OFF-WALL

- Cel: Weryfikacja: model dodawania ćwiczeń w off-wall.
- Wynik oczekiwany: Lokalny predykat dopuszcza obsługę ćwiczeń.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 0.180 ms.
- Plik i linia: [src/test/templates.test.ts:212](../../../../src/test/templates.test.ts#L212).
- Pełna nazwa w Vitest: `OFF-WALL Templates should allow adding exercises`.
- Ograniczenia: Test kopii funkcji i lokalnych przykładowych szablonów zdefiniowanych w pliku testowym; brak importu logiki szablonów aplikacji.

### T2-TPL-017 — Model liczby ćwiczeń szablonu

- Cel: Weryfikacja: model liczby ćwiczeń szablonu.
- Wynik oczekiwany: Przygotowany lokalny obiekt zawiera trzy ćwiczenia.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 0.122 ms.
- Plik i linia: [src/test/templates.test.ts:223](../../../../src/test/templates.test.ts#L223).
- Pełna nazwa w Vitest: `OFF-WALL Templates should show exercise count correctly`.
- Ograniczenia: Test kopii funkcji i lokalnych przykładowych szablonów zdefiniowanych w pliku testowym; brak importu logiki szablonów aplikacji.

### T2-TOAST-001 — Zamknięcie komunikatu akcją DISMISS_TOAST

- Cel: Weryfikacja: zamknięcie komunikatu akcją dismiss_toast.
- Wynik oczekiwany: Reducer zmienia open na false; upływ 3000 ms nie jest sprawdzany.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 5.118 ms.
- Plik i linia: [src/test/toast.test.ts:6](../../../../src/test/toast.test.ts#L6).
- Pełna nazwa w Vitest: `Toast System TOAST_REMOVE_DELAY configuration should have auto-dismiss configured to 3 seconds`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją. Nazwa sugeruje 3000 ms, lecz test nie używa zegara ani asercji opóźnienia.

### T2-TOAST-002 — Limit liczby komunikatów

- Cel: Weryfikacja: limit liczby komunikatów.
- Wynik oczekiwany: Dodanie pięciu komunikatów pozostawia nie więcej niż trzy.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.451 ms.
- Plik i linia: [src/test/toast.test.ts:33](../../../../src/test/toast.test.ts#L33).
- Pełna nazwa w Vitest: `Toast System Toast reducer should limit toasts to TOAST_LIMIT`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T2-TOAST-003 — Usunięcie komunikatu po identyfikatorze

- Cel: Weryfikacja: usunięcie komunikatu po identyfikatorze.
- Wynik oczekiwany: Pozostaje jeden komunikat o identyfikatorze toast-2.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.478 ms.
- Plik i linia: [src/test/toast.test.ts:48](../../../../src/test/toast.test.ts#L48).
- Pełna nazwa w Vitest: `Toast System Toast reducer should remove toast by id`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T2-TOAST-004 — Aktualizacja treści komunikatu

- Cel: Weryfikacja: aktualizacja treści komunikatu.
- Wynik oczekiwany: Tytuł istniejącego komunikatu zmienia się na Updated.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: jednostkowy; środowisko: jsdom. Czas raportera: 0.441 ms.
- Plik i linia: [src/test/toast.test.ts:65](../../../../src/test/toast.test.ts#L65).
- Pełna nazwa w Vitest: `Toast System Toast reducer should update existing toast`.
- Ograniczenia: Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.

### T2-TOAST-005 — Deklaracja położenia komunikatu

- Cel: Weryfikacja: deklaracja położenia komunikatu.
- Wynik oczekiwany: Asercja true równe true przechodzi; położenie elementu nie jest sprawdzane.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 0.234 ms.
- Plik i linia: [src/test/toast.test.ts:80](../../../../src/test/toast.test.ts#L80).
- Pełna nazwa w Vitest: `Toast System Toast placement should be positioned at bottom of screen via ToastViewport className`.
- Ograniczenia: Placeholder expect(true).toBe(true); nie sprawdza CSS, DOM ani responsywności.

## T3: Baza danych, integralność i bezpieczeństwo

### T3-SQL-001 — Zakończenie OFF-WALL w lokalnym PostgreSQL

- Cel: Weryfikacja: zakończenie off-wall w lokalnym postgresql.
- Wynik oczekiwany: Sesja ma completed i date_end, zapisane jest jedno ćwiczenie i dwie serie.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: integracyjny; środowisko: node. Czas raportera: 96.691 ms.
- Plik i linia: [src/test/atomicSessionSave.test.ts:54](../../../../src/test/atomicSessionSave.test.ts#L54).
- Pełna nazwa w Vitest: `atomic save in PostgreSQL with lifecycle trigger and RLS completes online OFF-WALL with an end time, exercises and all sets`.
- Ograniczenia: Rzeczywisty lokalny silnik PostgreSQL/PGlite, lecz uproszczony schemat i testowe polityki RLS z fixtures/sessionSchema.sql. Nie dowodzi poprawności produkcyjnych polityk RLS, REST ani wieloprocesowej współbieżności. Część asercji akceptuje dowolny wyjątek.

### T3-SQL-002 — Wierność szczegółów OFF-WALL w bazie

- Cel: Weryfikacja: wierność szczegółów off-wall w bazie.
- Wynik oczekiwany: Zachowane są exercise_id, protocol_id, kolejność, wartości serii, zerowe obciążenie i zmęczenie.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: integracyjny; środowisko: node. Czas raportera: 55.336 ms.
- Plik i linia: [src/test/atomicSessionSave.test.ts:63](../../../../src/test/atomicSessionSave.test.ts#L63).
- Pełna nazwa w Vitest: `atomic save in PostgreSQL with lifecycle trigger and RLS syncs OFF-WALL with correct exercise, protocol, order, set values and zero fatigue`.
- Ograniczenia: Rzeczywisty lokalny silnik PostgreSQL/PGlite, lecz uproszczony schemat i testowe polityki RLS z fixtures/sessionSchema.sql. Nie dowodzi poprawności produkcyjnych polityk RLS, REST ani wieloprocesowej współbieżności. Część asercji akceptuje dowolny wyjątek.

### T3-SQL-003 — Zapis ON-WALL z obiektem i historią

- Cel: Weryfikacja: zapis on-wall z obiektem i historią.
- Wynik oczekiwany: Powstaje powiązanie obiektu, poprawny log i zakończona sesja z date_end.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: integracyjny; środowisko: node. Czas raportera: 45.413 ms.
- Plik i linia: [src/test/atomicSessionSave.test.ts:73](../../../../src/test/atomicSessionSave.test.ts#L73).
- Pełna nazwa w Vitest: `atomic save in PostgreSQL with lifecycle trigger and RLS syncs ON-WALL with a gym, logs and history-compatible status`.
- Ograniczenia: Rzeczywisty lokalny silnik PostgreSQL/PGlite, lecz uproszczony schemat i testowe polityki RLS z fixtures/sessionSchema.sql. Nie dowodzi poprawności produkcyjnych polityk RLS, REST ani wieloprocesowej współbieżności. Część asercji akceptuje dowolny wyjątek.

### T3-SQL-004 — Idempotentne ponowienie OFF-WALL po utracie odpowiedzi

- Cel: Weryfikacja: idempotentne ponowienie off-wall po utracie odpowiedzi.
- Wynik oczekiwany: Ponowienie zwraca ten sam identyfikator; pozostaje jedna sesja, jedno ćwiczenie i dwie serie.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: integracyjny; środowisko: node. Czas raportera: 50.395 ms.
- Plik i linia: [src/test/atomicSessionSave.test.ts:79](../../../../src/test/atomicSessionSave.test.ts#L79).
- Pełna nazwa w Vitest: `atomic save in PostgreSQL with lifecycle trigger and RLS retries after a lost response without duplicating sessions, exercises or sets`.
- Ograniczenia: Rzeczywisty lokalny silnik PostgreSQL/PGlite, lecz uproszczony schemat i testowe polityki RLS z fixtures/sessionSchema.sql. Nie dowodzi poprawności produkcyjnych polityk RLS, REST ani wieloprocesowej współbieżności. Część asercji akceptuje dowolny wyjątek.

### T3-SQL-005 — Idempotentne ponowienie ON-WALL

- Cel: Weryfikacja: idempotentne ponowienie on-wall.
- Wynik oczekiwany: Ponowienie nie powiela powiązań obiektu ani logów.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: integracyjny; środowisko: node. Czas raportera: 43.575 ms.
- Plik i linia: [src/test/atomicSessionSave.test.ts:86](../../../../src/test/atomicSessionSave.test.ts#L86).
- Pełna nazwa w Vitest: `atomic save in PostgreSQL with lifecycle trigger and RLS retries ON-WALL without duplicating gym links or logs`.
- Ograniczenia: Rzeczywisty lokalny silnik PostgreSQL/PGlite, lecz uproszczony schemat i testowe polityki RLS z fixtures/sessionSchema.sql. Nie dowodzi poprawności produkcyjnych polityk RLS, REST ani wieloprocesowej współbieżności. Część asercji akceptuje dowolny wyjątek.

### T3-SQL-006 — Wycofanie ON-WALL po błędzie logu

- Cel: Weryfikacja: wycofanie on-wall po błędzie logu.
- Wynik oczekiwany: Po błędnym stopniu nie pozostaje sesja, powiązanie obiektu ani log.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: integracyjny; środowisko: node. Czas raportera: 47.913 ms.
- Plik i linia: [src/test/atomicSessionSave.test.ts:93](../../../../src/test/atomicSessionSave.test.ts#L93).
- Pełna nazwa w Vitest: `atomic save in PostgreSQL with lifecycle trigger and RLS rolls back session, gym and logs when a log insert fails`.
- Ograniczenia: Rzeczywisty lokalny silnik PostgreSQL/PGlite, lecz uproszczony schemat i testowe polityki RLS z fixtures/sessionSchema.sql. Nie dowodzi poprawności produkcyjnych polityk RLS, REST ani wieloprocesowej współbieżności. Część asercji akceptuje dowolny wyjątek.

### T3-SQL-007 — Wycofanie OFF-WALL po błędzie późniejszej serii

- Cel: Weryfikacja: wycofanie off-wall po błędzie późniejszej serii.
- Wynik oczekiwany: Nie pozostaje część sesji, ćwiczeń ani serii; poprawne ponowienie jest możliwe.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: integracyjny; środowisko: node. Czas raportera: 52.016 ms.
- Plik i linia: [src/test/atomicSessionSave.test.ts:97](../../../../src/test/atomicSessionSave.test.ts#L97).
- Pełna nazwa w Vitest: `atomic save in PostgreSQL with lifecycle trigger and RLS rolls back session, exercises and earlier sets when a later set fails`.
- Ograniczenia: Rzeczywisty lokalny silnik PostgreSQL/PGlite, lecz uproszczony schemat i testowe polityki RLS z fixtures/sessionSchema.sql. Nie dowodzi poprawności produkcyjnych polityk RLS, REST ani wieloprocesowej współbieżności. Część asercji akceptuje dowolny wyjątek.

### T3-SQL-008 — Ochrona wcześniejszych danych przy błędzie zastępowania

- Cel: Weryfikacja: ochrona wcześniejszych danych przy błędzie zastępowania.
- Wynik oczekiwany: Sesja pozostaje active bez date_end, a poprzednia seria z 42 powtórzeniami pozostaje w bazie.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: integracyjny; środowisko: node. Czas raportera: 51.016 ms.
- Plik i linia: [src/test/atomicSessionSave.test.ts:104](../../../../src/test/atomicSessionSave.test.ts#L104).
- Pełna nazwa w Vitest: `atomic save in PostgreSQL with lifecycle trigger and RLS preserves existing online data and active status when replacement fails`.
- Ograniczenia: Rzeczywisty lokalny silnik PostgreSQL/PGlite, lecz uproszczony schemat i testowe polityki RLS z fixtures/sessionSchema.sql. Nie dowodzi poprawności produkcyjnych polityk RLS, REST ani wieloprocesowej współbieżności. Część asercji akceptuje dowolny wyjątek.

### T3-SQL-009 — Odrzucanie niezakończonej lub pustej sesji

- Cel: Weryfikacja: odrzucanie niezakończonej lub pustej sesji.
- Wynik oczekiwany: Wywołania kończą się wyjątkami i nie tworzą rekordów sesji.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: integracyjny; środowisko: node. Czas raportera: 31.003 ms.
- Plik i linia: [src/test/atomicSessionSave.test.ts:114](../../../../src/test/atomicSessionSave.test.ts#L114).
- Pełna nazwa w Vitest: `atomic save in PostgreSQL with lifecycle trigger and RLS rejects unfinished or empty sessions without creating records`.
- Ograniczenia: Rzeczywisty lokalny silnik PostgreSQL/PGlite, lecz uproszczony schemat i testowe polityki RLS z fixtures/sessionSchema.sql. Nie dowodzi poprawności produkcyjnych polityk RLS, REST ani wieloprocesowej współbieżności. Część asercji akceptuje dowolny wyjątek.

### T3-SQL-010 — Kontrola własności i dostępu do danych powiązanych

- Cel: Weryfikacja: kontrola własności i dostępu do danych powiązanych.
- Wynik oczekiwany: Obcy właściciel, prywatne ćwiczenie, prywatny protokół i obcy obiekt powodują odrzucenie zapisu.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: integracyjny; środowisko: node. Czas raportera: 42.751 ms.
- Plik i linia: [src/test/atomicSessionSave.test.ts:120](../../../../src/test/atomicSessionSave.test.ts#L120).
- Pełna nazwa w Vitest: `atomic save in PostgreSQL with lifecycle trigger and RLS rejects another owner, private exercises, private protocols and foreign gyms`.
- Ograniczenia: Rzeczywisty lokalny silnik PostgreSQL/PGlite, lecz uproszczony schemat i testowe polityki RLS z fixtures/sessionSchema.sql. Nie dowodzi poprawności produkcyjnych polityk RLS, REST ani wieloprocesowej współbieżności. Część asercji akceptuje dowolny wyjątek.

### T3-SQL-011 — Odrzucanie zakończenia cudzej sesji i zapisu bez użytkownika

- Cel: Weryfikacja: odrzucanie zakończenia cudzej sesji i zapisu bez użytkownika.
- Wynik oczekiwany: Cudza sesja oraz brak auth.uid powodują wyjątek.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: integracyjny; środowisko: node. Czas raportera: 29.266 ms.
- Plik i linia: [src/test/atomicSessionSave.test.ts:135](../../../../src/test/atomicSessionSave.test.ts#L135).
- Pełna nazwa w Vitest: `atomic save in PostgreSQL with lifecycle trigger and RLS does not allow completing someone else's session or an anonymous save`.
- Ograniczenia: Rzeczywisty lokalny silnik PostgreSQL/PGlite, lecz uproszczony schemat i testowe polityki RLS z fixtures/sessionSchema.sql. Nie dowodzi poprawności produkcyjnych polityk RLS, REST ani wieloprocesowej współbieżności. Część asercji akceptuje dowolny wyjątek.

### T3-HARD-001 — Deklaracja zakończonej sesji z datą

- Cel: Weryfikacja: deklaracja zakończonej sesji z datą.
- Wynik oczekiwany: Lokalny obiekt ma completed i niepustą date_end; wyzwalacz nie jest uruchamiany.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 2.711 ms.
- Plik i linia: [src/test/productionHardening.test.ts:11](../../../../src/test/productionHardening.test.ts#L11).
- Pełna nazwa w Vitest: `Session Lifecycle completed sessions must have date_end (enforced by DB trigger)`.
- Ograniczenia: Sprawdza lokalny obiekt lub filtrowanie tablicy. Mimo nazwy testu nie uruchamia wyzwalacza ani zapytania historii.

### T3-HARD-002 — Model filtra historii zakończonych sesji

- Cel: Weryfikacja: model filtra historii zakończonych sesji.
- Wynik oczekiwany: Lokalne filtrowanie pozostawia wyłącznie zakończoną sesję o identyfikatorze 1.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 1.537 ms.
- Plik i linia: [src/test/productionHardening.test.ts:22](../../../../src/test/productionHardening.test.ts#L22).
- Pełna nazwa w Vitest: `Session Lifecycle draft/active sessions should not appear in history queries`.
- Ograniczenia: Sprawdza lokalny obiekt lub filtrowanie tablicy. Mimo nazwy testu nie uruchamia wyzwalacza ani zapytania historii.

## T4: IndexedDB i synchronizacja offline

### T4-BANNER-001 — Automatyczna synchronizacja po zakończeniu w innej instancji hooka

- Cel: Weryfikacja: automatyczna synchronizacja po zakończeniu w innej instancji hooka.
- Wynik oczekiwany: Aktywna sesja nie jest wysyłana; zakończenie uruchamia jedno RPC i sprząta dane po sukcesie.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: komponentowy; środowisko: jsdom. Czas raportera: 126.718 ms.
- Plik i linia: [src/test/offlineIndicator.test.tsx:24](../../../../src/test/offlineIndicator.test.tsx#L24).
- Pełna nazwa w Vitest: `OfflineIndicator synchronization triggers syncs a session completed by another hook instance while already online`.
- Ograniczenia: Rzeczywisty komponent i hook; jsdom, fake-indexeddb i mock RPC. Komunikat workera jest sztucznym zdarzeniem.

### T4-BANNER-002 — Ponowienie synchronizacji przez komunikat Service Workera

- Cel: Weryfikacja: ponowienie synchronizacji przez komunikat service workera.
- Wynik oczekiwany: Błąd zachowuje sesję; ponowienie działa, a nakładające się żądania nie są uruchamiane.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: komponentowy; środowisko: jsdom. Czas raportera: 247.372 ms.
- Plik i linia: [src/test/offlineIndicator.test.tsx:41](../../../../src/test/offlineIndicator.test.tsx#L41).
- Pełna nazwa w Vitest: `OfflineIndicator synchronization triggers shows a failed startup sync, then accepts a service-worker retry without overlapping requests`.
- Ograniczenia: Rzeczywisty komponent i hook; jsdom, fake-indexeddb i mock RPC. Komunikat workera jest sztucznym zdarzeniem.

### T4-IDB-001 — Synchronizacja szczegółów OFF-WALL przed czyszczeniem

- Cel: Weryfikacja: synchronizacja szczegółów off-wall przed czyszczeniem.
- Wynik oczekiwany: RPC otrzymuje ćwiczenie, protokół i dwie serie; rekordy lokalne są usuwane dopiero po potwierdzeniu.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: integracyjny; środowisko: jsdom. Czas raportera: 75.337 ms.
- Plik i linia: [src/test/offlineSync.test.tsx:41](../../../../src/test/offlineSync.test.tsx#L41).
- Pełna nazwa w Vitest: `offline storage and synchronization uploads OFF-WALL exercises and sets and only then removes local records`.
- Ograniczenia: Rzeczywisty hook i moduł synchronizacji; fake-indexeddb oraz mock RPC. Brak rzeczywistego dysku, przeglądarki, sieci i serwera Supabase.

### T4-IDB-002 — Synchronizacja logów ON-WALL

- Cel: Weryfikacja: synchronizacja logów on-wall.
- Wynik oczekiwany: RPC otrzymuje completed, date_end, obiekt i log; lokalny log znika po sukcesie.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: integracyjny; środowisko: jsdom. Czas raportera: 17.525 ms.
- Plik i linia: [src/test/offlineSync.test.tsx:63](../../../../src/test/offlineSync.test.tsx#L63).
- Pełna nazwa w Vitest: `offline storage and synchronization uploads ON-WALL logs and completed status`.
- Ograniczenia: Rzeczywisty hook i moduł synchronizacji; fake-indexeddb oraz mock RPC. Brak rzeczywistego dysku, przeglądarki, sieci i serwera Supabase.

### T4-IDB-003 — Ponowienie po błędzie serwera

- Cel: Weryfikacja: ponowienie po błędzie serwera.
- Wynik oczekiwany: Sesja, ćwiczenie i dwie serie pozostają po błędzie; poprawne ponowienie używa tego samego klucza offline.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: integracyjny; środowisko: jsdom. Czas raportera: 19.148 ms.
- Plik i linia: [src/test/offlineSync.test.tsx:76](../../../../src/test/offlineSync.test.tsx#L76).
- Pełna nazwa w Vitest: `offline storage and synchronization keeps every local record after server error and allows retry`.
- Ograniczenia: Rzeczywisty hook i moduł synchronizacji; fake-indexeddb oraz mock RPC. Brak rzeczywistego dysku, przeglądarki, sieci i serwera Supabase.

### T4-IDB-004 — Ponowienie po błędzie sieci

- Cel: Weryfikacja: ponowienie po błędzie sieci.
- Wynik oczekiwany: Odrzucone żądanie zachowuje dane lokalne; poprawne ponowienie używa tego samego klucza offline.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: integracyjny; środowisko: jsdom. Czas raportera: 16.039 ms.
- Plik i linia: [src/test/offlineSync.test.tsx:76](../../../../src/test/offlineSync.test.tsx#L76).
- Pełna nazwa w Vitest: `offline storage and synchronization keeps every local record after network error and allows retry`.
- Ograniczenia: Rzeczywisty hook i moduł synchronizacji; fake-indexeddb oraz mock RPC. Brak rzeczywistego dysku, przeglądarki, sieci i serwera Supabase.

### T4-IDB-005 — Ponowienie po braku potwierdzenia zapisu

- Cel: Weryfikacja: ponowienie po braku potwierdzenia zapisu.
- Wynik oczekiwany: Brak identyfikatora z serwera zachowuje dane lokalne i umożliwia ponowienie.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: integracyjny; środowisko: jsdom. Czas raportera: 14.826 ms.
- Plik i linia: [src/test/offlineSync.test.tsx:76](../../../../src/test/offlineSync.test.tsx#L76).
- Pełna nazwa w Vitest: `offline storage and synchronization keeps every local record after missing confirmation and allows retry`.
- Ograniczenia: Rzeczywisty hook i moduł synchronizacji; fake-indexeddb oraz mock RPC. Brak rzeczywistego dysku, przeglądarki, sieci i serwera Supabase.

### T4-IDB-006 — Ochrona aktywnej i cudzej sesji offline

- Cel: Weryfikacja: ochrona aktywnej i cudzej sesji offline.
- Wynik oczekiwany: Żadna z tych sesji nie jest wysyłana ani usuwana.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: integracyjny; środowisko: jsdom. Czas raportera: 7.079 ms.
- Plik i linia: [src/test/offlineSync.test.tsx:93](../../../../src/test/offlineSync.test.tsx#L93).
- Pełna nazwa w Vitest: `offline storage and synchronization does not upload or delete an active session or another user's session`.
- Ograniczenia: Rzeczywisty hook i moduł synchronizacji; fake-indexeddb oraz mock RPC. Brak rzeczywistego dysku, przeglądarki, sieci i serwera Supabase.

### T4-IDB-007 — Błąd lokalnego odczytu serii

- Cel: Weryfikacja: błąd lokalnego odczytu serii.
- Wynik oczekiwany: Błąd nie jest zamieniany na pusty payload; RPC nie jest wywoływane i sesja pozostaje.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: integracyjny; środowisko: jsdom. Czas raportera: 8.636 ms.
- Plik i linia: [src/test/offlineSync.test.tsx:103](../../../../src/test/offlineSync.test.tsx#L103).
- Pełna nazwa w Vitest: `offline storage and synchronization does not treat a local read failure as an empty payload`.
- Ograniczenia: Rzeczywisty hook i moduł synchronizacji; fake-indexeddb oraz mock RPC. Brak rzeczywistego dysku, przeglądarki, sieci i serwera Supabase.

### T4-IDB-008 — Atomowość lokalnego kończenia po błędzie serii

- Cel: Weryfikacja: atomowość lokalnego kończenia po błędzie serii.
- Wynik oczekiwany: Błąd późniejszej serii wycofuje zastępowanie; stare dane pozostają w całości.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: integracyjny; środowisko: jsdom. Czas raportera: 7.927 ms.
- Plik i linia: [src/test/offlineSync.test.tsx:113](../../../../src/test/offlineSync.test.tsx#L113).
- Pełna nazwa w Vitest: `offline storage and synchronization rolls back the entire local completion if a later set cannot be written`.
- Ograniczenia: Rzeczywisty hook i moduł synchronizacji; fake-indexeddb oraz mock RPC. Brak rzeczywistego dysku, przeglądarki, sieci i serwera Supabase.

### T4-IDB-009 — Atomowość lokalnego czyszczenia

- Cel: Weryfikacja: atomowość lokalnego czyszczenia.
- Wynik oczekiwany: Błąd usuwania serii zachowuje całą sesję; poprawne ponowienie kończy synchronizację.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: integracyjny; środowisko: jsdom. Czas raportera: 13.828 ms.
- Plik i linia: [src/test/offlineSync.test.tsx:129](../../../../src/test/offlineSync.test.tsx#L129).
- Pełna nazwa w Vitest: `offline storage and synchronization rolls back local cleanup if deleting a set fails, then retries safely`.
- Ograniczenia: Rzeczywisty hook i moduł synchronizacji; fake-indexeddb oraz mock RPC. Brak rzeczywistego dysku, przeglądarki, sieci i serwera Supabase.

### T4-IDB-010 — Powiadamianie innej instancji hooka

- Cel: Weryfikacja: powiadamianie innej instancji hooka.
- Wynik oczekiwany: pendingCount drugiej instancji zmienia się z 0 na 1 po zakończeniu sesji.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: integracyjny; środowisko: jsdom. Czas raportera: 87.505 ms.
- Plik i linia: [src/test/offlineSync.test.tsx:148](../../../../src/test/offlineSync.test.tsx#L148).
- Pełna nazwa w Vitest: `offline storage and synchronization notifies other hook instances when a session becomes ready to sync`.
- Ograniczenia: Rzeczywisty hook i moduł synchronizacji; fake-indexeddb oraz mock RPC. Brak rzeczywistego dysku, przeglądarki, sieci i serwera Supabase.

### T4-IDB-011 — Rozpoznanie abortu po udanym ostatnim put

- Cel: Weryfikacja: rozpoznanie abortu po udanym ostatnim put.
- Wynik oczekiwany: Zapis zgłasza niepowodzenie, a poprzednie metadane, ćwiczenie i serie pozostają.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: integracyjny; środowisko: jsdom. Czas raportera: 11.090 ms.
- Plik i linia: [src/test/offlineSync.test.tsx:158](../../../../src/test/offlineSync.test.tsx#L158).
- Pełna nazwa w Vitest: `offline storage and synchronization does not report success when IndexedDB aborts after the last put succeeds`.
- Ograniczenia: Rzeczywisty hook i moduł synchronizacji; fake-indexeddb oraz mock RPC. Brak rzeczywistego dysku, przeglądarki, sieci i serwera Supabase.

### T4-IDB-012 — Brak sesji i ponowne lokalne zakończenie

- Cel: Weryfikacja: brak sesji i ponowne lokalne zakończenie.
- Wynik oczekiwany: Nieistniejąca sesja jest odrzucona; ponowienie nie powiela ćwiczeń ani serii.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: integracyjny; środowisko: jsdom. Czas raportera: 10.654 ms.
- Plik i linia: [src/test/offlineSync.test.tsx:178](../../../../src/test/offlineSync.test.tsx#L178).
- Pełna nazwa w Vitest: `offline storage and synchronization rejects completion of a missing session and replaces children on local retry`.
- Ograniczenia: Rzeczywisty hook i moduł synchronizacji; fake-indexeddb oraz mock RPC. Brak rzeczywistego dysku, przeglądarki, sieci i serwera Supabase.

## T5: PWA, Service Worker i konfiguracja produkcyjna

### T5-EX-001 — Kontrolna asercja uruchomienia Vitest

- Cel: Weryfikacja: kontrolna asercja uruchomienia vitest.
- Wynik oczekiwany: Asercja true równe true przechodzi; nie jest sprawdzana funkcja aplikacji.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: jsdom. Czas raportera: 1.569 ms.
- Plik i linia: [src/test/example.test.ts:4](../../../../src/test/example.test.ts#L4).
- Pełna nazwa w Vitest: `example should pass`.
- Ograniczenia: Asercja kontrolna true === true; brak pokrycia funkcjonalnego aplikacji.

### T5-PWA-001 — Artefakty buildu, manifest i rozmiary ikon

- Cel: Weryfikacja: artefakty buildu, manifest i rozmiary ikon.
- Wynik oczekiwany: Build emituje sw.js bez placeholderów, a ikony PNG mają wymiary zgodne z manifestem.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: integracyjny; środowisko: node. Czas raportera: 3.975 ms.
- Plik i linia: [src/test/pwa.test.ts:74](../../../../src/test/pwa.test.ts#L74).
- Pełna nazwa w Vitest: `production PWA emits executable sw.js with no build placeholders and matching icon files and dimensions`.
- Ograniczenia: Rzeczywisty build w pamięci; worker w node:vm, CacheStorage i sieć zastąpione symulatorem. Bez rejestracji, instalacji PWA i cyklu życia workera w przeglądarce.

### T5-PWA-002 — Cache aplikacji po symulowanej utracie sieci

- Cel: Weryfikacja: cache aplikacji po symulowanej utracie sieci.
- Wynik oczekiwany: Zasymulowany worker zwraca HTML oraz wszystkie zbudowane JS, CSS i obrazy z pamięci cache.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: node. Czas raportera: 15.471 ms.
- Plik i linia: [src/test/pwa.test.ts:85](../../../../src/test/pwa.test.ts#L85).
- Pełna nazwa w Vitest: `production PWA precaches every emitted JS/CSS/image and serves the app and scripts after losing the network`.
- Ograniczenia: Rzeczywisty build w pamięci; worker w node:vm, CacheStorage i sieć zastąpione symulatorem. Bez rejestracji, instalacji PWA i cyklu życia workera w przeglądarce.

### T5-PWA-003 — Brak zasobu podczas instalacji workera

- Cel: Weryfikacja: brak zasobu podczas instalacji workera.
- Wynik oczekiwany: Instalacja w symulatorze kończy się błędem precache, zamiast potwierdzać kompletność cache.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: node. Czas raportera: 2.183 ms.
- Plik i linia: [src/test/pwa.test.ts:100](../../../../src/test/pwa.test.ts#L100).
- Pełna nazwa w Vitest: `production PWA fails installation if a precache resource is missing`.
- Ograniczenia: Rzeczywisty build w pamięci; worker w node:vm, CacheStorage i sieć zastąpione symulatorem. Bez rejestracji, instalacji PWA i cyklu życia workera w przeglądarce.

### T5-PWA-004 — Wyłączenie żądań API i zewnętrznych z obsługi cache

- Cel: Weryfikacja: wyłączenie żądań api i zewnętrznych z obsługi cache.
- Wynik oczekiwany: Worker nie przechwytuje Supabase, innych originów, metod innych niż GET ani przykładowego API.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: node. Czas raportera: 1.429 ms.
- Plik i linia: [src/test/pwa.test.ts:105](../../../../src/test/pwa.test.ts#L105).
- Pełna nazwa w Vitest: `production PWA leaves Supabase, cross-origin, non-GET and same-origin API requests to the network`.
- Ograniczenia: Rzeczywisty build w pamięci; worker w node:vm, CacheStorage i sieć zastąpione symulatorem. Bez rejestracji, instalacji PWA i cyklu życia workera w przeglądarce.

### T5-PWA-005 — Sprzątanie własnych cache i sygnał synchronizacji

- Cel: Weryfikacja: sprzątanie własnych cache i sygnał synchronizacji.
- Wynik oczekiwany: Usuwany jest stary cache aplikacji, cudzy pozostaje; klient otrzymuje SYNC_SESSIONS.
- Wynik rzeczywisty: **PASS**. Vitest zarejestrował passed dla tego konkretnego przypadku.
- Rodzaj: symulacyjny; środowisko: node. Czas raportera: 5.933 ms.
- Plik i linia: [src/test/pwa.test.ts:114](../../../../src/test/pwa.test.ts#L114).
- Pełna nazwa w Vitest: `production PWA cleans up only app caches and forwards background sync to the app`.
- Ograniczenia: Rzeczywisty build w pamięci; worker w node:vm, CacheStorage i sieć zastąpione symulatorem. Bez rejestracji, instalacji PWA i cyklu życia workera w przeglądarce.
