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
  isVerified?: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  verifierInfo?: {
    id: string;
    username: string;
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

export interface DiagramFeedback {
  id: string;
  diagramId: string;
  teacherId: string;
  content: string;
  feedbackType: "suggestion" | "review" | "compliment";
  createdAt: string;
  updatedAt: string;
  teacher?: {
    id: string;
    username: string;
    fullName: string;
  };
}

export interface VerifyDiagramInput {
  verified: boolean;
}

export interface DiagramFeedbackInput {
  content: string;
  feedbackType: "suggestion" | "review" | "compliment";
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

const getDiagramById = async (
  id: string,
  incrementView: boolean = true,
): Promise<DiagramResponse> => {
  const response = await diagramServiceClient.get(`/diagrams/${id}`, {
    params: { incrementView },
  });
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

const verifyDiagram = async (id: string, data: VerifyDiagramInput): Promise<DiagramResponse> => {
  const response = await diagramServiceClient.put(`/diagrams/${id}/verify`, data);
  return response.data.data;
};

const addFeedback = async (
  diagramId: string,
  data: DiagramFeedbackInput,
): Promise<DiagramFeedback> => {
  const response = await diagramServiceClient.post(`/diagrams/${diagramId}/feedbacks`, data);
  return response.data.data;
};

const getFeedbacks = async (diagramId: string): Promise<DiagramFeedback[]> => {
  const response = await diagramServiceClient.get(`/diagrams/${diagramId}/feedbacks`);
  return response.data.data;
};

const updateFeedback = async (
  feedbackId: string,
  data: DiagramFeedbackInput,
): Promise<DiagramFeedback> => {
  const response = await diagramServiceClient.put(`/diagrams/feedbacks/${feedbackId}`, data);
  return response.data.data;
};

const deleteFeedback = async (feedbackId: string): Promise<void> => {
  await diagramServiceClient.delete(`/diagrams/feedbacks/${feedbackId}`);
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
    onSuccess: (
      response: DiagramResponse,
      variables: { id: string; voteType: "upvote" | "downvote" },
    ) => {
      // Directly update cache with returned data to avoid view count increment
      queryClient.setQueryData(["diagram", variables.id], response);
      queryClient.invalidateQueries({ queryKey: ["diagrams"] });
    },
  });
};

export const useRemoveVote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeVote,
    onSuccess: (response: DiagramResponse, id: string) => {
      // Directly update cache with returned data to avoid view count increment
      queryClient.setQueryData(["diagram", id], response);
      queryClient.invalidateQueries({ queryKey: ["diagrams"] });
    },
  });
};

export const useVerifyDiagram = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: VerifyDiagramInput }) => verifyDiagram(id, data),
    onSuccess: (response: DiagramResponse, variables: { id: string; data: VerifyDiagramInput }) => {
      // Directly update cache with returned data to avoid view count increment
      queryClient.setQueryData(["diagram", variables.id], response);
      queryClient.invalidateQueries({ queryKey: ["diagrams"] });
      queryClient.invalidateQueries({ queryKey: ["myDiagrams"] });
    },
  });
};

export const useAddFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ diagramId, data }: { diagramId: string; data: DiagramFeedbackInput }) =>
      addFeedback(diagramId, data),
    onSuccess: async (
      _: DiagramFeedback,
      variables: { diagramId: string; data: DiagramFeedbackInput },
    ) => {
      queryClient.invalidateQueries({ queryKey: ["feedbacks", variables.diagramId] });
      // Refresh diagram data without incrementing view count
      const updatedDiagram = await getDiagramById(variables.diagramId, false);
      queryClient.setQueryData(["diagram", variables.diagramId], updatedDiagram);
    },
  });
};

export const useFeedbacks = (diagramId: string) => {
  return useQuery({
    queryKey: ["feedbacks", diagramId],
    queryFn: () => getFeedbacks(diagramId),
    enabled: !!diagramId,
  });
};

export const useUpdateFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      feedbackId,
      data,
    }: {
      feedbackId: string;
      data: DiagramFeedbackInput;
      diagramId?: string;
    }) => updateFeedback(feedbackId, data),
    onSuccess: async (
      _: DiagramFeedback,
      variables: { feedbackId: string; data: DiagramFeedbackInput; diagramId?: string },
    ) => {
      queryClient.invalidateQueries({ queryKey: ["feedbacks"] });
      // Refresh diagram data without incrementing view count if diagramId provided
      if (variables.diagramId) {
        const updatedDiagram = await getDiagramById(variables.diagramId, false);
        queryClient.setQueryData(["diagram", variables.diagramId], updatedDiagram);
      }
    },
  });
};

export const useDeleteFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ feedbackId }: { feedbackId: string; diagramId?: string }) =>
      deleteFeedback(feedbackId),
    onSuccess: async (_: void, variables: { feedbackId: string; diagramId?: string }) => {
      queryClient.invalidateQueries({ queryKey: ["feedbacks"] });
      // Refresh diagram data without incrementing view count if diagramId provided
      if (variables.diagramId) {
        const updatedDiagram = await getDiagramById(variables.diagramId, false);
        queryClient.setQueryData(["diagram", variables.diagramId], updatedDiagram);
      }
    },
  });
};
