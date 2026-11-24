# Decisioni di progetto

## Il gioco si apre come sito statico

**In uso.** La cartella `pimpa/dist` è la copia giocabile. I file del gioco, le immagini, la voce italiana, i caratteri e Three.js vengono distribuiti insieme. L’apertura dal Finder e l’avvio su indirizzo locale consentono di giocare anche offline. Le texture locali e la vista compatibile coprono l’apertura da file e i browser senza WebGL.

## Ogni modalità di input usa le stesse azioni di turno

**In uso.** `game.js` definisce le regole. `app.js` coordina salvataggi, animazioni e scene tramite `command(action)`. Il pulsante del turno, la plancia e Parla usano questo percorso, così la partita applica i controlli di fase e di concorrenza sempre nello stesso punto.

## Parla usa il riconoscimento del browser per una frase

**In uso.** Il giocatore attiva **Parla** nel pannello del turno. Il primo risultato finale chiude la sessione, con una scadenza di quattro secondi dall’attivazione. Il gioco esegue solo «lancia il dado» o «muovi», nella fase corrispondente. I pulsanti esistenti restano disponibili per giocare in qualsiasi browser supportato dal gioco.

Il riconoscimento italiano sul dispositivo ha la precedenza quando il browser lo dichiara disponibile. Altrimenti si usa il riconoscimento integrato del browser, che può elaborare l’audio online. Il gioco comunica questa possibilità e usa il normale permesso del browser. La funzione opera senza OpenAI, chiavi API o servizi aggiuntivi gestiti dal progetto. [Web Speech API](https://webaudio.github.io/web-speech-api/)

I casi di errore, i tempi esatti e le prove sul Mac sono nel [piano Parla](docs/plans/PARLA.md).

## La narrazione usa registrazioni pronte da riprodurre

**In uso.** Le scene riproducono i 31 MP3 inclusi in [`assets/voce`](pimpa/dist/assets/voce), anche offline. Ogni traccia contiene la battuta e l’indicazione di gioco di `PimpaStories.storyFor()`. Per la nuova voce italiana abbiamo generato i file in locale con Kokoro v1.0, voce Sara (`if_sara`), a velocità `0.92`, e li abbiamo normalizzati allo stesso livello di ascolto. [Kokoro-82M e voci](https://huggingface.co/hexgrad/Kokoro-82M/blob/main/VOICES.md)
