// Jednorazowo opracowane opisy: kolejność zgodna z inventory.json pierwszego przebiegu.
// Źródłem prawdy po inicjalizacji jest docs/testing/test-catalog.json (klucz pełnej nazwy).
export const definitions = {
  'src/lib/analytics.test.ts': ['T1', 'ANL', 'jednostkowy', `
Indeksowanie stopni V-Scale|V0, V5 i V10 otrzymują indeksy 0, 5 i 10.
Odrzucanie nieprawidłowego zapisu V-Scale|Brak wartości, zapis Font i nieznany stopień dają -1.
Indeksowanie stopni Font|Stopnie 4, 6a i 7a otrzymują indeksy zgodne z kolejnością tabeli.
Odrzucanie nieprawidłowego zapisu Font|Brak wartości, V5 i nieznany stopień dają -1.
Normalizacja na podstawie przedziału V-Scale|Wynik przykładowego mapowania jest dodatni i mniejszy od 20.
Zapasowa normalizacja na podstawie Font|Przy braku granic V-Scale obliczona trudność jest dodatnia.
Normalizacja przy użyciu order_index|Przy braku skal wynik przykładowego mapowania wynosi 50.
Strefy rozwoju dla pustego dziennika|Wszystkie trzy udziały stref wynoszą 0.
Strefy dla nierozpoznanych stopni bez mapowań|Wszystkie trzy udziały wynoszą 0.
Klasyfikacja stopni Font z tabeli kanonicznej|Comfort, Growth i Limit mają dodatnie udziały.
Rozkład stref dla zróżnicowanego zbioru|Growth jest mniejsze od 100%, a Comfort i Limit są dodatnie.
Suma udziałów stref|Suma trzech udziałów wynosi 100%.
Wykorzystanie przekazanego poziomu odniesienia|Każda strefa przykładowej sesji ma udział większy od 25%.
Wpływ poziomu użytkownika na klasyfikację|Ta sama trudność daje 100% Comfort dla wysokiego poziomu i 100% Limit dla niskiego.
Profil trudności dla pustej listy sesji|difficulty_bias i samples_count wynoszą 0.
Profil obiektu z łatwiejszymi problemami|difficulty_bias jest dodatni, a liczba próbek wynosi 10.
Liczba próbek profilu obiektu|samples_count wynosi 10 dla danych kontrolnych.
Kierunek zmiany profilu przy zmianie próbek|Profil łatwiejszych próbek ma większy bias niż profil trudniejszych.
Maksymalny stopień dla pustych logów|Funkcja zwraca null.
Maksymalny stopień bez mapowań|Funkcja zwraca null.
Najtrudniejszy stopień z dodatnią liczbą przejść|Dla danych testowych wynikiem jest Blue.
Pomijanie stopni nieobecnych w mapowaniach|Nieznany stopień nie wypiera poprawnego wyniku Yellow.
Obliczanie stref dla przykładu OFF-WALL bez obiektu|Wywołanie analityki bez rozpoznanych stopni zwraca udziały 0.
Przykładowa struktura OFF-WALL bez powiązania z obiektem|Lokalny obiekt testowy ma pustą tablicę session_gyms.
`],
  'src/lib/importParser.test.ts': ['T2', 'PAR', 'jednostkowy', `
Parsowanie daty DD.MM.YYYY|Otrzymana data ma oczekiwany dzień, miesiąc i rok.
Parsowanie daty YYYY-MM-DD|Otrzymana data odpowiada zapisowi ISO.
Parsowanie jednocyfrowego dnia i miesiąca|Krótki zapis daty jest rozpoznawany poprawnie.
Odrzucanie nieprawidłowych dat|Nieobsługiwane lub niepoprawne zapisy dają null.
Parsowanie liczby przejść i stopnia|Poprawny token daje oczekiwane count i grade_raw.
Parsowanie stopnia oznaczonego kolorem|Nazwa koloru zostaje zachowana w grade_raw.
Parsowanie stopnia numerycznego|Stopień numeryczny zostaje zachowany jako tekst.
Rozpoznawanie wielkiej litery X w tokenie|Token z X daje poprawną liczbę i stopień.
Odrzucanie niepoprawnych tokenów|Niepoprawne tokeny nie tworzą poprawnego wpisu.
Parsowanie kompletnego wiersza importu|Wiersz daje sesję z oczekiwaną datą i listą stopni.
Parsowanie wiersza rozdzielanego spacjami|Parser rozpoznaje datę i tokeny bez przecinków.
Parsowanie wiersza z datą ISO|Data i tokeny wiersza zostają poprawnie odczytane.
Wykrywanie błędnej daty w wierszu|Parser zwraca błąd zamiast poprawnej sesji.
Wykrywanie wiersza bez stopni|Wiersz bez poprawnych przejść daje błąd.
Obsługa pustego wiersza na poziomie parseLine|Pusty wiersz nie daje poprawnej sesji.
Pomijanie błędnego tokenu przy poprawnych tokenach|Poprawne tokeny zostają zachowane mimo tokenu błędnego.
Import wielu wierszy|Powstaje oczekiwana liczba sesji bez błędów dla poprawnych danych.
Pomijanie pustych wierszy w całym imporcie|Puste wiersze nie zwiększają liczby błędów ani sesji.
Zbieranie błędów poszczególnych wierszy|Poprawne sesje i diagnostyka błędnych wierszy są zwracane oddzielnie.
Obsługa wiersza zawierającego wyłącznie datę|Wiersz bez przejść zostaje zgłoszony jako niepoprawny.
Wyszukiwanie stopni bez mapowania|Wynik zawiera stopnie nieobecne na dostępnej liście.
Brak brakujących mapowań|Dla kompletnych mapowań wynik jest pustą tablicą.
Dopasowanie mapowań niezależnie od wielkości liter|Różna wielkość liter nie tworzy fałszywego braku mapowania.
Podsumowanie importu|Liczba sesji, łączna liczba przejść i rozkład stopni odpowiadają danym wejściowym.
Podsumowanie pustego importu|Liczba sesji i przejść wynosi 0, a rozkład jest pusty.
`],
  'src/lib/volumeByGrade.test.ts': ['T1', 'VOL', 'jednostkowy', `
Agregacja objętości dla pustego dziennika|Wynik jest pustą tablicą.
Agregacja objętości bez mapowań|Wynik jest pustą tablicą.
Agregacja jednego stopnia|Powstaje jeden wynik o oczekiwanej liczbie przejść.
Scalanie wielu logów Yellow|Powstaje dokładnie jeden słupek Yellow z sumą przejść.
Rozróżnianie jednakowych nazw w różnych obiektach|Etykiety wyników są unikalne mimo tej samej nazwy stopnia.
Agregacja mieszanych stopni i obiektów|Liczby i rozróżnienie wyników odpowiadają danym testowym.
Sortowanie objętości według order_index|Wyniki mają oczekiwaną kolejność stopni.
Pomijanie wpisów o zerowej liczbie przejść|Wpis z count równym 0 nie trafia do wyników.
Pomijanie stopni bez mapowania w agregacji|Nieznany stopień nie tworzy wyniku agregacji.
`],
  'src/test/analytics.test.ts': ['T1', 'ORD', 'jednostkowy', `
Porządek Font: 6c+ i 6c|Maksymalnym stopniem jest 6c+.
Porządek Font: 7a i 6c+|Maksymalnym stopniem jest 7a.
Porządek Font: 6a+ i 6a|Maksymalnym stopniem jest 6a+.
Porządek V-Scale: V7 i V6|Maksymalnym stopniem jest V7.
Porządek pełnego zakresu V-Scale w próbce|Najwyższy stopień odpowiada maksimum danych testowych.
Porządkowanie etykiet przez normalizację V-Scale|Wynik wskazuje stopień o największej znormalizowanej trudności.
Zapasowe porządkowanie przez Font|Brak V-Scale nie blokuje wyznaczenia maksimum z granic Font.
Maksimum bez logów|Wynikiem jest null.
Maksimum bez mapowań|Wynikiem jest null.
Wykluczenie count równego 0 z maksimum|Stopień bez przejść nie jest wybierany jako maksimum.
Wykluczenie niemapowanych stopni z maksimum|Niemapowany wpis nie zmienia maksimum poprawnych danych.
Indeksy stopni V-Scale|Przykładowe stopnie mają oczekiwane indeksy liczbowe.
Niepoprawne indeksy V-Scale|Niepoprawny zapis zwraca -1.
Kolejność Font z wariantami plus|Indeksy zachowują porządek stopni podstawowych i wariantów plus.
Niepoprawne indeksy Font|Niepoprawny zapis zwraca -1.
`],
  'src/test/atomicSessionSave.test.ts': ['T3', 'SQL', 'integracyjny', `
Zakończenie OFF-WALL w lokalnym PostgreSQL|Sesja ma completed i date_end, zapisane jest jedno ćwiczenie i dwie serie.
Wierność szczegółów OFF-WALL w bazie|Zachowane są exercise_id, protocol_id, kolejność, wartości serii, zerowe obciążenie i zmęczenie.
Zapis ON-WALL z obiektem i historią|Powstaje powiązanie obiektu, poprawny log i zakończona sesja z date_end.
Idempotentne ponowienie OFF-WALL po utracie odpowiedzi|Ponowienie zwraca ten sam identyfikator; pozostaje jedna sesja, jedno ćwiczenie i dwie serie.
Idempotentne ponowienie ON-WALL|Ponowienie nie powiela powiązań obiektu ani logów.
Wycofanie ON-WALL po błędzie logu|Po błędnym stopniu nie pozostaje sesja, powiązanie obiektu ani log.
Wycofanie OFF-WALL po błędzie późniejszej serii|Nie pozostaje część sesji, ćwiczeń ani serii; poprawne ponowienie jest możliwe.
Ochrona wcześniejszych danych przy błędzie zastępowania|Sesja pozostaje active bez date_end, a poprzednia seria z 42 powtórzeniami pozostaje w bazie.
Odrzucanie niezakończonej lub pustej sesji|Wywołania kończą się wyjątkami i nie tworzą rekordów sesji.
Kontrola własności i dostępu do danych powiązanych|Obcy właściciel, prywatne ćwiczenie, prywatny protokół i obcy obiekt powodują odrzucenie zapisu.
Odrzucanie zakończenia cudzej sesji i zapisu bez użytkownika|Cudza sesja oraz brak auth.uid powodują wyjątek.
`],
  'src/test/auth.test.ts': ['T2', 'AUTH', 'symulacyjny', `
Model przekierowania po rejestracji|Ręcznie wywołany mock nawigacji otrzymuje /login i replace=true.
Model pustych pól logowania|Lokalne stałe email i password są pustymi tekstami.
Deklaracja przeznaczenia strony logowania|Lokalna flaga obsługi wyłącznie logowania ma wartość true.
Deklaracja odnośnika rejestracji|Lokalna ścieżka ma wartość /register.
Deklaracja odnośnika resetu hasła|Lokalna ścieżka ma wartość /forgot-password.
Deklaracja przeznaczenia strony rejestracji|Lokalna flaga obsługi wyłącznie rejestracji ma wartość true.
Deklaracja odnośnika logowania|Lokalna ścieżka ma wartość /login.
Model izolacji danych formularzy|Zmiana lokalnego obiektu logowania nie zmienia osobnego obiektu rejestracji.
Model świeżego stanu formularza|Nowo utworzony lokalny obiekt ma puste pola.
Deklaracja trasy logowania|Lokalna tablica ścieżek zawiera /login.
Deklaracja trasy rejestracji|Lokalna tablica ścieżek zawiera /register.
Deklaracja przekierowania starej trasy /auth|Lokalna flaga przekierowania ma wartość true.
Deklaracja ochrony tras|Lokalna ścieżka przekierowania ma wartość /login.
`],
  'src/test/developmentZones.test.ts': ['T1', 'ZONE', 'jednostkowy', `
Granica Comfort względem poziomu użytkownika|Próbka daje Comfort=67%, Growth=33%, Limit=0%.
Granica Limit powyżej poziomu użytkownika|Próbka daje Comfort=30%, Growth=50%, Limit=20%.
V7 przy poziomie V6|Wszystkie przejścia próbki trafiają do Growth.
Zrównoważona próbka treningu|Comfort i Growth przekraczają 40%, a Limit jest mniejsze od 10%.
Regresja zawyżonego Growth dla łatwych przejść|Comfort przekracza 70%, Growth jest mniejsze od 25%, Limit mniejsze od 5%.
Zróżnicowana objętość a udział Growth|Dla przygotowanej próbki Growth jest mniejsze od 70%.
Obecność Comfort dla zróżnicowanej historii|Udział Comfort jest większy od 0.
Relacja Limit do Growth w przykładowej sesji|Limit ma mniejszy udział niż Growth.
Puste logi w klasyfikacji stref|Wszystkie udziały stref wynoszą 0.
Zapasowa obsługa V-Scale bez mapowań|Rozpoznany stopień V-Scale nadal jest klasyfikowany.
Brak jawnego poziomu odniesienia|Funkcja korzysta z maksimum sesji i zwraca oczekiwany rozkład.
Przejścia dokładnie na poziomie użytkownika|Próbka trafia w całości do Growth.
Strefy dla mapowań kolorów|Stopnie kolorowe są klasyfikowane według przypisanych trudności V-Scale.
Strefy dla mapowań numerycznych|Stopnie numeryczne dają rozkład zgodny z mapowaniami.
`],
  'src/test/example.test.ts': ['T5', 'EX', 'symulacyjny', `
Kontrolna asercja uruchomienia Vitest|Asercja true równe true przechodzi; nie jest sprawdzana funkcja aplikacji.
`],
  'src/test/importHistory.test.ts': ['T2', 'IMP', 'jednostkowy', `
Parsowanie dwóch historycznych treningów|Parser zwraca dwie sesje z właściwymi datami, liczbami i stopniami, bez błędów.
Historyczny import z datą ISO|Powstaje jedna sesja z datą 2025-01-15.
Wskazanie błędnego wiersza importu|Dwie poprawne sesje pozostają, a błąd wskazuje drugi wiersz.
Pusty tekst importu|Lista sesji i lista błędów są puste.
Sumowanie historii importowanej|Dwie sesje dają 10 przejść, w tym 7 dla 6a i 3 dla 6b.
Brakujące mapowanie historii|Wynik zawiera 7a z liczbą 3.
Deklarowany status importowanej sesji|Lokalny obiekt ma completed, date_end i notatkę rozpoczynającą się od Imported:.
Model filtra historii dla importu|Lokalny obiekt spełnia warunek completed i niepustego date_end.
Przykładowe dane do agregacji tygodniowej|Lokalny obiekt ma on_wall, dodatnią liczbę przejść i dateStart.
Przykładowe logi wejściowe poziomu wspinacza|Lokalne logi mają grade_raw i dodatni count.
Przykładowe podsumowanie stref po imporcie|Wpisane do lokalnego obiektu udziały sumują się do 100%.
Deklaracja filtrów analityki bez oznaczenia importu|Lokalny obiekt nie zawiera is_imported ani source.
Model obecności importu w oknie 90 dni|Przykładowa sesja sprzed 7 dni mieści się w oknie i ma typ on_wall.
`],
  'src/test/listPager.test.ts': ['T2', 'PAGE', 'symulacyjny', `
Model pierwszej strony listy|Pierwsza strona zawiera elementy 0–9 i ma indeks 0.
Model liczby stron|55 elementów przy rozmiarze 10 daje 6 stron.
Model stronicowania pustej tablicy|Indeks wynosi 0, liczba stron 1, wynik jest pusty.
Model stronicowania undefined|Indeks wynosi 0, liczba stron 1, wynik jest pusty.
Model drugiej strony|Strona o indeksie 1 rozpoczyna się od elementu 10.
Model ograniczania zbyt dużego indeksu|Żądana strona 10 zostaje ograniczona do ostatniej strony o indeksie 2.
Model wskaźnika następnej strony|hasNextPage jest true przed ostatnią stroną i false na ostatniej.
Model wskaźnika poprzedniej strony|hasPrevPage jest false na pierwszej stronie i true na kolejnych.
Model indeksów zakresu|Pierwsze dwa zakresy wynoszą 0–10 i 10–20.
Model niepełnej ostatniej strony|Ostatnia strona próbki ma 5 elementów i zakres 20–25.
Model różnych rozmiarów strony|Rozmiary 25 i 5 dają odpowiednio 2 i 10 stron.
`],
  'src/test/mappingHealth.test.ts': ['T1', 'MAP', 'jednostkowy', `
Kompletne mapowania stopni|Normalizowalność wynosi 100%, bez braków i flagi problemów.
Identyfikacja brakującego mapowania|Purple ma przyczynę missing_mapping i liczbę 3; normalizowalność wynosi 63%.
Puste logi a kondycja mapowań|Liczba logów wynosi 0, wskaźnik 100%, brak flagi problemów.
Font bez mapowania specyficznego dla obiektu|Standardowe stopnie Font są rozpoznawane w 100%.
V-Scale bez mapowania specyficznego dla obiektu|Standardowe stopnie V-Scale są rozpoznawane w 100%.
Sortowanie nierozpoznanych stopni|Kolejność jest malejąca według liczby: B, C, A.
Zbiorcza kondycja kilku obiektów|Dwa obiekty, jeden problematyczny i 90% normalizowalności odpowiadają próbce.
Brak wyników kondycji obiektów|Liczby obiektów i problemów wynoszą 0, wskaźnik 100%.
Łączenie braków o tej samej nazwie|Wpisy X z dwóch obiektów dają łączną liczbę 7.
Obsługa pustych danych zwróconych przez wywołującego|Brak danych nie powoduje błędu, wynik ma 0 logów i brak problemów.
`],
  'src/test/offlineIndicator.test.tsx': ['T4', 'BANNER', 'komponentowy', `
Automatyczna synchronizacja po zakończeniu w innej instancji hooka|Aktywna sesja nie jest wysyłana; zakończenie uruchamia jedno RPC i sprząta dane po sukcesie.
Ponowienie synchronizacji przez komunikat Service Workera|Błąd zachowuje sesję; ponowienie działa, a nakładające się żądania nie są uruchamiane.
`],
  'src/test/offlineSync.test.tsx': ['T4', 'IDB', 'integracyjny', `
Synchronizacja szczegółów OFF-WALL przed czyszczeniem|RPC otrzymuje ćwiczenie, protokół i dwie serie; rekordy lokalne są usuwane dopiero po potwierdzeniu.
Synchronizacja logów ON-WALL|RPC otrzymuje completed, date_end, obiekt i log; lokalny log znika po sukcesie.
Ponowienie po błędzie serwera|Sesja, ćwiczenie i dwie serie pozostają po błędzie; poprawne ponowienie używa tego samego klucza offline.
Ponowienie po błędzie sieci|Odrzucone żądanie zachowuje dane lokalne; poprawne ponowienie używa tego samego klucza offline.
Ponowienie po braku potwierdzenia zapisu|Brak identyfikatora z serwera zachowuje dane lokalne i umożliwia ponowienie.
Ochrona aktywnej i cudzej sesji offline|Żadna z tych sesji nie jest wysyłana ani usuwana.
Błąd lokalnego odczytu serii|Błąd nie jest zamieniany na pusty payload; RPC nie jest wywoływane i sesja pozostaje.
Atomowość lokalnego kończenia po błędzie serii|Błąd późniejszej serii wycofuje zastępowanie; stare dane pozostają w całości.
Atomowość lokalnego czyszczenia|Błąd usuwania serii zachowuje całą sesję; poprawne ponowienie kończy synchronizację.
Powiadamianie innej instancji hooka|pendingCount drugiej instancji zmienia się z 0 na 1 po zakończeniu sesji.
Rozpoznanie abortu po udanym ostatnim put|Zapis zgłasza niepowodzenie, a poprzednie metadane, ćwiczenie i serie pozostają.
Brak sesji i ponowne lokalne zakończenie|Nieistniejąca sesja jest odrzucona; ponowienie nie powiela ćwiczeń ani serii.
`],
  'src/test/painInsights.test.ts': ['T1', 'PAIN', 'jednostkowy', `
Znacznik bólu o wartości false|Funkcja rozpoznawania bólu zwraca false.
Znacznik bólu o wartości true|Funkcja rozpoznawania bólu zwraca true.
Brak wartości znacznika bólu|Wartość null jest traktowana jako brak bólu.
Brak sesji w ocenie bólu|Wynikiem jest false.
Lista sesji bez bólu|Wynikiem jest false.
Lista zawierająca sesję z bólem|Wynikiem jest true.
Brak przesłanek do wskazówek bólowych|Lista wskazówek jest pusta.
Reguła zmniejszenia obciążenia po bólu|Wynik zawiera wskazówkę deload dla danych testowych.
Reguła małej liczby sesji OFF-WALL przy bólu|Wynik zawiera wskazówkę dotyczącą udziału OFF-WALL.
Reguła wysokiej intensywności przy bólu|Wynik zawiera wskazówkę dotyczącą wysokiego RPE.
Podsumowanie sesji bez bólu|Wynikiem jest null.
Podsumowanie bólu bez szczegółów|Wynik ma tekst Pain reported.
Podsumowanie poziomu i obszaru bólu|Tekst zawiera przekazane nasilenie i obszar.
Brak sesji w badanym tygodniu|Funkcja weekHasPain zwraca false.
Tydzień z sesjami bez bólu|Funkcja weekHasPain zwraca false.
Tydzień z co najmniej jedną sesją z bólem|Funkcja weekHasPain zwraca true.
Wykluczanie sesji poza tygodniem|Sesja z bólem spoza badanego zakresu nie zmienia wyniku tygodnia.
`],
  'src/test/productionHardening.test.ts': ['T3', 'HARD', 'symulacyjny', `
Deklaracja zakończonej sesji z datą|Lokalny obiekt ma completed i niepustą date_end; wyzwalacz nie jest uruchamiany.
Model filtra historii zakończonych sesji|Lokalne filtrowanie pozostawia wyłącznie zakończoną sesję o identyfikatorze 1.
Normalizowalność poprawnie zmapowanych stopni|Osiem przejść jest normalizowalnych w 100%, bez braków.
Wykrycie nieznanego stopnia w próbce|Osiem przejść daje 5 poprawnych i 3 brakujące, czyli 63% normalizowalności.
Kanoniczne rozpoznawanie Font bez mapowań|Pięć przejść Font jest poprawnie normalizowanych.
Agregacja zdrowia mapowań kilku obiektów|Wynik wskazuje dwa obiekty, jeden z problemami i 93% normalizowalności.
Lokalny model różnicowania stref|Ręcznie zdefiniowane progi rozdzielają próbkę do co najmniej dwóch stref.
`],
  'src/test/pwa.test.ts': ['T5', 'PWA', 'symulacyjny', `
Artefakty buildu, manifest i rozmiary ikon|Build emituje sw.js bez placeholderów, a ikony PNG mają wymiary zgodne z manifestem.
Cache aplikacji po symulowanej utracie sieci|Zasymulowany worker zwraca HTML oraz wszystkie zbudowane JS, CSS i obrazy z pamięci cache.
Brak zasobu podczas instalacji workera|Instalacja w symulatorze kończy się błędem precache, zamiast potwierdzać kompletność cache.
Wyłączenie żądań API i zewnętrznych z obsługi cache|Worker nie przechwytuje Supabase, innych originów, metod innych niż GET ani przykładowego API.
Sprzątanie własnych cache i sygnał synchronizacji|Usuwany jest stary cache aplikacji, cudzy pozostaje; klient otrzymuje SYNC_SESSIONS.
`],
  'src/test/sessionPersistence.test.ts': ['T2', 'STATE', 'symulacyjny', `
Model zapisu aktywnej sesji w localStorage|Serializowany obiekt można odczytać z oczekiwanym identyfikatorem, typem i nazwą obiektu.
Model usunięcia aktywnej sesji|Po removeItem odczyt klucza zwraca null.
Model stanu sesji ze znacznikiem czasu|Odczyt odtwarza listę przejść, notatki, RPE i czas aktualizacji.
Model przywrócenia po przełączeniu karty|Dane zapisane w mocku pamięci pozostają dostępne do odczytu.
Model identyfikacji sesji offline|Lokalny zapis zachowuje isOffline i prefiks offline- identyfikatora.
Model zachowania danych po nawigacji wstecz|W mocku pamięci nadal są metadane i trzy przejścia; rzeczywista nawigacja nie jest wykonywana.
Model porzucenia sesji|Oba ręcznie usuwane klucze sesji zwracają null.
Deklaracja braku pozostałości po porzuceniu|Asercja nie znajduje kluczy sesji w Object.keys(localStorageMock); nie bada wewnętrznego magazynu mocka.
Model kontynuacji sesji|Odczyt zachowuje identyfikator, nazwę obiektu, trzy przejścia i notatkę.
Model porzucenia sesji offline|Oba klucze z identyfikatorem tymczasowym zostają ręcznie usunięte.
Model lokalnego czyszczenia po zakończeniu|Odczyt kluczy po removeItem zwraca null; rzeczywisty zapis do bazy nie jest sprawdzany.
Izolacja lokalnego stanu dwóch sesji|Usunięcie kluczy drugiej sesji pozostawia stan pierwszej sesji.
`],
  'src/test/strengthCompletion.test.tsx': ['T2', 'UI', 'komponentowy', `
Zakończenie OFF-WALL przez rzeczywisty komponent|RPC otrzymuje completed, date_end, protokół i serię; po potwierdzeniu następuje nawigacja i czyszczenie stanu.
Błąd bazy podczas kończenia OFF-WALL|Widok i stan odtwarzania pozostają, widoczny jest błąd; poprawne ponowienie prowadzi do analityki.
Brak potwierdzenia podczas kończenia OFF-WALL|Formularz i stan pozostają do ponowienia; późniejsze potwierdzenie kończy sesję.
Oczekiwanie komponentu na potwierdzenie serwera|Przycisk jest zablokowany; przed odpowiedzią nie ma nawigacji ani czyszczenia stanu.
Odrzucenie pustego treningu w widoku OFF-WALL|RPC nie jest wywoływane, stan nie jest czyszczony i pojawia się komunikat błędu.
`],
  'src/test/templates.test.ts': ['T2', 'TPL', 'symulacyjny', `
Model braku ćwiczeń w szablonie ON-WALL|Lokalna funkcja shouldShowAddExercise zwraca false.
Model obsługi ćwiczeń w szablonie OFF-WALL|Lokalna funkcja shouldShowAddExercise zwraca true.
Model ON-WALL z nieoczekiwaną listą ćwiczeń|Lokalna funkcja nadal zwraca false.
Model trasy sesji z szablonu ON-WALL|Lokalna funkcja daje /session/sess-123/boulders.
Model trasy sesji z szablonu OFF-WALL|Lokalna funkcja daje /session/sess-456/strength.
Model walidacji pełnego szablonu ON-WALL|Przygotowana poprawna konfiguracja daje true.
Model walidacji braku konfiguracji|Wartość null daje false.
Model walidacji sumy stref|Rozkład sumujący się do 150% daje false.
Model zakresu grade_focus|Wartość 5 poza zakresem -2 do 2 daje false.
Model zakresu długości treningu|Wartość 500 minut przekraczająca limit 300 daje false.
Model pól opcjonalnych szablonu|Minimalna konfiguracja z focus=custom daje true.
Deklarowana liczba szablonów systemowych|Lokalna tablica zawiera pięć wpisów.
Deklarowany typ szablonów systemowych|Wszystkie lokalne wpisy mają on_wall.
Deklarowany znacznik szablonów systemowych|Wszystkie lokalne wpisy mają is_system=true.
Model ochrony szablonu systemowego przed usunięciem|Lokalny predykat canDelete zwraca false dla przygotowanych wpisów.
Model dodawania ćwiczeń w OFF-WALL|Lokalny predykat dopuszcza obsługę ćwiczeń.
Model liczby ćwiczeń szablonu|Przygotowany lokalny obiekt zawiera trzy ćwiczenia.
`],
  'src/test/toast.test.ts': ['T2', 'TOAST', 'jednostkowy', `
Zamknięcie komunikatu akcją DISMISS_TOAST|Reducer zmienia open na false; upływ 3000 ms nie jest sprawdzany.
Limit liczby komunikatów|Dodanie pięciu komunikatów pozostawia nie więcej niż trzy.
Usunięcie komunikatu po identyfikatorze|Pozostaje jeden komunikat o identyfikatorze toast-2.
Aktualizacja treści komunikatu|Tytuł istniejącego komunikatu zmienia się na Updated.
Deklaracja położenia komunikatu|Asercja true równe true przechodzi; położenie elementu nie jest sprawdzane.
`],
  'src/test/userLevel.test.ts': ['T1', 'LEVEL', 'jednostkowy', `
Kompletność kanonicznej tabeli Font|Tabela zawiera mapowania dla wszystkich stopni wymienionych w teście.
Wartości kanonicznych przeliczeń Font na V-score|Przykładowe stopnie mają wartości wskazane przez asercje, np. 6a=3 i 7a=7.
Brak pustych wartości w tabeli Font|Każdy wynik jest liczbą nieujemną, różną od null i undefined.
Kompletność odwrotnej tabeli V-score|Dla indeksów 0–17 istnieją tekstowe odpowiedniki Font.
Wartości odwrotnej tabeli Font|Kontrolne wartości V-score mają oczekiwane etykiety Font.
Funkcja przeliczania Font według tabeli|Dla próbek zwracane są oczekiwane wyniki, np. 5a=1 i 7a=7.
Niezależność konwersji Font od wielkości liter|Zapisy 6A i 7A+ dają odpowiednio 3 i 8.
Odrzucanie nieprawidłowych stopni Font|Null, pusty tekst, nieznany zapis i V5 dają -1.
Konwersja wszystkich obsługiwanych stopni Font|Żaden obsługiwany stopień nie daje null ani undefined; wyniki są nieujemne.
Indeksy poprawnych stopni V-Scale|V0, V5, V10 i V16 dają odpowiadające liczby.
Odrzucanie nieprawidłowych stopni V-Scale|Null, pusty tekst, nieznany zapis i 6a dają -1.
Środek przedziału V-Scale w mapowaniu|Wynik próbki mapowania wynosi 4.
Mapowanie z pojedynczą granicą V-Scale|Granica minimalna lub maksymalna daje odpowiednio 2 lub 4.
Zapasowe granice Font w mapowaniu|Przy braku V-Scale wynik próbki wynosi 4.
Mapowanie z pojedynczą granicą Font|Kontrolne granice dają wyniki 7 i 6.
Mapowanie bez żadnych granic trudności|Wynikiem jest -1.
Pierwszeństwo V-Scale wobec Font|Przy obu skalach wybierany jest wynik V-Scale równy 6.
Budowanie słownika mapowań obiektu|Yellow, Green i Blue mają wartości 0,5, 2,5 i 4,5.
Dodawanie mapowań zawierających wyłącznie Font|Słownik zawiera etykietę FontOnly z wynikiem 8.
Odrzucanie mapowania bez poprawnych granic|Red jest pomijane, a poprawne Blue pozostaje w słowniku.
Kanoniczne stopnie Font dostępne bez etykiet obiektu|Słownik zawiera kontrolne stopnie Font i oczekiwane wartości.
Kanoniczne stopnie V-Scale dostępne bez etykiet obiektu|Słownik zawiera V0, V1, V5 i V10 z oczekiwanymi wartościami.
Pierwszeństwo mapowania obiektu przed tabelą kanoniczną|Nadpisane mapowanie 6a ma wartość 11.
Rozwijanie przejść według count|Trzy i dwa przejścia tworzą pięć próbek o oczekiwanych trudnościach.
Pomijanie stopni spoza słownika|Pozostają tylko dwie poprawnie rozpoznane próbki.
Interpolacja percentyla 75|Dla kontrolnej posortowanej tablicy wynik wynosi 6,25.
Percentyl pustego zbioru|Wynikiem jest -1.
Percentyl zbioru jednoelementowego|Dla próbki [5] wynik wynosi 5.
Skrajne percentyle|Percentyle 0 i 1 zwracają odpowiednio minimum 1 i maksimum 5.
Maksymalna trudność próbki|Maksimum tablicy kontrolnej wynosi 8.
Maksimum pustego zbioru|Wynikiem jest -1.
Zaokrąglanie wyniku do etykiety V-Scale|Kontrolne wyniki dają V0, V4, V5 i V10.
Ograniczanie zakresu etykiet V-Scale|Wynik ujemny daje null, a 20 jest ograniczane do V17.
Przeliczanie wyniku na etykietę Font|Kontrolne wartości dają 4, 5a i 7a; wynik ujemny daje null.
Dobór etykiety obiektu według trudności|Kontrolne wyniki dają Yellow i Blue.
Formatowanie według preferowanej skali V-Scale|Wynik 5 daje V5.
Formatowanie według preferowanej skali Font|Wynik 5 daje 6b.
Formatowanie kolorów przy dostępnych mapowaniach|Wynik 4,5 daje Blue.
Zapasowe formatowanie kolorów bez mapowań|Wynik 5 daje etykietę V5.
Poziom wspinacza w formacie Font i V-Scale|Oba formaty są niepuste i mają oczekiwany wzorzec tekstowy.
Poziom wspinacza dla wystarczających danych ON-WALL|Rozpoznawanych jest 14 przejść, a poziom jest dodatni i ma etykiety obu skal.
Wykluczenie sesji OFF-WALL z poziomu wspinacza|Sesje siłowe nie dostarczają przejść; hasData=false i totalBoulders=0.
Wykluczenie sesji spoza 90 dni|Dane spoza okna nie wystarczają do wyznaczenia poziomu.
Próg minimalnej liczby przejść poniżej minimum|Dla minimum minus jeden hasData=false i brak etykiety poziomu.
Próg minimalnej liczby przejść dokładnie na minimum|Dla minimalnej liczby przejść hasData=true i istnieje etykieta poziomu.
Brak historii do wyznaczenia poziomu|hasData=false; etykieta poziomu i maksimum mają null.
Częściowo brakujące mapowania poziomu|Dziesięć rozpoznanych przejść wystarcza do obliczenia poziomu.
Wybór najtrudniejszych przejść do poziomu|Z 35 przejść wybierane jest TOP_BOULDERS_COUNT; levelScore≈4,5 i maxScore=6,5.
Użycie wszystkich danych poniżej limitu próbek|Wykorzystywanych jest 12 przejść, a levelScore wynosi 4,5.
Prezentacja poziomu zgodnie z preferencją|Skala V-Scale daje etykietę V, a kolory dają Blue.
Diagnostyka braku mapowań|missingMappings=true i hasData=false dla danych testowych.
Poprawność wyników obiektu korzystającego tylko z Font|Co najmniej trzy etykiety mają nieujemne V-score.
Poziom wspinacza w obiekcie korzystającym tylko z Font|Dziesięć przejść daje dane i niepuste etykiety Font oraz V-Scale.
Poziom wspinacza na podstawie kolorów|Etykietą poziomu jest Green, a oba formaty liczbowe mają poprawny wzorzec.
Poziom wspinacza na podstawie skali numerycznej|Etykietą poziomu jest 3, a oba formaty liczbowe mają poprawny wzorzec.
Odporność analityki na częściowe braki mapowań|Brak wyjątku; dziesięć rozpoznanych przejść daje hasData=true.
Całkowicie nierozpoznane przejścia|hasData=false, totalBoulders=0, a obie etykiety poziomu mają null.
Regresja odczytu Font bezpośrednio z grade_raw|Dwadzieścia przejść Font jest użytych do poziomu i daje obie etykiety.
Regresja mieszanych stopni Font|Dwadzieścia przejść daje levelScore≈5 i etykietę V5.
Regresja odczytu V-Scale bezpośrednio z grade_raw|Dwadzieścia przejść daje etykietę poziomu V6.
Diagnostyka niewystarczających rozpoznanych danych|hasData=false, rawLogsFound=2, unmappedLogs=1, totalBoulders=5.
`],
  'src/test/userLevelCache.test.ts': ['T1', 'CACHE', 'jednostkowy', `
Odczyt nieistniejącego cache poziomu|Funkcja przy zamockowanym Supabase zwraca null.
Typ rezultatu aktualizacji cache poziomu|Wynik rzeczywistej funkcji z mockami ma typ boolean; wartość ani zapis nie są sprawdzane.
Deklarowany kształt danych cache|Lokalny obiekt zawiera level_score, obie etykiety i computed_at.
`],
};

