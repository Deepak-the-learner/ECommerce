import axios from "axios";

const api = axios.create({
  baseURL: "<your_backend_local_host>/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
