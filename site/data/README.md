# Dati del sito

- `games`: una riga per ogni partita del campionato. Per le partite senza il Nerone bastano risultato, data e squadre.
- `player-stats`: archivio legacy mantenuto per compatibilità. Il sito non mostra più statistiche individuali e non occorre aggiornarlo.
- `rosters.csv`: collega un giocatore a campionato, squadra, stagione, numero e ruolo.
- `players`: un file YAML per giocatore. Il percorso sportivo resta discorsivo dentro `bio`; non esiste un campo `career`.
- `content/news`: articoli in Markdown.
- `home-social.json`: i tre post Instagram promossi nella home, mostrati nell'ordine indicato nel file.

Gli ID non vanno cambiati dopo la pubblicazione, perché collegano pagine, partite e notizie nel tempo.
