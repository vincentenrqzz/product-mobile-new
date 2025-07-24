import { API } from "@/constants/api";
import { GetQueryResultParams } from "@/types/form";
import { AxiosResponse } from "axios";
import { client } from "../client";

export const getForms = async (token: string): Promise<any> => {
  const response: AxiosResponse<any> = await client.get(
    API.ENDPOINTS.FORMS.GET,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-request-context": "tasks",
      },
    }
  );
  return response.data;
};

export const submitRemoteQuery = async (
  params: GetQueryResultParams,
  token: string
) => {
  const response: AxiosResponse<any> = await client.post(
    API.ENDPOINTS.FORMS.POST_REMOTE_QUERY,
    params,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const { data } = response;
  if (typeof data === "string") throw new Error("request rejected");

  return data;
};
