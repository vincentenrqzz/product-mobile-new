import { API } from "@/constants/api";
import { FileData, FileUploadResponse } from "@/types/file";
import { AxiosProgressEvent, AxiosResponse } from "axios";
import { fileClient } from "../fileClient";

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
