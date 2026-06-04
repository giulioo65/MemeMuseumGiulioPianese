import axios from "axios";

const API_URL = "http://localhost:3000/api";

export async function getCommentsByMeme(memeId, token) {
  const response = await axios.get(`${API_URL}/memes/${memeId}/comments`, {
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {},
  });

  return response.data;
}

export async function createComment(memeId, commentData, token) {
  const response = await axios.post(
    `${API_URL}/memes/${memeId}/comments`,
    commentData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}