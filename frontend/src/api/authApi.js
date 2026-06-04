import axios from "axios";

const API_URL = "http://localhost:3000/api";

export async function loginUser(credentials) {
  const response = await axios.post(`${API_URL}/auth/login`, credentials);
  return response.data;
}

export async function registerUser(userData) {
  const response = await axios.post(`${API_URL}/auth/register`, userData);
  return response.data;
}

export async function getCurrentUser(token) {
  const response = await axios.get(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}