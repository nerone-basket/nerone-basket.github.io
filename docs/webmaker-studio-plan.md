# WebMAKER Studio: piano MVP

Branch di lavoro: `feat/webmaker-studio-mvp`. Il workflow Pages pubblica solo `main` o una richiesta manuale; questo branch non avvia il deploy.

## Dati e vincoli verificati

- Il sito legge `site/data/games/<stagione>/<campionato>.csv`, `site/data/player-stats/`, `site/data/teams.yaml`, `site/data/players/*.yaml`, `site/data/rosters.csv` e `site/content/news/*.md` con `site/scripts/build-data.mjs`.
- Nel 2026/27 le due squadre Nerone hanno ID distinti (`nerone`, `nerone-bounganvillae`) nello stesso campionato `platinum`. Le amichevoli usano `phase: friendly`.
- `deploy.yml` esegue `npm ci` e la build statica del sito sui push a `main`. Studio non entra nel bundle pubblico.
- Gli ID già pubblicati restano immutabili; i CSV possono avere colonne aggiuntive e il Markdown front matter può avere metadati aggiuntivi.

## Architettura

`studio/` contiene React, TypeScript e Tauri 2. Il frontend offre gli editor e conserva colonne/metadati sconosciuti. Il backend Rust è l'unica parte che legge/scrive file e lancia Git: verifica la cartella, limita i percorsi, salva atomicamente con backup, valida i riferimenti, esporta/ripristina backup e usa argomenti Git strutturati. Non richiede server, database o credenziali proprie.

## Percorso verificabile

1. Credito discreto nel footer pubblico; build e controllo delle pagine statiche.
2. Apri una copia locale del repository, modifica una partita, salva sul PC e verifica il diff.
3. Valida dati e riferimenti; mostra anteprima dei dati e dei file che verrebbero pubblicati.
4. Mostra un dry run della pubblicazione. Il push effettivo richiede branch `main`, remoto ufficiale, nessuna divergenza e conferma esplicita nell'interfaccia.
5. Test di parser, validazione e protezioni dei percorsi; `cargo check` e build dove supportati.

Il generatore grafico resta invariato. Studio può aprire il sito nel browser per usarlo, mentre l'anteprima interna rappresenta i dati e non sostituisce il rendering del sito.
