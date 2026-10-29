
import axios from "axios";

const apiBaseURL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api"
).replace(/\/+$/, "");

const api = axios.create({
  baseURL: apiBaseURL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the saved login token to requests that need authentication.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("unfazed-token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
