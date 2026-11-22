# Istruzioni del progetto

Chiudi sempre i server locali che avvii per questo progetto appena terminati i test, anche se un test fallisce. Prima di concludere, verifica che il server sia spento.

Tieni chiavi API, token e credenziali fuori dal repository, inclusi gli asset generati. In ogni nuova copia abilita il controllo prima del commit con `git config --local core.hooksPath .githooks`. Se il controllo segnala un file, verifica la corrispondenza senza stampare il valore.
