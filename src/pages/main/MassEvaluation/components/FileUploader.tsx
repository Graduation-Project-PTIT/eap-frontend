import { useCallback, useState } from "react";
import { Upload, X, FileImage, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUploadFile } from "@/api/services/file-service";
import { toast } from "@/lib/toast";

interface FileUploaderProps {
  onFilesUploaded: (fileKeys: string[]) => void;
  maxFiles?: number;
  accept?: string;
  selectedClass?: { id: string; code: string };
}

interface UploadedFile {
  file: File;
  fileKey?: string;
  uploading: boolean;
  error?: string;
  validationError?: string;
}

/**
 * Validate filename format when class is selected
 * Expected format: {classCode}-{studentCode}-{description}.{ext}
 */
function validateFilename(filename: string, classCode: string): string | null {
  // Remove file extension
  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex === -1) {
    return "No file extension";
  }

  const nameWithoutExt = filename.substring(0, lastDotIndex);
  const parts = nameWithoutExt.split("-");

  // Must have at least 3 parts: classCode, studentCode, and description
  if (parts.length < 3) {
    return `Must match format: ${classCode}-{studentCode}-{description}`;
  }

  const fileClassCode = parts[0];
  const studentCode = parts[1];

  // Validate class code matches (case-sensitive)
  if (fileClassCode !== classCode) {
    return `Class code "${fileClassCode}" doesn't match "${classCode}"`;
  }

  // Validate student code is not empty
  if (!studentCode || studentCode.trim() === "") {
    return "Student code is empty";
  }

  // Validate description part exists
  const description = parts.slice(2).join("-");
  if (!description || description.trim() === "") {
    return "Description is empty";
  }

  return null; // Valid
}

const FileUploader = ({
  onFilesUploaded,
  maxFiles = 20,
  accept = "image/*",
  selectedClass,
}: FileUploaderProps) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const uploadFileMutation = useUploadFile();

  const handleFiles = useCallback(
    async (newFiles: FileList | null) => {
      if (!newFiles || newFiles.length === 0) return;

      const fileArray = Array.from(newFiles);

      // Check max files limit
      if (files.length + fileArray.length > maxFiles) {
        toast.error(`Maximum ${maxFiles} files allowed`);
        return;
      }

      // Validate filenames if class is selected
      const uploadedFiles: UploadedFile[] = fileArray.map((file) => {
        let validationError: string | undefined;
        if (selectedClass) {
          const error = validateFilename(file.name, selectedClass.code);
          if (error) {
            validationError = error;
          }
        }
        return {
          file,
          uploading: !validationError, // Don't upload if validation failed
          validationError,
        };
      });

      setFiles((prev) => [...prev, ...uploadedFiles]);

      // Upload files one by one (skip files with validation errors)
      const fileKeys: string[] = [];
      for (let i = 0; i < uploadedFiles.length; i++) {
        const uploadedFile = uploadedFiles[i];

        // Skip files with validation errors
        if (uploadedFile.validationError) {
          toast.error(`${uploadedFile.file.name}: ${uploadedFile.validationError}`);
          continue;
        }

        try {
          const result = await uploadFileMutation.mutateAsync({ file: uploadedFile.file });
          const fileKey = result.file.id; // Use file ID (UUID) instead of fileName
          fileKeys.push(fileKey);

          // Update file state
          setFiles((prev) =>
            prev.map((f) =>
              f.file === uploadedFile.file ? { ...f, uploading: false, fileKey } : f,
            ),
          );
        } catch (error) {
          console.error("Upload error:", error);
          const errorMessage = error instanceof Error ? error.message : "Upload failed";
          setFiles((prev) =>
            prev.map((f) =>
              f.file === uploadedFile.file ? { ...f, uploading: false, error: errorMessage } : f,
            ),
          );
          toast.error(`Failed to upload ${uploadedFile.file.name}`);
        }
      }

      // Notify parent of uploaded file keys
      if (fileKeys.length > 0) {
        onFilesUploaded(fileKeys);
      }
    },
    [files.length, maxFiles, uploadFileMutation, onFilesUploaded, selectedClass],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
    },
    [handleFiles],
  );

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50"
        }`}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          multiple
          accept={accept}
          onChange={handleFileInput}
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">Drag & drop ERD images here</p>
          <p className="text-xs text-muted-foreground mt-4">
            Supported: PNG, JPG, JPEG (Max {maxFiles} files)
          </p>
        </label>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Selected Files ({files.length}):</p>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {files.map((uploadedFile, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 border rounded-lg ${
                  uploadedFile.validationError ? "bg-destructive/10 border-destructive" : "bg-card"
                }`}
              >
                {uploadedFile.validationError ? (
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                ) : (
                  <FileImage className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{uploadedFile.file.name}</p>
                  <p
                    className={`text-xs ${
                      uploadedFile.validationError ? "text-destructive" : "text-muted-foreground"
                    }`}
                  >
                    {uploadedFile.validationError ? (
                      uploadedFile.validationError
                    ) : (
                      <>
                        {formatFileSize(uploadedFile.file.size)}
                        {uploadedFile.uploading && " - Uploading..."}
                        {uploadedFile.fileKey && " - Uploaded"}
                        {uploadedFile.error && ` - ${uploadedFile.error}`}
                      </>
                    )}
                  </p>
                </div>
                {uploadedFile.uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary flex-shrink-0" />
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
