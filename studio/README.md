# WebMAKER Studio 0.2.2

App Windows locale per aggiornare i contenuti del sito Nerone Basket Anzio. Il sito pubblico rimane in `site/` e GitHub Pages continua a pubblicare il branch `main` con il workflow esistente.

## Stato e limiti della versione

Studio modifica file CSV, YAML e Markdown già usati dal sito. Mostra un'anteprima **dei dati**, non una versione renderizzata del sito. L'anteprima completa richiede la build del sito (`cd site`, `npm ci`, `npm run build`). La pubblicazione mostra il commit e il workflow GitHub Actions; il successo del push non equivale al completamento del deploy, che va controllato nel link Actions. Non c'è un account Studio, un database cloud, né un pannello `/admin`.

L'app richiede Git for Windows e Git Credential Manager configurati nel PC dell'operatore. L'operatore non deve installare Node.js o Rust **dopo** aver ricevuto un installer compilato. Il developer usa Node/Rust per costruirlo. Alcuni PC richiedono il runtime WebView2, gestito dal normale installer Tauri/Windows.

## Setup sviluppatore (Windows)

1. Installa Node.js 22.13+, Rust stable con target MSVC, Visual Studio Build Tools C++ e WebView2. Installa Git for Windows.
2. Nella cartella `studio/` esegui `npm ci`.
3. Esegui `npm test`, `npm run build`, `cargo check --manifest-path src-tauri/Cargo.toml`.
4. Esegui `npm run tauri dev` per aprire la finestra desktop.
5. Per generare installer Windows esegui `npm run tauri build`; il risultato, se la build termina correttamente, è in `src-tauri/target/release/bundle/` (`.msi`/NSIS). Non distribuire un installer non verificato.

Lo Studio non viene compilato dal workflow Pages: la build pubblica continua a usare soltanto `site/`.

## Prova sicura senza toccare il sito pubblico

Usa il branch `feat/webmaker-studio-mvp` o un worktree di test con il remote `origin` ufficiale. Apri quella cartella in Studio. La sezione **Pubblica** visualizza il diff, ma blocca il push perché il branch non è `main`.

Percorso rapido di test:

1. Apri il repository con **Apri progetto locale**. Studio verifica `.git`, `site/`, remote e scrittura.
2. In **Partite**, scegli `2026-27/platinum.csv`; modifica una partita di prova o creane una. Le righe CSV non toccate restano identiche, incluse colonne sconosciute.
3. La bozza viene salvata automaticamente in `%LOCALAPPDATA%\WebMAKER Studio\...\drafts`; usa **Annulla** per tornare indietro nell'editor.
4. Usa **Salva sul PC** per applicare la bozza al repository. Studio salva in modo atomico e crea una copia precedente in `%LOCALAPPDATA%\WebMAKER Studio\...\backups`.
5. Usa **Pubblica → Valida** per controllare squadre, giocatori, roster, partite e notizie. In **Anteprima commit / push** leggi i file selezionati e il diff. Nessun push viene fatto da questa schermata.
6. Controlla con `git diff -- site/data/games/2026-27/platinum.csv`. Per ripartire, usa una copia/worktree di test o ripristina consapevolmente il file con Git.

Le bozze auto salvate restano sul PC finché il file non viene salvato; anche i nuovi profili e articoli non ancora salvati ricompaiono nell'elenco alla riapertura. Se hai modificato lo stesso file da un altro programma, Studio blocca la sovrascrittura e conserva la bozza: riapri il file e confronta le versioni.

## Lavoro quotidiano dell'operatore

- **Squadre / Giocatori / Roster:** gli ID restano stabili; i campi YAML o colonne CSV non gestiti dall'interfaccia vengono mantenuti. Per le foto importa prima l'immagine in **Immagini**, poi copia il percorso `/assets/...` nel profilo o nella notizia.
- **Nuove squadre:** in **Squadre**, inserisci ID stabile, nome completo e breve. Aggiungila alla bozza, imposta i loghi se disponibili e premi **Salva sul PC**. Solo dopo il salvataggio compare nei menu delle partite e dei campionati. Gli ID esistenti non si rinominano.
- **Stagioni e campionati:** in **Campionati** scegli la stagione, modifica nome, squadre Nerone partecipanti e punti classifica oppure crea un nuovo campionato. Puoi aggiungere anche una stagione e decidere separatamente quando renderla corrente. Salva la configurazione; in **Partite** apparirà il nuovo archivio CSV, creato sul disco quando salvi il primo contenuto. Gli ID restano fissi perché collegano gli archivi storici.
- **Partite:** scegli stagione/campionato dal file, modifica data, squadre, punteggi e luogo. Una nuova partita riceve un ID unico che non cambia in seguito.
- **Notizie:** Markdown con front matter YAML. Lo slug è derivato dal titolo alla creazione; titolo, data, copertina e collegamenti sono modificabili. L'anteprima Markdown è isolata in un iframe senza script.
- **Backup:** esporta un ZIP v1 di dati/notizie/immagini. Il ripristino standard aggiunge solo file assenti e segnala i conflitti. Il ripristino con sovrascrittura è una scelta separata e conserva una copia locale precedente.
- **Generatore grafiche:** il generatore già pubblicato si apre nel browser; Studio non modifica il suo codice o il suo flusso.

## Autenticazione e pubblicazione

Accedi a GitHub tramite Git Credential Manager, per esempio con un normale `git push` da terminale o GitHub Desktop, e lascia che sia Git a gestire la credenziale. Studio non chiede e non salva PAT.

Per pubblicare usa una copia autorizzata sul branch `main` e il remote ufficiale `nerone-basket/nerone-basket.github.io`. Premi **Sincronizza da GitHub**, salva e valida, seleziona soltanto i file dati/media desiderati, leggi il dry run, scrivi un messaggio commit e digita `PUBBLICA SU MAIN`. Il backend esegue ancora `git fetch origin main` prima di stage/commit/push. Blocca branch diversi, remote diversi, file già in staging, divergenze e dati invalidi. Lo staging è limitato ai percorsi selezionati: mai `git add .`.

Se il push riesce, apri il link **Workflow Actions** mostrato da Studio. Attendi che build e deploy siano verdi prima di considerare aggiornato il sito pubblico. In caso di push fallito dopo il commit, Studio mostra lo SHA del commit locale: non ripetere automaticamente la procedura senza prima controllare lo stato Git.

## Backup e formato

Lo ZIP contiene `manifest.json` con `format: webmaker-nerone-backup` e `version: 1`, oltre a file sotto `site/data/`, `site/content/news/` e, se richiesto, `site/public/assets/`. Studio rifiuta path fuori da queste cartelle, file troppo grandi e versioni future non riconosciute. I vecchi ZIP v1 restano leggibili dalla serie 0.1. I backup di sicurezza dei singoli salvataggi restano in `%LOCALAPPDATA%` e non vengono aggiunti a Git.

## Problemi frequenti

- **Repository rifiutato:** scegli la root con `.git` e `site/`; controlla `git remote -v` e i permessi di scrittura.
- **CSV/YAML non valido:** Studio segnala il file; correggilo, senza azzerarlo o creare automaticamente contenuti sostitutivi.
- **Pubblica bloccato:** controlla branch, origin, staging, validazione e divergenza da `origin/main`. Risolvi i conflitti con Git/GitHub Desktop prima di tornare in Studio.
- **Credenziali Git:** verifica Git Credential Manager (`git credential-manager version`) e autentica GitHub fuori da Studio.
- **Build dell'installer fallita:** verifica target MSVC, Visual Studio Build Tools, WebView2 e `cargo check`; non serve cambiare il workflow Pages.
