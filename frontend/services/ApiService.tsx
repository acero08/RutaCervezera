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

  // Métodos de reviews corregidos
  async createBarReview(
    barId: string,
    token: string,
    rating: number,
    comment: string
  ) {
    try {
      console.log("Creating review with data:", {
        barId,
        rating,
        comment,
        hasToken: !!token,
      });

      const response = await axios.post(
        `${this.api}/bars/${barId}/reviews`,
        {
          token,
          rating,
          comment,
        },
        {
          headers: {
            "Content-Type": "application/json",
            // Si tu API requiere Authorization header en lugar de token en el body:
            // 'Authorization': `Bearer ${token}`
          },
          timeout: 10000, // 10 segundos de timeout
        }
      );

      console.log("Review created successfully:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error creating review:", error);

      // Más detalles del error
      if (error.response) {
        console.error("Error response:", {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        });
      } else if (error.request) {
        console.error("Error request:", error.request);
      } else {
        console.error("Error message:", error.message);
      }

      throw error;
    }
  }

  async editReview(
    reviewId: string,
    token: string,
    rating: number,
    comment: string
  ) {
    try {
      console.log("Editing review with data:", {
        reviewId,
        rating,
        comment,
        hasToken: !!token,
      });

      const response = await axios.put(
        `${this.api}/reviews/${reviewId}`,
        {
          token,
          rating,
          comment,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      console.log("Review edited successfully:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error editing review:", error);

      if (error.response) {
        console.error("Error response:", {
          status: error.response.status,
          data: error.response.data,
        });
      }

      throw error;
    }
  }

  async deleteReview(reviewId: string, token: string) {
    try {
      console.log("Deleting review:", { reviewId, hasToken: !!token });

      const response = await axios.delete(`${this.api}/reviews/${reviewId}`, {
        data: { token },
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000,
      });

      console.log("Review deleted successfully:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error deleting review:", error);

      if (error.response) {
        console.error("Error response:", {
          status: error.response.status,
          data: error.response.data,
        });
      }

      throw error;
    }
  }

  async getBarReviews(barId: string) {
    try {
      console.log("Fetching reviews for bar:", barId);

      const response = await axios.get(`${this.api}/bars/${barId}/reviews`, {
        timeout: 10000,
      });

      console.log("Reviews fetched successfully:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching reviews:", error);

      if (error.response) {
        console.error("Error response:", {
          status: error.response.status,
          data: error.response.data,
        });
      }

      throw error;
    }
  }

  // Métodos de comentarios corregidos
  async upvoteReview(reviewId: string, token: string) {
    try {
      console.log("Upvoting review:", { reviewId, hasToken: !!token });

      const response = await axios.post(
        `${this.api}/reviews/${reviewId}/upvotes`,
        { token },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      console.log("Review upvoted successfully:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error upvoting review:", error);

      if (error.response) {
        console.error("Error response:", {
          status: error.response.status,
          data: error.response.data,
        });
      }

      throw error;
    }
  }

  async getComments(reviewId: string) {
    try {
      console.log("Fetching comments for review:", reviewId);

      const response = await axios.get(
        `${this.api}/reviews/${reviewId}/comments`,
        {
          timeout: 10000,
        }
      );

      console.log("Comments fetched successfully:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching comments:", error);

      if (error.response) {
        console.error("Error response:", {
          status: error.response.status,
          data: error.response.data,
        });
      }

      throw error;
    }
  }

  async postComment(reviewId: string, token: string, comment: string) {
    try {
      console.log("Posting comment:", { reviewId, comment, hasToken: !!token });

      const response = await axios.post(
        `${this.api}/reviews/${reviewId}/comments`,
        { token, comment },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      console.log("Comment posted successfully:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error posting comment:", error);

      if (error.response) {
        console.error("Error response:", {
          status: error.response.status,
          data: error.response.data,
        });
      }

      throw error;
    }
  }

  // Otros métodos existentes...
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
          if (image instanceof File) {
            formData.append("image", image);
          }
        } else {
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

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000,
      };

      const { data } = await axios.put(
        `${this.api}/updateUser`,
        formData,
        config
      );

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
