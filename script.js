Eingefügter Text(3).txt
Dokument

Eingefügter Text(4).txt
Dokument
füge du alles richtig ein

Eingefügter Text(5).txt
Dokument

markdown(1).md eingefügt
Datei

Gut, damit ist der Restfehler klar eingegrenzt: Der Button funktioniert als Touch-Fläche, aber unser Klick-Code startet den Player nicht zuverlässig.

In deiner aktuellen Logik wird beim Button-Klick das Video teils noch einmal mit loadVideoById() geladen und danach sofort playVideo() aufgerufen. Genau das kann in einem WhatsApp-WebView wieder als skriptgesteuerter Start blockiert werden. YouTube weist ausdrücklich darauf hin, dass sowohl loadVideoById() als auch playVideo() von Autoplay-/WebView-Regeln blockiert werden können.

Die bessere Lösung ist: Das Video vorher nur vorbereiten (cueVideoById) und beim echten Fingertipp ausschließlich playVideo() ausführen. cueVideoById() bereitet das Video vor, startet es aber noch nicht.

Schick mir bitte jetzt deine aktuelle komplette script.js noch einmal. Dann baue ich dir diese Variante vollständig ein, sodass du wieder nur Strg+A → ersetzen → speichern machen musst.

Eingefügter Text(6).txt
Dokument

Ja. Ich habe deine aktuelle script.js jetzt auf die bessere Variante umgestellt.

Der entscheidende Unterschied: Das Video wird vorab mit cueVideoById() vorbereitet. Wenn WhatsApp den automatischen Start blockiert und du auf ▶ Video starten tippst, wird nicht noch einmal neu geladen, sondern nur noch playVideo() ausgeführt. In deiner bisherigen Version wurde beim Button-Klick nochmals loadVideoById() aufgerufen.

Da du beim letzten Mal mit den einzelnen Stellen Probleme hattest, machen wir es wieder am sichersten: script.js öffnen → Strg+A → alles löschen → kompletten neuen Inhalt einsetzen.

Der neue Code ist sehr lang. Ich kann ihn dir im nächsten Schritt komplett hier in den Chat setzen, genau wie beim letzten Mal, damit du nichts suchen oder selbst ändern musst.

ok

Genau. Ersetze jetzt den gesamten Inhalt deiner script.js durch diesen Code. Der entscheidende Unterschied ist, dass jetzt cueVideoById() verwendet wird und der Button-Klick nur noch playVideo() ausführt. Deine bisherige Version lud beim Button-Klick das Video erneut.

            ) {

                youtubePlayer.playVideo();

                window.setTimeout(() => {

                    if (
                        youtubePlayer.getPlayerState() ===
                        YT.PlayerState.PLAYING
                    ) {
                        videoStartKnopf.classList.add("verborgen");
                    }

                }, 500);

            } else if (aktuellesVideoId) {

                wartendesVideo = aktuellesVideoId;
            }
        }
    );
}


/*
 * Video schließen
 */
videoSchliessen.addEventListener(
    "click",
    videoManuellSchliessen
);


videoFenster.addEventListener(
    "click",
    (ereignis) => {

        if (
            ereignis.target === videoFenster
        ) {
            videoManuellSchliessen();
        }
    }
);


/*
 * ESC-Taste
 */
document.addEventListener(
    "keydown",
    (ereignis) => {

        if (
            ereignis.key === "Escape" &&
            !videoFenster.classList.contains(
                "verborgen"
            )
        ) {
            videoManuellSchliessen();
        }
    }
);


/*
 * Kalender starten
 */
tuerchenErzeugen();

kalenderDatumAktualisieren();