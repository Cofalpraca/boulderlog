# Scenariusze manualne i rzeczywiste treningi

Liczba scenariuszy: 36. Stan według wprowadzonych protokołów: PASS=0, FAIL=0, SKIP=0, NOT_RUN=36. Generator nie wykonuje testów na urządzeniach.

## Zasady wykonania i uzupełniania

1. Użyj kontrolowanego środowiska testowego/staging i kont testowych. Operacje modyfikujące Supabase wykonuj wyłącznie tam; ten plan nie upoważnia do zmiany produkcyjnych danych. W razie braku środowiska oznacz NOT_RUN i wpisz powód.
2. Zapisz wersję aplikacji/commit badanego wdrożenia, model fizycznego urządzenia, system, przeglądarkę, rozmiar widoku i warunki sieci. Emulacja w DevTools nie zastępuje fizycznego urządzenia.
3. Wykonaj wszystkie kroki, porównaj stan z niezależnym zapisem. Zachowaj zanonimizowane zrzuty, logi lub dziennik; nie zapisuj haseł, tokenów, kluczy service_role ani prywatnych danych medycznych.
4. Uzupełnij wpis danego ID w [manual-results.json](manual-results.json): status, actual, date (ISO 8601 ze strefą), device, executor, evidence, environment, commit i notes. Puste pola w tym dokumencie służą jako formularz roboczy.
5. PASS lub FAIL wymaga rzeczywistej obserwacji, daty, urządzenia, wykonawcy i odnośnika do dowodu. SKIP wymaga przyczyny w notes. Brak wykonania to NOT_RUN. Nie zastępuj obserwacji wynikiem automatycznym.
6. Po uzupełnieniu JSON uruchom npm run test:report. Powstanie nowa historia i aktualne raporty. Ręczne zmiany w wygenerowanym Markdown mogą zostać zastąpione; trwałym źródłem wyników jest manual-results.json.

Każdy scenariusz jest zliczany raz w T6; pole powiązań nie zwiększa liczebności T1–T5. Jeżeli wymagany wariant urządzenia nie został sprawdzony, nie przypisuj mu wyniku z innej platformy. Dalsze powtórzenia i warianty zapisuj jako osobne obserwacje w dowodzie; nie dodawaj ich automatycznie do mianownika.

## T6-MAN-001 — ON-WALL: zapis treningu online

- Rodzaj: manualny — rzeczywiste urządzenie. Powiązania merytoryczne: T2, T3.
- Cel: Sprawdzenie kompletnej ścieżki od rozpoczęcia sesji wspinaczkowej do historii i analityki.
- Warunki wstępne: Środowisko testowe, zalogowany użytkownik A, obiekt z poprawnymi mapowaniami, działająca sieć.
- Powiązane źródła: src/pages/SessionNew.tsx; src/pages/BoulderSession.tsx; src/pages/SessionHistory.tsx. Brak automatycznego pliku wykonującego ten scenariusz.

1. Zapisz wersję aplikacji, urządzenia i przeglądarki oraz stan historii przed testem.
2. Rozpocznij ON-WALL i wybierz obiekt. Dodaj trzy przejścia o dwóch stopniach, znaczniki i notatkę; zapisz niezależną listę danych.
3. Zakończ sesję, ustaw RPE i zmęczenie, potwierdź zapis.
4. Otwórz historię i szczegóły sesji, odśwież stronę, a następnie sprawdź właściwy okres analityki.
5. Porównaj liczbę sesji, daty, stopnie, liczbę przejść, obiekt i notatki z niezależnym zapisem.

Wynik oczekiwany: Dokładnie jedna zakończona sesja z datą końca; komplet danych po odświeżeniu; zgodna objętość w historii i odpowiedniej analityce.

| Pole protokołu | Wartość |
| --- | --- |
| Status | NOT_RUN |
| Wynik rzeczywisty |  |
| Data i godzina wykonania |  |
| Model urządzenia, OS, przeglądarka, widok |  |
| Środowisko i URL |  |
| Wersja aplikacji / commit |  |
| Wykonawca |  |
| Dowód / plik dziennika |  |
| Uwagi / powód braku wykonania |  |

## T6-MAN-002 — OFF-WALL: ćwiczenia, protokoły i serie online

- Rodzaj: manualny — rzeczywiste urządzenie. Powiązania merytoryczne: T2, T3.
- Cel: Ocena zapisu rzeczywistej sesji siłowej i jej widoczności po zakończeniu.
- Warunki wstępne: Testowy użytkownik A, dostępne ćwiczenia i protokół; aktywna sieć.
- Powiązane źródła: src/pages/StrengthSession.tsx; supabase/migrations/20261025120000_atomic_session_save.sql. Brak automatycznego pliku wykonującego ten scenariusz.

1. Rozpocznij OFF-WALL. Dodaj dwa ćwiczenia, w tym jedno z protokołem i jedno czasowe.
2. Uzupełnij serie o powtórzenia, czas, ciężar (także 0) i RPE. Oznacz ukończone serie; pozostaw jedną nieukończoną. Zapisz wartości niezależnie.
3. Zakończ trening i zaczekaj na potwierdzenie.
4. Otwórz historię i szczegóły, następnie przeładuj stronę.
5. Porównaj wszystkie ukończone serie i protokół; sprawdź status completed i datę końca w testowym środowisku.

Wynik oczekiwany: Jedna zakończona sesja OFF-WALL widoczna po odświeżeniu, z właściwymi ćwiczeniami, protokołem, kolejnością i ukończonymi seriami.

| Pole protokołu | Wartość |
| --- | --- |
| Status | NOT_RUN |
| Wynik rzeczywisty |  |
| Data i godzina wykonania |  |
| Model urządzenia, OS, przeglądarka, widok |  |
| Środowisko i URL |  |
| Wersja aplikacji / commit |  |
| Wykonawca |  |
| Dowód / plik dziennika |  |
| Uwagi / powód braku wykonania |  |

## T6-MAN-003 — Walidacja pustych sesji

- Rodzaj: manualny — rzeczywiste urządzenie. Powiązania merytoryczne: T2.
- Cel: Sprawdzenie komunikatów i braku fałszywego sukcesu.
- Warunki wstępne: Testowe konto; osobno sesja ON-WALL i OFF-WALL.
- Powiązane źródła: src/pages/BoulderSession.tsx; src/pages/StrengthSession.tsx. Brak automatycznego pliku wykonującego ten scenariusz.

1. Spróbuj zakończyć ON-WALL bez przejść.
2. Spróbuj zakończyć OFF-WALL bez ćwiczeń, a następnie z ćwiczeniem bez ukończonej serii.
3. Sprawdź komunikat, zachowanie formularza i historię.
4. Dodaj wymagane dane i sprawdź możliwość poprawnego zakończenia.

Wynik oczekiwany: Pusta sesja nie zostaje przedstawiona jako poprawnie zakończona; komunikat wyjaśnia brakujące dane, a formularz pozwala kontynuować.

| Pole protokołu | Wartość |
| --- | --- |
| Status | NOT_RUN |
| Wynik rzeczywisty |  |
| Data i godzina wykonania |  |
| Model urządzenia, OS, przeglądarka, widok |  |
| Środowisko i URL |  |
| Wersja aplikacji / commit |  |
| Wykonawca |  |
| Dowód / plik dziennika |  |
| Uwagi / powód braku wykonania |  |

## T6-MAN-004 — Odtworzenie rozpoczętej sesji

