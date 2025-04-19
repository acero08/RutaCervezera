// components/LoginService.ts
import ApiService from "../services/ApiService";
const api = ApiService.getInstance();

export const loginAPI = (username: string, password: string) =>
  api.login(username, password);

export const registerAPI = (email: string, username: string, password: string) =>
  api.register(email, username, password);
