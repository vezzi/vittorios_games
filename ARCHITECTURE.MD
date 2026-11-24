# Architettura

## Il gioco oggi

Il gioco dell’oca di Pimpa è una pagina statica per 1–4 giocatori sullo stesso schermo. [`pimpa/dist`](pimpa/dist) contiene la versione giocabile e i file JavaScript da modificare. Il gioco si prova aprendo [`index.html`](pimpa/dist/index.html) dal Finder o tramite un server HTTP locale. La pagina carica gli script in ordine con `defer` e usa il motore Three.js incluso nel repository.

| File | Responsabilità |
| --- | --- |
| [`index.html`](pimpa/dist/index.html) e [`style.css`](pimpa/dist/style.css) | Plancia, pannello del turno, pulsanti, finestre di gioco e annunci accessibili. |
| [`game.js`](pimpa/dist/game.js) | Personaggi, caselle, percorso, regole, stato e validazione delle partite salvate. Le fasi sono `roll`, `move` e `won`. |
| [`app.js`](pimpa/dist/app.js) | Collega interfaccia, regole, plancia e scene. Gestisce il turno, i salvataggi e l’esecuzione di `command(action)`. |
| [`board.js`](pimpa/dist/board.js) | Deriva la geometria dalla disposizione delle caselle in `game.js`, identifica la casella toccata e associa le illustrazioni. |
| [`table3d.js`](pimpa/dist/table3d.js) e [`table-compatible.js`](pimpa/dist/table-compatible.js) | Presentano lo stesso tavolo con WebGL e con una vista compatibile se WebGL fallisce. Usano le azioni fornite da `app.js` per clic su dado, pedina e caselle. |
| [`stories.js`](pimpa/dist/stories.js) | Mostra le scene di arrivo, con animazioni, pausa, replay e audio italiano da [`assets/voce`](pimpa/dist/assets/voce). |
| [`render_board.py`](pimpa/tools/render_board.py) | Rigenera la stampa della plancia e le texture WebGL usate all’apertura dal Finder. È uno strumento di sviluppo. |

## Turni e salvataggi

1. Il pulsante del turno e i tocchi sul dado passano da `command("roll")`. L’app genera il valore, aggiorna e salva la partita, poi fa rotolare il dado. Al termine del lancio il gioco attende il movimento.
2. `command("move")` usa il percorso calcolato da `game.js` e mostra il movimento, le scene di arrivo e gli eventuali spostamenti aggiuntivi. `app.js` salva i progressi tramite `journey` (`walk`, `landed`, `travel`, `target`) e riprende un viaggio interrotto all’avvio. Le regole di arrivo si applicano una sola volta, al termine della sequenza.
3. `command()` verifica la fase corrente e impedisce richieste concorrenti mentre l’app è occupata. La stessa funzione alimenta `window.PimpaControls.roll()` e `.move()`.

`localStorage` conserva la partita in `pimpa.oca.v1` e l’impostazione audio in `pimpa.suono`. La partita ripresa dipende dal browser e dall’indirizzo usati per aprire il gioco. I salvataggi precedenti all’introduzione di `journey` sono ancora validi.

## Punto d’integrazione previsto per Parla

L’integrazione parte dal pannello del turno. Il riconoscimento del browser restituisce una frase e il componente vocale la traduce in `roll` o `move`. `app.js` verifica che la sessione appartenga ancora alla fase corrente e passa l’azione a `command()`. Le scene di arrivo possono già parlare con l’audio italiano incluso nel gioco. L’ascolto del microfono sarà una funzione del pannello del turno con un proprio pulsante e indicatore.

Il [piano Parla](docs/plans/PARLA.md) definisce le condizioni di avvio, chiusura e passaggio alla funzione `command()`. La [guida ai test](docs/TESTING.md) riporta la copertura esistente.
