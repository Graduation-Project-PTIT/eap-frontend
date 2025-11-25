import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { diagramServiceClient } from "../client";
import type { ERDEntity } from "./evaluation-service";

// Types
export interface DiagramSchema {
  entities: ERDEntity[];
}

export interface CreateDiagramInput {
  title: string;
  description?: string;
  schemaJson: DiagramSchema;
  ddlScript: string;
  domain?: string;
  visibility: "public" | "private" | "class";
  classId?: string;
}

export interface UpdateDiagramInput {
  title?: string;
  description?: string;
  schemaJson?: DiagramSchema;
  ddlScript?: string;
  domain?: string;
  visibility?: "public" | "private" | "class";
  classId?: string;
}

export interface DiagramResponse {
  id: string;
  userId: string;
  title: string;
  description?: string;
  schemaJson: DiagramSchema;
  ddlScript: string;
  domain?: string;
  visibility: "public" | "private" | "class";
  classId?: string;
  viewCount: number;
  upvoteCount: number;
  downvoteCount: number;
  userVote?: "upvote" | "downvote";
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
}

export interface DiagramListResponse {
  content: DiagramResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface SearchDiagramsParams {
  search?: string;
  domain?: string;
  sortBy?: string;
  order?: "asc" | "desc";
  page?: number;
  size?: number;
}

// API Functions
const createDiagram = async (data: CreateDiagramInput): Promise<DiagramResponse> => {
  const response = await diagramServiceClient.post("/diagrams", data);
  return response.data.data;
};

const getDiagrams = async (params: SearchDiagramsParams): Promise<DiagramListResponse> => {
  const response = await diagramServiceClient.get("/diagrams", { params });
  return response.data.data;
};

const getMyDiagrams = async (params: {
  page?: number;
  size?: number;
}): Promise<DiagramListResponse> => {
  const response = await diagramServiceClient.get("/diagrams/my", { params });
  return response.data.data;
};

const getClassDiagrams = async (
  classId: string,
  params: { page?: number; size?: number },
): Promise<DiagramListResponse> => {
  const response = await diagramServiceClient.get(`/diagrams/class/${classId}`, { params });
  return response.data.data;
};

const getDiagramById = async (id: string): Promise<DiagramResponse> => {
  const response = await diagramServiceClient.get(`/diagrams/${id}`);
  return response.data.data;
};

const updateDiagram = async (id: string, data: UpdateDiagramInput): Promise<DiagramResponse> => {
  const response = await diagramServiceClient.put(`/diagrams/${id}`, data);
  return response.data.data;
};

const deleteDiagram = async (id: string): Promise<void> => {
  await diagramServiceClient.delete(`/diagrams/${id}`);
};

const voteDiagram = async (
  id: string,
  voteType: "upvote" | "downvote",
): Promise<DiagramResponse> => {
  const response = await diagramServiceClient.post(`/diagrams/${id}/vote`, { voteType });
  return response.data.data;
};

const removeVote = async (id: string): Promise<DiagramResponse> => {
  const response = await diagramServiceClient.delete(`/diagrams/${id}/vote`);
  return response.data.data;
};

// React Query Hooks
export const useCreateDiagram = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDiagram,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diagrams"] });
      queryClient.invalidateQueries({ queryKey: ["myDiagrams"] });
    },
  });
};

export const useDiagrams = (params: SearchDiagramsParams) => {
  return useQuery({
    queryKey: ["diagrams", params],
    queryFn: () => getDiagrams(params),
  });
};

export const useMyDiagrams = (params: { page?: number; size?: number }) => {
  return useQuery({
    queryKey: ["myDiagrams", params],
    queryFn: () => getMyDiagrams(params),
  });
};

export const useClassDiagrams = (classId: string, params: { page?: number; size?: number }) => {
  return useQuery({
    queryKey: ["classDiagrams", classId, params],
    queryFn: () => getClassDiagrams(classId, params),
    enabled: !!classId,
  });
};

export const useDiagram = (id: string) => {
  return useQuery({
    queryKey: ["diagram", id],
    queryFn: () => getDiagramById(id),
    enabled: !!id,
  });
};

export const useUpdateDiagram = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDiagramInput }) => updateDiagram(id, data),
    onSuccess: (_: DiagramResponse, variables: { id: string; data: UpdateDiagramInput }) => {
      queryClient.invalidateQueries({ queryKey: ["diagram", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["diagrams"] });
      queryClient.invalidateQueries({ queryKey: ["myDiagrams"] });
    },
  });
};

export const useDeleteDiagram = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDiagram,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diagrams"] });
      queryClient.invalidateQueries({ queryKey: ["myDiagrams"] });
    },
  });
};

export const useVoteDiagram = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, voteType }: { id: string; voteType: "upvote" | "downvote" }) =>
      voteDiagram(id, voteType),
    onSuccess: (_: DiagramResponse, variables: { id: string; voteType: "upvote" | "downvote" }) => {
      queryClient.invalidateQueries({ queryKey: ["diagram", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["diagrams"] });
    },
  });
};

export const useRemoveVote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeVote,
    onSuccess: (_: DiagramResponse, id: string) => {
      queryClient.invalidateQueries({ queryKey: ["diagram", id] });
      queryClient.invalidateQueries({ queryKey: ["diagrams"] });
    },
  });
};
