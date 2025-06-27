import { API } from "@/constants/api";
import {
  ChangePasswordInput,
  ForgotPasswordInput,
  OtpInput,
  ResetPasswordInput,
} from "@/types/auth";
import { GetQueryResultParams } from "@/types/form";
import { CustomCreateData, Task } from "@/types/task";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosInstance, AxiosResponse } from "axios";

const client: AxiosInstance = axios.create({
  baseURL: API.BASE_URL.MAIN,
  headers: {
    "Content-Type": "application/json",
  },
});

client.interceptors.request.use(async (config) => {
  const tenant = await AsyncStorage.getItem("tenant");
  if (tenant) {
    config.headers["x-tenant-name"] = tenant;
  }
  return config;
});

export const login = async (username: string, password: string) => {
  const response: AxiosResponse<any> = await client.post(
    API.ENDPOINTS.USER.POST,
    { username, password }
  );
  return response.data;
};

export const getOneTask = async (
  taskId: string,
  token: string
): Promise<Task> => {
  const endpoint = API.ENDPOINTS.TASKS.GET_ONE.replace(":id", taskId);
  const response: AxiosResponse<Task> = await client.get(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
      from: "mobile",
      "x-request-context": "tasks",
    },
  });
  return response.data;
};

export const getAllTasks = async (token: string): Promise<Task[]> => {
  const response: AxiosResponse<Task[]> = await client.get(
    API.ENDPOINTS.TASKS.ALL,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        from: "mobile",
        "x-request-context": "tasks",
      },
    }
  );
  return response.data;
};

export const changeTaskStatus = async (
  taskId: number,
  token: string,
  wholeTask: Task,
  taskTypes: any[] = [], //TODO Add types for taskTypes
  signal?: AbortSignal
): Promise<Task> => {
  const typeLabelToKey = Object.fromEntries(
    taskTypes.map((item) => [item.label, item.key])
  );
  const typeKey = typeLabelToKey[wholeTask.taskType] ?? wholeTask.taskType;

  const endpoint = API.ENDPOINTS.TASKS.UPDATE.replace(":id", taskId.toString());
  const response: AxiosResponse<Task> = await client.put(
    endpoint,
    {
      ...wholeTask,
      taskType: typeKey,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-request-context": "mobile",
      },
      signal,
    }
  );

  return response.data;
};

export const getTaskStatus = async (
  taskId: number,
  token: string
): Promise<any> => {
  const endpoint = API.ENDPOINTS.TASK_STATUSES.GET.replace(
    ":id",
    taskId.toString()
  );
  const response: AxiosResponse<any> = await client.get(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
      "x-request-context": "tasks",
    },
  });
  return response.data;
};

export const getSettings = async (token: string): Promise<any> => {
  const response: AxiosResponse<any> = await client.get(
    API.ENDPOINTS.SETTINGS.GET,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-request-context": "tasks",
      },
    }
  );

  return response.data;
};

export const getTaskTypes = async (token: string): Promise<any> => {
  const response: AxiosResponse<any> = await client.get(
    API.ENDPOINTS.TASK_TYPES.GET,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-request-context": "tasks",
      },
    }
  );

  return response.data;
};

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

export const createTask = async (
  values: any,
  selectedType: string,
  token: string
): Promise<Task> => {
  const response: AxiosResponse<Task> = await client.post(
    API.ENDPOINTS.TASKS.CREATE,
    {
      ...values,
      taskType: selectedType,
    },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export const getGroupsUser = async (token: string): Promise<any> => {
  const response: AxiosResponse<any> = await client.get(
    API.ENDPOINTS.GROUPS.GET_USER_GROUPS,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const submitOtp = async (params: OtpInput): Promise<any> => {
  const response: AxiosResponse<any> = await client.post(
    API.ENDPOINTS.USER.POST_OTP,
    params
  );
  return response.data;
};

export const submitForgotPassword = async (
  params: ForgotPasswordInput
): Promise<any> => {
  const response: AxiosResponse<any> = await client.post(
    API.ENDPOINTS.USER.POST_FORGOT_PASSWORD,
    params
  );
  return response.data;
};

export const submitResetPassword = async (
  params: ResetPasswordInput
): Promise<any> => {
  const response: AxiosResponse<any> = await client.post(
    API.ENDPOINTS.USER.POST_RESET_PASSWORD,
    params
  );
  return response.data;
};

export const submitChangePassword = async (
  params: ChangePasswordInput
): Promise<any> => {
  const { token, ...rest } = params;

  const response: AxiosResponse<any> = await client.post(
    API.ENDPOINTS.USER.POST_CHANGE_PASSWORD,
    rest,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const customCreateTask = async (
  customCreateData: CustomCreateData,
  token: string
) => {
  const response: AxiosResponse<any> = await client.post(
    API.ENDPOINTS.TASKS.CREATE_CUSTOM,
    customCreateData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
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

export default client;
