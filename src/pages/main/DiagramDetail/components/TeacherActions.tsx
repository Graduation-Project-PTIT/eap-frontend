import { Button } from "@/components/ui/button";
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
import { CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import { useVerifyDiagram } from "@/api/services/diagram-service";
import { toast } from "@/lib/toast";

interface TeacherActionsProps {
  diagramId: string;
  isVerified?: boolean;
}

const TeacherActions = ({ diagramId, isVerified }: TeacherActionsProps) => {
  const [showUnverifyDialog, setShowUnverifyDialog] = useState(false);
  const verifyMutation = useVerifyDiagram();

  const handleVerify = async () => {
    try {
      await verifyMutation.mutateAsync({
        id: diagramId,
        data: { verified: true },
      });
      toast.success("Diagram verified successfully");
    } catch {
      toast.error("Failed to verify diagram");
    }
  };

  const handleUnverify = async () => {
    try {
      await verifyMutation.mutateAsync({
        id: diagramId,
        data: { verified: false },
      });
      toast.success("Verification removed");
      setShowUnverifyDialog(false);
    } catch {
      toast.error("Failed to unverify diagram");
    }
  };

  return (
    <>
      {isVerified ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowUnverifyDialog(true)}
          disabled={verifyMutation.isPending}
          className="gap-2"
        >
          <XCircle className="h-4 w-4" />
          Unverify
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={handleVerify}
          disabled={verifyMutation.isPending}
          className="gap-2 text-green-600 hover:text-green-700 border-green-600 hover:border-green-700"
        >
          <CheckCircle2 className="h-4 w-4" />
          Verify
        </Button>
      )}

      <AlertDialog open={showUnverifyDialog} onOpenChange={setShowUnverifyDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove verification?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove your verification from this diagram. Students will no longer see it
              as verified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnverify}>Unverify</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TeacherActions;
