import {
  changeTaskStatus,
  createTask,
  customCreateTask,
} from "@/lib/api/client";
import {
  ChangeTaskStatusParams,
  CreateTaskParams,
  CustomCreateTaskParams,
  Task,
} from "@/types/task";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// TODO Add toast notification for failed task update

export const useChangeTaskStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<Task, Error, ChangeTaskStatusParams>({
    mutationFn: ({ taskId, idToken, wholeTask, taskTypes, signal }) =>
      changeTaskStatus(taskId, idToken, wholeTask, taskTypes, signal),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["task", variables.taskId.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error, variables, context) => {
      console.error("Failed to update task status:", error);
    },
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation<Task, Error, CreateTaskParams>({
    mutationFn: ({ values, selectedType, token }) =>
      createTask(values, selectedType, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => {
      console.error("Failed to create task:", error);
    },
  });
};

export const useCustomCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation<Task, Error, CustomCreateTaskParams>({
    mutationFn: ({ customCreateData, token }) =>
      customCreateTask(customCreateData, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => {
      console.error("Failed to create task:", error);
    },
  });
};
