# Podsumowanie testowania i ograniczenia

Przebieg: 2026-10-25T16-10-41-635Z_7cf8db65. Data: niedziela, 25 października 2026 17:10:41 CET. Commit bazowy: `7cf8db659eb627a0e2a3014c2a3ad50d1e5875e0`.

## Zestawienie kategorii

| Kategoria | Liczba | PASS | FAIL | SKIP | NOT_RUN | Wykonane | Powodzenie |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T1: Algorytmy i analityka | 158 | 158 | 0 | 0 | 0 | 158 | 100,00% |
| T2: Funkcjonalności aplikacji i interfejs użytkownika | 101 | 101 | 0 | 0 | 0 | 101 | 100,00% |
| T3: Baza danych, integralność i bezpieczeństwo | 13 | 13 | 0 | 0 | 0 | 13 | 100,00% |
| T4: IndexedDB i synchronizacja offline | 14 | 14 | 0 | 0 | 0 | 14 | 100,00% |
| T5: PWA, Service Worker i konfiguracja produkcyjna | 6 | 6 | 0 | 0 | 0 | 6 | 100,00% |
| T6: Testy manualne i rzeczywiste treningi | 36 | 0 | 0 | 0 | 36 | 0 | nie dotyczy |

Automatyczne: 292; manualne zaplanowane: 36. Testy manualne zaliczone: 0. Automatyczne powodzenie: 100,00%. Powodzenie manualnych wykonanych: nie dotyczy. Mianownik powodzenia = PASS + FAIL. SKIP i NOT_RUN nie zwiększają mianownika. Gdy mianownik wynosi 0, wynikiem jest „nie dotyczy”, a nie 0% ani 100%.

## Rodzaje dowodów

| Rodzaj dowodu automatycznego | Liczba | PASS | FAIL | SKIP | NOT_RUN |
| --- | --- | --- | --- | --- | --- |
| jednostkowy | 190 | 190 | 0 | 0 | 0 |
| symulacyjny | 71 | 71 | 0 | 0 | 0 |
| integracyjny | 24 | 24 | 0 | 0 | 0 |
| komponentowy | 7 | 7 | 0 | 0 | 0 |

Test komponentowy działa w jsdom, nie na fizycznym urządzeniu. Test integracyjny może łączyć rzeczywiste moduły z fake-indexeddb lub mockiem RPC. Test symulacyjny obejmuje zarówno modele zachowania, jak i deklaracje/placeholdery; nie należy utożsamiać tych przypadków z dowodami działania pełnego systemu. Szczegóły każdego ograniczenia są przy ID w raporcie automatycznym.

## Oddzielna ocena narzędzi

| Kontrola | Polecenie | Status | Kod | Czas [ms] | Początek UTC |
| --- | --- | --- | --- | --- | --- |
| CTRL-TEST | npm test -- --reporter=default --reporter=json --outputFile.json=<przebieg>/vitest-results.json --includeTaskLocation | PASS | 0 | 25148 | 2026-10-25T16:10:42.459Z |
| CTRL-BUILD | npm run build | PASS | 0 | 14406 | 2026-10-25T16:11:07.610Z |
| CTRL-LINT | npm run lint | FAIL | 1 | 6453 | 2026-10-25T16:11:22.018Z |

## Zidentyfikowane problemy i granice wnioskowania

- Wynik linta: FAIL; 16 błędów i 12 ostrzeżeń. Nie zmieniano logiki ani istniejących testów w celu wymuszenia PASS.
- auth.test.ts sprawdza lokalne deklaracje i mock nawigacji; nie wykonuje rzeczywistego logowania ani ochrony tras.
- templates.test.ts i listPager.test.ts sprawdzają kopie logiki. Zmiana produkcyjnej implementacji może nie spowodować ich niepowodzenia.
- sessionPersistence.test.ts używa mocka localStorage bez rzeczywistej nawigacji. Test braku śladów enumeruje obiekt metod mocka, a nie jego wewnętrzny magazyn; test zakończenia nie sprawdza zapisu do bazy.
- example.test.ts i test położenia toastu są asercjami true === true. Test opisany jako 3-sekundowe zamykanie toastu nie mierzy czasu.
- productionHardening.test.ts nie uruchamia wyzwalacza w pierwszych dwóch przypadkach. Jego lokalny model stref używa innych progów niż rzeczywista analityka.
- atomicSessionSave.test.ts uruchamia lokalny PostgreSQL/PGlite z rzeczywistą funkcją i wyzwalaczem, ale z uproszczonym schematem oraz politykami RLS z fixture. Nie jest audytem aktualnego schematu, uprawnień i RLS produkcyjnego Supabase.
- Testy offline nie sprawdzają trwałości na dysku fizycznego telefonu, limitów quota, przerwania procesu systemowego ani rzeczywistej sieci.
- Testy PWA wykonują build, lecz worker działa w node:vm z symulowaną siecią i cache. Instalacja PWA, aktualizacja na Android/iOS i responsywność wymagają T6.
- Brak pomiaru pokrycia instrukcji/gałęzi, obciążenia, dostępności WCAG, statystycznej niezawodności, trafności sportowej i klinicznej wskazówek. Odsetek PASS nie jest procentem pokrycia ani prawdopodobieństwem bezawaryjności.
- Wszystkie poprzednie deklaracje z rozmowy o produkcji lub treningach są poza dowodami tego przebiegu. Nie zostały przepisane jako wyniki manualne.

## Kompletność i odtwarzalność

Inwentaryzacja, klucze pełnych nazw, liczba przypadków i katalog są zgodne. Nie pominięto istniejących przypadków.

Każdy przebieg zachowuje surowy JSON, wyjścia poleceń, metadane, inwentaryzację i manifest SHA-256. Raporty oraz snapshot wyników ręcznych są przechowywane w history/2026-10-25T16-10-41-635Z_7cf8db65/. Plik LATEST_RUN.txt wskazuje bieżący przebieg; historia nie jest nadpisywana. Zmiana commita, zależności, systemu, czasu lub niezatwierdzonych plików może zmienić wynik.

## Wniosek do rozdziału 4

W badanym lokalnym przebiegu wykonano 292 z 292 zinwentaryzowanych przypadków automatycznych, z czego 292 zakończyło się powodzeniem i 0 niepowodzeniem. Kontrole kompilacji i analizy statycznej oceniono oddzielnie. Wyniki potwierdzają spełnienie asercji w opisanym środowisku i zakresie, a nie pełną poprawność wdrożenia produkcyjnego. Bez uzupełnienia protokołów T6 nie można sformułować potwierdzonego wniosku o działaniu na rzeczywistych urządzeniach ani o wykorzystaniu podczas rzeczywistych treningów.
