import axios from "axios";

// If frontend runs on same device as backend in Termux:
export const api = axios.create({
  baseURL: "http://localhost:5000/api",
});