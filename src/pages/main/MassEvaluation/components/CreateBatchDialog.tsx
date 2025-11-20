import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Info } from "lucide-react";
import { useCreateBatch, type MassEvaluationBatch } from "@/api/services/mass-evaluation-service";
import { useClasses } from "@/api/services/class-service";
import FileUploader from "./FileUploader";
import { toast } from "@/lib/toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CreateBatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (batch: MassEvaluationBatch) => void;
}

const CreateBatchDialog = ({ open, onOpenChange, onSuccess }: CreateBatchDialogProps) => {
  const [questionDescription, setQuestionDescription] = useState("");
  const [fileKeys, setFileKeys] = useState<string[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | undefined>();
  const createBatchMutation = useCreateBatch();

  // Fetch active classes
  const { data: classesData, isLoading: isLoadingClasses } = useClasses({ isActive: true });
  const activeClasses = classesData?.data || [];

  // Get selected class info
  const selectedClass = activeClasses.find((c) => c.id === selectedClassId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!questionDescription.trim()) {
      toast.error("Please enter an evaluation description");
      return;
    }

    if (fileKeys.length === 0) {
      toast.error("Please upload at least one file");
      return;
    }

    try {
      const batch = await createBatchMutation.mutateAsync({
        questionDescription: questionDescription.trim(),
        fileKeys,
        classId: selectedClassId,
      });

      toast.success("Batch created successfully!");
      onSuccess(batch);

      // Reset form
      setQuestionDescription("");
      setFileKeys([]);
      setSelectedClassId(undefined);
    } catch (error) {
      console.error("Create batch error:", error);
      const message = error instanceof Error ? error.message : "Failed to create batch";
      toast.error(message);
    }
  };

  const handleCancel = () => {
    setQuestionDescription("");
    setFileKeys([]);
    setSelectedClassId(undefined);
    onOpenChange(false);
  };

  const handleFilesUploaded = (newFileKeys: string[]) => {
    setFileKeys((prev) => [...prev, ...newFileKeys]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[60vw] max-w-[60vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Mass Evaluation Batch</DialogTitle>
          <DialogDescription>
            Upload ERD images and provide evaluation criteria to create a new batch.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Select Class (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="class" className="text-base font-semibold">
              Step 1: Select Class (Optional)
            </Label>
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger id="class">
                <SelectValue placeholder="No class selected" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No class</SelectItem>
                {isLoadingClasses ? (
                  <SelectItem value="loading" disabled>
                    Loading classes...
                  </SelectItem>
                ) : activeClasses.length === 0 ? (
                  <SelectItem value="empty" disabled>
                    No active classes available
                  </SelectItem>
                ) : (
                  activeClasses.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.code} - {cls.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Filename Format Helper */}
          {selectedClass && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> Files must be named in the format:{" "}
                <code className="bg-muted px-1 py-0.5 rounded">
                  {selectedClass.code}-{"{studentCode}"}-{"{description}"}.{"{ext}"}
                </code>
                Example:{" "}
                <code className="bg-muted px-1 py-0.5 rounded">
                  {selectedClass.code}-ST001-my-diagram.png
                </code>
              </AlertDescription>
            </Alert>
          )}

          {/* Step 2: Upload Files */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Step 2: Upload Files</Label>
            <FileUploader
              onFilesUploaded={handleFilesUploaded}
              maxFiles={20}
              selectedClass={
                selectedClass ? { id: selectedClass.id, code: selectedClass.code } : undefined
              }
            />
          </div>

          {/* Step 3: Evaluation Criteria */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-base font-semibold">
              Step 3: Evaluation Criteria *
            </Label>
            <Textarea
              id="description"
              placeholder="Describe what you want to evaluate in these ERD diagrams. For example: 'Evaluate these ERD diagrams for a university management system. Check for proper entity relationships, normalization, and data integrity.'"
              value={questionDescription}
              onChange={(e) => setQuestionDescription(e.target.value)}
              rows={6}
              required
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Provide clear evaluation criteria to help the AI assess the diagrams accurately.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={createBatchMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                createBatchMutation.isPending ||
                !questionDescription.trim() ||
                fileKeys.length === 0
              }
            >
              {createBatchMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Batch"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBatchDialog;
