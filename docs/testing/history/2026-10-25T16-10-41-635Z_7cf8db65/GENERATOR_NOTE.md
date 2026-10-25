# Interpretacja przebiegu weryfikującego historię

Zestaw aplikacji rzeczywiście uzyskał 292 PASS, build zakończył się kodem 0, a lint zgłosił 16 błędów i 12 ostrzeżeń. Pięć dodatkowych błędów względem poprzedniego przebiegu pochodzi z kopii `mappingHealth.test.ts` i `toast.test.ts` zapisanych w `input-sources/`, które ESLint analizował jako zwykłe pliki TypeScript. Surowe logi i raporty tego przebiegu pozostają niezmienione.

W następnym przebiegu wyłączono z ESLint jedynie wygenerowany katalog `docs/testing/history/**`. Nie zmieniono reguł dla oryginalnych źródeł, testów, ich asercji ani logiki aplikacji. Nie jest to naprawa pierwotnych błędów linta. Ten przebieg dokumentuje wykryty efekt uboczny narzędzia raportowania.
