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


/* =========================================================
   ELEMENTE
   ========================================================= */

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


/* =========================================================
   VARIABLEN
   ========================================================= */

let youtubePlayer = null;
let youtubeApiBereit = false;

let aktivesTuerchen = null;
let aktiveTuerNummer = null;

let wartendesVideo = null;
let aktuellesVideoId = null;

let grussTimer = null;
let startPruefTimer = null;

let videoAbschlussLaeuft = false;


/* =========================================================
   STARTKNOPF
   ========================================================= */

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


/* =========================================================
   YOUTUBE-IFRAME-API

   Der Player wird wieder genau wie in der früheren
   funktionierenden Version einmal beim Laden erzeugt.
   ========================================================= */

function onYouTubeIframeAPIReady() {

    youtubePlayer =
        new YT.Player(
            "youtube-player",
            {

                host:
                    "https://www.youtube-nocookie.com",

                width: "100%",
                height: "100%",

                playerVars: {
                    autoplay: 1,
                    rel: 0,
                    cc_load_policy: 0,
                    playsinline: 1
                },

                events: {

                    onReady: () => {

                        youtubeApiBereit = true;

                        if (wartendesVideo) {

                            const videoId =
                                wartendesVideo;

                            wartendesVideo = null;

                            aktuellesVideoId =
                                videoId;

                            youtubePlayer.loadVideoById(
                                videoId
                            );

                            window.setTimeout(
                                () => {

                                    if (
                                        youtubePlayer &&
                                        typeof youtubePlayer.playVideo ===
                                            "function"
                                    ) {

                                        youtubePlayer.playVideo();
                                    }

                                },
                                300
                            );

                            videoStartPruefen();
                        }
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
}


/* =========================================================
   AKTUELLER KALENDERTAG
   ========================================================= */

function aktuellerKalendertag() {

    if (testmodus.checked) {

        return Number(
            testtag.value
        );
    }

    const heute =
        new Date();

    const monat =
        heute.getMonth() + 1;

    const tag =
        heute.getDate();


    if (monat < 12) {
        return 0;
    }

    if (monat === 12) {

        return Math.min(
            tag,
            24
        );
    }

    return 24;
}


/* =========================================================
   FREISCHALTUNG
   ========================================================= */

function tuerIstFreigeschaltet(
    nummer
) {

    return (
        aktuellerKalendertag() >=
        nummer
    );
}


/* =========================================================
   POSITION FINDEN
   ========================================================= */

function findePosition(
    positionNummer
) {

    return positionen.find(
        (position) =>
            position.position ===
            positionNummer
    );
}


/* =========================================================
   PLAYER STOPPEN
   ========================================================= */

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
                "Video konnte nicht gestoppt werden.",
                fehler
            );
        }
    }
}


/* =========================================================
   TÜR SCHLIESSEN
   ========================================================= */

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
             * Browser zwingend neu berechnen lassen.
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

                    aktivesTuerchen =
                        null;

                    resolve();

                },
                2600
            );
        }
    );
}


/* =========================================================
   VIDEOFENSTER ZURÜCKSETZEN

   Wichtig:
   "hidden" verhindert den WhatsApp-Fehler beim Drehen.
   ========================================================= */

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

    /*
     * Hoch-/Querformat-Fix für WhatsApp.
     */
    videoFenster.hidden = true;


    videoGruss.classList.remove(
        "ausgeblendet"
    );

    videoBereich.classList.add(
        "verborgen"
    );

    document.body.style.overflow =
        "";

    playerStoppen();

    aktuellesVideoId =
        null;

    videoAbschlussLaeuft =
        false;
}


/* =========================================================
   SCHNEEFALL
   ========================================================= */

function abschiedsschneeErzeugen() {

    abschiedsschnee.innerHTML =
        "";

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


/* =========================================================
   ABSCHIEDSGRUSS
   ========================================================= */

function abschiedsgrussZeigen(
    nummer
) {

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


/* =========================================================
   VIDEO BEENDET
   ========================================================= */

async function videoBeendet() {

    if (videoAbschlussLaeuft) {
        return;
    }

    videoAbschlussLaeuft =
        true;


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


    aktiveTuerNummer =
        null;


    await abschiedsgrussZeigen(
        nummer
    );
}


/* =========================================================
   VIDEO MANUELL SCHLIESSEN
   ========================================================= */

async function videoManuellSchliessen() {

    if (videoAbschlussLaeuft) {
        return;
    }

    videoAbschlussLaeuft =
        true;


    videoFensterZuruecksetzen();


    await tuerchenSchliessen();


    aktiveTuerNummer =
        null;


    videoAbschlussLaeuft =
        false;
}


/* =========================================================
   PRÜFEN, OB VIDEO WIRKLICH LÄUFT
   ========================================================= */

function videoStartPruefen() {

    window.clearTimeout(
        startPruefTimer
    );


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

                        startKnopfZeigen();
                    }

                } else {

                    startKnopfZeigen();
                }

            },
            2500
        );
}