- Rodzaj: manualny — rzeczywiste urządzenie. Powiązania merytoryczne: T2, T4.
- Cel: Sprawdzenie trwałości stanu w rzeczywistej przeglądarce.
- Warunki wstępne: Oddzielny profil testowy; sesje obu typów; niezależnie zapisane dane wejściowe.
- Powiązane źródła: src/hooks/useSessionPersistence.ts; src/contexts/ActiveSessionContext.tsx. Brak automatycznego pliku wykonującego ten scenariusz.

1. Dodaj dane w aktywnej sesji, nie kończ jej.
2. Przełącz kartę lub aplikację, zablokuj i odblokuj ekran.
3. Przejdź wstecz i wróć do sesji; wykonaj przeładowanie.
4. Za każdym razem porównaj pola, listy i wartości z zapisem kontrolnym; powtórz dla OFF-WALL.

Wynik oczekiwany: Stan odtwarza się bez utraty i powielenia danych; ewentualny brak odtwarzania należy zarejestrować jako FAIL, niezależnie od testów localStorage.

| Pole protokołu | Wartość |
| --- | --- |
| Status | NOT_RUN |
| Wynik rzeczywisty |  |
| Data i godzina wykonania |  |
| Model urządzenia, OS, przeglądarka, widok |  |
| Środowisko i URL |  |
| Wersja aplikacji / commit |  |
| Wykonawca |  |
| Dowód / plik dziennika |  |
| Uwagi / powód braku wykonania |  |

## T6-MAN-005 — Porzucenie i kontynuacja treningu

- Rodzaj: manualny — rzeczywiste urządzenie. Powiązania merytoryczne: T2, T4.
- Cel: Sprawdzenie obu ścieżek dialogu opuszczenia sesji.
- Warunki wstępne: Dane testowe obu typów sesji; osobny profil przeglądarki.
- Powiązane źródła: src/components/SessionExitConfirmation.tsx; src/hooks/useOfflineStorage.ts. Brak automatycznego pliku wykonującego ten scenariusz.

1. Wypełnij sesję i otwórz dialog wyjścia.
2. Wybierz kontynuację i sprawdź zachowanie danych.
3. Ponownie otwórz dialog i wybierz porzucenie.
4. Sprawdź historię, aktywną sesję i lokalne magazyny w profilu testowym; przeładuj aplikację.
5. Powtórz dla treningu rozpoczętego offline.

Wynik oczekiwany: Kontynuacja zachowuje stan; porzucenie nie tworzy zakończonej historii ani sesji do synchronizacji i nie proponuje odtworzenia porzuconych danych.

| Pole protokołu | Wartość |
| --- | --- |
| Status | NOT_RUN |
| Wynik rzeczywisty |  |
| Data i godzina wykonania |  |
| Model urządzenia, OS, przeglądarka, widok |  |
| Środowisko i URL |  |
| Wersja aplikacji / commit |  |
| Wykonawca |  |
| Dowód / plik dziennika |  |
| Uwagi / powód braku wykonania |  |

## T6-MAN-006 — Szablony ON-WALL i OFF-WALL

- Rodzaj: manualny — rzeczywiste urządzenie. Powiązania merytoryczne: T2.
- Cel: Sprawdzenie szablonów przez rzeczywisty interfejs.
- Warunki wstępne: Testowe konto i dane szablonów.
- Powiązane źródła: src/pages/Templates.tsx; src/test/templates.test.ts (jedynie model lokalny). Brak automatycznego pliku wykonującego ten scenariusz.

1. Otwórz szablon ON-WALL, sprawdź pola planu i brak zarządzania ćwiczeniami.
2. Otwórz OFF-WALL i dodaj testowe ćwiczenia oraz serie.
3. Zapisz, ponownie otwórz i uruchom sesję z obu typów szablonu.
4. Sprawdź właściwą trasę i przeniesienie danych; sprawdź dostępność usuwania szablonu systemowego.

Wynik oczekiwany: Szablony zachowują właściwe dane i uruchamiają odpowiedni typ sesji; szablon systemowy jest chroniony zgodnie z regułami interfejsu.

| Pole protokołu | Wartość |
| --- | --- |
| Status | NOT_RUN |
| Wynik rzeczywisty |  |
| Data i godzina wykonania |  |
| Model urządzenia, OS, przeglądarka, widok |  |
| Środowisko i URL |  |
| Wersja aplikacji / commit |  |
| Wykonawca |  |
| Dowód / plik dziennika |  |
| Uwagi / powód braku wykonania |  |

## T6-MAN-007 — Import historii z walidacją

- Rodzaj: manualny — rzeczywiste urządzenie. Powiązania merytoryczne: T1, T2, T3.
- Cel: Ocena rzeczywistego importu, historii i agregacji.
- Warunki wstępne: Puste lub udokumentowane konto w środowisku testowym; kopia danych wejściowych.
- Powiązane źródła: src/pages/ImportHistory.tsx; src/lib/importParser.ts. Brak automatycznego pliku wykonującego ten scenariusz.

1. Przygotuj dwa poprawne wiersze z datami z ostatnich 90 dni i jeden błędny wiersz.
2. Wklej dane do importu i sprawdź podgląd, numer błędnego wiersza i sumy przejść.
3. Popraw błąd i wykonaj import wyłącznie w środowisku testowym.
4. Sprawdź historię, szczegóły, poziom i agregacje; porównaj z sumami policzonymi niezależnie.
5. Powtórz próbę na tym samym materiale i zanotuj zachowanie wobec duplikatów bez zakładania ich automatycznej eliminacji.

Wynik oczekiwany: Poprawne dane zachowują daty i przejścia, błędne wiersze mają czytelną diagnostykę; zakończone importy są widoczne w historii i odpowiedniej analityce.

| Pole protokołu | Wartość |
| --- | --- |
| Status | NOT_RUN |
| Wynik rzeczywisty |  |
| Data i godzina wykonania |  |
| Model urządzenia, OS, przeglądarka, widok |  |
| Środowisko i URL |  |
| Wersja aplikacji / commit |  |
| Wykonawca |  |
| Dowód / plik dziennika |  |
| Uwagi / powód braku wykonania |  |

## T6-MAN-008 — Mapowania stopni w obiektach

- Rodzaj: manualny — rzeczywiste urządzenie. Powiązania merytoryczne: T1, T2.
- Cel: Sprawdzenie wpływu rzeczywistej konfiguracji mapowań na prezentację i obliczenia.
- Warunki wstępne: Testowe obiekty używające Font, V-Scale, kolorów i liczb.
- Powiązane źródła: src/lib/mappingHealth.ts; src/lib/analytics.ts; src/lib/volumeByGrade.ts. Brak automatycznego pliku wykonującego ten scenariusz.

1. Zapisz tabelę kontrolną etykiet, granic trudności i kolejności.
2. Dodaj mapowania w interfejsie i odśwież ekran.
3. Dodaj przejścia dla znanych etykiet i jednego stopnia bez mapowania.
4. Sprawdź kolejność, maksimum, objętość i diagnostykę braków; porównaj z tabelą kontrolną.

Wynik oczekiwany: Kolejność i wyniki są zgodne z mapowaniami; brak mapowania jest sygnalizowany i nie prowadzi do cichego przypisania błędnej trudności.

