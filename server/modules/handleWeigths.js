const fs = require("fs/promises");
const WEIGHT_DB_PATH = process.env.WEIGHT_DB_PATH;

/**
 * Die Funktion erstellt ein Dictionary, bei dem der Name des Bildes
 * als Schlüssel und die Anzahl der Male, die das Bild bereits gezeigt wurde,
 * als Wert dienen.
 * Dieses Dictionary dient als Berechnungsgrundlage dafür, welches Bild als
 * nächstes angezeigt werden soll.
 * Sofern vorhanden werden Weigths aus vorhergehenden Durchläufen geladen
 * @param {string : path} images
 * @returns {string : int}
 */
async function getWeightDict(images) {
  const weigths = await loadWeigths();

  for (let imageName in images) {
    weigths[images[imageName]] = 0;
  }

  return weigths;
}

/**
 * Die Funktion erhoeht den Zaehler eines Bildes um eins.
 * Dabei wird Das Bild neu im Dict angelegt, sollte es nicht
 * vorhanden sein und die Gewichte werden abgelegt.
 * @param {string : int} weigths
 * @param {string} imageName
 */
async function increaseWeights(weigths, imageName) {
  if (!(imageName in weigths)) {
    weigths[imageName] = 0;
  }
  weigths[imageName]++;

  await saveWeights(weigths);
}

async function loadWeigths() {
  try {
    return JSON.parse(await fs.readFile(WEIGHT_DB_PATH));
  } catch (error) {
    return {};
  }
}

async function saveWeights(weights) {
  await fs.writeFile(WEIGHT_DB_PATH, JSON.stringify(weights), {
    encoding: "utf8",
  });
}

module.exports = {
  getWeightDict,
  saveWeights,
  increaseWeights,
};