/* =========================================================
   VIDEO STARTEN

   Wieder die einfache frühere Logik.
   ========================================================= */

function videoStarten(
    videoId
) {

    aktuellesVideoId =
        videoId;

    startKnopfVerbergen();


    if (
        youtubeApiBereit &&
        youtubePlayer
    ) {

        try {

            youtubePlayer.loadVideoById(
                videoId
            );


            window.setTimeout(
                () => {

                    if (
                        youtubePlayer &&
                        typeof youtubePlayer.playVideo ===
                            "function"
                    ) {

                        youtubePlayer.playVideo();
                    }

                },
                300
            );

        } catch (fehler) {

            console.warn(
                "Automatischer Videostart fehlgeschlagen.",
                fehler
            );

            startKnopfZeigen();
        }


        videoStartPruefen();

    } else {

        /*
         * API ist noch nicht fertig.
         */
        wartendesVideo =
            videoId;

        videoStartPruefen();
    }
}


/* =========================================================
   MANUELLER STARTKNOPF

   Keine Neuerzeugung des Players.
   Nur vorhandenen Player starten.
   ========================================================= */

function videoManuellStarten() {

    if (!aktuellesVideoId) {
        return;
    }


    if (
        !youtubeApiBereit ||
        !youtubePlayer
    ) {

        wartendesVideo =
            aktuellesVideoId;

        startKnopfZeigen();

        return;
    }


    startKnopfVerbergen();


    try {

        const status =
            typeof youtubePlayer.getPlayerState ===
                "function"
                ? youtubePlayer.getPlayerState()
                : null;


        if (
            status ===
                YT.PlayerState.UNSTARTED ||
            status ===
                YT.PlayerState.CUED ||
            status === -1 ||
            status === null
        ) {

            youtubePlayer.loadVideoById(
                aktuellesVideoId
            );
        }


        youtubePlayer.playVideo();


    } catch (fehler) {

        console.warn(
            "Manueller Videostart fehlgeschlagen.",
            fehler
        );

        startKnopfZeigen();

        return;
    }


    videoStartPruefen();
}


/* =========================================================
   VIDEOFENSTER ÖFFNEN

   Hier wird "hidden" wieder aufgehoben.
   ========================================================= */

function videoOeffnen(
    nummer,
    videoId
) {

    grussTuerchen.textContent =
        `Türchen Nr. ${nummer}`;


    videoGruss.classList.remove(
        "ausgeblendet"
    );


    videoBereich.classList.add(
        "verborgen"
    );


    playerStoppen();


    aktuellesVideoId =
        videoId;


    /*
     * WhatsApp Hoch-/Querformat-Fix:
     * Zuerst hidden entfernen.
     */
    videoFenster.hidden =
        false;


    videoFenster.classList.remove(
        "verborgen"
    );


    document.body.style.overflow =
        "hidden";


    grussTimer =
        window.setTimeout(
            () => {

                videoGruss.classList.add(
                    "ausgeblendet"
                );


                videoBereich.classList.remove(
                    "verborgen"
                );


                videoStarten(
                    videoId
                );

            },
            4200
        );
}


/* =========================================================
   TÜRCHEN MIT EFFEKT ÖFFNEN
   ========================================================= */

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


    aktivesTuerchen =
        button;

    aktiveTuerNummer =
        nummer;

    videoAbschlussLaeuft =
        false;


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


/* =========================================================
   TÜRCHEN AKTUALISIEREN
   ========================================================= */

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


/* =========================================================
   TÜRCHEN ERZEUGEN
   ========================================================= */

function tuerchenErzeugen() {

    container.innerHTML =
        "";


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
   STARTKNOPF
   ========================================================= */

videoStartKnopf.addEventListener(
    "click",
    videoManuellStarten
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
            !videoFenster.hidden
        ) {

            videoManuellSchliessen();
        }
    }
);


/* =========================================================
   KALENDER STARTEN
   ========================================================= */

tuerchenErzeugen();

kalenderDatumAktualisieren();