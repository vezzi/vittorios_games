# Piano Parla

**Da implementare.** Riferimento di partenza `b9f624e`.

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

- [ ] Prima dell’attivazione di **Parla** il riconoscitore riceve zero chiamate a `start()`. Dopo un’attivazione ne riceve una sola, anche con tocchi ripetuti. Su Mac l’indicatore del microfono sparisce alla fine e non si riaccende al cambio di turno, di scheda o al termine della narrazione.
- [ ] I due comandi validi eseguono ciascuno l’azione una sola volta, con gli stessi effetti del pulsante del turno. Frasi sconosciute, inversioni di fase, risultati intermedi e duplicati non producono azioni aggiuntive.
- [ ] Il test controlla che la sessione sia ancora valida immediatamente prima di 4.000 ms e scada esattamente a 4.000 ms. Risultati al limite o oltre, permesso tardivo ed eventi di una sessione precedente non modificano la partita. Sul browser di riferimento si verifica anche la chiusura del microfono nel caso del primo permesso lasciato in attesa.
- [ ] Annullamento su azione manuale, finestra di gioco o cambio scheda verificato. Un nuovo tentativo funziona dopo il termine di una sessione. Per permesso negato, API assente e servizio indisponibile la partita rimane giocabile.
- [ ] La suite completa passa. Su Mac si verifica la partita con i controlli esistenti e si riprende un salvataggio. I controlli manuali funzionano anche dal Finder e offline. Per la voce si registra il comportamento osservato nei due modi di apertura.

## Evidenze

Sul codice di partenza `node --test pimpa/tests/*.test.cjs` passa con 4 test. I test vocali e le prove con il microfono sono previsti per l’implementazione. Aggiorna questa sezione con il numero di test superati, browser e versione, modo di apertura, modalità di riconoscimento e risultati delle prove manuali della [guida ai test](../TESTING.md). Se il browser può riaprire il microfono dopo la scadenza, registra il caso come non superato per quella configurazione.
