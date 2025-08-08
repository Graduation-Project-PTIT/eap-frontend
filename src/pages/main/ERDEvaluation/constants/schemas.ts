import { z } from "zod";

// Setup step form schema
export const setupStepSchema = z.object({
  questionDescription: z
    .string()
    .min(10, "Question description must be at least 10 characters")
    .max(2000, "Question description must be less than 2000 characters")
    .trim(),
  erdImage: z.any().refine(
    (file) => {
      if (!file) return false;
      if (!(file instanceof File)) return false;
      if (!file.type.startsWith("image/")) return false;
      if (file.size > 10 * 1024 * 1024) return false;
      return true;
    },
    {
      message: "Please upload a valid image file (PNG, JPG, JPEG, max 10MB)",
    },
  ),
});

export type SetupStepFormData = z.infer<typeof setupStepSchema>;

// Extract diagram step schema (for future use)
export const extractDiagramSchema = z.object({
  extractedEntities: z.array(
    z.object({
      id: z.string(),
      name: z.string().min(1, "Entity name is required"),
      attributes: z.array(z.string()),
    }),
  ),
  extractedRelationships: z.array(
    z.object({
      id: z.string(),
      from: z.string().min(1, "Source entity is required"),
      to: z.string().min(1, "Target entity is required"),
      type: z.enum(["One-to-One", "One-to-Many", "Many-to-Many"]),
      description: z.string().optional(),
    }),
  ),
});

export type ExtractDiagramFormData = z.infer<typeof extractDiagramSchema>;

// Manual refine step schema (for future use)
export const manualRefineSchema = z.object({
  entities: z.array(
    z.object({
      id: z.string(),
      name: z.string().min(1, "Entity name is required"),
      attributes: z.array(
        z.object({
          name: z.string().min(1, "Attribute name is required"),
          type: z.string().min(1, "Attribute type is required"),
          isPrimaryKey: z.boolean().default(false),
          isForeignKey: z.boolean().default(false),
          isRequired: z.boolean().default(false),
        }),
      ),
    }),
  ),
  relationships: z.array(
    z.object({
      id: z.string(),
      from: z.string().min(1, "Source entity is required"),
      to: z.string().min(1, "Target entity is required"),
      type: z.enum(["One-to-One", "One-to-Many", "Many-to-Many"]),
      description: z.string().optional(),
      constraints: z.array(z.string()).optional(),
    }),
  ),
});

export type ManualRefineFormData = z.infer<typeof manualRefineSchema>;

// Evaluation criteria schema (for future use)
export const evaluationCriteriaSchema = z.object({
  normalization: z.object({
    weight: z.number().min(0).max(100).default(25),
    enabled: z.boolean().default(true),
  }),
  relationshipDesign: z.object({
    weight: z.number().min(0).max(100).default(25),
    enabled: z.boolean().default(true),
  }),
  namingConventions: z.object({
    weight: z.number().min(0).max(100).default(25),
    enabled: z.boolean().default(true),
  }),
  dataTypes: z.object({
    weight: z.number().min(0).max(100).default(25),
    enabled: z.boolean().default(true),
  }),
});

export type EvaluationCriteriaFormData = z.infer<typeof evaluationCriteriaSchema>;
