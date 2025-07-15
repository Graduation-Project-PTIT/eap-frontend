import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fileServiceClient } from "../client";
import { queryKeys } from "../query-client";

// Types based on actual file service implementation
export interface FileUpload {
  id: string;
  originalName: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FileUploadRequest {
  file: File;
}

export interface FileUploadResponse {
  message: string;
  file: FileUpload;
}

export interface FileListResponse {
  files: FileUpload[];
}

// API Functions based on actual file service routes
export const fileApi = {
  // Upload file - POST /files/upload
  uploadFile: async (data: FileUploadRequest): Promise<FileUploadResponse> => {
    const formData = new FormData();
    formData.append("file", data.file);

    const response = await fileServiceClient.post<FileUploadResponse>("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Get file list - GET /files
  getFiles: async (): Promise<FileListResponse> => {
    const response = await fileServiceClient.get<FileListResponse>("/");
    return response.data;
  },

  // Download file - GET /files/:fileId/download
  downloadFile: async (fileId: string): Promise<Blob> => {
    const response = await fileServiceClient.get(`/${fileId}/download`, {
      responseType: "blob",
    });
    return response.data;
  },

  // Render file (for images/PDFs) - GET /files/:fileId/render
  renderFile: async (fileId: string): Promise<Blob> => {
    const response = await fileServiceClient.get(`/${fileId}/render`, {
      responseType: "blob",
    });
    return response.data;
  },

  // Get file render URL (for displaying in browser)
  getFileRenderUrl: (fileId: string): string => {
    return `${fileServiceClient.defaults.baseURL}/${fileId}/render`;
  },

  // Get file download URL
  getFileDownloadUrl: (fileId: string): string => {
    return `${fileServiceClient.defaults.baseURL}/${fileId}/download`;
  },
};

// React Query Hooks
export const useUploadFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: fileApi.uploadFile,
    onSuccess: () => {
      // Invalidate file lists to refresh the data
      queryClient.invalidateQueries({ queryKey: queryKeys.files.lists() });
    },
  });
};

export const useFiles = () => {
  return useQuery({
    queryKey: queryKeys.files.lists(),
    queryFn: () => fileApi.getFiles(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useDownloadFile = () => {
  return useMutation({
    mutationFn: fileApi.downloadFile,
  });
};

export const useRenderFile = () => {
  return useMutation({
    mutationFn: fileApi.renderFile,
  });
};

// Utility hooks for getting URLs
export const useFileRenderUrl = (fileId: string) => {
  return fileApi.getFileRenderUrl(fileId);
};

export const useFileDownloadUrl = (fileId: string) => {
  return fileApi.getFileDownloadUrl(fileId);
};

export const useInvalidateFiles = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.files.all });
  };
};