| Pole protokołu | Wartość |
| --- | --- |
| Status | NOT_RUN |
| Wynik rzeczywisty |  |
| Data i godzina wykonania |  |
| Model urządzenia, OS, przeglądarka, widok |  |
| Środowisko i URL |  |
| Wersja aplikacji / commit |  |
| Wykonawca |  |
| Dowód / plik dziennika |  |
| Uwagi / powód braku wykonania |  |

## T6-MAN-009 — Poziom wspinacza: minimum, limit i okno czasowe

- Rodzaj: manualny — rzeczywiste urządzenie. Powiązania merytoryczne: T1, T2.
- Cel: Niezależna kontrola danych widocznych użytkownikowi.
- Warunki wstępne: Środowisko testowe; przygotowana tabela przejść z datami i trudnościami; wartości stałych z src/lib/userLevel.ts.
- Powiązane źródła: src/lib/userLevel.ts; src/lib/userLevelCache.ts; src/pages/Analytics.tsx. Brak automatycznego pliku wykonującego ten scenariusz.

1. Przygotuj zestaw poniżej minimalnej liczby przejść; zapisz oczekiwany brak wyniku.
2. Rozszerz zestaw do minimum i powyżej limitu najtrudniejszych przejść. Oblicz wynik niezależnie według opisanej w kodzie metody i zachowaj arkusz obliczeń.
3. Dodaj sesję starszą niż 90 dni oraz OFF-WALL, aby sprawdzić ich wykluczenie.
4. Porównaj poziom, maksimum, liczbę użytych przejść i etykiety Font/V-Scale z widokiem po odświeżeniu.

Wynik oczekiwany: Prezentowane liczby odpowiadają niezależnym obliczeniom, progi minimum i wykluczenia są zachowane. Zgodność nie jest dowodem trafności sportowej modelu.

| Pole protokołu | Wartość |
| --- | --- |
| Status | NOT_RUN |
| Wynik rzeczywisty |  |
| Data i godzina wykonania |  |
| Model urządzenia, OS, przeglądarka, widok |  |
| Środowisko i URL |  |
| Wersja aplikacji / commit |  |
| Wykonawca |  |
| Dowód / plik dziennika |  |
| Uwagi / powód braku wykonania |  |

## T6-MAN-010 — Filtry historii i analityki

- Rodzaj: manualny — rzeczywiste urządzenie. Powiązania merytoryczne: T1, T2.
- Cel: Ocena spójności zakresów i typów treningów.
- Warunki wstępne: Testowe sesje obu typów z kilku tygodni i obiektów.
- Powiązane źródła: src/pages/SessionHistory.tsx; src/pages/Analytics.tsx; src/pages/Dashboard.tsx. Brak automatycznego pliku wykonującego ten scenariusz.

1. Zapisz listę kontrolną sesji, dat, obiektów i liczby przejść.
2. Zmieniaj zakres dat, typ sesji i obiekt w dostępnych widokach.
3. Porównaj listy i sumy z listą kontrolną.
4. Sprawdź OFF-WALL bez powiązania z obiektem i pusty zakres.

Wynik oczekiwany: Listy i sumy odpowiadają rzeczywistym filtrom, OFF-WALL jest obsługiwane zgodnie z wybranym typem i pusty zakres nie pokazuje starych danych.

| Pole protokołu | Wartość |
| --- | --- |
| Status | NOT_RUN |
| Wynik rzeczywisty |  |
| Data i godzina wykonania |  |
| Model urządzenia, OS, przeglądarka, widok |  |
| Środowisko i URL |  |
| Wersja aplikacji / commit |  |
| Wykonawca |  |
| Dowód / plik dziennika |  |
| Uwagi / powód braku wykonania |  |

## T6-MAN-011 — Notatki, RPE i zgłoszenie bólu

- Rodzaj: manualny — rzeczywiste urządzenie. Powiązania merytoryczne: T1, T2.
- Cel: Weryfikacja zapisu i prezentacji dodatkowych informacji.
- Warunki wstępne: Syntetyczne dane testowe, bez danych medycznych uczestników.
- Powiązane źródła: src/lib/painInsights.ts; src/pages/StrengthSession.tsx; src/pages/BoulderSession.tsx. Brak automatycznego pliku wykonującego ten scenariusz.

1. Wprowadź notatkę, RPE, zmęczenie, znacznik bólu oraz dostępne szczegóły.
2. Zakończ sesję i odśwież szczegóły oraz analitykę.
3. Powtórz z wyłączonym znacznikiem bólu i porównaj pola.
4. Sprawdź czy treść wskazówek odpowiada regułom, nie formułując wniosku o skuteczności medycznej.

Wynik oczekiwany: Dane są zachowane i prezentowane spójnie; pola zależne od znacznika nie zawierają przypadkowych danych z poprzedniej sesji.

| Pole protokołu | Wartość |
| --- | --- |
| Status | NOT_RUN |
| Wynik rzeczywisty |  |
| Data i godzina wykonania |  |
| Model urządzenia, OS, przeglądarka, widok |  |
| Środowisko i URL |  |
| Wersja aplikacji / commit |  |
| Wykonawca |  |
| Dowód / plik dziennika |  |
| Uwagi / powód braku wykonania |  |

## T6-MAN-012 — Rzeczywista rejestracja, logowanie i wylogowanie

- Rodzaj: manualny — rzeczywiste urządzenie. Powiązania merytoryczne: T2, T3.
- Cel: Sprawdzenie uwierzytelniania poza deklaratywnymi testami auth.test.ts.
- Warunki wstępne: Kontrolowany projekt testowy Supabase i testowe adresy e-mail; bez zmiany kont produkcyjnych.
- Powiązane źródła: src/pages/Login.tsx; src/pages/Register.tsx; src/contexts/AuthContext.tsx. Brak automatycznego pliku wykonującego ten scenariusz.

1. Przejdź do rejestracji i sprawdź walidację niepoprawnych danych.
2. Utwórz testowe konto zgodnie z konfiguracją potwierdzenia e-mail.
3. Zaloguj się poprawnymi danymi; sprawdź odrzucenie błędnych danych.
4. Wyloguj się i otwórz bezpośrednio chronioną trasę.
5. Sprawdź ścieżkę odzyskania hasła na koncie testowym.

Wynik oczekiwany: Operacje wymagają poprawnych danych i wymaganych potwierdzeń, a po wylogowaniu chronione dane nie są dostępne.

| Pole protokołu | Wartość |
| --- | --- |
| Status | NOT_RUN |
| Wynik rzeczywisty |  |
| Data i godzina wykonania |  |
| Model urządzenia, OS, przeglądarka, widok |  |
| Środowisko i URL |  |
| Wersja aplikacji / commit |  |
| Wykonawca |  |
| Dowód / plik dziennika |  |
| Uwagi / powód braku wykonania |  |

## T6-MAN-013 — RLS: odczyt danych dwóch użytkowników

- Rodzaj: manualny — rzeczywiste urządzenie. Powiązania merytoryczne: T3.
- Cel: Weryfikacja wdrożonych polityk w reprezentatywnym środowisku testowym.
- Warunki wstępne: Osobny projekt Supabase z wdrożonym schematem; konta A i B w różnych profilach; publiczny klient API bez service_role.
- Powiązane źródła: src/test/fixtures/sessionSchema.sql (polityki testowe); supabase/migrations/20261025120000_atomic_session_save.sql. Brak automatycznego pliku wykonującego ten scenariusz.

