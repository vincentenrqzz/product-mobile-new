import { API } from "@/constants/api";
import axios, { AxiosInstance } from "axios";

export const client: AxiosInstance = axios.create({
  baseURL: API.BASE_URL.MAIN,
  headers: {
    "Content-Type": "application/json",
  },
});
