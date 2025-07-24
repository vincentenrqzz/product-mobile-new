import AsyncStorage from "@react-native-async-storage/async-storage";
import { client } from "./client";
import { fileClient } from "./fileClient";

client.interceptors.request.use(async (config) => {
  const tenant = await AsyncStorage.getItem("tenant");
  if (tenant) {
    config.headers["x-tenant-name"] = tenant;
  }
  return config;
});

fileClient.interceptors.request.use(async (config) => {
  const tenant = await AsyncStorage.getItem("tenant");
  if (tenant) {
    config.headers["x-tenant-name"] = tenant;
  }
  return config;
});
