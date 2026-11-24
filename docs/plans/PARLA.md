# Piano Parla

**Implementato.** Entrambi i comandi verificati con il microfono del Mac. Riferimento di partenza `b9f624e`.

## Obiettivo

Permettere a chi è di turno di lanciare il dado e muovere la pedina dicendo «lancia il dado» o «muovi» dopo aver attivato **Parla**. Ogni attivazione apre una finestra di ascolto per una sola frase, con un limite di quattro secondi. La prima versione usa il riconoscimento del browser, senza integrazione con OpenAI. Il gioco conserva il flusso manuale e i salvataggi esistenti.

## Comportamento atteso

| Situazione | Risultato |
| --- | --- |
| Il gioco attende un’azione e il giocatore attiva **Parla** | Una sola sessione `it-IT`. Il pulsante indica l’attivazione e poi mostra «Ti ascolto…» quando il browser inizia a acquisire audio. Un secondo tocco durante la sessione viene ignorato. |
| Il primo risultato finale arriva prima della scadenza | L’ascolto termina subito. In fase `roll`, «lancia il dado» lancia una volta. In fase `move`, «muovi» muove una volta. Il confronto ignora le differenze tra maiuscole e minuscole, gli spazi in più e la punteggiatura finale. |
| La frase è sconosciuta o non corrisponde alla fase | La sessione si chiude, la partita resta ferma e il pannello suggerisce la frase valida per il momento. «Tira», «non muovi» e una frase con entrambi i comandi restano senza effetto. |
| Passano 4.000 ms dall’attivazione, oppure il browser termina prima senza un risultato | La sessione si chiude senza azioni di gioco. Il pannello permette di riprovare. Dopo la scadenza vale solo un nuovo tocco, anche se il primo permesso arriva tardi. |
| Si avvia un’azione manuale, si apre una finestra di gioco o si lascia la scheda | La sessione si annulla e i risultati tardivi vengono ignorati. Durante l’avvio, le animazioni, la narrazione, la ripresa di un viaggio o la vittoria, **Parla** non è attivabile. |
| Il browser, il microfono o il servizio vocale sono indisponibili, oppure il permesso è negato | Il pannello indica come proseguire con i pulsanti. I normali controlli della partita restano utilizzabili. |

Una singola attivazione è legata alla fase del gioco in quel momento. Il gioco non salva l’audio o la trascrizione e non riapre il microfono al cambio di turno, dopo una scena o al ritorno alla scheda. Il riconoscimento può avvenire sul dispositivo o tramite il servizio integrato nel browser. [Decisioni di progetto](../../DECISION.MD)

## Ordine di lavoro e deliverable

