import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PublishDiagramDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

const PublishDiagramDialog = ({
  open,
  onClose,
  onConfirm,
  isLoading,
}: PublishDiagramDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Publish this diagram?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>This will make your diagram visible to everyone in the gallery.</p>
            <p className="font-medium">Others will be able to:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>View your diagram</li>
              <li>Upvote or downvote it</li>
              <li>Leave feedback and comments</li>
              <li>See view statistics</li>
            </ul>
            <p className="text-sm mt-2">You can always delete the diagram later if needed.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? "Publishing..." : "Publish Diagram"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PublishDiagramDialog;
