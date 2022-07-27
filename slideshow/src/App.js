import "./App.css";
import { useRef, useEffect, useState } from "react";
import { getNextImageName } from "./model";
const IMAGE_DURATION = 30;
const DELAY = 10;
const IMAGE_COUNT = 6;

function wait(seconds) {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res();
    }, seconds * 1000);
  });
}

function App() {
  const initialImagesArray = [];

  for (let i = 0; i < IMAGE_COUNT; i++) {
    initialImagesArray.push(null);
  }

  const [images, setImages] = useState(initialImagesArray);

  const resetIndex = (i) => {
    setImages((val) => {
      val[i] = null;

      return [...val];
    });

    setTimeout(async () => {
      const nextImage = await getNextImageName();

      setImages((val) => {
        val[i] = nextImage;

        return [...val];
      });
    }, DELAY * 1000);
  };

  useEffect(() => {
    const initImages = async () => {
      for (let i in images) {
        const nextImage = await getNextImageName();
        setImages((val) => {
          val[i] = nextImage;

          return [...val];
        });
        await wait(DELAY);
      }
    };

    initImages();
  }, []);

  const rowCount = Math.round(Math.sqrt(images.length));
  const columnCount = Math.ceil(images.length / rowCount);

  return (
    <div className="App">
      <div
        className="images_wrapper"
        style={{
          gridTemplateColumns: (() => {
            const out = [];

            for (let i = 0; i < columnCount; i++) {
              out.push("auto");
            }

            return out.join(" ");
          })(),
        }}
      >
        {images.map((el, i) =>
          el ? (
            <div className="flex_container">
              <Image img={el} onDisable={() => resetIndex(i)}></Image>
            </div>
          ) : (
            <div className="flex_container" />
          )
        )}
      </div>
    </div>
  );
}

function Image(props) {
  const ROTATION_RANGE = 0;
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [z, setZ] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const onLoad = (ev) => {
    const currentElement = ev.target.parentElement;
    const parentElement = currentElement.parentElement;

    console.log(currentElement.offsetWidth, parentElement.offsetWidth);
    console.log((parentElement.offsetWidth - currentElement.offsetWidth) * 1);

    setX(
      Math.random() * (parentElement.offsetWidth - currentElement.offsetWidth)
    );
    setY(
      Math.random() * (parentElement.offsetHeight - currentElement.offsetHeight)
    );
    setZ(Math.floor(Math.random() * 25));
    setRotation(
      Math.floor(Math.random() * ROTATION_RANGE * 2) - ROTATION_RANGE
    );
    setIsVisible(true);

    setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        props.onDisable();
      }, 1000);
    }, IMAGE_DURATION * 1000);
  };

  return (
    <div
      className={`image_preview ${isVisible ? "visible" : null}`}
      style={{
        left: x,
        top: y,
        zIndex: z,
        transform: `rotate(${rotation}deg)`,
      }}
    >
      <img
        src={`http://localhost:5454/image/${props.img}`}
        onLoad={onLoad}
        alt=""
      ></img>
    </div>
  );
}

export default App;
