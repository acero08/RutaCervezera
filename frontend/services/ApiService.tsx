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

  // Método corregido para obtener reseñas - manejo de errores mejorado
  async getBarReviews(barId: string) {
    try {
      console.log("Fetching reviews for bar:", barId);

      const response = await axios.get(`${this.api}/bars/${barId}/reviews`, {
        timeout: 10000, // Reducido de 15000 a 10000
        headers: {
          "Content-Type": "application/json",
        },
        validateStatus: function (status) {
          return status < 500; // Aceptar cualquier código menor a 500
        },
      });

      console.log("Reviews response status:", response.status);
      console.log("Reviews response data:", response.data);

      // Si es 404, retornar array vacío (no hay reseñas)
      if (response.status === 404) {
        return { success: true, data: [] };
      }

      // Si hay error del servidor (5xx), lanzar excepción
      if (response.status >= 500) {
        throw new Error("Server error - please try again later");
      }

      const responseData = response.data;

      if (responseData.success === false) {
        return { success: false, data: [], message: responseData.message };
      }

      let reviews = [];
      if (Array.isArray(responseData)) {
        reviews = responseData;
      } else if (responseData.data && Array.isArray(responseData.data)) {
        reviews = responseData.data;
      } else if (responseData.reviews && Array.isArray(responseData.reviews)) {
        reviews = responseData.reviews;
      }

      return {
        success: true,
        data: reviews,
      };
    } catch (error: any) {
      console.error("Error fetching reviews:", error);

      // Si es error de timeout o red
      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        throw new Error("Connection timeout - please try again");
      }

      if (error.response) {
        if (error.response.status === 404) {
          return { success: true, data: [] };
        } else if (error.response.status >= 500) {
          throw new Error("Server error - please try again later");
        } else if (error.response.status === 400) {
          throw new Error(error.response.data?.message || "Bad request");
        }
      } else if (error.request) {
        throw new Error("Network error - please check your connection");
      }

      throw error;
    }
  }

  // Método corregido para crear reseña - timeout reducido y mejor validación
  async createBarReview(
    barId: string,
    token: string,
    rating: number,
    comment: string
  ) {
    try {
      if (!barId || !token) {
        throw new Error("Missing required parameters");
      }

      if (rating < 1 || rating > 5) {
        throw new Error("Rating must be between 1 and 5");
      }

      if (!comment || comment.trim().length === 0) {
        throw new Error("Comment cannot be empty");
      }

      const payload = {
        token: token.trim(),
        rating: Number(rating),
        comment: comment.trim(),
      };

      console.log("Creating review with data:", {
        barId,
        rating: payload.rating,
        comment: payload.comment.substring(0, 50) + "...",
        hasToken: !!payload.token,
      });

      const response = await axios.post(
        `${this.api}/bars/${barId}/reviews`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          timeout: 15000, // Reducido de 20000 a 15000
          validateStatus: function (status) {
            return status < 500; // Aceptar códigos menores a 500
          },
        }
      );

      if (response.status >= 400) {
        const errorMessage =
          response.data?.message ||
          `Request failed with status ${response.status}`;
        throw new Error(errorMessage);
      }

      console.log("Review created successfully:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error creating review:", error);

      // Manejo específico de timeout
      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        throw new Error(
          "Connection timeout - please try again with a shorter review"
        );
      }

      if (error.response) {
        const status = error.response.status;
        const errorMessage = error.response.data?.message;

        if (status === 400) {
          throw new Error(errorMessage || "Invalid request data");
        } else if (status === 401) {
          throw new Error("Authentication required - please login again");
        } else if (status === 403) {
          throw new Error("You don't have permission to perform this action");
        } else if (status === 409) {
          throw new Error("You have already reviewed this bar");
        } else if (status >= 500) {
          throw new Error("Server error - please try again later");
        }
      } else if (error.request) {
        throw new Error("Network error - please check your connection");
      }

      throw error;
    }
  }

  // Método corregido para editar reseña
  async editReview(
    reviewId: string,
    token: string,
    rating: number,
    comment: string
  ) {
    try {
      if (!reviewId || !token) {
        throw new Error("Missing required parameters");
      }

      if (rating < 1 || rating > 5) {
        throw new Error("Rating must be between 1 and 5");
      }

      if (!comment || comment.trim().length === 0) {
        throw new Error("Comment cannot be empty");
      }

      const payload = {
        token: token.trim(),
        rating: Number(rating),
        comment: comment.trim(),
      };

      const response = await axios.put(
        `${this.api}/reviews/${reviewId}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          timeout: 15000, // Reducido de 20000
          validateStatus: function (status) {
            return status < 500;
          },
        }
      );

      if (response.status >= 400) {
        const errorMessage =
          response.data?.message ||
          `Request failed with status ${response.status}`;
        throw new Error(errorMessage);
      }

      return response.data;
    } catch (error: any) {
      console.error("Error editing review:", error);

      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        throw new Error("Connection timeout - please try again");
      }

      if (error.response) {
        const status = error.response.status;
        if (status === 400) {
          throw new Error(
            error.response.data?.message || "Invalid request data"
          );
        } else if (status === 401) {
          throw new Error("Authentication required");
        } else if (status === 403) {
          throw new Error("You can only edit your own reviews");
        } else if (status === 404) {
          throw new Error("Review not found");
        }
      }

      throw error;
    }
  }
  // Método corregido para eliminar reseña
  async deleteReview(reviewId: string, token: string) {
    try {
      if (!reviewId || !token) {
        throw new Error("Missing required parameters");
      }

      console.log("Deleting review:", { reviewId, hasToken: !!token });

      const response = await axios.delete(`${this.api}/reviews/${reviewId}`, {
        data: {
          token: token.trim(),
        },
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 15000,
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

        if (error.response.status === 401) {
          throw new Error("Authentication required");
        } else if (error.response.status === 403) {
          throw new Error("You can only delete your own reviews");
        } else if (error.response.status === 404) {
          throw new Error("Review not found");
        }
      }

      throw error;
    }
  }

  // Método corregido para upvote
  async upvoteReview(reviewId: string, token: string) {
    try {
      if (!reviewId || !token) {
        throw new Error("Missing required parameters");
      }

      console.log("Upvoting review:", { reviewId, hasToken: !!token });

      const response = await axios.post(
        `${this.api}/reviews/${reviewId}/upvotes`,
        {
          token: token.trim(),
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          timeout: 15000,
        }
      );

      console.log("Review upvoted successfully:", response.data);

      // Retornar la estructura esperada
      return {
        success: true,
        count: response.data.upvotes || response.data.count || 0,
        data: response.data,
      };
    } catch (error: any) {
      console.error("Error upvoting review:", error);

      if (error.response) {
        console.error("Error response:", {
          status: error.response.status,
          data: error.response.data,
        });

        if (error.response.status === 401) {
          throw new Error("Authentication required");
        } else if (error.response.status === 409) {
          throw new Error("You have already upvoted this review");
        }
      }

      throw error;
    }
  }

  // Método corregido para obtener comentarios
  async getComments(reviewId: string) {
    try {
      if (!reviewId) {
        throw new Error("Review ID is required");
      }

      console.log("Fetching comments for review:", reviewId);

      const response = await axios.get(
        `${this.api}/reviews/${reviewId}/comments`,
        {
          timeout: 15000,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      console.log("Comments fetched successfully:", response.data);

      // Manejar diferentes estructuras de respuesta
      let comments = [];
      const responseData = response.data;

      if (Array.isArray(responseData)) {
        comments = responseData;
      } else if (responseData.data && Array.isArray(responseData.data)) {
        comments = responseData.data;
      } else if (
        responseData.comments &&
        Array.isArray(responseData.comments)
      ) {
        comments = responseData.comments;
      }

      return {
        success: true,
        data: comments,
      };
    } catch (error: any) {
      console.error("Error fetching comments:", error);

      if (error.response) {
        console.error("Error response:", {
          status: error.response.status,
          data: error.response.data,
        });

        if (error.response.status === 404) {
          return { success: true, data: [] }; // Review sin comentarios
        }
      }

      throw error;
    }
  }

  // Método corregido para crear comentario
  async postComment(reviewId: string, token: string, comment: string) {
    try {
      if (!reviewId || !token || !comment) {
        throw new Error("All parameters are required");
      }

      if (comment.trim().length === 0) {
        throw new Error("Comment cannot be empty");
      }

      const payload = {
        token: token.trim(),
        comment: comment.trim(),
      };

      console.log("Posting comment:", {
        reviewId,
        comment: payload.comment.substring(0, 50) + "...",
        hasToken: !!payload.token,
      });

      const response = await axios.post(
        `${this.api}/reviews/${reviewId}/comments`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          timeout: 15000,
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

        if (error.response.status === 400) {
          throw new Error(
            error.response.data?.message || "Invalid comment data"
          );
        } else if (error.response.status === 401) {
          throw new Error("Authentication required");
        } else if (error.response.status === 404) {
          throw new Error("Review not found");
        }
      }

      throw error;
    }
  }

  // Métodos existentes sin cambios...
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

      formData.append("token", token);

      Object.entries(userData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

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
