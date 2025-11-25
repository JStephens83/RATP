import axios from "axios";

const API_KEY = import.meta.env.PRIM_API_KEY;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const axiosClient = axios.create({
  baseURL: BACKEND_URL, // url backend express
  headers: {
    Accept: "application/json"
  }
});