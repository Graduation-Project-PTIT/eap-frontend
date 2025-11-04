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
import { Loader2 } from "lucide-react";
import { useCreateBatch, type MassEvaluationBatch } from "@/api/services/mass-evaluation-service";
import FileUploader from "./FileUploader";
import { toast } from "@/lib/toast";

interface CreateBatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (batch: MassEvaluationBatch) => void;
}

const CreateBatchDialog = ({ open, onOpenChange, onSuccess }: CreateBatchDialogProps) => {
  const [questionDescription, setQuestionDescription] = useState("");
  const [fileKeys, setFileKeys] = useState<string[]>([]);
  const createBatchMutation = useCreateBatch();

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
      });

      toast.success("Batch created successfully!");
      onSuccess(batch);

      // Reset form
      setQuestionDescription("");
      setFileKeys([]);
    } catch (error) {
      console.error("Create batch error:", error);
      const message = error instanceof Error ? error.message : "Failed to create batch";
      toast.error(message);
    }
  };

  const handleCancel = () => {
    setQuestionDescription("");
    setFileKeys([]);
    onOpenChange(false);
  };

  const handleFilesUploaded = (newFileKeys: string[]) => {
    setFileKeys((prev) => [...prev, ...newFileKeys]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Mass Evaluation Batch</DialogTitle>
          <DialogDescription>
            Upload ERD images and provide evaluation criteria to create a new batch.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Upload Files */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Step 1: Upload Files</Label>
            <FileUploader onFilesUploaded={handleFilesUploaded} maxFiles={20} />
          </div>

          {/* Step 2: Evaluation Criteria */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-base font-semibold">
              Step 2: Evaluation Criteria *
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
