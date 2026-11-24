# Guida ai test

## Suite del gioco

Esegui questo comando dalla cartella principale con Node.js.

```sh
node --test pimpa/tests/*.test.cjs
```

[`journey.test.cjs`](../pimpa/tests/journey.test.cjs) controlla la coerenza tra percorso, selezione e scene, la presenza degli asset, i collegamenti tra caselle, la ripresa del viaggio in ogni fase e gli effetti speciali. Lo stesso comando esegue [`voice.test.cjs`](../pimpa/tests/voice.test.cjs). Entrambi funzionano senza browser o server locale.

## Test automatici di Parla

Il riconoscitore finto permette di inviare gli eventi in ordine controllato e di contare `start()`, `abort()` e le azioni di gioco. Con un orologio controllabile si verificano questi casi senza aspettare quattro secondi reali.

- Due frasi valide, con prove di maiuscole, spazi e punteggiatura. Frasi simili, sconosciute o valide nella fase sbagliata lasciano il turno fermo.
- Un tocco avvia una sola sessione. Un risultato intermedio non esegue l’azione. Il primo risultato finale consuma la sessione e gli eventuali duplicati non causano ulteriori azioni.
- Il risultato a 3.999 ms può eseguire un’azione. Quello a 4.000 ms viene scartato anche se il callback del timer è in ritardo. Gli eventi tardivi non alterano il tentativo successivo.
- Annullamento, fine senza risultato, errori di avvio o del servizio e API assente lasciano utilizzabile il gioco. Dopo la fine si può riprovare con un nuovo tocco.

## Prova sul Mac

Per la verifica sul browser usa l’avvio locale descritto nel [README](../README.md#avvio-con-un-server-locale). Prima di avviare il server di prova, controlla la porta con `lsof -nP -iTCP:8766 -sTCP:LISTEN`. Se è già in uso, scegli una porta libera e usa lo stesso numero nei comandi e nell’indirizzo del browser. Al termine premi **Ctrl+C** nel terminale del server di prova, anche in caso di test fallito, e ripeti il controllo sulla porta scelta per confermare che sia spento.

Per la regressione del gioco, apri anche `pimpa/dist/index.html` dal Finder. Lancia dal pulsante e dal dado, muovi dal pulsante e dalla pedina e verifica che si apra la scena. Prova con l’audio italiano, ricarica una partita durante un viaggio e verifica che il turno venga completato una volta sola. Dal Finder prova anche senza connessione.

## Prove di Parla con il microfono

Usa il microfono effettivo del Mac e osserva l’indicatore del browser o di macOS oltre al messaggio nella pagina.

| Prova | Cosa osservare |
| --- | --- |
| Carica la pagina e gioca un turno senza usare **Parla** | Il microfono rimane chiuso, anche durante la narrazione e al passaggio di turno. |
| Attiva **Parla** nella fase di lancio e pronuncia «lancia il dado», poi ripeti nella fase di movimento con «muovi» | Il microfono si apre solo dopo l’attivazione. Ogni azione avviene una volta e il microfono si chiude al primo risultato. Prova anche l’attivazione da tastiera. |
| Attiva **Parla** e taci, prova una frase estranea e poi usa un comando nella fase sbagliata | L’ascolto termina al primo risultato o dopo al massimo quattro secondi. Il turno resta fermo. |
| Attiva **Parla**, poi usa il pulsante di gioco, apri le regole o passa a un’altra scheda mentre ascolta | L’ascolto viene annullato subito. Il ritorno alla partita non riapre il microfono. |
| Al primo permesso aspetta più di quattro secondi prima di accettare | Nessun ascolto o azione proveniente dal tentativo scaduto. Un nuovo tocco deve poter avviare la prova. |
| Nega il permesso, prova senza rete e prova un browser senza riconoscimento disponibile | Il pannello indica come continuare quando la voce non è disponibile. Con riconoscimento locale attivo, prova entrambi i comandi offline. I pulsanti del gioco funzionano in ogni caso. |
| Ripeti l’apertura dal Finder | Il gioco si avvia. Registra se il browser offre Parla anche in questa modalità. |

Annota nel [piano Parla](plans/PARLA.md#evidenze) la versione del browser, il modo di apertura, la modalità di riconoscimento e gli esiti. Le prove con esito incerto o senza microfono rimangono da verificare.
