import { API } from "@/constants/api";
import { AxiosResponse } from "axios";
import { client } from "../client";

export const getTaskDetails = async (token: string): Promise<any> => {
  const response: AxiosResponse<any> = await client.get(
    API.ENDPOINTS.TASK_DETAILS.GET,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-request-context": "tasks",
      },
    }
  );

  return response.data;
};
