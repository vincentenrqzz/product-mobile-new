import { uploadFile } from "@/services/api/fileClient";
import { FileData, FileUploadResponse } from "@/types/file";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UploadFileParams {
  idToken: string;
  taskIdAndFilePath: string;
  fileData: FileData;
  signal?: AbortSignal;
  onProgress?: (percent: number) => void;
}

export const useUploadFile = () => {
  const queryClient = useQueryClient();

  return useMutation<FileUploadResponse, Error, UploadFileParams>({
    mutationFn: ({
      idToken,
      taskIdAndFilePath,
      fileData,
      signal,
      onProgress,
    }) => uploadFile(idToken, taskIdAndFilePath, fileData, signal, onProgress),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["task", variables.taskIdAndFilePath.split("/")[0]],
      });
    },
    onError: (error, variables, context) => {
      console.error("Failed to upload file:", error);
      // TODO Add toast notification for failed file upload
    },
  });
};
