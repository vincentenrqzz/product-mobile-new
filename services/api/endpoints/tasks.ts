import { API } from "@/constants/api";
import { CustomCreateData, Task } from "@/types/task";
import { AxiosResponse } from "axios";
import { client } from "../client";

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
