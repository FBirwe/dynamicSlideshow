require("dotenv").config();

const express = require("express");
const fs = require("fs/promises");
const { lstatSync, existsSync } = require("fs");
const path = require("path");
const cors = require("cors");
const chokidar = require("chokidar");
const { increaseWeights, getWeightDict } = require("./modules/handleWeigths");
const { isImageBlocked } = require('./modules/handleBlocks'); 

const app = express();
const PORT = parseInt(process.env.PORT);
const IMAGE_DIR = process.env.IMAGE_DIR;
const N = parseInt(process.env.N);

async function getNextImage(images, weigths) {
  const imageList = Object.keys(images);
  // Die Formel kann angepasst werden, um neue oder ältere Bilder stärker zu bestrafen/zu belohnen
  const transformedWeigths = imageList.map(
    (img) => 1 / (1 + weigths[images[img]]) ** 2
  );
  const weigthSum = transformedWeigths.reduce((prev, cur) => prev + cur, 0);
  const randomVal = Math.random() * weigthSum;

  let cummulatedSum = 0;

  for (let i in imageList) {
    cummulatedSum += transformedWeigths[i];

    if (randomVal < cummulatedSum) {

      // Fehlerbehebung, wenn das Bild nicht im System vorhanden ist
      // Fehlerbehebung, wenn das Bild auf der Blocklist steht
      const nextImagePath = images[imageList[i]]

      if( existsSync(nextImagePath) && !(await isImageBlocked( nextImagePath ) ) ) {
        await increaseWeights(weigths, nextImagePath);
        return imageList[i];  
      } else {
        return await getNextImage( images, weigths );
      }
    }
  }

  // on Error
  console.log("no image selected error");
  console.log(imageList.length, Object.keys(weigths).length);

  const randomIndex = Math.floor(Math.random() * imageList.length);
  await increaseWeights(weigths, images[imageList[randomIndex]]);

  return images[imageList[randomIndex]];
}

async function loadImages(imageDir, acceptedExtensions) {
  const imageDirs = await getImageSubDirectories(imageDir);
  const images = {};

  for (let currentDir of imageDirs) {
    const foundImages = (await fs.readdir(currentDir)).filter((el) => {
      for (let aE of acceptedExtensions) {
        const extensionRegex = new RegExp(`.+\.${aE}$`);
        if (el.match(extensionRegex)) {
          return true;
        }
      }

      return false;
    });

    for (let foundImage of foundImages) {
      const imagePath  = path.resolve(currentDir, foundImage);
      images[imagePath.replaceAll(path.sep,'_')] = imagePath
    }
  }

  return images;
}

async function getImageSubDirectories(parentDirPath) {
  const directoryPaths = (await fs.readdir(parentDirPath)).filter((entry) => {
    return lstatSync(path.resolve(parentDirPath, entry)).isDirectory();
  });

  let outPaths = [parentDirPath];

  for (let dirPath of directoryPaths) {
    outPaths = [
      ...outPaths,
      ...(await getImageSubDirectories(path.resolve(parentDirPath, dirPath))),
    ];
  }

  return outPaths;
}

async function updateImages(imageDir, weigths, acceptedExtensions) {
  const images = await loadImages(imageDir, acceptedExtensions);

  // Wenn neue Bilder hinzugefügt werden,
  // wird auch das Weight-Dictionary weitergepflegt
  for (let img in images) {
    if (!(images[img] in weigths)) {
      weigths[images[img]] = 0;
    }
  }

  return images;
}

async function main() {
  const slideshowConfig = {
    imageDuration: 22,
    delay: 10,
    imageParallelCount: 6,
  };

  const acceptedExtensions = ["jpg", "jpeg", "png"];
  let images = await loadImages(IMAGE_DIR, acceptedExtensions);
  const weigths = await getWeightDict(images);

  const watcher = chokidar.watch(IMAGE_DIR);

  watcher.on("all", async (eventType, filepath, stats) => {
    images = await updateImages(IMAGE_DIR, weigths, acceptedExtensions);
    console.log(`image dir: ${eventType}`, path.basename(filepath));
  });

  const imageSelection = [];
  let i = 0;

  console.log( i < N, i < Object.keys(images).length)

  while (i < N && i < Object.keys(images).length) {
    const nextImage = await getNextImage(images, weigths);

    if (!imageSelection.includes(nextImage)) {
      imageSelection.push(nextImage);
      await increaseWeights(weigths, nextImage);
      i++;
    }
  }

  console.log( imageSelection );

  app.listen(PORT, () => console.log(`server listening on port ${PORT}`));
  app.use(cors());
  app.use(express.json());

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
  app.use("/", express.static( path.join('.','client','build')) )

  app.get("/api/v1/image/:imageName", (req, res, next) => {
    const { imageName } = req.params;
    console.log( imageName )

    res.sendFile(images[imageName]);
  });

  app.get("/api/v1/waiting", (req, res, next) => {
    res.json(imageSelection);
  });

  app.get("/api/v1/weigths", (req, res, next) => {
    res.json(weigths);
  });

  // image Duration
  app.get("/api/v1/config/imageDuration", (req, res, next) => {
    console.log(slideshowConfig);

    res.json({
      value: slideshowConfig.imageDuration,
    });
  });

  app.put("/api/v1/config/imageDuration", (req, res, next) => {
    const { value } = req.body;
    slideshowConfig.imageDuration = value;

    res.json({
      value: slideshowConfig.imageDuration,
    });
  });

  // delay
  app.get("/api/v1/config/delay", (req, res, next) => {
    console.log("delay:", slideshowConfig.delay);
    res.json({
      value: slideshowConfig.delay,
    });
  });

  app.put("/api/v1/config/delay", (req, res, next) => {
    const { value } = req.body;
    slideshowConfig.delay = value;

    console.log(slideshowConfig);

    res.json({
      value: slideshowConfig.delay,
    });
  });

  // imageParallelCount
  app.get("/api/v1/config/imageParallelCount", (req, res, next) => {
    res.json({
      value: slideshowConfig.imageParallelCount,
    });
  });

  app.put("/api/v1/config/imageParallelCount", (req, res, next) => {
    const { value } = req.body;
    slideshowConfig.imageParallelCount = value;

    res.json({
      value: slideshowConfig.imageParallelCount,
    });
  });
}

main();