1. **Verifica iniziale.** Esegui la suite esistente. Su un browser Mac di riferimento verifica il riconoscimento `it-IT`, la disponibilità sul dispositivo, il primo permesso e l’interruzione dalla pagina servita su `127.0.0.1`. Registra browser e versione. L’apertura dal Finder va verificata per il gioco di base e può offrire Parla se il browser lo consente.
2. **Pulsante e riconoscimento.** Aggiungi **Parla** e un messaggio di stato accessibile nel pannello del turno di [`index.html`](../../pimpa/dist/index.html) e [`style.css`](../../pimpa/dist/style.css). Crea un piccolo modulo browser per il ciclo di ascolto, caricato prima di `app.js`. Usa `SpeechRecognition` o la variante con prefisso `webkit` e richiedi il riconoscimento sul dispositivo quando il browser lo dichiara disponibile per l’italiano. Mantieni il riconoscimento non continuo e usa il primo risultato finale. Gestisci errore, fine senza risultato e avvio fallito. [Web Speech API](https://webaudio.github.io/web-speech-api/)
3. **Scadenza e integrazione.** Imposta il termine di quattro secondi prima di avviare il riconoscimento e verifica il tempo trascorso anche quando arriva un evento. Alla chiusura invalida la sessione, annulla il timer e chiama `abort()` se il riconoscitore è ancora aperto. I callback di una sessione chiusa non possono lanciare azioni, aggiornare quella nuova o far ripartire il microfono. In [`app.js`](../../pimpa/dist/app.js) controlla che tavolo, visibilità e fase consentano ancora l’azione, poi inoltra l’esito a `command("roll")` o `command("move")` una sola volta. Salvataggi e regole continuano a passare dagli stessi punti.
4. **Test e istruzioni per chi gioca.** Aggiungi `pimpa/tests/voice.test.cjs` con un riconoscitore finto e un orologio controllabile. Esegui la suite completa e le prove sul Mac. Aggiorna il [README](../../README.md) con l’uso di **Parla**, il permesso e l’eventuale uso della rete da parte del browser. Registra l’esito qui.

## Criteri di accettazione

- [x] Prima dell’attivazione di **Parla** il riconoscitore riceve zero chiamate a `start()`. Dopo un’attivazione ne riceve una sola, anche con tocchi ripetuti.
- [x] Con risultati simulati, i due comandi validi eseguono ciascuno l’azione una sola volta, con gli stessi effetti del pulsante del turno. Frasi sconosciute, inversioni di fase, risultati intermedi e duplicati non producono azioni aggiuntive.
- [x] La sessione è ancora valida immediatamente prima di 4.000 ms e scade esattamente a 4.000 ms. Risultati al limite o oltre ed eventi di una sessione precedente non modificano la partita.
- [x] Annullamento su azione manuale, finestra di gioco o cambio scheda verificato con eventi simulati. Un nuovo tentativo funziona dopo il termine di una sessione. Per permesso negato, API assente e servizio indisponibile la partita rimane giocabile.
- [x] La suite completa passa. In Chrome su Mac si riprende un salvataggio. I controlli manuali e la narrazione funzionano anche con apertura da file e rete disattivata.
- [x] Con il microfono del Mac e il gioco aperto da indirizzo locale, «lancia il dado» e «muovi» eseguono le azioni previste.
- [x] In una prova dal vivo senza parlare, l’indicatore del microfono scompare dopo circa quattro secondi.
- [ ] Con microfono fisico, verificare l’indicatore durante la narrazione e al cambio di scheda. Lasciare in attesa il primo permesso per oltre quattro secondi e confermare che il microfono resti chiuso. Registrare l’eventuale disponibilità della voce con apertura da Finder.

## Evidenze

- **Verifica iniziale.** La suite di partenza passa con 4 test. Su macOS 15.7.2, Chrome 158.0.8127.38 ha caricato il gioco con apertura via `file:` ed esposto la Web Speech API su `127.0.0.1`. Per `it-IT` il browser ha riportato `downloadable` per il riconoscimento sul dispositivo. Con un microfono simulato, la sessione di prova ha acquisito audio dopo il clic e si è chiusa in risposta ad `abort()` a quattro secondi.
- **Primo permesso.** In Chrome senza interfaccia, senza permesso precaricato, la prova termina subito con `not-allowed`. Impostare il permesso dopo la scadenza non ha riattivato la sessione. La finestra di permesso con microfono fisico resta da provare secondo la [guida ai test](../TESTING.md).
- **Suite finale.** `node --test pimpa/tests/*.test.cjs` passa con 13 test. In Chrome 158 su `127.0.0.1`, i risultati vocali simulati hanno verificato le due azioni, la tastiera, l’annullamento, la scadenza e il recupero di un viaggio salvato. Con apertura via `file:` e rete disattivata, partita e narrazione hanno funzionato con l’API vocale assente.
- **Riconoscimento nativo.** In Chrome senza interfaccia e con audio italiano preregistrato inviato al microfono simulato, il browser ha aperto e chiuso l’acquisizione per entrambi i tentativi. Le trascrizioni non sono arrivate entro quattro secondi.
- **Prova dal vivo.** Con il gioco aperto da indirizzo locale, entrambi i comandi vocali hanno funzionato con il microfono del Mac. In una prova senza parlare, l’indicatore si è spento dopo circa quattro secondi.
