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
import { useCreateClass, useUpdateClass, useClass } from "@/api/services/class-service";
import type { CreateClassDto, UpdateClassDto } from "../types";

// Validation schema
const classFormSchema = z.object({
  code: z.string().min(1, "Code is required").max(50, "Code must be less than 50 characters"),
  name: z.string().min(1, "Name is required").max(255, "Name must be less than 255 characters"),
  isActive: z.boolean(),
});

type ClassFormData = z.infer<typeof classFormSchema>;

interface ClassFormProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  classId?: string | null;
}

const ClassForm = ({ isOpen, onClose, mode, classId }: ClassFormProps) => {
  const createClass = useCreateClass();
  const updateClass = useUpdateClass();
  const { data: existingClass, isLoading: isLoadingClass } = useClass(
    classId || "",
    mode === "edit" && !!classId,
  );

  const form = useForm<ClassFormData>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      code: "",
      name: "",
      isActive: true,
    },
  });

  // Reset form when dialog opens/closes or when existing class data loads
  useEffect(() => {
    if (isOpen) {
      if (mode === "create") {
        form.reset({
          code: "",
          name: "",
          isActive: true,
        });
      } else if (mode === "edit" && existingClass) {
        form.reset({
          code: existingClass.code,
          name: existingClass.name,
          isActive: existingClass.isActive,
        });
      }
    }
  }, [isOpen, mode, existingClass, form]);

  const onSubmit = async (data: ClassFormData) => {
    try {
      if (mode === "create") {
        const createData: CreateClassDto = {
          code: data.code,
          name: data.name,
        };
        await createClass.mutateAsync(createData);
      } else if (mode === "edit" && classId) {
        const updateData: UpdateClassDto = {
          code: data.code,
          name: data.name,
          isActive: data.isActive,
        };
        await updateClass.mutateAsync({ id: classId, data: updateData });
      }
      onClose();
    } catch (error) {
      console.error("Error saving class:", error);
    }
  };

  const isSubmitting = createClass.isPending || updateClass.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create New Class" : "Edit Class"}</DialogTitle>
          <DialogDescription>
            {mode === "create" ? "Add a new class to the system" : "Update class information"}
          </DialogDescription>
        </DialogHeader>

        {isLoadingClass && mode === "edit" ? (
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
                      <Input placeholder="CS101" {...field} />
                    </FormControl>
                    <FormDescription>Unique identifier for the class</FormDescription>
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
                      <Input placeholder="Introduction to Computer Science" {...field} />
                    </FormControl>
                    <FormDescription>Full name of the class</FormDescription>
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
                        <FormDescription>Enable or disable this class</FormDescription>
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

export default ClassForm;
