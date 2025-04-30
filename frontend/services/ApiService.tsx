import axios, { AxiosResponse } from "axios";
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

  public async login(email: string, password: string): Promise<any> {
    try {
      const { data }: AxiosResponse = await axios.post(`${this.api}/login`, {
        email,
        password,
      });
      return data;
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }

  async register(
    name: string,
    email: string,
    mobile: string,
    password: string
  ) {
    try {
      const response = await axios.post(`${this.api}/register`, {
        name,
        email,
        mobile,
        password,
      });

      if (response.data.success) {
        return {
          token: response.data.token,
          user: response.data.data,
        };
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      HandleLoginError(error);
      throw error;
    }
  }
  async getUserData(token: string): Promise<any> {
    try {
      const { data } = await axios.post(`${this.api}/userdata`, { token });
      return data.data;
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }

  async updateUser(token: string, userData: any, image?: File): Promise<any> {
    const formData = new FormData();
    if (image) formData.append("image", image);
    Object.entries(userData).forEach(([key, value]) => {
      formData.append(key, value as string);
    });

    try {
      const { data } = await axios.put(`${this.api}/updateUser`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return data.user;
    } catch (error) {
      HandleLoginError(error);
      throw error;
    }
  }
}
