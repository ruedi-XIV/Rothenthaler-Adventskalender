function kalenderDatumAktualisieren() {
    const aktuellesDatum =
        document.getElementById("aktuelles-datum");

    if (!aktuellesDatum) {
        return;
    }

    aktuellesDatum.textContent =
        new Date().toLocaleDateString("de-DE", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
}


const container =
    document.getElementById("tuerchen-container");

const videoFenster =
    document.getElementById("video-fenster");

const videoSchliessen =
    document.getElementById("video-schliessen");

const videoGruss =
    document.getElementById("video-gruss");

const grussTuerchen =
    document.getElementById("gruss-tuerchen");

const videoBereich =
    document.querySelector(".video-bereich");

const videoStartKnopf =
    document.getElementById("video-starten");

const testmodus =
    document.getElementById("testmodus");

const testtag =
    document.getElementById("testtag");

const abschiedsgruss =
    document.getElementById("abschiedsgruss");

const abschiedszeile1 =
    document.getElementById("abschiedszeile-1");

const abschiedszeile2 =
    document.getElementById("abschiedszeile-2");

const abschiedszeile3 =
    document.getElementById("abschiedszeile-3");

const abschiedsschnee =
    document.getElementById("abschiedsschnee");


let youtubePlayer = null;
let youtubeApiBereit = false;

let aktivesTuerchen = null;
let aktiveTuerNummer = null;

let wartendesVideo = null;
let aktuellesVideoId = null;

let grussTimer = null;
let startPruefTimer = null;

let videoWirdBeendet = false;


/*
 * ---------------------------------------------------------
 * Hilfsfunktionen für den Startknopf
 * ---------------------------------------------------------
 */

function startKnopfVerbergen() {

    if (!videoStartKnopf) {
        return;
    }

    videoStartKnopf.classList.add("verborgen");
}


function startKnopfZeigen() {

    if (!videoStartKnopf) {
        return;
    }

    videoStartKnopf.classList.remove("verborgen");
}


/*
 * ---------------------------------------------------------
 * YouTube-IFrame-API
 * ---------------------------------------------------------
 *
 * Diese Funktion wird automatisch von YouTube aufgerufen,
 * sobald die IFrame-API vollständig geladen ist.
 */

function onYouTubeIframeAPIReady() {

    /*
     * Wichtig für WhatsApp:
     * Den Player NICHT schon beim Laden der Seite erzeugen.
     * Zu diesem Zeitpunkt ist das Videofenster noch verborgen.
     *
     * Wir merken uns nur, dass die YouTube-API bereit ist.
     */
    youtubeApiBereit = true;

    if (wartendesVideo) {

        const videoId = wartendesVideo;

        wartendesVideo = null;

        videoStarten(videoId);
    }
}
function youtubePlayerErzeugen(videoId) {

    /*
     * Falls von einem vorherigen Versuch noch ein Player
     * existiert, wird er zuerst vollständig entfernt.
     */
    if (youtubePlayer) {

        try {

            if (
                typeof youtubePlayer.destroy ===
                "function"
            ) {
                youtubePlayer.destroy();
            }

        } catch (fehler) {

            console.warn(
                "Alter YouTube-Player konnte nicht entfernt werden.",
                fehler
            );
        }

        youtubePlayer = null;
    }


    /*
     * Nach destroy() kann das ursprüngliche DIV fehlen.
     * Deshalb erzeugen wir es sicherheitshalber neu.
     */
    let playerElement =
        document.getElementById(
            "youtube-player"
        );

    if (!playerElement) {

        playerElement =
            document.createElement(
                "div"
            );

        playerElement.id =
            "youtube-player";

        playerElement.setAttribute(
            "aria-label",
            "Rothenthaler Adventskalender Video"
        );

        videoBereich.insertBefore(
            playerElement,
            videoStartKnopf
        );
    }


    /*
     * Jetzt erst wird der echte YouTube-Player erzeugt.
     * Das Videofenster ist zu diesem Zeitpunkt bereits sichtbar.
     */
    youtubePlayer =
        new YT.Player(
            "youtube-player",
            {

                width: "100%",
                height: "100%",

                videoId: videoId,

                playerVars: {
                    autoplay: 1,
                    rel: 0,
                    cc_load_policy: 0,
                    playsinline: 1
                },

                events: {

                    onReady: () => {

                        try {

                            youtubePlayer.playVideo();

                        } catch (fehler) {

                            console.warn(
                                "Autoplay wurde blockiert.",
                                fehler
                            );
                        }

                        videoStartPruefen();
                    },


                    onStateChange: (ereignis) => {

                        if (
                            ereignis.data ===
                            YT.PlayerState.PLAYING
                        ) {

                            startKnopfVerbergen();

                            window.clearTimeout(
                                startPruefTimer
                            );

                            startPruefTimer = null;
                        }


                        if (
                            ereignis.data ===
                            YT.PlayerState.ENDED
                        ) {

                            videoBeendet();
                        }
                    },


                    onError: (ereignis) => {

                        console.warn(
                            "YouTube-Fehler:",
                            ereignis.data
                        );

                        startKnopfZeigen();
                    }
                }
            }
        );
}/*
 * ---------------------------------------------------------
 * Kalenderdatum / Freischaltung
 * ---------------------------------------------------------
 */

function aktuellerKalendertag() {

    if (testmodus.checked) {
        return Number(testtag.value);
    }

    const heute = new Date();

    const monat =
        heute.getMonth() + 1;

    const tag =
        heute.getDate();

    if (monat < 12) {
        return 0;
    }

    if (monat === 12) {
        return Math.min(tag, 24);
    }

    return 24;
}


function tuerIstFreigeschaltet(nummer) {

    return (
        aktuellerKalendertag() >= nummer
    );
}


function findePosition(positionNummer) {

    return positionen.find(
        (position) =>
            position.position ===
            positionNummer
    );
}


/*
 * ---------------------------------------------------------
 * Player stoppen
 * ---------------------------------------------------------
 */

function playerStoppen() {

    wartendesVideo = null;

    window.clearTimeout(
        startPruefTimer
    );

    startPruefTimer = null;

    startKnopfVerbergen();

    if (
        youtubeApiBereit &&
        youtubePlayer &&
        typeof youtubePlayer.stopVideo ===
            "function"
    ) {

        try {
            youtubePlayer.stopVideo();
        } catch (fehler) {
            console.warn(
                "YouTube-Player konnte nicht gestoppt werden.",
                fehler
            );
        }
    }
}


/*
 * ---------------------------------------------------------
 * Tür schließen
 * ---------------------------------------------------------
 */

function tuerchenSchliessen() {

    return new Promise(
        (resolve) => {

            if (!aktivesTuerchen) {

                resolve();
                return;
            }

            const tuer =
                aktivesTuerchen;

            tuer.classList.remove(
                "wird-geoeffnet"
            );

            tuer.classList.remove(
                "geoeffnet"
            );

            /*
             * Browser zwingend den aktuellen
             * Zustand berechnen lassen.
             */
            void tuer.offsetWidth;

            tuer.classList.add(
                "wird-geschlossen"
            );

            window.setTimeout(
                () => {

                    tuer.classList.remove(
                        "wird-geschlossen"
                    );

                    aktivesTuerchen = null;

                    resolve();

                },
                2600
            );
        }
    );
}


/*
 * ---------------------------------------------------------
 * Videofenster zurücksetzen
 * ---------------------------------------------------------
 */

function videoFensterZuruecksetzen() {

    window.clearTimeout(
        grussTimer
    );

    window.clearTimeout(
        startPruefTimer
    );

    grussTimer = null;
    startPruefTimer = null;

    videoFenster.classList.add(
        "verborgen"
    );

    videoFenster.hidden = true;

    videoGruss.classList.remove(
        "ausgeblendet"
    );

    videoBereich.classList.add(
        "verborgen"
    );

    document.body.style.overflow = "";

    playerStoppen();

    aktuellesVideoId = null;

    videoWirdBeendet = false;
}


/*
 * ---------------------------------------------------------
 * Schneefall beim Abschiedsgruß
 * ---------------------------------------------------------
 */

function abschiedsschneeErzeugen() {

    abschiedsschnee.innerHTML = "";

    const schichten = [

        {
            klasse: "hinten",
            anzahl: 20,
            minGroesse: 2,
            maxGroesse: 4,
            minDauer: 12,
            maxDauer: 18,
            minDeckkraft: 0.22,
            maxDeckkraft: 0.42,
            maxDrift: 18
        },

        {
            klasse: "mitte",
            anzahl: 14,
            minGroesse: 4,
            maxGroesse: 7,
            minDauer: 9,
            maxDauer: 14,
            minDeckkraft: 0.38,
            maxDeckkraft: 0.68,
            maxDrift: 30
        },

        {
            klasse: "vorne",
            anzahl: 6,
            minGroesse: 7,
            maxGroesse: 11,
            minDauer: 7,
            maxDauer: 10,
            minDeckkraft: 0.58,
            maxDeckkraft: 0.92,
            maxDrift: 46
        }
    ];


    schichten.forEach(
        (schicht) => {

            for (
                let index = 0;
                index < schicht.anzahl;
                index++
            ) {

                const flocke =
                    document.createElement(
                        "span"
                    );

                flocke.className =
                    `abschiedsflocke abschiedsflocke-${schicht.klasse}`;


                const groesse =
                    schicht.minGroesse +
                    Math.random() *
                    (
                        schicht.maxGroesse -
                        schicht.minGroesse
                    );


                const dauer =
                    schicht.minDauer +
                    Math.random() *
                    (
                        schicht.maxDauer -
                        schicht.minDauer
                    );


                const drift =
                    -schicht.maxDrift +
                    Math.random() *
                    schicht.maxDrift * 2;


                const deckkraft =
                    schicht.minDeckkraft +
                    Math.random() *
                    (
                        schicht.maxDeckkraft -
                        schicht.minDeckkraft
                    );


                flocke.style.left =
                    `${Math.random() * 100}%`;

                flocke.style.width =
                    `${groesse}px`;

                flocke.style.height =
                    `${groesse}px`;

                flocke.style.opacity =
                    deckkraft;


                flocke.style.setProperty(
                    "--fall-dauer",
                    `${dauer}s`
                );


                flocke.style.setProperty(
                    "--fall-verzoegerung",
                    `${Math.random() * -dauer}s`
                );


                flocke.style.setProperty(
                    "--seitendrift",
                    `${drift}px`
                );


                abschiedsschnee.appendChild(
                    flocke
                );
            }
        }
    );
}


/*
 * ---------------------------------------------------------
 * Abschiedsgruß
 * ---------------------------------------------------------
 */

function abschiedsgrussZeigen(nummer) {

    return new Promise(
        (resolve) => {

            if (nummer === 24) {

                abschiedszeile1.textContent =
                    "Danke, dass de jeden Tog mit dabei warst.";

                abschiedszeile2.textContent =
                    "Ich wünsch dir fröhliche Weihnachten!";

                abschiedszeile3.textContent =
                    "Bis zum nächsten Advent!";

            } else {

                abschiedszeile1.textContent =
                    "De nächste Geschicht wart schie auf dich...";

                abschiedszeile2.textContent =
                    "Guck när morschn wiedr rei.";

                abschiedszeile3.textContent =
                    "";
            }


            abschiedsschneeErzeugen();

            abschiedsgruss.classList.remove(
                "verborgen"
            );

            abschiedsgruss.classList.add(
                "sichtbar"
            );


            window.setTimeout(
                () => {

                    abschiedsgruss.classList.remove(
                        "sichtbar"
                    );

                    abschiedsgruss.classList.add(
                        "ausblendend"
                    );

                },
                6000
            );


            window.setTimeout(
                () => {

                    abschiedsgruss.classList.add(
                        "verborgen"
                    );

                    abschiedsgruss.classList.remove(
                        "ausblendend"
                    );

                    abschiedsschnee.innerHTML =
                        "";

                    resolve();

                },
                7200
            );
        }
    );
}


/*
 * ---------------------------------------------------------
 * Video wurde vollständig abgespielt
 * ---------------------------------------------------------
 */

async function videoBeendet() {

    /*
     * Verhindert, dass das ENDED-Ereignis
     * versehentlich zweimal abgearbeitet wird.
     */
    if (videoWirdBeendet) {
        return;
    }

    videoWirdBeendet = true;

    const nummer =
        aktiveTuerNummer;


    await new Promise(
        (resolve) =>
            window.setTimeout(
                resolve,
                1800
            )
    );


    videoFenster.classList.add(
        "video-fenster-ausblendend"
    );


    await new Promise(
        (resolve) =>
            window.setTimeout(
                resolve,
                900
            )
    );


    videoFensterZuruecksetzen();


    videoFenster.classList.remove(
        "video-fenster-ausblendend"
    );


    await new Promise(
        (resolve) =>
            window.setTimeout(
                resolve,
                700
            )
    );


    await tuerchenSchliessen();

    aktiveTuerNummer = null;

    await abschiedsgrussZeigen(
        nummer
    );
}


/*
 * ---------------------------------------------------------
 * Video manuell schließen
 * ---------------------------------------------------------
 */

async function videoManuellSchliessen() {

    if (videoWirdBeendet) {
        return;
    }

    videoWirdBeendet = true;

    videoFensterZuruecksetzen();

    await tuerchenSchliessen();

    aktiveTuerNummer = null;

    videoWirdBeendet = false;
}


/*
 * ---------------------------------------------------------
 * Prüfen, ob das Video wirklich läuft
 * ---------------------------------------------------------
 */

function videoStartPruefen() {

    window.clearTimeout(
        startPruefTimer
    );

    /*
     * Etwas mehr Zeit als vorher.
     * Gerade WhatsApp und langsame Mobilverbindungen
     * brauchen gelegentlich länger.
     */
    startPruefTimer =
        window.setTimeout(
            () => {

                if (
                    youtubeApiBereit &&
                    youtubePlayer &&
                    typeof youtubePlayer.getPlayerState ===
                        "function"
                ) {

                    let status = null;

                    try {

                        status =
                            youtubePlayer.getPlayerState();

                    } catch (fehler) {

                        console.warn(
                            "Playerstatus konnte nicht gelesen werden.",
                            fehler
                        );
                    }


                    if (
                        status ===
                        YT.PlayerState.PLAYING
                    ) {

                        startKnopfVerbergen();

                    } else {

                        /*
                         * Autoplay hat nicht funktioniert.
                         * Jetzt erhält der Besucher einen
                         * echten Startknopf.
                         */
                        startKnopfZeigen();
                    }

                } else {

                    startKnopfZeigen();
                }

            },
            2500
        );
}


/*
 * ---------------------------------------------------------
 * Automatischen Videostart versuchen
 * ---------------------------------------------------------
 */

function automatischenVideoStartVersuchen(
    videoId
) {

    if (
        !youtubeApiBereit ||
        !youtubePlayer
    ) {

        wartendesVideo = videoId;

        videoStartPruefen();

        return;
    }


    try {

        /*
         * loadVideoById versucht das Video direkt
         * zu laden und abzuspielen.
         */
        youtubePlayer.loadVideoById(
            videoId
        );

    } catch (fehler) {

        console.warn(
            "Automatischer Videostart fehlgeschlagen.",
            fehler
        );

        startKnopfZeigen();

        return;
    }


    /*
     * Kein hektischer zweiter loadVideoById-Aufruf.
     * Wir geben YouTube erst einmal Zeit.
     */
    window.setTimeout(
        () => {

            if (
                youtubePlayer &&
                typeof youtubePlayer.playVideo ===
                    "function"
            ) {

                try {
                    youtubePlayer.playVideo();
                } catch (fehler) {
                    console.warn(
                        "playVideo wurde vom Browser blockiert.",
                        fehler
                    );
                }
            }

        },
        650
    );


    videoStartPruefen();
}


/*
 * ---------------------------------------------------------
 * Video starten
 * ---------------------------------------------------------
 */

function videoStarten(videoId) {

    aktuellesVideoId =
        videoId;

    startKnopfVerbergen();


    /*
     * Falls die YouTube-API noch nicht geladen ist,
     * merken wir uns das Video.
     */
    if (
        !youtubeApiBereit ||
        typeof YT === "undefined" ||
        typeof YT.Player === "undefined"
    ) {

        wartendesVideo =
            videoId;

        /*
         * Nach kurzer Zeit Startknopf anbieten.
         */
        videoStartPruefen();

        return;
    }


    /*
     * Der entscheidende WhatsApp-Fix:
     * Player wird JETZT erzeugt,
     * also erst nachdem der Videobereich sichtbar ist.
     */
    youtubePlayerErzeugen(
        videoId
    );
}

/*
 * ---------------------------------------------------------
 * MANUELLER VIDEOSTART
 *
 * Dieser Weg wird ausschließlich durch einen echten
 * Fingertipp/Mausklick ausgelöst.
 * Das ist besonders für WhatsApp, Android und iPhone
 * wichtig, weil Browser Autoplay blockieren dürfen.
 * ---------------------------------------------------------
 */

function videoManuellStarten() {

    if (!aktuellesVideoId) {
        return;
    }


    startKnopfVerbergen();


    if (
        !youtubeApiBereit ||
        typeof YT === "undefined" ||
        typeof YT.Player === "undefined"
    ) {

        wartendesVideo =
            aktuellesVideoId;

        startKnopfZeigen();

        return;
    }


    /*
     * Zuerst versuchen wir den vorhandenen Player
     * direkt durch den Fingertipp zu starten.
     */
    if (
        youtubePlayer &&
        typeof youtubePlayer.playVideo ===
            "function"
    ) {

        try {

            youtubePlayer.playVideo();

        } catch (fehler) {

            console.warn(
                "Direkter Start fehlgeschlagen.",
                fehler
            );
        }


        window.setTimeout(
            () => {

                let status = null;

                try {

                    status =
                        youtubePlayer.getPlayerState();

                } catch (fehler) {
                    status = null;
                }


                /*
                 * Läuft er trotz Fingertipp nicht,
                 * erzeugen wir einen komplett neuen Player.
                 */
                if (
                    status !==
                    YT.PlayerState.PLAYING
                ) {

                    youtubePlayerErzeugen(
                        aktuellesVideoId
                    );
                }

            },
            700
        );

    } else {

        youtubePlayerErzeugen(
            aktuellesVideoId
        );
    }


    videoStartPruefen();
}

/*
 * ---------------------------------------------------------
 * Tür öffnen
 * ---------------------------------------------------------
 */

function tuerchenMitEffektOeffnen(
    button,
    nummer,
    videoId
) {

    if (
        aktivesTuerchen ||
        button.classList.contains(
            "wird-geoeffnet"
        )
    ) {

        return;
    }


    aktivesTuerchen = button;

    aktiveTuerNummer = nummer;

    videoWirdBeendet = false;

    button.classList.add(
        "wird-geoeffnet"
    );


    window.setTimeout(
        () => {

            button.classList.add(
                "geoeffnet"
            );


            window.setTimeout(
                () => {

                    videoOeffnen(
                        nummer,
                        videoId
                    );

                },
                1500
            );

        },
        950
    );
}


/*
 * ---------------------------------------------------------
 * Türchen aktualisieren
 * ---------------------------------------------------------
 */

function tuerchenAktualisieren() {

    document
        .querySelectorAll(".tuer")
        .forEach(
            (button) => {

                const nummer =
                    Number(
                        button.dataset.nummer
                    );

                const freigeschaltet =
                    tuerIstFreigeschaltet(
                        nummer
                    );


                button.classList.toggle(
                    "freigeschaltet",
                    freigeschaltet
                );


                button.classList.toggle(
                    "gesperrt",
                    !freigeschaltet
                );


                button.setAttribute(
                    "aria-disabled",
                    freigeschaltet
                        ? "false"
                        : "true"
                );
            }
        );
}


/*
 * ---------------------------------------------------------
 * Türchen erzeugen
 * ---------------------------------------------------------
 */

function tuerchenErzeugen() {

    container.innerHTML = "";


    tuerchenDaten.forEach(
        (tuer) => {

            const position =
                findePosition(
                    tuer.position
                );


            if (!position) {

                console.error(
                    `Position ${tuer.position} wurde nicht gefunden.`
                );

                return;
            }


            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "tuer";

            button.type =
                "button";

            button.dataset.nummer =
                tuer.nummer;


            button.setAttribute(
                "aria-label",
                `Türchen ${tuer.nummer}`
            );


            button.style.left =
                `${position.left}%`;

            button.style.top =
                `${position.top}%`;


            const innen =
                document.createElement(
                    "span"
                );

            innen.className =
                "tuer-innen";

            innen.setAttribute(
                "aria-hidden",
                "true"
            );


            const klappe =
                document.createElement(
                    "span"
                );

            klappe.className =
                "tuer-klappe";


            const zahl =
                document.createElement(
                    "span"
                );

            zahl.className =
                "tuer-zahl";

            zahl.textContent =
                tuer.nummer;


            klappe.appendChild(
                zahl
            );

            button.appendChild(
                innen
            );

            button.appendChild(
                klappe
            );


            button.addEventListener(
                "click",
                () => {

                    if (
                        !tuerIstFreigeschaltet(
                            tuer.nummer
                        )
                    ) {

                        alert(
                            `Dieses Türchen öffnet sich erst am ${tuer.nummer}. Dezember.`
                        );

                        return;
                    }


                    if (!tuer.video) {

                        alert(
                            `Für Türchen ${tuer.nummer} ist noch kein Video eingetragen.`
                        );

                        return;
                    }


                    tuerchenMitEffektOeffnen(
                        button,
                        tuer.nummer,
                        tuer.video
                    );
                }
            );


            container.appendChild(
                button
            );
        }
    );


    tuerchenAktualisieren();
}


/*
 * ---------------------------------------------------------
 * Testmodus
 * ---------------------------------------------------------
 */

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


/*
 * ---------------------------------------------------------
 * Notfall-Startknopf
 * ---------------------------------------------------------
 */

videoStartKnopf.addEventListener(
    "click",
    videoManuellStarten
);


/*
 * ---------------------------------------------------------
 * Video schließen
 * ---------------------------------------------------------
 */

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


/*
 * ---------------------------------------------------------
 * ESC-Taste
 * ---------------------------------------------------------
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
 * ---------------------------------------------------------
 * Kalender starten
 * ---------------------------------------------------------
 */

tuerchenErzeugen();

kalenderDatumAktualisieren();