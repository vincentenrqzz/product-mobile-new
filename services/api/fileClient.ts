import { API } from "@/constants/api";
import axios, { AxiosInstance } from "axios";

export const fileClient: AxiosInstance = axios.create({
  baseURL: API.BASE_URL.FILE,
  headers: {
    "x-request-context": "mobile",
  },
});
