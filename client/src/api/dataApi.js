const BASE_URL = process.env.BASE_URL;

export async function fetchData() {
  const res = await fetch(`${BASE_URL}/data`);
  return res.json();
}

export async function saveData(data) {
  await fetch(`${BASE_URL}/data`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}