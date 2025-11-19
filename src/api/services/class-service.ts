import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { classServiceClient } from "../client";
import { queryKeys } from "../query-client";
import { toast } from "@/lib/toast";

// ============================================================================
// TypeScript Interfaces
// ============================================================================

// Student Entity
export interface Student {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  classes?: Class[];
  createdAt: string;
  updatedAt: string;
}

// Class Entity
export interface Class {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  students: Student[];
  createdAt: string;
  updatedAt: string;
}

// DTOs
export interface StudentInputDto {
  code: string;
  name?: string;
}

export interface CreateClassDto {
  code: string;
  name: string;
  students?: StudentInputDto[];
}

export interface UpdateClassDto {
  code?: string;
  name?: string;
  isActive?: boolean;
  students?: StudentInputDto[];
}

export interface CreateStudentDto {
  code: string;
  name: string;
}

export interface UpdateStudentDto {
  code?: string;
  name?: string;
  isActive?: boolean;
}

// Query Parameters
export interface ListClassQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "ASC" | "DESC";
  code?: string;
  name?: string;
  isActive?: boolean;
}

export interface ListStudentQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "ASC" | "DESC";
  code?: string;
  name?: string;
  isActive?: boolean;
}

// API Response
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// API Functions
// ============================================================================

export const classApi = {
  // Class APIs
  fetchClasses: async (params: ListClassQuery = {}): Promise<PaginatedResponse<Class>> => {
    const response = await classServiceClient.get<PaginatedResponse<Class>>("/classes", {
      params,
    });
    return response.data;
  },

  fetchClassById: async (id: string): Promise<Class> => {
    const response = await classServiceClient.get<Class>(`/classes/${id}`);
    return response.data;
  },

  createClass: async (data: CreateClassDto): Promise<Class> => {
    const response = await classServiceClient.post<Class>("/classes", data);
    return response.data;
  },

  updateClass: async (id: string, data: UpdateClassDto): Promise<Class> => {
    const response = await classServiceClient.patch<Class>(`/classes/${id}`, data);
    return response.data;
  },

  deleteClass: async (id: string): Promise<void> => {
    await classServiceClient.delete(`/classes/${id}`);
  },

  // Student APIs
  fetchStudents: async (params: ListStudentQuery = {}): Promise<PaginatedResponse<Student>> => {
    const response = await classServiceClient.get<PaginatedResponse<Student>>("/students", {
      params,
    });
    return response.data;
  },

  fetchStudentById: async (id: string): Promise<Student> => {
    const response = await classServiceClient.get<Student>(`/students/${id}`);
    return response.data;
  },

  createStudent: async (data: CreateStudentDto): Promise<Student> => {
    const response = await classServiceClient.post<Student>("/students", data);
    return response.data;
  },

  updateStudent: async (id: string, data: UpdateStudentDto): Promise<Student> => {
    const response = await classServiceClient.patch<Student>(`/students/${id}`, data);
    return response.data;
  },

  deleteStudent: async (id: string): Promise<void> => {
    await classServiceClient.delete(`/students/${id}`);
  },

  bulkCreateStudents: async (
    students: CreateStudentDto[],
  ): Promise<{
    created: Student[];
    failed: Array<{ code: string; name: string; error: string }>;
  }> => {
    const results = {
      created: [] as Student[],
      failed: [] as Array<{ code: string; name: string; error: string }>,
    };

    for (const student of students) {
      try {
        const response = await classServiceClient.post<Student>("/students", student);
        results.created.push(response.data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        results.failed.push({
          code: student.code,
          name: student.name,
          error: error.response?.data?.message || error.message || "Unknown error",
        });
      }
    }

    return results;
  },

  validateStudentCodes: async (codes: string[]): Promise<Record<string, Student | null>> => {
    const result: Record<string, Student | null> = {};

    // Fetch all students and create a map by code
    const response = await classServiceClient.get<{ data: Student[] }>("/students", {
      params: { limit: 1000 }, // Get a large number to cover most cases
    });

    const studentMap = new Map(response.data.data.map((s) => [s.code, s]));

    // Map each code to its student or null
    codes.forEach((code) => {
      result[code] = studentMap.get(code) || null;
    });

    return result;
  },
};

// ============================================================================
// React Query Hooks - Classes
// ============================================================================

export const useClasses = (params: ListClassQuery = {}) => {
  return useQuery({
    queryKey: queryKeys.classes.list(params),
    queryFn: () => classApi.fetchClasses(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useClass = (id: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.classes.detail(id),
    queryFn: () => classApi.fetchClassById(id),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useCreateClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: classApi.createClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.classes.lists() });
      toast.success("Class created successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to create class", {
        description: error.message,
      });
    },
  });
};

export const useUpdateClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClassDto }) =>
      classApi.updateClass(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.classes.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.classes.detail(variables.id) });
      // Invalidate student queries when class students are updated
      if (variables.data.students !== undefined) {
        queryClient.invalidateQueries({ queryKey: queryKeys.students.lists() });
      }
      toast.success("Class updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update class", {
        description: error.message,
      });
    },
  });
};

export const useDeleteClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: classApi.deleteClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.classes.lists() });
      toast.success("Class deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete class", {
        description: error.message,
      });
    },
  });
};

// ============================================================================
// React Query Hooks - Students
// ============================================================================

export const useStudents = (params: ListStudentQuery = {}) => {
  return useQuery({
    queryKey: queryKeys.students.list(params),
    queryFn: () => classApi.fetchStudents(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useStudent = (id: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.students.detail(id),
    queryFn: () => classApi.fetchStudentById(id),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useCreateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: classApi.createStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students.lists() });
      toast.success("Student created successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to create student", {
        description: error.message,
      });
    },
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStudentDto }) =>
      classApi.updateStudent(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.students.detail(variables.id) });
      toast.success("Student updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update student", {
        description: error.message,
      });
    },
  });
};

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: classApi.deleteStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students.lists() });
      toast.success("Student deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete student", {
        description: error.message,
      });
    },
  });
};

export const useBulkCreateStudents = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: classApi.bulkCreateStudents,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students.lists() });

      if (data.created.length > 0 && data.failed.length === 0) {
        toast.success(`Successfully imported ${data.created.length} students`);
      } else if (data.created.length > 0 && data.failed.length > 0) {
        toast.success(`Imported ${data.created.length} students`, {
          description: `${data.failed.length} students failed to import`,
        });
      } else {
        toast.error("Failed to import students");
      }
    },
    onError: (error: Error) => {
      toast.error("Failed to import students", {
        description: error.message,
      });
    },
  });
};
