import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getWaitingImages, getImageWeights } from "../model";
import {
  useGetDelayQuery,
  useGetImageDurationQuery,
  useGetImageParallelCountQuery,
  useUpdateDelayMutation,
  useUpdateImageDurationMutation,
  useUpdateImageParallelCountyMutation,
} from "../ReduxReducers/configApi";
import { BASE_URL } from "../model";
import "./Admin.css";

const AdminPanel = (props) => {
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
      ? 10
      : imageParallelCountQuery.data.value;

  const [
    updateImageDuration, // This is the mutation trigger
    resultImageDuration, // This is the destructured mutation result
  ] = useUpdateImageDurationMutation();

  const [
    updateDelay, // This is the mutation trigger
    resultDelay, // This is the destructured mutation result
  ] = useUpdateDelayMutation();

  const [
    updateImageParallelCount, // This is the mutation trigger
    resultImageParallelCount, // This is the destructured mutation result
  ] = useUpdateImageParallelCountyMutation();

  const [waitingImages, _setWaitingImages] = useState([]);
  const [imageWeights, _setImageWeights] = useState({});
  const [weightSortOrder, setWeightSortOrder] = useState("desc");

  const dispatch = useDispatch();

  const setWaitingImages = async () => {
    const newWaiting = await getWaitingImages();
    _setWaitingImages(newWaiting);

    setTimeout(async () => {
      await setWaitingImages();
    }, imageDuration * 1000);
  };
  const setImageWeights = async () => {
    console.log("update running");
    const newWaiting = await getImageWeights();
    _setImageWeights(newWaiting);

    setTimeout(async () => {
      await setImageWeights();
    }, imageDuration * 1000);
  };

  useEffect(() => {
    setWaitingImages();
    setImageWeights();
  }, []);

  return (
    <div>
      <div className="value_panel">
        <p>
          <label forhtml="setImageDuration">image duration</label>
          <input
            type="number"
            id="setImageDuration"
            value={imageDuration}
            onChange={(ev) => updateImageDuration(parseInt(ev.target.value))}
          ></input>
        </p>
        <p>
          <label forhtml="setDelay">delay</label>
          <input
            type="number"
            id="setDelay"
            value={delay}
            onChange={(ev) => updateDelay(parseInt(ev.target.value))}
          ></input>
        </p>
        <p>
          <label forhtml="setImageParallelCount">
            Anzahl gleichzeitige Bilder
          </label>
          <input
            type="number"
            id="setImageParallelCount"
            value={imageParallelCount}
            onChange={(ev) =>
              updateImageParallelCount(parseInt(ev.target.value))
            }
          ></input>
        </p>
      </div>
      <ul className="waiting_images">
        {waitingImages.map((el) => (
          <li>
            <ImageLine img={el}></ImageLine>
          </li>
        ))}
      </ul>
      <button
        onClick={(ev) => {
          if (weightSortOrder === "asc") {
            setWeightSortOrder("desc");
          } else {
            setWeightSortOrder("asc");
          }
        }}
      >
        {weightSortOrder}
      </button>
      <ul>
        {Object.keys(imageWeights)
          .sort((a, b) => {
            if (weightSortOrder === "desc") {
              return imageWeights[b] - imageWeights[a];
            } else {
              return imageWeights[a] - imageWeights[b];
            }
          })
          .map((el) => (
            <li>
              {imageWeights[el]} – {el}
            </li>
          ))}
      </ul>
    </div>
  );
};

const ImageLine = (props) => {
  return (
    <div className="imageLine">
      <div
        className="imageContainer"
        style={{
          backgroundImage: `url("${BASE_URL}/api/v1/image/${props.img}")`,
        }}
      ></div>
      <p>{props.img}</p>
    </div>
  );
};

export default AdminPanel;
