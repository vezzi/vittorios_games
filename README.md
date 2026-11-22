# vittorios_games

Giochi per Vittorio.

## Il gioco dell’oca di Pimpa

Un gioco da tavolo in 3D per 1–4 persone sullo stesso schermo. Il tabellone riproduce quello delle foto di famiglia. Il codice del gioco, il motore 3D, i caratteri e le immagini sono tutti nella cartella [pimpa/dist](pimpa/dist). Puoi giocare sul Mac anche senza connessione o account ChatGPT.

### Avvio con un doppio clic

Nel Finder apri la cartella `pimpa`, poi `dist`, e fai doppio clic su **index.html**. Si aprirà nel browser. Tieni insieme i file di `dist` quando sposti il gioco.

### Avvio con un server locale

Per usare un indirizzo fisso, apri il Terminale nella cartella principale del repository ed esegui questo comando con Python 3:

```sh
python3 -m http.server 8766 --bind 127.0.0.1 --directory pimpa/dist
```

Apri [il gioco su questo computer](http://127.0.0.1:8766/). Il server accetta connessioni solo dal tuo Mac. Tieni aperto il Terminale mentre giocate e premi **Ctrl+C** per spegnere il server. Per giocare un altro giorno, rilancia lo stesso comando.

La partita si salva nel browser. Per riprenderla, usa lo stesso browser e lo stesso metodo di avvio. L’apertura dal Finder e l’indirizzo del server locale hanno salvataggi separati.

### Come si gioca

1. Premi **Modifica** per scegliere le pedine e i nomi dei giocatori.
2. Quando tocca a te, premi **Lancia il dado** o fai clic sul dado rosso.
3. Conta i puntini, poi premi **Muovi** o fai clic sulla tua pedina. Il gioco applica gli effetti delle caselle speciali.
4. Raggiungi la maga per vincere. Puoi toccare qualsiasi casella per leggerne il testo o trascinare il tavolo per cambiare prospettiva.

![Il tabellone di Pimpa con le pedine e il dado sul tavolo 3D](pimpa/anteprima.jpg)
