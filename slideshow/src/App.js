import "./App.css";
import { useEffect, useState } from "react";
import { getNextImageName, BASE_URL } from "./model";
import {
  useGetImageDurationQuery,
  useGetDelayQuery,
  useGetImageParallelCountQuery,
} from "./ReduxReducers/configApi";

function wait(seconds) {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res();
    }, seconds * 1000);
  });
}

function App(props) {
  const imageDurationQuery = useGetImageDurationQuery();
  const delayQuery = useGetDelayQuery();
  const imageParallelCountQuery = useGetImageParallelCountQuery();

  const delay =
    delayQuery.isError || delayQuery.isLoading ? 10 : delayQuery.data.value;

  const imageParallelCount =
    imageParallelCountQuery.isError || imageParallelCountQuery.isLoading
      ? 5
      : imageParallelCountQuery.data.value;

  // useEffect(() => {
  //   setInterval(() => {
  //     console.log("refetch");
  //     imageDurationQuery.refetch();
  //     delayQuery.refetch();
  //     imageParallelCountQuery.refetch();
  //   }, 10 * 1000);
  // }, []);

  const initialImagesArray = [];

  for (let i = 0; i < imageParallelCount; i++) {
    initialImagesArray.push(null);
  }

  const [images, setImages] = useState(initialImagesArray);
  const [zIndex, setZIndex] = useState(initialImagesArray.map((el, i) => i));

  useEffect(() => {
    if (images.length !== imageParallelCount) {
      (async () => {
        // Da die Funktion setImages nicht asynchron sein darf, muss dieser Fall
        // im Vorhinein bearbeitet werden
        const nextImages = [];
        if (images.length < imageParallelCount) {
          for (let i = images.length; i < imageParallelCount; i++) {
            nextImages.push(await getNextImageName());
          }
        }

        setImages((val) => {
          const newImages = [...val];

          let containsNull = true;
          while (imageParallelCount < newImages.length && containsNull) {
            for (let j = 0; j < newImages.length; j++) {
              if (j === newImages.length - 1) {
                containsNull = false;
              }

              if (newImages[j] == null) {
                newImages.splice(j, 1);
                break;
              }
            }
          }

          for (let img of nextImages) {
            newImages.push(img);
          }

          return newImages;
        });
      })();
    }
  }, [imageParallelCount]);

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

      setZIndex((val) => {
        val[i] = zIndex.reduce((prev, cur) => (prev > cur ? prev : cur), 0) + 1;

        return [...val];
      });
    }, delay * 1000);
  };

  useEffect(() => {
    const initImages = async () => {
      // Die Kacheln werden zu Beginn geshufflet

      const usedIdx = [];

      while (usedIdx.length < images.length) {
        let i = Math.floor(Math.random() * images.length);

        while (usedIdx.includes(i)) {
          i = Math.floor(Math.random() * images.length);
        }
        usedIdx.push(i);

        const nextImage = await getNextImageName();
        setImages((val) => {
          val[i] = nextImage;

          return [...val];
        });
        await wait(delay);
      }
    };

    initImages();
  }, []);

  const rowCount = Math.round(Math.sqrt(images.length));
  const columnCount = Math.ceil(images.length / rowCount);
  const devPanel = props.dev ? <DevPanel></DevPanel> : null;

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
              <Image
                img={el}
                dev={props.dev}
                z={zIndex[i]}
                onDisable={() => resetIndex(i)}
              ></Image>
            </div>
          ) : (
            <div className="flex_container" />
          )
        )}
      </div>
      {devPanel}
    </div>
  );
}

function Image(props) {
  const imageDurationQuery = useGetImageDurationQuery();
  const imageDuration =
    imageDurationQuery.isError || imageDurationQuery.isLoading
      ? 10
      : imageDurationQuery.data.value;

  const ROTATION_RANGE = 0;
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [isPortrait, setIsPortrait] = useState(true);
  // const [z, setZ] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const onLoad = (ev) => {
    const currentElement = ev.target.parentElement;
    const parentElement = currentElement.parentElement;
    setIsPortrait(ev.target.offsetWidth <= ev.target.offsetHeight);

    setX(
      Math.random() * (parentElement.offsetWidth - currentElement.offsetWidth)
    );
    setY(
      Math.random() * (parentElement.offsetHeight - currentElement.offsetHeight)
    );
    setRotation(
      Math.floor(Math.random() * ROTATION_RANGE * 2) - ROTATION_RANGE
    );
    setIsVisible(true);

    setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        props.onDisable();
      }, 1000);
    }, imageDuration * 1000);
  };

  const classNames = [
    "image_preview",
    isVisible ? "visible" : null,
    isPortrait ? "portrait" : "landscape",
  ];
  const nameLine = props.dev ? (
    <p className="imageNameLine">{props.img}</p>
  ) : null;

  return (
    <div
      className={classNames.join(" ")}
      style={{
        left: x,
        top: y,
        zIndex: props.z,
        transform: `rotate(${rotation}deg)`,
      }}
    >
      <img
        src={`${BASE_URL}/api/v1/image/${props.img}`}
        onLoad={onLoad}
        alt=""
      ></img>
      {nameLine}
    </div>
  );
}

function DevPanel() {
  const imageDurationQuery = useGetImageDurationQuery();
  const delayQuery = useGetDelayQuery();
  const imageParallelCountQuery = useGetImageParallelCountQuery();

  const imageDuration =
    imageDurationQuery.isError || imageDurationQuery.isLoading
      ? 10
      : imageDurationQuery.data.value;

  const delay =
    delayQuery.isError || delayQuery.isLoading ? 10 : delayQuery.data.value;

  const imageParallelCount =
    imageParallelCountQuery.isError || imageParallelCountQuery.isLoading
      ? 5
      : imageParallelCountQuery.data.value;

  const refetch = () => {
    imageDurationQuery.refetch();
    delayQuery.refetch();
    imageParallelCountQuery.refetch();
  };

  return (
    <div className="dev_panel">
      <p>image duration {imageDuration}</p>
      <p>delay {delay}</p>
      <p>image parallel count {imageParallelCount}</p>
      <button onClick={refetch}>Refetch</button>
    </div>
  );
}

export default App;
