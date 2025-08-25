import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // lee la URL desde el .env
});

export default api;