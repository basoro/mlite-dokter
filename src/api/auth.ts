import apiClient from './client';

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  fullname: string;
  user?: {
    id: string;
    username: string;
    nama: string;
    kd_dokter: string;
    role: string;
    gender?: string;
  };
}

export const loginApi = async (payload: LoginPayload) => {
  const response = await apiClient.post<LoginResponse>('/login', {
    username: payload.username,
    password: payload.password,
  });
  return response.data;
};