export const limitations = {
  jednostkowy: 'Lokalne dane testowe; brak pełnej ścieżki użytkownika i komunikacji z produkcją.',
  'src/test/auth.test.ts': 'Test deklaratywny: lokalne stałe, obiekty lub mock nawigacji. Nie renderuje stron i nie testuje Supabase Auth ani ochrony tras.',
  'src/test/templates.test.ts': 'Test kopii funkcji i lokalnych przykładowych szablonów zdefiniowanych w pliku testowym; brak importu logiki szablonów aplikacji.',
  'src/test/listPager.test.ts': 'Test lokalnej kopii funkcji paginate; nie uruchamia usePagination ani komponentu listy.',
  'src/test/sessionPersistence.test.ts': 'Bezpośrednie operacje na mocku localStorage; brak rzeczywistych zdarzeń przeglądarki, hooka trwałości i zapisu do bazy.',
  'src/test/atomicSessionSave.test.ts': 'Rzeczywisty lokalny silnik PostgreSQL/PGlite, lecz uproszczony schemat i testowe polityki RLS z fixtures/sessionSchema.sql. Nie dowodzi poprawności produkcyjnych polityk RLS, REST ani wieloprocesowej współbieżności. Część asercji akceptuje dowolny wyjątek.',
  'src/test/offlineSync.test.tsx': 'Rzeczywisty hook i moduł synchronizacji; fake-indexeddb oraz mock RPC. Brak rzeczywistego dysku, przeglądarki, sieci i serwera Supabase.',
  'src/test/offlineIndicator.test.tsx': 'Rzeczywisty komponent i hook; jsdom, fake-indexeddb i mock RPC. Komunikat workera jest sztucznym zdarzeniem.',
  'src/test/strengthCompletion.test.tsx': 'Rzeczywisty komponent StrengthSession w jsdom; mocki Supabase, uwierzytelnienia i trwałości, dane z cache QueryClient. Bez rzeczywistego serwera i urządzenia.',
  'src/test/pwa.test.ts': 'Rzeczywisty build w pamięci; worker w node:vm, CacheStorage i sieć zastąpione symulatorem. Bez rejestracji, instalacji PWA i cyklu życia workera w przeglądarce.',
  'src/test/userLevelCache.test.ts': 'Klient Supabase i computeUserLevel są zamockowane; nie jest badany rzeczywisty cache bazy danych.',
  'src/test/example.test.ts': 'Asercja kontrolna true === true; brak pokrycia funkcjonalnego aplikacji.',
};
