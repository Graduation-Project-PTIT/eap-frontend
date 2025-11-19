import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useCreateStudent, useUpdateStudent, useStudent } from "@/api/services/class-service";
import type { CreateStudentDto, UpdateStudentDto } from "../../ClassManagement/types";

// Validation schema
const studentFormSchema = z.object({
  code: z.string().min(1, "Code is required").max(50, "Code must be less than 50 characters"),
  name: z.string().min(1, "Name is required").max(255, "Name must be less than 255 characters"),
  isActive: z.boolean(),
});

type StudentFormData = z.infer<typeof studentFormSchema>;

interface StudentFormProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  studentId?: string | null;
}

const StudentForm = ({ isOpen, onClose, mode, studentId }: StudentFormProps) => {
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();
  const { data: existingStudent, isLoading: isLoadingStudent } = useStudent(
    studentId || "",
    mode === "edit" && !!studentId,
  );

  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      code: "",
      name: "",
      isActive: true,
    },
  });

  // Reset form when dialog opens/closes or when existing student data loads
  useEffect(() => {
    if (isOpen) {
      if (mode === "create") {
        form.reset({
          code: "",
          name: "",
          isActive: true,
        });
      } else if (mode === "edit" && existingStudent) {
        form.reset({
          code: existingStudent.code,
          name: existingStudent.name,
          isActive: existingStudent.isActive,
        });
      }
    }
  }, [isOpen, mode, existingStudent, form]);

  const onSubmit = async (data: StudentFormData) => {
    try {
      if (mode === "create") {
        const createData: CreateStudentDto = {
          code: data.code,
          name: data.name,
        };
        await createStudent.mutateAsync(createData);
      } else if (mode === "edit" && studentId) {
        const updateData: UpdateStudentDto = {
          code: data.code,
          name: data.name,
          isActive: data.isActive,
        };
        await updateStudent.mutateAsync({ id: studentId, data: updateData });
      }
      onClose();
    } catch (error) {
      console.error("Error saving student:", error);
    }
  };

  const isSubmitting = createStudent.isPending || updateStudent.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create New Student" : "Edit Student"}</DialogTitle>
          <DialogDescription>
            {mode === "create" ? "Add a new student to the system" : "Update student information"}
          </DialogDescription>
        </DialogHeader>

        {isLoadingStudent && mode === "edit" ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input placeholder="S001" {...field} />
                    </FormControl>
                    <FormDescription>Unique identifier for the student</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormDescription>Full name of the student</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {mode === "edit" && (
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                        <FormDescription>Enable or disable this student</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : mode === "create" ? "Create" : "Update"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StudentForm;
