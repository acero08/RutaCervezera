import axios, { AxiosResponse } from "axios";
import { HandleLoginError } from "../helpers/ErrorHandler";
import { Platform } from "react-native";

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

  // Fixed updateUser method with proper web support
  async updateUser(
    token: string,
    userData: any,
    image?: File | { uri: string; type?: string; name?: string }
  ): Promise<any> {
    try {
      console.log("updateUser called with:", {
        userData,
        hasImage: !!image,
        platform: Platform.OS,
      });

      const formData = new FormData();

      // Add token
      formData.append("token", token);

      // Add other user data fields
      Object.entries(userData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      // Handle image upload
      if (image) {
        console.log("Processing image:", image);

        if (Platform.OS === "web") {
          // Web handling - Direct File object
          if (image instanceof File) {
            console.log("Adding File directly to FormData");
            formData.append("image", image);
          } else {
            console.log("Image is not a File instance on web, skipping");
          }
        } else {
          // React Native handling
          if (typeof image === "object" && "uri" in image) {
            const mobileImage = {
              uri: image.uri,
              type: image.type || "image/jpeg",
              name: image.name || "profile.jpg",
            } as any;
            formData.append("image", mobileImage);
          }
        }
      }

      console.log("Sending request to server...");

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000, // 30 second timeout
      };

      const { data } = await axios.put(
        `${this.api}/updateUser`,
        formData,
        config
      );

      console.log("Update response:", data);
      return data;
    } catch (error: any) {
      console.error("Error en updateUser:", error);
      if (error.response) {
        console.error("Server response:", error.response.data);
        console.error("Status:", error.response.status);
      }
      throw error;
    }
  }
}
