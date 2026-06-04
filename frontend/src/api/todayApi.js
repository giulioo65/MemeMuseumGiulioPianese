import axios from "axios";

const API_URL = "http://localhost:3000/api";

export async function getMemeOfTheDay(token) {
  const response = await axios.get(`${API_URL}/memes/today`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
}