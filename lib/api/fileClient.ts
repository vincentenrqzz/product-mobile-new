import { API } from "@/constants/api";
import { FileData, FileUploadResponse } from "@/types/File";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosInstance, AxiosProgressEvent, AxiosResponse } from "axios";

const fileClient: AxiosInstance = axios.create({
  baseURL: API.BASE_URL.FILE,
  headers: {
    "x-request-context": "mobile",
  },
});

fileClient.interceptors.request.use(async (config) => {
  const tenant = await AsyncStorage.getItem("tenant");
  if (tenant) {
    config.headers["x-tenant-name"] = tenant;
  }
  return config;
});

export const uploadFile = async (
  token: string,
  taskIdAndFilePath: string,
  fileData: FileData,
  signal?: AbortSignal,
  onProgress?: (percent: number) => void
): Promise<FileUploadResponse> => {
  const formData = new FormData();
  formData.append("destination", taskIdAndFilePath);
  formData.append("image", fileData as any);

  const response: AxiosResponse<FileUploadResponse> = await fileClient.post(
    API.ENDPOINTS.FILES.POST,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
      signal,
      timeout: 120000,
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round(
            (progressEvent.loaded / progressEvent.total) * 100
          );
          onProgress(percent);
        }
      },
    }
  );

  return response.data;
};
