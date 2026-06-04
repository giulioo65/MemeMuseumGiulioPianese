import axios from "axios";

const API_URL = "http://localhost:3000/api";

export async function getMemeVotes(memeId, token) {
  const response = await axios.get(`${API_URL}/memes/${memeId}/votes`, {
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {},
  });

  return response.data;
}

export async function voteMeme(memeId, value, token) {
  const response = await axios.post(
    `${API_URL}/memes/${memeId}/vote`,
    { value },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}