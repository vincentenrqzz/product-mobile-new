// src/constants/urls.ts
export const BASE_URLS = {
  local: {
    MAIN: 'http://192.168.1.3:5000/',
    FILE: 'http://192.168.1.3:8080/',
    SOCKET: 'http://192.168.1.3:4000/',
  },
  dev: {
    MAIN: 'https://saas-gw-dev.milgam.co.il:8012/',
    FILE: 'https://saas-gw-dev.milgam.co.il:8014/',
    SOCKET: 'https://saas-gw-dev.milgam.co.il:8013/',
  },
  prod: {
    MAIN: 'https://miltask-gw.milgam.co.il/',
    FILE: 'https://miltask-files-gw.milgam.co.il/',
    SOCKET: 'https://miltask-gw.milgam.co.il/',
  },
  qa: {
    MAIN: 'https://product-saas-gw-qa.milgam.co.il:8843/',
    FILE: 'https://product-saas-files-gw-qa.milgam.co.il:8015/',
    SOCKET: 'https://miltask-gw.milgam.co.il/',
  },
} as const
export type EnvKey = keyof typeof BASE_URLS
export type BaseGroup = (typeof BASE_URLS)[EnvKey]

export const API = {
  BASE_URL: BASE_URLS.dev,
  ENDPOINTS: {
    USER: {
      POST: 'auth/login',
      GET: 'auth/user',
      POST_OTP: 'auth/login/otp',
      POST_FORGOT_PASSWORD: 'auth/mobile/forgot-password',
      POST_RESET_PASSWORD: 'auth/mobile/confirm-forgot-password',
      POST_CHANGE_PASSWORD: 'users/change-password',
    },
    TASKS: {
      ALL: 'tasks?page=0&pageSize=2000',
      GET_ONE: 'tasks?taskId=:id&page=0&pageSize=2000',
      CREATE: 'tasks',
      CREATE_CUSTOM: 'tasks/genericCreate',
      UPDATE: `tasks/:id`,
    },
    TASK_TYPES: {
      GET: 'task-types',
    },
    TASK_STATUSES: {
      GET: 'task-statuses',
    },
    TASK_DETAILS: {
      GET: 'task-details',
    },
    FORMS: {
      GET: 'forms',
      POST_REMOTE_QUERY: 'remote',
    },
    SETTINGS: {
      GET: 'settings',
    },
    FILES: {
      POST: 'files/mobile-upload-image',
    },
    AMAZON: {
      POST: 'files/pre-signed-download',
    },
    GROUPS: {
      GET_USER_GROUPS: 'groups/group-with-attributes/:id',
    },
  },
}
