const BASE_URL = "http://localhost:5454";

async function getNextImageName() {
  const res = await fetch(`${BASE_URL}/api/v1/next`);

  return (await res.json()).image;
}

export { getNextImageName };
