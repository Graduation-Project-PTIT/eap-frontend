import { useRef, useState } from "react";
import type { FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/lib/toast";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { setupStepSchema } from "../constants/schemas";

interface SetupStepProps {
  onNext: () => void;
}

const SetupStep: FC<SetupStepProps> = ({ onNext }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const form = useForm({
    resolver: zodResolver(setupStepSchema),
    defaultValues: {
      questionDescription: "",
      erdImage: null,
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

  const onSubmit = (data: { questionDescription: string; erdImage?: File }) => {
    if (!data.erdImage) {
      toast.error("Please upload an ERD image");
      return;
    }
    toast.success("Setup completed successfully!");
    console.log("Form data:", data); // For debugging
    onNext();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Setup Evaluation Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Question Description */}
              <FormField
                control={form.control}
                name="questionDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter a detailed description of what you want to evaluate in the ERD. For example: 'Analyze the database design for an e-commerce system focusing on user management, product catalog, and order processing...'"
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
                <Button type="submit" size="lg">
                  Start Evaluation
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
