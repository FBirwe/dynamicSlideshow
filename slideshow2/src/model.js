// const BASE_URL = `http://${window.location.hostname}:5454`;
const BASE_URL = '';

async function getNextImageName() {
  const res = await fetch(`${BASE_URL}/api/v1/next`);

  return (await res.json()).image;
}

async function getWaitingImages() {
  const res = await fetch(`${BASE_URL}/api/v1/waiting`);

  return await res.json();
}

async function getImageWeights() {
  const res = await fetch(`${BASE_URL}/api/v1/weigths`);

  return await res.json();
}

async function getImageDuration() {
  const res = await fetch(`${BASE_URL}/api/v1/config/imageDuration`);

  return await res.json();
}

export {
  BASE_URL,
  getNextImageName,
  getWaitingImages,
  getImageWeights,
  getImageDuration,
};
