import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../query-client";
import { apiClient } from "@/api";

// Types
export interface AdminUser {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  age?: number;
  address?: string;
  gender?: "Male" | "Female" | "Other";
  role: "User" | "Admin" | "Teacher";
}

export interface CreateAdminUserRequest {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  age?: number;
  address?: string;
  gender?: "Male" | "Female" | "Other";
  role: "User" | "Admin" | "Teacher";
}

export interface UpdateAdminUserRequest {
  id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  phone?: string;
  age?: number;
  address?: string;
  gender?: "Male" | "Female" | "Other";
}

export interface AdminUserFilters {
  search?: string;
  role?: string;
  page?: number;
  size?: number;
  orderBy?: string;
  order?: "asc" | "desc";
}

export interface AdminUserListResponse {
  success: boolean;
  data: {
    totalElements: number;
    totalPage: number;
    pageSize: number;
    content: AdminUser[];
  };
}

export interface AdminUserResponse {
  success: boolean;
  data: AdminUser;
}

// API Functions
export const adminUserApi = {
  // Get all users (paginated) - GET /api/admin/user/all
  getAllUsers: async (filters?: AdminUserFilters): Promise<AdminUserListResponse["data"]> => {
    const params = {
      page: filters?.page ?? 0,
      size: filters?.size ?? 10,
      orderBy: filters?.orderBy ?? "email",
      order: filters?.order ?? "asc",
    };
    const response = await apiClient.get<AdminUserListResponse>("/admin/user/all", { params });
    return response.data.data;
  },

  // Get user by ID - GET /admin/user/{userId}
  getUserById: async (userId: string): Promise<AdminUser> => {
    const response = await apiClient.get<AdminUserResponse>(`/admin/user/${userId}`);
    return response.data.data;
  },

  // Create user - POST /admin/user
  createUser: async (data: CreateAdminUserRequest): Promise<AdminUser> => {
    const response = await apiClient.post<AdminUserResponse>("/admin/user", data);
    return response.data.data;
  },

  // Update user - PUT /admin/user
  updateUser: async (data: UpdateAdminUserRequest): Promise<AdminUser> => {
    const response = await apiClient.put<AdminUserResponse>("/admin/user", data);
    return response.data.data;
  },

  // Delete user - DELETE /admin/user/{userId}
  deleteUser: async (userId: string): Promise<void> => {
    await apiClient.delete(`/admin/user/${userId}`);
  },

  // Assign role - PATCH /admin/user/{userId}/role
  assignRole: async (userId: string, role: string): Promise<AdminUser> => {
    const response = await apiClient.patch<AdminUserResponse>(`/admin/user/${userId}/role`, null, {
      params: { role },
    });
    return response.data.data;
  },
};

// React Query Hooks
export const useAdminUsers = (filters?: AdminUserFilters) => {
  return useQuery({
    queryKey: queryKeys.adminUsers.list(filters),
    queryFn: () => adminUserApi.getAllUsers(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useAdminUser = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.adminUsers.detail(userId),
    queryFn: () => adminUserApi.getUserById(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreateAdminUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminUserApi.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.adminUsers.lists(),
      });
    },
  });
};

export const useUpdateAdminUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminUserApi.updateUser,
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.adminUsers.detail(data.id), data);
      queryClient.invalidateQueries({
        queryKey: queryKeys.adminUsers.lists(),
      });
    },
  });
};

export const useDeleteAdminUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminUserApi.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.adminUsers.lists(),
      });
    },
  });
};

export const useAssignUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      adminUserApi.assignRole(userId, role),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.adminUsers.detail(data.id), data);
      queryClient.invalidateQueries({
        queryKey: queryKeys.adminUsers.lists(),
      });
    },
  });
};
