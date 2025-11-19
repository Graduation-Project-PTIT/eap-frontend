import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useClass } from "@/api/services/class-service";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";

interface ClassDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string | null;
}

const ClassDetailDialog = ({ isOpen, onClose, classId }: ClassDetailDialogProps) => {
  const { data: classData, isLoading } = useClass(classId || "", isOpen && !!classId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Class Details</DialogTitle>
          <DialogDescription>View detailed information about this class</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : classData ? (
          <div className="space-y-4">
            {/* Basic Information */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Code</p>
                  <p className="font-medium">{classData.code}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{classData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={classData.isActive ? "default" : "outline"}>
                    {classData.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                  <p className="font-medium">{classData.students?.length || 0}</p>
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
                  <p className="text-sm">{format(new Date(classData.createdAt), "PPpp")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Updated At</p>
                  <p className="text-sm">{format(new Date(classData.updatedAt), "PPpp")}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Students List */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Students</h3>
              {classData.students && classData.students.length > 0 ? (
                <div className="max-h-[200px] overflow-y-auto space-y-2">
                  {classData.students.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-2 rounded-md border"
                    >
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{student.code}</p>
                      </div>
                      <Badge variant={student.isActive ? "default" : "outline"}>
                        {student.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No students assigned</p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">Class not found</div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ClassDetailDialog;
