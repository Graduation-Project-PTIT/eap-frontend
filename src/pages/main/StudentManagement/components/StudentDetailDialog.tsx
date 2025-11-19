import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useStudent } from "@/api/services/class-service";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";

interface StudentDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string | null;
}

const StudentDetailDialog = ({ isOpen, onClose, studentId }: StudentDetailDialogProps) => {
  const { data: studentData, isLoading } = useStudent(studentId || "", isOpen && !!studentId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Student Details</DialogTitle>
          <DialogDescription>View detailed information about this student</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : studentData ? (
          <div className="space-y-4">
            {/* Basic Information */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Code</p>
                  <p className="font-medium">{studentData.code}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{studentData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={studentData.isActive ? "default" : "outline"}>
                    {studentData.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Classes</p>
                  <p className="font-medium">{studentData.classes?.length || 0}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Timestamps */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Timestamps</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Created At</p>
                  <p className="text-sm">{format(new Date(studentData.createdAt), "PPpp")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Updated At</p>
                  <p className="text-sm">{format(new Date(studentData.updatedAt), "PPpp")}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Classes List */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Classes</h3>
              {studentData.classes && studentData.classes.length > 0 ? (
                <div className="max-h-[200px] overflow-y-auto space-y-2">
                  {studentData.classes.map((classItem) => (
                    <div
                      key={classItem.id}
                      className="flex items-center justify-between p-2 rounded-md border"
                    >
                      <div>
                        <p className="font-medium">{classItem.name}</p>
                        <p className="text-sm text-muted-foreground">{classItem.code}</p>
                      </div>
                      <Badge variant={classItem.isActive ? "default" : "outline"}>
                        {classItem.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Not enrolled in any classes</p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">Student not found</div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StudentDetailDialog;