1. Przygotuj sesje obu typów należące do A i osobne do B wyłącznie w projekcie testowym; zapisz ich identyfikatory.
2. Jako B spróbuj odczytać znane identyfikatory sesji A przez UI i REST.
3. Sprawdź również boulder_logs, session_items, session_sets i session_gyms dla danych A.
4. Porównaj odpowiedzi z odczytem własnych danych B; zachowaj zredagowane statusy i treści odpowiedzi.

Wynik oczekiwany: B widzi własne dane i nie otrzymuje danych A. Sam pusty wynik jednej tabeli nie zastępuje sprawdzenia wszystkich powiązanych tabel.

| Pole protokołu | Wartość |
| --- | --- |
| Status | NOT_RUN |
| Wynik rzeczywisty |  |
| Data i godzina wykonania |  |
| Model urządzenia, OS, przeglądarka, widok |  |
| Środowisko i URL |  |
| Wersja aplikacji / commit |  |
| Wykonawca |  |
| Dowód / plik dziennika |  |
| Uwagi / powód braku wykonania |  |

## T6-MAN-014 — RLS: cudze modyfikacje i manipulacja identyfikatorem

- Rodzaj: manualny — rzeczywiste urządzenie. Powiązania merytoryczne: T3.
- Cel: Sprawdzenie izolacji zapisu, aktualizacji i usuwania.
- Warunki wstępne: Ten sam odizolowany projekt testowy i konta A/B; operacje modyfikujące wyłącznie dane testowe.
- Powiązane źródła: supabase/migrations/20261025120000_atomic_session_save.sql; testy RLS projektu testowego. Brak automatycznego pliku wykonującego ten scenariusz.

1. Zapisz stan sesji i szczegółów należących do A.
2. Jako B spróbuj zmienić i usunąć znaną sesję A przez REST oraz zakończyć ją przez RPC.
3. Spróbuj utworzyć szczegół powiązany z sesją A albo podmienić session_id/session_item_id w danych testowych.
4. Jako A ponownie odczytaj dane i porównaj stan przed i po.

Wynik oczekiwany: Nieuprawnione operacje nie zmieniają ani nie usuwają danych A; odpowiedzi i stan po operacjach potwierdzają izolację.

| Pole protokołu | Wartość |
| --- | --- |
| Status | NOT_RUN |
| Wynik rzeczywisty |  |
| Data i godzina wykonania |  |
| Model urządzenia, OS, przeglądarka, widok |  |
| Środowisko i URL |  |
| Wersja aplikacji / commit |  |
| Wykonawca |  |
| Dowód / plik dziennika |  |
| Uwagi / powód braku wykonania |  |

## T6-MAN-015 — RLS: anonimowość i dostęp do prywatnych powiązań

- Rodzaj: manualny — rzeczywiste urządzenie. Powiązania merytoryczne: T3.
- Cel: Sprawdzenie kompletnej kontroli właściciela i uprawnień RPC.
- Warunki wstępne: Projekt testowy; prywatne ćwiczenie, protokół i obiekt A; publiczny klucz klienta, bez service_role.
- Powiązane źródła: supabase/migrations/20261025120000_atomic_session_save.sql. Brak automatycznego pliku wykonującego ten scenariusz.

1. Bez sesji użytkownika spróbuj odczytu prywatnych danych i wywołania save_completed_session.
2. Jako B spróbuj zapisu z cudzym user_id, prywatnym ćwiczeniem, protokołem i obiektem A.
3. Po każdej próbie sprawdź brak częściowo utworzonych rekordów.
4. Zachowaj zredagowane odpowiedzi. Sprawdzaj faktyczne uprawnienia ról, nie zakładaj konkretnego kodu HTTP dla każdej konfiguracji.

Wynik oczekiwany: Brak prywatnych odczytów i nieuprawnionych zapisów; nie pozostają częściowe sesje ani szczegóły.

| Pole protokołu | Wartość |
| --- | --- |
| Status | NOT_RUN |
| Wynik rzeczywisty |  |
| Data i godzina wykonania |  |
| Model urządzenia, OS, przeglądarka, widok |  |
| Środowisko i URL |  |
| Wersja aplikacji / commit |  |
| Wykonawca |  |
| Dowód / plik dziennika |  |
| Uwagi / powód braku wykonania |  |

## T6-MAN-016 — ON-WALL offline i późniejsza synchronizacja

- Rodzaj: manualny — rzeczywiste urządzenie. Powiązania merytoryczne: T2, T4, T5.
- Cel: Ocena całej ścieżki offline na prawdziwym urządzeniu.
- Warunki wstępne: Środowisko testowe HTTPS; konto zalogowane; obiekt i mapowania wcześniej otwarte online.
- Powiązane źródła: src/hooks/useOfflineStorage.ts; src/lib/syncOfflineSessions.ts; src/components/OfflineIndicator.tsx. Brak automatycznego pliku wykonującego ten scenariusz.

1. Włącz tryb samolotowy lub odetnij sieć i sprawdź faktyczny brak połączenia.
2. Rozpocznij ON-WALL, dodaj przejścia, notatki i zakończ sesję; zapisz dane kontrolne.
3. Sprawdź komunikat lokalnego zapisu i obecność danych w IndexedDB profilu testowego.
4. Przywróć sieć, zaczekaj na synchronizację i odśwież historię.
5. Porównaj komplet danych i sprawdź brak duplikatów po ponownym otwarciu aplikacji.

Wynik oczekiwany: Trening pozostaje lokalnie do potwierdzenia; po synchronizacji istnieje jedna pełna sesja completed z datą końca.

| Pole protokołu | Wartość |
| --- | --- |
| Status | NOT_RUN |
| Wynik rzeczywisty |  |
| Data i godzina wykonania |  |
| Model urządzenia, OS, przeglądarka, widok |  |
| Środowisko i URL |  |
| Wersja aplikacji / commit |  |
| Wykonawca |  |
| Dowód / plik dziennika |  |
| Uwagi / powód braku wykonania |  |

## T6-MAN-017 — OFF-WALL offline z ćwiczeniami i seriami

- Rodzaj: manualny — rzeczywiste urządzenie. Powiązania merytoryczne: T2, T4.
- Cel: Sprawdzenie szczegółów treningu siłowego po rzeczywistej synchronizacji.
- Warunki wstępne: Środowisko testowe; uprzednio buforowane ćwiczenia; zapis kontrolny wszystkich wartości.
- Powiązane źródła: src/pages/StrengthSession.tsx; src/lib/syncOfflineSessions.ts. Brak automatycznego pliku wykonującego ten scenariusz.

1. Odetnij sieć i rozpocznij OFF-WALL.
2. Dodaj dwa ćwiczenia, serie z powtórzeniami, czasem i ciężarem, w tym wartości 0; zakończ trening.
3. Przeładuj aplikację bez sieci i sprawdź zachowanie zapisanych danych.
4. Przywróć sieć i zaczekaj na synchronizację.
5. Porównaj ćwiczenia, protokół, kolejność i serie w szczegółach oraz w projekcie testowym.

Wynik oczekiwany: Synchronizacja zachowuje wszystkie zapisane szczegóły ukończonych serii i tworzy jedną zakończoną sesję.

| Pole protokołu | Wartość |
| --- | --- |
| Status | NOT_RUN |
| Wynik rzeczywisty |  |
| Data i godzina wykonania |  |
| Model urządzenia, OS, przeglądarka, widok |  |
| Środowisko i URL |  |
| Wersja aplikacji / commit |  |
| Wykonawca |  |
| Dowód / plik dziennika |  |
| Uwagi / powód braku wykonania |  |

