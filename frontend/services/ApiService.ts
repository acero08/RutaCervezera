// services/ApiService.ts
import axios from "axios";
import { AuthResponse } from "../models/AuthResponse";
import { HandleLoginError } from "../helpers/ErrorHandler";

export default class ApiService {
  private static instance: ApiService;
  private api = "http://localhost:3000/api";

  private constructor() {}

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  public async login(username: string, password: string): Promise<AuthResponse> {
    try {
      const { data } = await axios.post<AuthResponse>(
        `${this.api}/login`,
        { username, password }
      );
      return data;
    } catch (error) {
      HandleLoginError(error);
      throw error;  // re-lanzamos para que el componente pueda reaccionar si lo necesita
    }
  }

  public async register(email: string, username: string, password: string): Promise<AuthResponse> {
    try {
      const { data } = await axios.post<AuthResponse>(
        `${this.api}/register`,
        { email, username, password }
      );
      return data;
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }
}
