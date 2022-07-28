const express = require("express");
const fs = require("fs/promises");
const { watch } = require("fs");
const path = require("path");
const cors = require("cors");
const chokidar = require("chokidar");

const app = express();
const PORT = 5454;
const IMAGE_DIR = "./images";
const N = 10;

function getNextImage(imageList, weigths) {
  // Die Formel kann angepasst werden, um neue oder ältere Bilder stärker zu bestrafen/zu belohnen
  const transformedWeigths = imageList.map(
    (img) => 1 / (1 + weigths[img]) ** 2
  );
  const weigthSum = transformedWeigths.reduce((prev, cur) => prev + cur, 0);
  const randomVal = Math.random() * weigthSum;

  let cummulatedSum = 0;

  for (let i in imageList) {
    cummulatedSum += transformedWeigths[i];

    if (randomVal < cummulatedSum) {
      weigths[imageList[i]]++;
      return imageList[i];
    }
  }

  throw new Error("no image selected");
}

async function loadImages(imageDir) {
  return (await fs.readdir(imageDir)).filter(
    (el) => el.match(/.+\.jpg/) || el.match(/.+\.jpeg/) || el.match(/.+\.png/)
  );
}

function getWeightDict(images) {
  const weigths = {};

  for (let image of images) {
    weigths[image] = 0;
  }

  return weigths;
}

async function main() {
  const images = await loadImages(IMAGE_DIR);
  const extension = ["jpg", "jpeg", "png"];
  const weigths = getWeightDict(images);

  const watcher = chokidar.watch(IMAGE_DIR);

  watcher.on("add", (filepath, stats) => {
    const filename = path.basename(filepath);
    for (let ext of extension) {
      const reg = new RegExp(`.+\.${ext}$`);

      if (filename.match(reg)) {
        if (!images.includes(filename)) {
          images.push(filename);
          weigths[filename] = 0;
          console.log(filename);
        }
      }
    }
  });

  const imageSelection = [];
  let i = 0;

  while (i < N) {
    const nextImage = await getNextImage(images, weigths);

    if (!imageSelection.includes(nextImage)) {
      imageSelection.push(nextImage);
      weigths[nextImage]++;
      i++;
    }
  }

  app.listen(PORT, () => console.log(`server listening on port ${PORT}`));
  app.use(cors());

  app.get("/api/v1/next", async (req, res, next) => {
    const nextImage = imageSelection.shift();
    res.json({
      image: nextImage,
    });

    let newWaiting = await getNextImage(images, weigths);

    while (imageSelection.includes(newWaiting)) {
      newWaiting = await getNextImage(images, weigths);
    }

    imageSelection.push(newWaiting);
  });

  app.use("/image/", express.static(IMAGE_DIR));

  app.get("/api/v1/waiting", (req, res, next) => {
    res.json(imageSelection);
  });

  app.get("/api/v1/weigths", (req, res, next) => {
    res.json(weigths);
  });
}

main();