## T6-MAN-018 — Powrót sieci w trakcie aktywnej sesji offline

- Rodzaj: manualny — rzeczywiste urządzenie. Powiązania merytoryczne: T4.
- Cel: Sprawdzenie, czy synchronizacja nie wyprzedza zakończenia treningu.
- Warunki wstępne: Projekt i konto testowe; rozpoczęta sesja offline.
- Powiązane źródła: src/hooks/useOfflineStorage.ts; src/components/OfflineIndicator.tsx. Brak automatycznego pliku wykonującego ten scenariusz.

1. Dodaj dane w sesji offline, ale nie kończ treningu.
2. Przywróć sieć i sprawdź lokalny stan oraz historię.
3. Dodaj kolejne dane, a następnie zakończ sesję.
4. Sprawdź automatyczną synchronizację i komplet obu części danych.

Wynik oczekiwany: Aktywna sesja nie jest przedwcześnie usuwana ani publikowana jako zakończona; po zakończeniu synchronizuje się pełny stan.

| Pole protokołu | Wartość |
| --- | --- |
| Status | NOT_RUN |
| Wynik rzeczywisty |  |
| Data i godzina wykonania |  |
| Model urządzenia, OS, przeglądarka, widok |  |
| Środowisko i URL |  |
| Wersja aplikacji / commit |  |
| Wykonawca |  |
| Dowód / plik dziennika |  |
| Uwagi / powód braku wykonania |  |

## T6-MAN-019 — Utrata połączenia podczas synchronizacji i idempotencja

- Rodzaj: manualny — rzeczywiste urządzenie. Powiązania merytoryczne: T3, T4.
- Cel: Sprawdzenie ponowienia po niepewnym wyniku żądania.
- Warunki wstępne: Projekt testowy; narzędzie kontroli sieci lub proxy testowe; zapisane offline sesje obu typów.
- Powiązane źródła: src/lib/syncOfflineSessions.ts; supabase/migrations/20261025120000_atomic_session_save.sql. Brak automatycznego pliku wykonującego ten scenariusz.

1. Uruchom synchronizację na wolnym połączeniu.
2. Przerwij odpowiedź w chwili wysyłania; wykonaj także wariant, w którym serwer wykona zapis, ale odpowiedź nie dotrze do klienta.
3. Sprawdź lokalne dane i komunikat; przywróć sieć i ponów synchronizację.
4. Policz rekordy sesji i szczegółów w projekcie testowym; ponów przycisk i uruchom aplikację jeszcze raz.

Wynik oczekiwany: Dane nie znikają przed potwierdzeniem, a stały identyfikator offline zapobiega duplikatom po utraconej odpowiedzi.

| Pole protokołu | Wartość |
| --- | --- |
| Status | NOT_RUN |
| Wynik rzeczywisty |  |
| Data i godzina wykonania |  |
| Model urządzenia, OS, przeglądarka, widok |  |
| Środowisko i URL |  |
| Wersja aplikacji / commit |  |
| Wykonawca |  |
| Dowód / plik dziennika |  |
| Uwagi / powód braku wykonania |  |

## T6-MAN-020 — Błąd zapisu szczegółu i ponowienie

- Rodzaj: manualny — rzeczywiste urządzenie. Powiązania merytoryczne: T3, T4.
- Cel: Ocena zachowania przy błędzie serwera i atomowości.
- Warunki wstępne: Wyłącznie środowisko testowe z kontrolowanym błędem odpowiedzi lub ograniczeniem uprawnień; bez zmiany produkcyjnych polityk.
- Powiązane źródła: src/lib/syncOfflineSessions.ts; supabase/migrations/20261025120000_atomic_session_save.sql. Brak automatycznego pliku wykonującego ten scenariusz.

1. Przygotuj sesję offline i kontrolnie zablokuj zapis logu lub późniejszej serii w projekcie testowym.
2. Uruchom synchronizację i zachowaj komunikat oraz odpowiedź.
3. Sprawdź brak częściowego zapisu po stronie serwera i komplet danych lokalnych.
4. Usuń przyczynę błędu w środowisku testowym i ponów operację.

Wynik oczekiwany: Błąd nie powoduje utraty lokalnych danych ani częściowej sesji; po naprawieniu przyczyny powstaje jeden kompletny zapis.

| Pole protokołu | Wartość |
| --- | --- |
| Status | NOT_RUN |
| Wynik rzeczywisty |  |
| Data i godzina wykonania |  |
| Model urządzenia, OS, przeglądarka, widok |  |
| Środowisko i URL |  |
| Wersja aplikacji / commit |  |
| Wykonawca |  |
| Dowód / plik dziennika |  |
| Uwagi / powód braku wykonania |  |

## T6-MAN-021 — Zmiana użytkownika z zaległą sesją offline

- Rodzaj: manualny — rzeczywiste urządzenie. Powiązania merytoryczne: T3, T4.
- Cel: Sprawdzenie powiązania kolejki z właścicielem.
- Warunki wstępne: Projekt testowy, dwa konta i jeden osobny profil testowy przeglądarki.
- Powiązane źródła: src/lib/syncOfflineSessions.ts; src/contexts/AuthContext.tsx. Brak automatycznego pliku wykonującego ten scenariusz.

1. Jako A zapisz zakończony trening offline i pozostaw go niesynchronizowanego.
2. Po przywróceniu sieci wyloguj A i zaloguj B w kontrolowanym wariancie przed synchronizacją.
3. Sprawdź, że B nie wysyła ani nie usuwa danych A.
4. Wróć do A i zsynchronizuj trening, kontrolując właściciela w projekcie testowym.

Wynik oczekiwany: Kolejka A pozostaje przypisana do A; dane nie są publikowane jako trening użytkownika B.

| Pole protokołu | Wartość |
| --- | --- |
| Status | NOT_RUN |
| Wynik rzeczywisty |  |
| Data i godzina wykonania |  |
| Model urządzenia, OS, przeglądarka, widok |  |
| Środowisko i URL |  |
| Wersja aplikacji / commit |  |
| Wykonawca |  |
| Dowód / plik dziennika |  |
| Uwagi / powód braku wykonania |  |

## T6-MAN-022 — Odmowa lub wyczerpanie miejsca IndexedDB

- Rodzaj: manualny — rzeczywiste urządzenie. Powiązania merytoryczne: T4, T5.
- Cel: Ocena czytelności błędu i ochrony już zapisanych danych.
- Warunki wstępne: Izolowany profil testowy; kopia danych; narzędzie symulacji błędu magazynu lub ograniczenia quota.
- Powiązane źródła: src/hooks/useOfflineStorage.ts. Brak automatycznego pliku wykonującego ten scenariusz.

1. Przygotuj istniejącą zapisaną lokalnie sesję.
2. Wymuś niepowodzenie kolejnego zapisu IndexedDB w profilu testowym.
3. Spróbuj zakończyć inną sesję lub zastąpić szczegóły istniejącej.
4. Sprawdź komunikat, brak fałszywego sukcesu i komplet poprzednich rekordów.
5. Przywróć warunki i ponów zapis. Nie czyść produkcyjnego profilu przeglądarki.

Wynik oczekiwany: Nieudany zapis nie jest potwierdzany jako sukces, a poprzednio zatwierdzone dane pozostają dostępne.

