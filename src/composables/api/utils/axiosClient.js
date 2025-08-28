import axios from "axios";

const API_KEY = import.meta.env.VITE_RATP_API_KEY;

export const axiosClient = axios.create({
  headers: {
    "apikey": API_KEY,
    "Accept": "application/json"
  }
});