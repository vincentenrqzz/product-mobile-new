export interface OtpInput {
  tenantName: string;
  userSub: string;
  code: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  newPassword: string;
  confirmPassword: string;
  tenantName: string;
  email: string;
  otpCode: string;
  userSub: string;
}

export interface ChangePasswordInput {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
  token: string;
}

export interface OtpResponse {
  data: {
    AuthenticationResult: any;
  };
}

export interface ForgotPasswordResponse {
  // Adjust based on API response
  success?: boolean;
}

export interface ResetPasswordResponse {
  // Adjust based on API response
  success?: boolean;
}

export interface ChangePasswordResponse {
  success: boolean;
}

export type OtpChallenge = {
  userSub: string;
  tenantName: string;
  code: string;
  resendSeconds: number;
};