| Pole protokołu | Wartość |
| --- | --- |
| Status | NOT_RUN |
| Wynik rzeczywisty |  |
| Data i godzina wykonania |  |
| Model urządzenia, OS, przeglądarka, widok |  |
| Środowisko i URL |  |
| Wersja aplikacji / commit |  |
| Wykonawca |  |
| Dowód / plik dziennika |  |
| Uwagi / powód braku wykonania |  |

## T6-MAN-023 — Uruchomienie aplikacji bez sieci po zamknięciu

- Rodzaj: manualny — rzeczywiste urządzenie. Powiązania merytoryczne: T4, T5.
- Cel: Sprawdzenie rzeczywistego działania cache i trwałości.
- Warunki wstępne: Zainstalowana lub wcześniej otwarta aplikacja HTTPS; zakończona instalacja workera; testowe konto.
- Powiązane źródła: src/service-worker.js; scripts/pwa.ts; src/hooks/useOfflineStorage.ts. Brak automatycznego pliku wykonującego ten scenariusz.

1. Otwórz wymagane widoki online i sprawdź aktywną rejestrację workera.
2. Zamknij aplikację, odetnij sieć i uruchom ją ponownie.
3. Otwórz wcześniej przygotowany widok oraz rozpocznij możliwy trening offline.
4. Zapisz wynik i komunikaty, następnie przywróć sieć i sprawdź odtworzenie działania.

Wynik oczekiwany: Wcześniej pobrana aplikacja ładuje się bez białego ekranu; dostępne są przygotowane dane offline, a brak niebuforowanych danych jest komunikowany.

| Pole protokołu | Wartość |
| --- | --- |
| Status | NOT_RUN |
| Wynik rzeczywisty |  |
| Data i godzina wykonania |  |
| Model urządzenia, OS, przeglądarka, widok |  |
| Środowisko i URL |  |
| Wersja aplikacji / commit |  |
| Wykonawca |  |
| Dowód / plik dziennika |  |
| Uwagi / powód braku wykonania |  |

## T6-MAN-024 — Instalacja PWA na Androidzie

- Rodzaj: manualny — rzeczywiste urządzenie. Powiązania merytoryczne: T5.
- Cel: Sprawdzenie instalacji, ikon i skrótów na rzeczywistym Androidzie.
- Warunki wstępne: Fizyczne urządzenie Android z obsługiwaną przeglądarką; testowy adres HTTPS i stabilna wersja buildu.
- Powiązane źródła: public/manifest.json; public/icon-192.png; public/icon-512.png; src/main.tsx. Brak automatycznego pliku wykonującego ten scenariusz.

1. Otwórz aplikację, poczekaj na instalację workera i sprawdź możliwość dodania do ekranu głównego.
2. Zainstaluj aplikację przez funkcję przeglądarki.
3. Uruchom z ikony i sprawdź nazwę, ikonę, tryb standalone i obszary ekranu.
4. Jeżeli system udostępnia skróty, uruchom ON-WALL i OFF-WALL ze skrótu.
5. Sprawdź uruchomienie bez sieci po wcześniejszym buforowaniu.

Wynik oczekiwany: Instalacja i ikona są poprawne; aplikacja uruchamia się w przewidzianym trybie, obsługiwane skróty prowadzą do właściwych typów sesji.

| Pole protokołu | Wartość |
| --- | --- |
| Status | NOT_RUN |
| Wynik rzeczywisty |  |
| Data i godzina wykonania |  |
| Model urządzenia, OS, przeglądarka, widok |  |
| Środowisko i URL |  |
| Wersja aplikacji / commit |  |
| Wykonawca |  |
| Dowód / plik dziennika |  |
| Uwagi / powód braku wykonania |  |

## T6-MAN-025 — Instalacja PWA na iOS

- Rodzaj: manualny — rzeczywiste urządzenie. Powiązania merytoryczne: T5.
- Cel: Sprawdzenie platformowej ścieżki dodania do ekranu głównego.
- Warunki wstępne: Fizyczny iPhone z Safari; testowy adres HTTPS.
- Powiązane źródła: index.html; public/manifest.json; src/service-worker.js. Brak automatycznego pliku wykonującego ten scenariusz.

1. Otwórz aplikację w Safari i użyj Udostępnij → Do ekranu początkowego.
2. Sprawdź nazwę i ikonę, następnie uruchom z ekranu głównego.
3. Sprawdź tryb wyświetlania, safe-area i ponowne uruchomienie po zamknięciu.
4. Po buforowaniu sprawdź uruchomienie bez sieci. Zanotuj funkcje niewspierane przez badaną wersję iOS.

Wynik oczekiwany: Aplikacja daje się dodać i uruchomić, interfejs nie jest zasłonięty przez obszary systemowe; ograniczenia platformy są udokumentowane.

| Pole protokołu | Wartość |
| --- | --- |
| Status | NOT_RUN |
| Wynik rzeczywisty |  |
| Data i godzina wykonania |  |
| Model urządzenia, OS, przeglądarka, widok |  |
| Środowisko i URL |  |
| Wersja aplikacji / commit |  |
| Wykonawca |  |
| Dowód / plik dziennika |  |
| Uwagi / powód braku wykonania |  |

## T6-MAN-026 — Aktualizacja Service Workera

- Rodzaj: manualny — rzeczywiste urządzenie. Powiązania merytoryczne: T4, T5.
- Cel: Ocena aktualizacji aplikacji z zachowaniem danych użytkownika.
- Warunki wstępne: Środowisko staging z dwiema oznaczonymi wersjami; osobny profil z danymi testowymi offline.
- Powiązane źródła: src/main.tsx; src/service-worker.js; scripts/pwa.ts. Brak automatycznego pliku wykonującego ten scenariusz.

1. Zainstaluj wersję A, zapisz lokalną sesję i zanotuj rejestrację oraz nazwy cache.
2. Udostępnij przygotowaną wersję B w staging; nie zmieniaj produkcji w ramach tego scenariusza.
3. Sprawdź stan installing/waiting/active i sposób wejścia w nową wersję po zamknięciu lub odświeżeniu.
4. Sprawdź stare cache, pliki nowej wersji i zachowanie lokalnych sesji.
5. Przywróć sieć i zakończ synchronizację danych testowych.

Wynik oczekiwany: Nowa wersja działa z kompletnymi zasobami; sprzątanie cache nie usuwa danych IndexedDB ani danych obcych aplikacji.

| Pole protokołu | Wartość |
| --- | --- |
| Status | NOT_RUN |
| Wynik rzeczywisty |  |
| Data i godzina wykonania |  |
| Model urządzenia, OS, przeglądarka, widok |  |
| Środowisko i URL |  |
| Wersja aplikacji / commit |  |
| Wykonawca |  |
| Dowód / plik dziennika |  |
| Uwagi / powód braku wykonania |  |

## T6-MAN-027 — Responsywność Android: mały ekran i klawiatura

- Rodzaj: manualny — rzeczywiste urządzenie. Powiązania merytoryczne: T2, T5.
- Cel: Ocena użyteczności formularzy na fizycznym telefonie.
- Warunki wstępne: Android; zapisz rzeczywistą szerokość CSS (docelowo około 360 px), rozdzielczość i skalowanie.
- Powiązane źródła: src/pages; src/components/ui; src/index.css. Brak automatycznego pliku wykonującego ten scenariusz.

