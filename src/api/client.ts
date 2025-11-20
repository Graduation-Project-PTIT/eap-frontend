import axios, { type AxiosInstance, type AxiosResponse } from "axios";
import { fetchAuthSession } from "aws-amplify/auth";

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

// Service paths - these match the nginx routing configuration
export const SERVICE_PATHS = {
  FILE: "/files",
  AI: "/ai",
  CLASS_SERVICE: "/class-service",
} as const;

// Create axios instance with default configuration
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 1200000, // 20 minutes (1200 seconds) for AI processing
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor for adding auth token
  client.interceptors.request.use(
    async (config) => {
      try {
        // Get token from AWS Amplify auth session
        const session = await fetchAuthSession();
        const token = session.tokens?.accessToken?.toString();

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        // If user is not authenticated, continue without token
        console.warn("No auth session available:", error);
      }

      // Log request in development
      if (import.meta.env.DEV) {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
          data: config.data,
          params: config.params,
          hasAuth: !!config.headers.Authorization,
        });
      }

      return config;
    },
    (error) => {
      console.error("Request interceptor error:", error);
      return Promise.reject(error);
    },
  );

  // Response interceptor for handling common responses and errors
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      // Log response in development
      if (import.meta.env.DEV) {
        console.log(
          `✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`,
          {
            status: response.status,
            data: response.data,
          },
        );
      }

      return response;
    },
    (error) => {
      // Log error in development
      if (import.meta.env.DEV) {
        console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
      }

      // Handle common error scenarios
      if (error.response?.status === 401) {
        // Unauthorized - redirect to login
        console.warn("Authentication failed, redirecting to login");
        window.location.href = "/auth/login";
      }

      if (error.response?.status === 403) {
        // Forbidden - show error message
        console.error("Access forbidden:", error.response.data);
      }

      if (error.response?.status >= 500) {
        // Server error - show generic error message
        console.error("Server error:", error.response.data);
      }

      return Promise.reject(error);
    },
  );

  return client;
};

// Export the configured client instance
export const apiClient = createApiClient();

// Helper function to create service-specific clients
export const createServiceClient = (
  servicePath: string,
  transformResponse?: boolean,
): AxiosInstance => {
  const client = createApiClient();

  // Override the baseURL to include the service path
  client.defaults.baseURL = `${API_BASE_URL}${servicePath}`;

  // Add response transformer for class service to handle pagination structure
  if (transformResponse) {
    client.interceptors.response.use(
      (response: AxiosResponse) => {
        // Transform the response structure for list endpoints
        if (response.data?.meta?.pagination) {
          response.data = {
            data: response.data.data,
            pagination: response.data.meta.pagination,
          };
        } else if (response.data?.data !== undefined) {
          // For single item responses, just return the data
          response.data = response.data.data;
        }
        return response;
      },
      (error) => Promise.reject(error),
    );
  }

  return client;
};

// Export service-specific clients
export const fileServiceClient = createServiceClient(SERVICE_PATHS.FILE);
export const aiServiceClient = createServiceClient(SERVICE_PATHS.AI);
export const classServiceClient = createServiceClient(SERVICE_PATHS.CLASS_SERVICE, true);

// Generic API response type
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Generic API error type
export interface ApiError {
  message: string;
  status: number;
  code?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details?: any;
}

// Helper function to handle API responses
export const handleApiResponse = <T>(response: AxiosResponse<ApiResponse<T>>): T => {
  if (response.data.success) {
    return response.data.data;
  }
  throw new Error(response.data.error || response.data.message || "API request failed");
};

// Helper function to create API error from axios error
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createApiError = (error: any): ApiError => {
  if (error.response) {
    return {
      message: error.response.data?.message || error.response.data?.error || "Request failed",
      status: error.response.status,
      code: error.response.data?.code,
      details: error.response.data,
    };
  }

  if (error.request) {
    return {
      message: "Network error - please check your connection",
      status: 0,
      code: "NETWORK_ERROR",
    };
  }

  return {
    message: error.message || "Unknown error occurred",
    status: 0,
    code: "UNKNOWN_ERROR",
  };
};
