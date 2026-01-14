import { ENV } from "@/app/env";
import axios from "axios";

export const apiClient = axios.create({
  baseURL: ENV.API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  },
});