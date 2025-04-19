import axios, { AxiosError } from "axios";
import { toast } from "react-toastify"; // Ensure you import the toast function correctly

export const HandleLoginError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const response = error.response;

    // Handle specific status codes
    if (response) {
      switch (response.status) {
        case 400:
          if (Array.isArray(response.data.errors)) {
            response.data.errors.forEach((err: { description?: string }) => {
              toast.warning(err.description || "Invalid input.");
            });
          } else {
            toast.warning(response.data.message || "Invalid input.");
          }
          break;
        case 401:
          toast.error("Invalid username or password. Please try again.");
          break;
        case 403:
          toast.error("Your account is locked or inactive.");
          break;
        case 404:
          toast.error("The requested resource was not found.");
          break;
        case 500:
          toast.error("Server error. Please try again later.");
          break;
        default:
          toast.error("An unexpected error occurred. Please try again.");
      }
    } else {
      toast.error("Network error. Please check your connection.");
    }
  } else {
    toast.error("An unknown error occurred.");
  }
};
