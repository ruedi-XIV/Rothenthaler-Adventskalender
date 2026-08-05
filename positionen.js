/*
 * Positionen der 24 Felder:
 * 6 Spalten × 4 Reihen
 *
 * Trage bei startLinks, startOben, abstandX und abstandY
 * deine passenden Werte ein.
 */

const startLinks = 30.6;  // Position des ersten Feldes
const startOben = 31.6;

const abstandX = 10.71;   // Abstand nach rechts
const abstandY = 14.75;  // Abstand nach unten

const positionen = [];

let positionsNummer = 1;

for (let reihe = 0; reihe < 4; reihe++) {
    for (let spalte = 0; spalte < 6; spalte++) {
        positionen.push({
            position: positionsNummer,
            left: startLinks + spalte * abstandX,
            top: startOben + reihe * abstandY
        });

        positionsNummer++;
    }
}