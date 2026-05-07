import { apiRequest, setAuthToken, clearAuthToken } from "@/lib/api";
import {
  LoginPayload,
  LoginResponse,
  SignupPayload,
  VerifyPayload,
  UserProfile,
} from "@/types/auth";

export async function loginUser(payload: LoginPayload): Promise<LoginResponse> {
  const response = await apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (response.access_token) {
    setAuthToken(response.access_token);
  }

  return response;
}

export async function signupUser(
  payload: SignupPayload,
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function verifyEmail(
  payload: VerifyPayload,
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/auth/verify", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getCurrentUserProfile(): Promise<UserProfile> {
  return apiRequest<UserProfile>("/users/profile", {
    method: "GET",
  });
}

export async function logout(): Promise<void> {
  clearAuthToken();
}
