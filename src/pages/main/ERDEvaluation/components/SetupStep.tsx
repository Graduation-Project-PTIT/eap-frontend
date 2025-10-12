import { useRef, useState } from "react";
import type { FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/lib/toast";
import {
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
  Zap,
  GitBranch,
  Languages,
  FileJson,
  Database,
  Network,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { setupStepSchema } from "../constants/schemas";
import { useWorkflow } from "../context/WorkflowContext";
import { useUploadFile, useStartEvaluation, fileApi } from "@/api";
import LoadingSpinner from "./LoadingSpinner";
import { fetchAuthSession } from "aws-amplify/auth";
import type { z } from "zod";
import type { WorkflowMode, PreferredFormat } from "../context/WorkflowContext";
import { LANGUAGES } from "@/config/languages";

type SetupStepFormData = z.infer<typeof setupStepSchema>;

interface SetupStepProps {
  onNext: () => void;
}

const SetupStep: FC<SetupStepProps> = ({ onNext }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Workflow context
  const {
    state,
    setQuestion,
    setFile,
    setFileUrl,
    setEvaluationId,
    setLoading,
    setError,
    setWorkflowMode,
    setWorkflowName,
    setSelectedLanguage,
    setPreferredFormat,
  } = useWorkflow();

  const [workflowMode, setWorkflowModeState] = useState<WorkflowMode>(
    state.workflowMode || "standard",
  );

  const [preferredFormat, setPreferredFormatState] = useState<PreferredFormat>(
    state.preferredFormat || "json",
  );

  // API hooks
  const uploadFile = useUploadFile();
  const startEvaluation = useStartEvaluation({
    onSuccess: (data) => {
      console.log("SetupStep - startEvaluation onSuccess", data);
      // Set the actual evaluation ID from the response
      setEvaluationId(data.id);
      setLoading(false);
      toast.success("Evaluation started successfully!");
    },
    onError: (error) => {
      console.error("Evaluation start error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to start evaluation";
      setError(errorMessage);
      setLoading(false);
      toast.error(errorMessage);
    },
  });

  const form = useForm<SetupStepFormData>({
    resolver: zodResolver(setupStepSchema),
    defaultValues: {
      questionDescription: state.questionDescription || "",
      erdImage: state.uploadedFile || null,
    },
  });

  const { watch, setValue, handleSubmit } = form;
  const erdImage = watch("erdImage");
  const imagePreview = erdImage ? URL.createObjectURL(erdImage) : null;

  const handleImageSelect = (file: File) => {
    // Validation is now handled by zod schema, but we can add immediate feedback
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      toast.error("Image size should be less than 10MB");
      return;
    }

    setValue("erdImage", file, { shouldValidate: true });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removeImage = () => {
    setValue("erdImage", null, { shouldValidate: true });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: SetupStepFormData) => {
    if (!data.erdImage) {
      toast.error("Please upload an ERD image");
      return;
    }

    // Prevent multiple submissions
    if (state.isLoading) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Save form data to workflow state
      setQuestion(data.questionDescription);
      setFile(data.erdImage);
      setWorkflowMode(workflowMode);
      setPreferredFormat(preferredFormat);

      // Determine and save workflow name
      const workflowName =
        workflowMode === "sync" ? "evaluationSyncWorkflow" : "evaluationWorkflow";
      setWorkflowName(workflowName);

      // Upload file to file service
      toast.info("Uploading ERD image...");
      const uploadResult = await uploadFile.mutateAsync({ file: data.erdImage });

      if (!uploadResult.file) {
        throw new Error("Failed to upload file");
      }

      // Get the file render URL for the evaluation service
      const fileUrl = fileApi.getFileRenderUrl(uploadResult.file.id);
      setFileUrl(fileUrl);

      toast.success("Setup completed successfully!");
      toast.info("Starting ERD evaluation...");

      // Get user token from auth session
      const session = await fetchAuthSession();
      const userToken = session.tokens?.accessToken?.toString();

      // Start evaluation workflow synchronously
      startEvaluation.mutate({
        erdImage: fileUrl,
        questionDescription: data.questionDescription,
        userToken: userToken, // Pass user token
        workflowMode: workflowMode, // Pass workflow mode
        preferredFormat: preferredFormat, // Pass preferred format
      });

      // Navigate to extract step after starting evaluation
      onNext();
    } catch (error) {
      console.error("Setup error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to start evaluation";
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      {state.isLoading && (
        <LoadingSpinner fullScreen={true} message="Processing your ERD image..." size="lg" />
      )}
      <Card>
        <CardHeader>
          <CardTitle>Setup Evaluation Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Configuration Section */}
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Evaluation Mode */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">Evaluation Mode</label>
                    <TooltipProvider>
                      <div className="flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant={workflowMode === "standard" ? "default" : "outline"}
                              size="sm"
                              onClick={() => setWorkflowModeState("standard")}
                              className="gap-2 flex-1"
                            >
                              <GitBranch className="h-4 w-4" />
                              Standard
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              Extract diagram, manually refine the data, then get evaluation
                              results. Allows you to review and adjust extracted information before
                              evaluation.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant={workflowMode === "sync" ? "default" : "outline"}
                              size="sm"
                              onClick={() => setWorkflowModeState("sync")}
                              className="gap-2 flex-1"
                            >
                              <Zap className="h-4 w-4" />
                              Quick
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              Get evaluation results directly without manual refinement. Faster
                              workflow with automatic evaluation based on extracted data.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>
                    <p className="text-xs text-muted-foreground">
                      Choose between standard workflow with refinement or quick direct evaluation.
                    </p>
                  </div>

                  {/* Language Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">Report Language</label>
                    <Select
                      value={state.selectedLanguage}
                      onValueChange={(value) => setSelectedLanguage(value)}
                    >
                      <SelectTrigger className="w-full">
                        <div className="flex items-center gap-2">
                          <Languages className="h-4 w-4" />
                          <SelectValue placeholder="Select language" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            <div className="flex items-center gap-2">
                              <span>{lang.flag}</span>
                              <span>{lang.nativeName}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Select the language for your evaluation report.
                    </p>
                  </div>

                  {/* Evaluation Format */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">Evaluation Format</label>
                    <TooltipProvider>
                      <div className="flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant={preferredFormat === "json" ? "default" : "outline"}
                              size="sm"
                              onClick={() => setPreferredFormatState("json")}
                              className="gap-2 flex-1"
                            >
                              <FileJson className="h-4 w-4" />
                              JSON
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              Structured data format. Best for detailed entity and attribute
                              analysis.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant={preferredFormat === "ddl" ? "default" : "outline"}
                              size="sm"
                              onClick={() => setPreferredFormatState("ddl")}
                              className="gap-2 flex-1"
                            >
                              <Database className="h-4 w-4" />
                              DDL
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              PostgreSQL script format. Best for SQL-focused evaluation and database
                              implementation.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant={preferredFormat === "mermaid" ? "default" : "outline"}
                              size="sm"
                              onClick={() => setPreferredFormatState("mermaid")}
                              className="gap-2 flex-1"
                            >
                              <Network className="h-4 w-4" />
                              Mermaid
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              Diagram syntax format. Best for visual relationship analysis and ERD
                              structure.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>
                    <p className="text-xs text-muted-foreground">
                      Choose which format to send to the evaluation agent.
                    </p>
                  </div>
                </div>
              </div>

              {/* Question Description */}
              <FormField
                control={form.control}
                name="questionDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter a detailed description of the objective of the ERD. For example: 'Below is an ERD for an e-commerce system focusing on user management, product catalog, and order processing...'"
                        className="min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Provide a comprehensive description to help guide the evaluation process.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Image Upload */}
              <FormField
                control={form.control}
                name="erdImage"
                render={() => (
                  <FormItem>
                    <FormLabel>ERD Image Upload</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        {!imagePreview ? (
                          <div
                            className={cn(
                              "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                              isDragOver
                                ? "border-primary bg-primary/5"
                                : "border-muted-foreground/25 hover:border-primary/50",
                            )}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <div className="flex flex-col items-center space-y-4">
                              <div className="p-4 bg-muted rounded-full">
                                <Upload className="h-8 w-8 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="text-lg font-medium">Upload ERD Image</p>
                                <p className="text-sm text-muted-foreground">
                                  Drag and drop your ERD image here, or click to browse
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">
                                  Supports: PNG, JPG, JPEG (Max 10MB)
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="relative border rounded-lg overflow-hidden">
                              <img
                                src={imagePreview}
                                alt="ERD Preview"
                                className="w-full max-h-96 object-contain bg-muted"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2"
                                onClick={removeImage}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <ImageIcon className="h-4 w-4" />
                              <span>{erdImage?.name}</span>
                              <span>({((erdImage?.size || 0) / 1024 / 1024).toFixed(2)} MB)</span>
                            </div>
                          </div>
                        )}

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileInputChange}
                          className="hidden"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <Button type="submit" size="lg" disabled={state.isLoading}>
                  {state.isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Start Evaluation"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SetupStep;