1. Przejdź przez logowanie, nową sesję, ON-WALL, OFF-WALL, historię i analitykę.
2. Otwórz dialog zakończenia i klawiaturę ekranową przy dolnym polu.
3. Zmień orientację, przewiń dialog i spróbuj potwierdzenia.
4. Sprawdź teksty, wykresy, dotykowe przyciski i ewentualny poziomy scroll; dołącz zrzuty.

Wynik oczekiwany: Żadne wymagane pole ani przycisk nie jest niedostępny lub zasłonięty; treści można odczytać, a formularze da się ukończyć.

| Pole protokołu | Wartość |
| --- | --- |
| Status | NOT_RUN |
| Wynik rzeczywisty |  |
| Data i godzina wykonania |  |
| Model urządzenia, OS, przeglądarka, widok |  |
| Środowisko i URL |  |
| Wersja aplikacji / commit |  |
| Wykonawca |  |
| Dowód / plik dziennika |  |
| Uwagi / powód braku wykonania |  |

## T6-MAN-028 — Responsywność iOS: safe-area i dialogi

- Rodzaj: manualny — rzeczywiste urządzenie. Powiązania merytoryczne: T2, T5.
- Cel: Ocena interfejsu na fizycznym iPhonie.
- Warunki wstępne: iPhone z Safari i PWA; zapisana szerokość CSS i wersja systemu.
- Powiązane źródła: index.html; src/index.css; src/components/ui/dialog.tsx. Brak automatycznego pliku wykonującego ten scenariusz.

1. Powtórz kluczowe formularze i widoki w Safari oraz po uruchomieniu PWA.
2. Sprawdź obszar notcha i dolnego wskaźnika, przewijanie dialogu i klawiaturę.
3. Zmień orientację i wróć do rozpoczętej sesji.
4. Udokumentuj zasłonięcia, nieczytelne fragmenty i nieosiągalne kontrolki.

Wynik oczekiwany: Interfejs respektuje obszary systemowe i umożliwia ukończenie wszystkich kluczowych operacji.

| Pole protokołu | Wartość |
| --- | --- |
| Status | NOT_RUN |
| Wynik rzeczywisty |  |
| Data i godzina wykonania |  |
| Model urządzenia, OS, przeglądarka, widok |  |
| Środowisko i URL |  |
| Wersja aplikacji / commit |  |
| Wykonawca |  |
| Dowód / plik dziennika |  |
| Uwagi / powód braku wykonania |  |

## T6-MAN-029 — Responsywność desktop i powiększenie

- Rodzaj: manualny — rzeczywiste urządzenie. Powiązania merytoryczne: T2, T5.
- Cel: Ocena obsługi na większym ekranie i przy powiększeniu.
- Warunki wstępne: Fizyczny komputer; przeglądarka i wymiary okna zapisane (np. 1280×800 CSS).
- Powiązane źródła: src/components; src/pages; src/index.css. Brak automatycznego pliku wykonującego ten scenariusz.

1. Przejdź przez widoki treningu, historii i analityki przy powiększeniu 100%.
2. Ustaw 200% i powtórz kluczowe operacje formularzy.
3. Sprawdź kolejność klawiatury, widoczność fokusu i obsługę dialogów.
4. Zapisz zrzuty i problemy układu, nie zastępując tym testów Android/iOS.

Wynik oczekiwany: Widoki i przyciski pozostają dostępne, tekst nie jest krytycznie ucinany, a operacje da się wykonać klawiaturą.

| Pole protokołu | Wartość |
| --- | --- |
| Status | NOT_RUN |
| Wynik rzeczywisty |  |
| Data i godzina wykonania |  |
| Model urządzenia, OS, przeglądarka, widok |  |
| Środowisko i URL |  |
| Wersja aplikacji / commit |  |
| Wykonawca |  |
| Dowód / plik dziennika |  |
| Uwagi / powód braku wykonania |  |

## T6-MAN-030 — Wolna sieć i czytelność stanu zapisu

- Rodzaj: manualny — rzeczywiste urządzenie. Powiązania merytoryczne: T2, T4.
- Cel: Ocena komunikatów w warunkach opóźnień.
- Warunki wstępne: Fizyczne urządzenie i kontrolowane ograniczenie łącza w środowisku testowym.
- Powiązane źródła: src/pages/StrengthSession.tsx; src/components/OfflineIndicator.tsx. Brak automatycznego pliku wykonującego ten scenariusz.

1. Włącz opóźnienie i ograniczenie przepustowości; zapisz ustawienia narzędzia.
2. Zakończ sesję i obserwuj wskaźnik oczekiwania oraz aktywność przycisku.
3. Wykonaj dodatkowe dotknięcia i sprawdź ewentualne powielenie żądań.
4. Przywróć sieć, sprawdź wynik i komplet danych. Jeśli mierzysz czas, zapisz metodę oraz każdą surową obserwację.

Wynik oczekiwany: Oczekiwanie jest widoczne; sukces nie pojawia się przed potwierdzeniem, a ponawianie interakcji nie powoduje utraty ani duplikatów.

| Pole protokołu | Wartość |
| --- | --- |
| Status | NOT_RUN |
| Wynik rzeczywisty |  |
| Data i godzina wykonania |  |
| Model urządzenia, OS, przeglądarka, widok |  |
| Środowisko i URL |  |
| Wersja aplikacji / commit |  |
| Wykonawca |  |
| Dowód / plik dziennika |  |
| Uwagi / powód braku wykonania |  |

## T6-MAN-031 — Rzeczywisty trening ON-WALL

- Rodzaj: manualny — rzeczywiste urządzenie. Powiązania merytoryczne: T2, T4, T6.
- Cel: Ocena aplikacji w kontekście faktycznego użytkowania podczas treningu.
- Warunki wstępne: Dobrowolny uczestnik, testowe konto w odizolowanym środowisku i własny plan treningu; brak narzuconego wysiłku.
- Powiązane źródła: Cała aplikacja; dziennik obserwacyjny uczestnika. Brak automatycznego pliku wykonującego ten scenariusz.

1. Przed treningiem zapisz datę, urządzenie, wersję aplikacji, warunki sieci i sposób niezależnego notowania przejść.
2. Podczas własnego treningu zapisuj przejścia, oznaczenia i notatki; prowadź dziennik przerw, blokowania ekranu i zdarzeń sieciowych.
3. Zakończ sesję i porównaj dane z notatkami kontrolnymi.
4. Zapisz konkretne obserwacje użyteczności, błędy i ewentualne utracone lub zdublowane wpisy; dołącz zanonimizowane dowody.

Wynik oczekiwany: Zapis sesji jest zgodny z niezależnym dziennikiem, a problemy i warunki użycia mają udokumentowany przebieg. Pojedynczy trening nie dowodzi skuteczności sportowej ani długoterminowej niezawodności.

| Pole protokołu | Wartość |
| --- | --- |
| Status | NOT_RUN |
| Wynik rzeczywisty |  |
| Data i godzina wykonania |  |
| Model urządzenia, OS, przeglądarka, widok |  |
| Środowisko i URL |  |
| Wersja aplikacji / commit |  |
| Wykonawca |  |
| Dowód / plik dziennika |  |
| Uwagi / powód braku wykonania |  |

## T6-MAN-032 — Rzeczywisty trening OFF-WALL

