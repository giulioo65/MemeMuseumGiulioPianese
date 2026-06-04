import axios from "axios";

const API_URL = "http://localhost:3000/api";

export async function getMemes(token, filters = {}) {
  const response = await axios.get(`${API_URL}/memes`, {
    params: filters,
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {},
  });

  return response.data;
}

export async function getMemeById(id, token) {
  const response = await axios.get(`${API_URL}/memes/${id}`, {
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {},
  });

  return response.data;
}

export async function createMeme(memeData, token) {
  const response = await axios.post(`${API_URL}/memes`, memeData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function deleteMeme(id, token) {
  const response = await axios.delete(`${API_URL}/memes/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}