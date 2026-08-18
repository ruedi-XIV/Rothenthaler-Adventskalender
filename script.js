Eingefügter Text(3).txt
Dokument

Eingefügter Text(4).txt
Dokument
füge du alles richtig ein

Eingefügter Text(5).txt
Dokument

markdown(1).md eingefügt
Datei

Eingefügter Text(6).txt
Dokument

Eingefügter Text(7).txt
Dokument

Eingefügter Text(8).txt
Dokument

Ja, das lässt sich sauber beheben. In deinem Code hängt Türchen schließen → Abschiedsgruß ausschließlich daran, dass YouTube zuverlässig den Status ENDED meldet. Genau dieser Status ist laut YouTube eigentlich 0, aber im WhatsApp-WebView kommt das Ereignis offenbar nicht immer sauber bei deinem JavaScript an.

Die robuste Lösung ist deshalb: Wir lassen onStateChange bestehen und bauen zusätzlich eine kleine Endkontrolle ein, die regelmäßig getCurrentTime() und getDuration() prüft. YouTube stellt beide Funktionen offiziell bereit. Sobald das Video praktisch am Ende angekommen ist, rufen wir einmalig videoBeendet() auf. Dann funktionieren wieder Türchen schließen → letzter Gruß → Schnee.

Dabei müssen wir unbedingt verhindern, dass videoBeendet() zweimal ausgelöst wird, falls YouTube ENDED doch noch meldet.

Schick mir bitte deine aktuelle script.js noch einmal – also die Version mit dem „▶ Video auf YouTube öffnen“-Fallback. Dann setze ich dir die Endkontrolle komplett und sauber ein und gebe dir wieder den vollständigen Text zum Ersetzen.

Eingefügter Text(9).txt
Dokument

Ich habe deine aktuelle script.js jetzt mit einer robusten Endkontrolle ergänzt. Deine bisherige Version schließt das Türchen nur, wenn YouTube zuverlässig YT.PlayerState.ENDED meldet. Genau das scheint im WhatsApp-Browser manchmal auszufallen.

Die neue Version erkennt zusätzlich, wenn das Video fast am Ende war und anschließend auf 0:00 zurückspringt. Dann wird trotzdem einmalig videoBeendet() ausgelöst, sodass wieder Video ausblenden → Türchen schließen → Abschiedsgruß läuft. Deine bestehende Abschlussroutine bleibt dabei unverändert.

Hier ist die fertige Datei:

Wenn du wieder lieber den kompletten Text direkt hier im Chat möchtest, schicke ich ihn dir auch vollständig zum Kopieren.

ja, bitte

Ja. Hier ist der komplette fertige Text für deine script.js mit der zusätzlichen Endkontrolle.

Die neue Sicherung erkennt jetzt zusätzlich den Fall, dass das Video am Ende auf 0:00 zurückspringt, ohne dass YouTube sauber ENDED meldet. Deine bisherige Abschlussroutine mit Türchen schließen und Abschiedsgruß bleibt dabei erhalten.

In VS Code wieder: script.js öffnen → Strg+A → alles löschen → kompletten Text einfügen → Strg+S → Commit → Push origin.

                }
            );


            container.appendChild(
                button
            );
        }
    );


    tuerchenAktualisieren();
}


/* =========================================================
   TESTMODUS
   ========================================================= */

testmodus.addEventListener(
    "change",
    () => {

        testtag.disabled =
            !testmodus.checked;


        tuerchenAktualisieren();
    }
);


testtag.addEventListener(
    "change",
    tuerchenAktualisieren
);


/* =========================================================
   VIDEO SCHLIESSEN
   ========================================================= */

videoSchliessen.addEventListener(
    "click",
    videoManuellSchliessen
);


videoFenster.addEventListener(
    "click",
    (ereignis) => {

        if (
            ereignis.target ===
            videoFenster
        ) {

            videoManuellSchliessen();
        }
    }
);


/* =========================================================
   ESC-TASTE
   ========================================================= */

document.addEventListener(
    "keydown",
    (ereignis) => {

        if (
            ereignis.key ===
                "Escape" &&
            !videoFenster.classList.contains(
                "verborgen"
            )
        ) {

            videoManuellSchliessen();
        }
    }
);


/* =========================================================
   KALENDER STARTEN

Danach wieder Strg+S → Commit → Push origin.

Jetzt sollte der Abschluss auch dann ausgelöst werden, wenn WhatsApp das Video am Ende einfach auf 0:00 zurücksetzt, statt das normale YouTube-Endsignal sauber zu melden.