- Rodzaj: manualny — rzeczywiste urządzenie. Powiązania merytoryczne: T2, T4, T6.
- Cel: Ocena zapisu rzeczywiście wykonanych ćwiczeń i serii.
- Warunki wstępne: Jak w ON-WALL; uczestnik realizuje własny plan, bez rekomendowania obciążeń przez testera.
- Powiązane źródła: Cała aplikacja; dziennik rzeczywistego treningu. Brak automatycznego pliku wykonującego ten scenariusz.

1. Zapisz warunki, wersje i niezależny plan notowania ćwiczeń.
2. Rejestruj wykonane serie, powtórzenia, czas i ciężar zgodnie z faktycznym treningiem.
3. Zanotuj użycie timerów, protokołów, przełączanie ekranu i problemy obsługi.
4. Zakończ trening, sprawdź historię po odświeżeniu i porównaj wszystkie wartości.
5. Zapisz wynik oraz obserwacje oddzielnie od oceny skuteczności treningu.

Wynik oczekiwany: Historia wiernie odzwierciedla niezależny dziennik wykonanych serii; obserwacje nie są zastępowane ogólnym stwierdzeniem aplikacja działa.

| Pole protokołu | Wartość |
| --- | --- |
| Status | NOT_RUN |
| Wynik rzeczywisty |  |
| Data i godzina wykonania |  |
| Model urządzenia, OS, przeglądarka, widok |  |
| Środowisko i URL |  |
| Wersja aplikacji / commit |  |
| Wykonawca |  |
| Dowód / plik dziennika |  |
| Uwagi / powód braku wykonania |  |

## T6-MAN-033 — Zarządzanie ćwiczeniami i protokołami

- Rodzaj: manualny — rzeczywiste urządzenie. Powiązania merytoryczne: T2, T3.
- Cel: Ocena funkcji bez bezpośredniego pełnego pokrycia komponentowego.
- Warunki wstępne: Konto i dane w środowisku testowym.
- Powiązane źródła: src/pages/Exercises.tsx; dane exercises i protocols. Brak automatycznego pliku wykonującego ten scenariusz.

1. Utwórz własne ćwiczenie i dostępny protokół z charakterystycznymi wartościami.
2. Edytuj je, odśwież widok i sprawdź zachowanie pól.
3. Użyj ich w OFF-WALL i sprawdź zapis protokołu w sesji.
4. Sprawdź zachowanie operacji usunięcia testowego elementu używanego w historii oraz ochronę elementów systemowych.

Wynik oczekiwany: Własne dane są trwałe, kontrolki respektują uprawnienia, a operacje na słownikach nie powodują cichego uszkodzenia historii.

| Pole protokołu | Wartość |
| --- | --- |
| Status | NOT_RUN |
| Wynik rzeczywisty |  |
| Data i godzina wykonania |  |
| Model urządzenia, OS, przeglądarka, widok |  |
| Środowisko i URL |  |
| Wersja aplikacji / commit |  |
| Wykonawca |  |
| Dowód / plik dziennika |  |
| Uwagi / powód braku wykonania |  |

## T6-MAN-034 — Plan tygodniowy

- Rodzaj: manualny — rzeczywiste urządzenie. Powiązania merytoryczne: T2, T3.
- Cel: Sprawdzenie planowania i trwałości konfiguracji tygodnia.
- Warunki wstępne: Konto i szablony testowe.
- Powiązane źródła: Dane weekly_plans i widok planowania aplikacji. Brak automatycznego pliku wykonującego ten scenariusz.

1. Utwórz plan na wybrany tydzień z oboma typami sesji i notatką.
2. Zmień dzień lub przypisanie szablonu i zapisz.
3. Przełącz tydzień, wróć i odśwież aplikację.
4. Sprawdź zgodność planu z wpisami kontrolnymi i izolację danych drugiego użytkownika.

Wynik oczekiwany: Plan zachowuje przypisania do właściwych dat i użytkownika; przełączanie tygodni nie miesza danych.

| Pole protokołu | Wartość |
| --- | --- |
| Status | NOT_RUN |
| Wynik rzeczywisty |  |
| Data i godzina wykonania |  |
| Model urządzenia, OS, przeglądarka, widok |  |
| Środowisko i URL |  |
| Wersja aplikacji / commit |  |
| Wykonawca |  |
| Dowód / plik dziennika |  |
| Uwagi / powód braku wykonania |  |

## T6-MAN-035 — Preferencje języka, motywu i skali

- Rodzaj: manualny — rzeczywiste urządzenie. Powiązania merytoryczne: T2, T5.
- Cel: Ocena trwałości ustawień i prezentacji.
- Warunki wstępne: Fizyczne urządzenie; konto testowe i znane dane analityczne.
- Powiązane źródła: src/i18n; src/contexts/ThemeContext.tsx; src/lib/userLevel.ts. Brak automatycznego pliku wykonującego ten scenariusz.

1. Zmień język polski/angielski, motyw oraz preferowaną skalę trudności.
2. Otwórz formularze, komunikaty i analitykę; sprawdź czytelność etykiet.
3. Uruchom aplikację ponownie i sprawdź trwałość ustawień.
4. Porównaj liczbowe wyniki przed i po zmianie samego formatu prezentacji.

Wynik oczekiwany: Zmiany prezentacji są spójne i nie zmieniają znaczenia zapisanych danych; brakujące tłumaczenia i problemy kontrastu są jawnie rejestrowane.

| Pole protokołu | Wartość |
| --- | --- |
| Status | NOT_RUN |
| Wynik rzeczywisty |  |
| Data i godzina wykonania |  |
| Model urządzenia, OS, przeglądarka, widok |  |
| Środowisko i URL |  |
| Wersja aplikacji / commit |  |
| Wykonawca |  |
| Dowód / plik dziennika |  |
| Uwagi / powód braku wykonania |  |

## T6-MAN-036 — Komunikaty, fokus i dostępność podstawowa

- Rodzaj: manualny — rzeczywiste urządzenie. Powiązania merytoryczne: T2, T5.
- Cel: Sprawdzenie zachowania elementów interfejsu poza asercjami deklaratywnymi.
- Warunki wstępne: Fizyczny komputer i telefon; klawiatura oraz opcjonalnie czytnik ekranu.
- Powiązane źródła: src/hooks/use-toast.ts; src/components/ui/toast.tsx; src/components/ui/dialog.tsx. Brak automatycznego pliku wykonującego ten scenariusz.

1. Wywołaj sukces i błąd zapisu w środowisku testowym; sprawdź położenie komunikatu i zasłanianie przycisków.
2. Zmierz rzeczywisty czas zamknięcia komunikatu, zapisując metodę i obserwacje.
3. Obsłuż dialog klawiaturą; sprawdź fokus po otwarciu i zamknięciu oraz nazwy przycisków.
4. Powtórz przy małym ekranie i powiększeniu; zanotuj ograniczenia bez deklarowania pełnego audytu WCAG.

Wynik oczekiwany: Ważne komunikaty i kontrolki są czytelne i osiągalne; fokus nie ginie, a rzeczywiste czasy i położenie mają potwierdzenie obserwacyjne.

| Pole protokołu | Wartość |
| --- | --- |
| Status | NOT_RUN |
| Wynik rzeczywisty |  |
| Data i godzina wykonania |  |
| Model urządzenia, OS, przeglądarka, widok |  |
| Środowisko i URL |  |
| Wersja aplikacji / commit |  |
| Wykonawca |  |
| Dowód / plik dziennika |  |
| Uwagi / powód braku wykonania |  |
