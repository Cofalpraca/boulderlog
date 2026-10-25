# Pochodzenie początkowego przebiegu roboczego

Polecenia `npm test`, `npm run build` i `npm run lint` zostały rzeczywiście wykonane; ich wyjścia, kody i czasy są zapisane w tym katalogu. Początkowa próba uruchomienia skryptu nastąpiła podczas jego opracowywania. Opcja przekazana przez powłokę npm nie dotarła do skryptu; po zebraniu wszystkich trzech poleceń próba renderowania zakończyła się `ERR_MODULE_NOT_FOUND` dla niegotowego jeszcze `scripts/testing/render.mjs`.

Po ukończeniu renderera ten sam, zachowany surowy przebieg wyrenderowano poleceniem `node scripts/testing-report.mjs --render latest`. Nie zastąpiono wyników testów ani logów. Ten archiwalny raport nie ma jeszcze rozszerzonego katalogu `input-sources/`; dowody kodu stanowią commit bazowy i `source-manifest.json`. Początkowe odnośniki w archiwalnych kopiach dokumentów są zapisane względem głównego `docs/testing/`; użyj znajdujących się tutaj surowych plików lub bieżącego raportu z następnego przebiegu.

Jest to zapis rozwoju narzędzia raportującego, nie niepowodzenie asercji aplikacji. Kolejny pełny przebieg gotowego generatora ma osobny katalog i nie nadpisuje tych materiałów.
