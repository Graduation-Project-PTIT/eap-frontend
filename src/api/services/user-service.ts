import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../query-client";
import { userServiceClient } from "@/api";

// Types and Interfaces
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username: string;
  phone?: string;
  age?: number;
  address?: string;
  gender?: "Male" | "Female" | "Other";
  role: "User" | "Admin" | "Teacher";
}

export interface UpdateUserRequest {
  id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  phone?: string;
  age?: number;
  address?: string;
  gender?: "Male" | "Female" | "Other";
}

export interface UserListResponse {
  success: boolean;
  data: {
    totalElements: number;
    totalPage: number;
    pageSize: number;
    content: User[];
  };
}

export interface UserResponse {
  success: boolean;
  data: User;
}

export interface UserFilters {
  page?: number;
  size?: number;
  orderBy?: string;
  order?: "asc" | "desc";
}

// API Functions
export const userApi = {
  // Get current user's profile - GET /api/user/my-profile
  getMyProfile: async (): Promise<User> => {
    const response = await userServiceClient.get<UserResponse>("/my-profile");
    return response.data.data;
  },

  // Update current user's profile - PUT /api/user
  updateProfile: async (request: UpdateUserRequest): Promise<User> => {
    const response = await userServiceClient.put<UserResponse>("/", request);
    return response.data.data;
  },

  // Get all users (paginated) - GET /api/user/all
  getAllUsers: async (filters?: UserFilters): Promise<UserListResponse["data"]> => {
    const params = {
      page: filters?.page ?? 0,
      size: filters?.size ?? 10,
      orderBy: filters?.orderBy ?? "email",
      order: filters?.order ?? "asc",
    };
    const response = await userServiceClient.get<UserListResponse>("/all", { params });
    return response.data.data;
  },
};

// React Query Hooks
export const useMyProfile = () => {
  return useQuery({
    queryKey: queryKeys.user.profile(),
    queryFn: userApi.getMyProfile,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.updateProfile,
    onSuccess: (data) => {
      // Update cached profile data
      queryClient.setQueryData(queryKeys.user.profile(), data);
      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: queryKeys.user.profile(),
      });
    },
  });
};

export const useAllUsers = (filters?: UserFilters) => {
  return useQuery({
    queryKey: queryKeys.user.list(filters),
    queryFn: () => userApi.getAllUsers(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};
