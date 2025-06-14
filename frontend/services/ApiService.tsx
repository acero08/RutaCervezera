import axios, { AxiosResponse } from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
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

  
  // ============================================================================
  // AUTHENTICATION METHODS
  // ============================================================================

  public async login(email: string, password: string): Promise<any> {
    try {
      const { data }: AxiosResponse = await axios.post(`${this.api}/login`, {
        email,
        password,
      });
      
      if (data.success) {
        await AsyncStorage.setItem('userToken', data.token); // Asegúrate de que el token esté en data.token
        console.log('Token stored:', data.token);
      }
      
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
    password: string,
    accountType: string = 'user'
  ): Promise<any> {
    try {
      const response = await axios.post(`${this.api}/register`, {
        name,
        email,
        mobile,
        password,
        accountType
      });
      return response.data;
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

  // ============================================================================
  // BAR MANAGEMENT METHODS
  // ============================================================================

  async getBarDetails(): Promise<any> {
    try {
      const token = await AsyncStorage.getItem('userToken');
      console.log('Token from storage:', token ? 'exists' : 'not found');
  
      if (!token) {
        throw new Error('No authentication token found');
      }
  
      const response = await axios.get(`${this.api}/bars/current`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error in getBarDetails:', error);
      throw this.handleError(error);
    }
  }
  
  
 
  async updateBarImage(type: 'cover' | 'profile', formData: FormData): Promise<any> {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.put(
        `${this.api}/bars/current/image/${type}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  async updateBarDetails(details: { 
    name?: string; 
    description?: string; 
    phone?: string; 
    email?: string; 
    website?: string 
  }): Promise<any> {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Updating bar details with token:', token ? 'exists' : 'missing');
      
      const response = await axios.put(
        `${this.api}/bars/current`, 
        details,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error updating bar details');
      }

      return response.data;
    } catch (error: any) {
      console.error('Error updating bar details:', error);
      if (error.response?.status === 401) {
        throw new Error('Authentication required - please login again');
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data.message || 'Invalid data provided');
      } else if (error.response) {
        throw new Error(error.response.data.message || 'Server error');
      } else if (error.request) {
        throw new Error('Network error - please check your connection');
      }
      throw error;
    }
  }

  async getBarMenu(): Promise<any> {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`${this.api}/bars/current/menu`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener el menú');
      }

      return response.data;
    } catch (error: any) {
      console.error('Error getting menu:', error);
      if (error.response?.status === 401) {
        throw new Error('Authentication required - please login again');
      } else if (error.response?.status === 404) {
        throw new Error('No bar found or no menu items available');
      } else if (error.response) {
        throw new Error(error.response.data.message || 'Server error');
      } else if (error.request) {
        throw new Error('Network error - please check your connection');
      }
      throw error;
    }
  }

  async createMenuItem(item: any): Promise<any> {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.post(`${this.api}/menu/items`, item, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createFoodItem(formData: FormData): Promise<any> {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Get current bar details to get the barId
      const barDetails = await this.getBarDetails();
      if (!barDetails.success || !barDetails.data._id) {
        throw new Error('No bar found or not authorized to manage a bar');
      }

      const response = await axios.post(
        `${this.api}/bars/${barDetails.data._id}/menu`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          }
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createDrinkItem(formData: FormData): Promise<any> {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Get current bar details to get the barId
      const barDetails = await this.getBarDetails();
      if (!barDetails.success || !barDetails.data._id) {
        throw new Error('No bar found or not authorized to manage a bar');
      }

      const response = await axios.post(
        `${this.api}/bars/${barDetails.data._id}/menu`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          }
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createAlcoholicDrinkItem(formData: FormData): Promise<any> {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
  
      console.log('Creating alcoholic drink with token:', token ? 'exists' : 'missing');
  
      const response = await axios.post(
        `${this.api}/bars/current/menu`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          }
        }
      );
  
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error creating alcoholic drink');
      }
  
      return response.data;
    } catch (error) {
      console.error('Error in createAlcoholicDrinkItem:', error);
      throw this.handleError(error);
    }
  }
  
  // FIX: Método getAlcoholicDrinks corregido
  async getAlcoholicDrinks(): Promise<any> {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
  
      console.log('Getting alcoholic drinks with token:', token ? 'exists' : 'not found');
  
      const response = await axios.get(`${this.api}/bars/current/menu`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      console.log('Menu response:', response.data);
  
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error fetching alcoholic drinks');
      }
  
      return {
        success: true,
        data: response.data.data.alcoholicDrinks || []
      };
    } catch (error: any) {
      console.error('Error in getAlcoholicDrinks:', error);
      
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
        
        if (error.response.status === 401) {
          throw new Error('Authentication required - please login again');
        } else if (error.response.status === 403) {
          throw new Error('No tienes permiso para acceder a este menú');
        } else if (error.response.status === 404) {
          throw new Error('No bar found or no menu items available');
        }
      }
      
      throw this.handleError(error);
    }
  }
  // ============================================================================
  // REVIEWS METHODS
  // ============================================================================

  async getBarReviews(barId: string): Promise<{ success: boolean; data: any[] }> {
    try {
      console.log("Fetching reviews for bar:", barId);

      const response = await axios.get(`${this.api}/bars/${barId}/reviews`, {
        timeout: 10000,
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Reviews response:", response.data);

      // Handle different response structures
      let reviews = [];
      const responseData = response.data;

      if (Array.isArray(responseData)) {
        reviews = responseData;
      } else if (responseData.data && Array.isArray(responseData.data)) {
        reviews = responseData.data;
      } else if (responseData.reviews && Array.isArray(responseData.reviews)) {
        reviews = responseData.reviews;
      } else if (responseData.success && responseData.data) {
        reviews = Array.isArray(responseData.data) ? responseData.data : [];
      }

      return {
        success: true,
        data: reviews,
      };
    } catch (error: any) {
      console.error("Error fetching reviews:", error);
      console.error("Error response data:", error.response?.data);
      console.error("Error response status:", error.response?.status);

      if (error.response?.status === 404) {
        return { success: true, data: [] };
      }

      // For 500 errors or network issues, return empty array instead of throwing
      if (error.response?.status >= 500 || !error.response) {
        console.warn("Server or network error, returning empty reviews");
        return { success: true, data: [] };
      }

      throw error;
    }
  }

  async createBarReview(
    barId: string,
    token: string,
    rating: number,
    comment: string
  ): Promise<any> {
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
          timeout: 15000,
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

      console.log("Review created successfully:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error creating review:", error);

      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        throw new Error("Connection timeout - please try again with a shorter review");
      }

      if (error.response) {
        const status = error.response.status;
        const errorMessage = error.response.data?.message;

        switch (status) {
          case 400:
            throw new Error(errorMessage || "Invalid request data");
          case 401:
            throw new Error("Authentication required - please login again");
          case 403:
            throw new Error("You don't have permission to perform this action");
          case 409:
            throw new Error("You have already reviewed this bar");
          case 500:
            throw new Error("Server error - please try again later");
          default:
            throw new Error(errorMessage || "Unknown error");
        }
      } else if (error.request) {
        throw new Error("Network error - please check your connection");
      }

      throw error;
    }
  }

  async editReview(
    reviewId: string,
    token: string,
    rating: number,
    comment: string
  ): Promise<any> {
    try {
      if (!reviewId || !token) {
        throw new Error("Missing required parameters");
      }

      if (rating < 1 || rating > 5) {
        throw new Error("Rating must be between 1 and 5 stars");
      }

      if (!comment || comment.trim().length === 0) {
        throw new Error("Review cannot be empty");
      }

      if (comment.trim().length > 1000) {
        throw new Error("Review is too long (maximum 1000 characters)");
      }

      const payload = {
        token: token.trim(),
        rating: Number(rating),
        comment: comment.trim(),
      };

      console.log("Editing review:", {
        reviewId,
        rating,
        commentLength: comment.length,
      });

      const response = await axios.put(
        `${this.api}/reviews/${reviewId}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          timeout: 15000,
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

      console.log("Review edited successfully");
      return response.data;
    } catch (error: any) {
      console.error("Error editing review:", error);

      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        throw new Error("Connection timeout. Please try again");
      }

      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message;

        switch (status) {
          case 400:
            throw new Error(message || "Invalid review data");
          case 401:
            throw new Error("You must be logged in to edit reviews");
          case 403:
            throw new Error("You can only edit your own reviews");
          case 404:
            throw new Error("Review not found");
          case 500:
            throw new Error("Server error. Please try again later");
          default:
            throw new Error(message || "Unknown error");
        }
      }

      throw error;
    }
  }

  async deleteReview(reviewId: string, token: string): Promise<any> {
    try {
      if (!reviewId || !token) {
        throw new Error("Missing required parameters");
      }

      console.log("Deleting review:", { reviewId });

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

      console.log("Review deleted successfully");
      return response.data;
    } catch (error: any) {
      console.error("Error deleting review:", error);

      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message;

        switch (status) {
          case 401:
            throw new Error("You must be logged in to delete reviews");
          case 403:
            throw new Error("You can only delete your own reviews");
          case 404:
            throw new Error("Review not found");
          case 500:
            throw new Error("Server error. Please try again later");
          default:
            throw new Error(message || "Unknown error");
        }
      }

      throw error;
    }
  }

  async upvoteReview(reviewId: string, token: string): Promise<any> {
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

  // ============================================================================
  // COMMENTS METHODS
  // ============================================================================

  async getComments(reviewId: string): Promise<{ success: boolean; data: any[] }> {
    try {
      console.log("Getting comments for review:", reviewId);

      if (!reviewId) {
        throw new Error("Review ID is required");
      }

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

      // Handle different response structures
      let comments = [];
      const responseData = response.data;

      if (Array.isArray(responseData)) {
        comments = responseData;
      } else if (responseData.data && Array.isArray(responseData.data)) {
        comments = responseData.data;
      } else if (responseData.comments && Array.isArray(responseData.comments)) {
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
          return { success: true, data: [] }; // Review without comments
        }
      }

      throw error;
    }
  }

  async postComment(reviewId: string, token: string, comment: string): Promise<any> {
    try {
      if (!reviewId || !token || !comment) {
        throw new Error("All parameters are required");
      }

      if (comment.trim().length === 0) {
        throw new Error("Comment cannot be empty");
      }

      if (comment.trim().length > 500) {
        throw new Error("Comment is too long (maximum 500 characters)");
      }

      const payload = {
        token: token.trim(),
        comment: comment.trim(),
      };

      console.log("Posting comment:", {
        reviewId,
        commentLength: comment.length,
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

      console.log("Comment posted successfully");
      return response.data;
    } catch (error: any) {
      console.error("Error posting comment:", error);

      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message;

        switch (status) {
          case 400:
            throw new Error(message || "Invalid comment data");
          case 401:
            throw new Error("You must be logged in to comment");
          case 404:
            throw new Error("Review not found");
          case 500:
            throw new Error("Server error. Please try again later");
          default:
            throw new Error(message || "Unknown error");
        }
      }

      if (error.code === "ECONNABORTED") {
        throw new Error("Connection timeout. Please try again");
      }

      throw error;
    }
  }

  async editComment(commentId: string, token: string, content: string): Promise<any> {
    try {
      if (!commentId || !token || !content) {
        throw new Error("All parameters are required");
      }

      if (content.trim().length === 0) {
        throw new Error("Comment cannot be empty");
      }

      if (content.trim().length > 500) {
        throw new Error("Comment is too long (maximum 500 characters)");
      }

      const payload = {
        token: token.trim(),
        content: content.trim(),
      };

      console.log("Editing comment:", {
        commentId,
        contentLength: content.length,
      });

      const response = await axios.put(
        `${this.api}/comments/${commentId}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          timeout: 15000,
        }
      );

      console.log("Comment edited successfully");
      return response.data;
    } catch (error: any) {
      console.error("Error editing comment:", error);

      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message;

        switch (status) {
          case 400:
            throw new Error(message || "Invalid comment data");
          case 401:
            throw new Error("You must be logged in to edit comments");
          case 403:
            throw new Error("You can only edit your own comments");
          case 404:
            throw new Error("Comment not found");
          case 500:
            throw new Error("Server error. Please try again later");
          default:
            throw new Error(message || "Unknown error");
        }
      }

      if (error.code === "ECONNABORTED") {
        throw new Error("Connection timeout. Please try again");
      }

      throw error;
    }
  }

  async deleteComment(commentId: string, token: string): Promise<any> {
    try {
      if (!commentId || !token) {
        throw new Error("Missing required parameters");
      }

      console.log("Deleting comment:", { commentId });

      const response = await axios.delete(`${this.api}/comments/${commentId}`, {
        data: {
          token: token.trim(),
        },
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 15000,
      });

      console.log("Comment deleted successfully");
      return response.data;
    } catch (error: any) {
      console.error("Error deleting comment:", error);

      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message;

        switch (status) {
          case 401:
            throw new Error("You must be logged in to delete comments");
          case 403:
            throw new Error("You can only delete your own comments");
          case 404:
            throw new Error("Comment not found");
          case 500:
            throw new Error("Server error. Please try again later");
          default:
            throw new Error(message || "Unknown error");
        }
      }

      throw error;
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private handleError(error: any): Error {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data.message || 'Server error';
      return new Error(message);
    } else if (error.request) {
      // Request was made but no response received
      return new Error('Could not connect to server');
    } else {
      // Something else happened
      return new Error('Error processing request');
    }
  }
}