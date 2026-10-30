# Nerone Basket Anzio

Sito statico per risultati, classifiche, roster, calendario e notizie del Nerone Basket Anzio. Lo storico 2025/26 conserva il campionato Platinum; nella stagione 2026/27 Nerone e Nerone BGV partecipano all'Amatori UISP.

Questa è una versione specializzata di [WebMAKER](https://github.com/PlayMAKER-apps/webmaker) per il Nerone Basket Anzio.

## Sviluppo locale

```powershell
cd site
npm install
npm run dev
```

Il sito viene pubblicato automaticamente su GitHub Pages quando le modifiche arrivano sul branch `main`.

## WebMAKER Studio (sviluppo)

L'app Windows locale per gestire i contenuti è in [`studio/`](studio/README.md). Dati e sito restano file nel repository: lo Studio salva bozze sul PC, valida i contenuti e separa il salvataggio dalla pubblicazione. Questa versione non aggiunge un pannello web `/admin` né cambia il workflow GitHub Pages.

I dati modificabili si trovano in `site/data`; gli articoli in `site/content/news`.

Le stagioni e i campionati disponibili sono dichiarati in `site/data/competitions.yaml`. I risultati sono salvati in `site/data/games/<stagione>/<campionato>.csv`; quando è disponibile una classifica ufficiale completa può essere inserita in `site/data/standings/<stagione>/<campionato>.csv` mantenendo l'ordine ufficiale.

Le classifiche dei play-in e i riferimenti alle partite del bracket sono salvati in `site/data/postseason/<stagione>/<campionato>.yaml`.

I loghi della stagione 2025/26 sono generati con `site/scripts/process-logos.py`: lo script elimina i margini trasparenti, centra ogni marchio in un quadrato e lo esporta in WebP.

## Graphic Generator 2026

Aprire `/graphic_generator_26` sul sito. La pagina non compare nella navigazione ed è esclusa dall'indicizzazione, ma l'URL da solo non limita l'accesso: se serve un'area davvero privata occorre aggiungere autenticazione a livello di hosting.

Il generatore crea in locale nel browser PNG 1080 × 1350 per Calendario, Week, Matchday e Risultato. Week può anche esportare una storia 1080 × 1920. Le foto caricate non vengono salvate sul server. In Week ogni GLASS partita ha un incontro indipendente, selezionabile dal calendario o compilabile a mano, con titolo, squadre, loghi, campionato, data e indirizzo propri. Un GLASS sponsor Mastroianni è presente inizialmente e si dimensiona sui pixel visibili del logo con un margine di 24 px. La sfocatura dello sfondo parte da zero ed è regolabile. Si può caricare un PNG trasparente delle stesse dimensioni della foto originale per mettere i GLASS davanti o dietro il soggetto. Il calendario può importare le partite pubblicate nel sito o un CSV con colonne `club,date,time,opponent,at_home`; il pulsante «Scarica CSV sito» fornisce un file compatibile. Per mantenere leggibile un singolo post, il Calendario ospita al massimo sei appuntamenti per squadra. In Risultato il numero pieno segue la squadra Nerone o Nerone BGV, anche in trasferta; la posizione è selezionabile per le partite inserite a mano.

Matchday usa un layout con titolo GAME DAY verticale, sfondo colorabile e giocatore in primo piano da PNG già scontornato. Il generatore ritaglia i margini trasparenti del PNG, aggiunge ombre ai piedi e permette di regolare posizione e dimensione del soggetto. Data, ora, luogo, loghi delle squadre e sponsor sono modificabili; la scelta di una partita dal calendario compila i dati disponibili.

Gli asset dei template sono in `site/public/assets/elementi_social/`; i sample sono esclusi da Git. I loghi mono bianchi disponibili per Risultato sono in `site/public/assets/teams/2026-27/mono_white/`. I font Google (Bebas Neue, Arimo, Anton, DM Sans e Archivo Black come alternativa ad Aharoni) richiedono la rete al primo caricamento.
