const express = require("express");
const fs = require("fs/promises");
const { watch } = require("fs");
const path = require("path");
const cors = require("cors");
const chokidar = require("chokidar");

const app = express();
const PORT = 5454;
const IMAGE_DIR = "./images";
const N = 15;

function getNextImage(imageList, weigths) {
  const weigthSum = imageList
    .map((img) => 1 / (1 + weigths[img]))
    .reduce((prev, cur) => prev + cur, 0);
  const randomVal = Math.random() * weigthSum;

  console.log(weigths);

  let cummulatedSum = 0;

  for (let i in imageList) {
    cummulatedSum += 1 / weigths[imageList[i]];

    if (randomVal < cummulatedSum) {
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

  // watch(IMAGE_DIR, (eventType, filename) => {
  //   console.log("\nThe file", filename, "was modified!");
  //   console.log("The type of change was:", eventType);
  // });

  const imageSelection = [];

  for (let i = 0; i < N; i++) {
    const nextImage = await getNextImage(images, weigths);
    imageSelection.push(nextImage);
    weigths[nextImage]++;
    // console.log(imageSelection);
  }

  app.listen(PORT, () => console.log(`server listening on port ${PORT}`));
  app.use(cors());

  app.get("/api/v1/next", async (req, res, next) => {
    const nextImage = imageSelection.shift();
    res.json({
      image: nextImage,
    });

    imageSelection.push(await getNextImage(images, weigths));
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
