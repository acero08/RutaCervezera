import axios, { AxiosError } from "axios";

export const HandleLoginError = (error: unknown): string[] => {
  const messages: string[] = [];

  if (axios.isAxiosError(error)) {
    const response = error.response;

    if (response) {
      switch (response.status) {
        case 400:
          if (Array.isArray(response.data.errors)) {
            response.data.errors.forEach((err: { description?: string }) => {
              messages.push(err.description || "Invalid input.");
            });
          } else {
            messages.push(response.data.message || "Invalid input.");
          }
          break;
        case 401:
          messages.push("Invalid username or password. Please try again.");
          break;
        case 403:
          messages.push("Your account is locked or inactive.");
          break;
        case 404:
          messages.push("The requested resource was not found.");
          break;
        case 500:
          messages.push("Server error. Please try again later.");
          break;
        default:
          messages.push("An unexpected error occurred. Please try again.");
      }
    } else {
      messages.push("Network error. Please check your connection.");
    }
  } else {
    messages.push("An unknown error occurred.");
  }

  return messages;
};
