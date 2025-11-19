import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useClass, useStudents, useUpdateClass, classApi } from "@/api/services/class-service";
import { Search, FileText, List } from "lucide-react";
import type { Student, StudentInputDto } from "../types";
import { useDebounce } from "@/hooks/use-debounce";

interface AssignStudentsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string | null;
}

const AssignStudentsDialog = ({ isOpen, onClose, classId }: AssignStudentsDialogProps) => {
  const [mode, setMode] = useState<"bulk" | "select">("select");
  const [bulkInput, setBulkInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudentCodes, setSelectedStudentCodes] = useState<Set<string>>(new Set());
  const [validatedStudents, setValidatedStudents] = useState<Record<string, Student | null>>({});
  const [isValidating, setIsValidating] = useState(false);

  const { data: classData, isLoading: isLoadingClass } = useClass(
    classId || "",
    isOpen && !!classId,
  );
  const { data: studentsData, isLoading: isLoadingStudents } = useStudents({
    limit: 100,
    isActive: true,
  });
  const updateClass = useUpdateClass();

  // Debounce the bulk input
  const debouncedBulkInput = useDebounce(bulkInput, 800);

  // Initialize selected students and bulk input when class data loads
  useEffect(() => {
    if (classData?.students) {
      const codes = new Set(classData.students.map((s) => s.code));
      setSelectedStudentCodes(codes);
      // Prefill bulk input with existing student codes
      const bulkText = classData.students.map((s) => s.code).join("\n");
      setBulkInput(bulkText);
    }
  }, [classData]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setBulkInput("");
      setSearchTerm("");
      setMode("select");
      setValidatedStudents({});
    }
  }, [isOpen]);

  // Validate student codes when bulk input changes (debounced)
  useEffect(() => {
    const validateCodes = async () => {
      if (mode !== "bulk" || !debouncedBulkInput.trim()) {
        setValidatedStudents({});
        return;
      }

      const codes = debouncedBulkInput
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      if (codes.length === 0) {
        setValidatedStudents({});
        return;
      }

      setIsValidating(true);
      try {
        const result = await classApi.validateStudentCodes(codes);
        setValidatedStudents(result);
      } catch (error) {
        console.error("Error validating student codes:", error);
        setValidatedStudents({});
      } finally {
        setIsValidating(false);
      }
    };

    validateCodes();
  }, [debouncedBulkInput, mode]);

  const handleToggleStudent = (studentCode: string) => {
    const newSelected = new Set(selectedStudentCodes);
    if (newSelected.has(studentCode)) {
      newSelected.delete(studentCode);
    } else {
      newSelected.add(studentCode);
    }
    setSelectedStudentCodes(newSelected);
  };

  const handleSave = async () => {
    if (!classId) return;

    let studentCodes: string[];

    if (mode === "bulk") {
      // Parse bulk input - one code per line
      studentCodes = bulkInput
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
    } else {
      // Use selected students from checkbox mode
      studentCodes = Array.from(selectedStudentCodes);
    }

    // Convert to StudentInputDto format
    const students: StudentInputDto[] = studentCodes.map((code) => ({ code }));

    try {
      await updateClass.mutateAsync({
        id: classId,
        data: { students },
      });
      onClose();
    } catch (error) {
      console.error("Error assigning students:", error);
    }
  };

  const filteredStudents =
    studentsData?.data.filter(
      (student) =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.code.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

  const isLoading = isLoadingClass || isLoadingStudents;
  const isSaving = updateClass.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Assign Students to Class</DialogTitle>
          <DialogDescription>
            {classData ? `Managing students for ${classData.name}` : "Loading..."}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <Tabs value={mode} onValueChange={(v) => setMode(v as "bulk" | "select")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="select">
                <List className="h-4 w-4 mr-2" />
                Select Students
              </TabsTrigger>
              <TabsTrigger value="bulk">
                <FileText className="h-4 w-4 mr-2" />
                Bulk Input
              </TabsTrigger>
            </TabsList>

            {/* Select Mode */}
            <TabsContent value="select" className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Badge variant="secondary">{selectedStudentCodes.size} selected</Badge>
              </div>

              <ScrollArea className="h-[300px] border rounded-md p-4">
                {filteredStudents.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No students found
                  </p>
                ) : (
                  <div className="space-y-2">
                    {filteredStudents.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent cursor-pointer"
                        onClick={() => handleToggleStudent(student.code)}
                      >
                        <Checkbox
                          checked={selectedStudentCodes.has(student.code)}
                          onCheckedChange={() => handleToggleStudent(student.code)}
                        />
                        <div className="flex-1">
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">{student.code}</p>
                        </div>
                        <Badge variant={student.isActive ? "default" : "outline"}>
                          {student.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            {/* Bulk Mode */}
            <TabsContent value="bulk" className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Enter student codes, one per line. Students will be looked up and displayed
                  automatically.
                </p>

                {/* Input area with overlay */}
                <div className="relative">
                  <Textarea
                    placeholder="S001&#10;S002&#10;S003"
                    value={bulkInput}
                    onChange={(e) => setBulkInput(e.target.value)}
                    className="min-h-[300px] font-mono text-sm"
                  />

                  {/* Overlay showing validated names */}
                  {bulkInput.trim() && (
                    <div className="absolute inset-0 pointer-events-none overflow-auto p-2 ml-1">
                      <div className="font-mono text-sm">
                        {bulkInput.split("\n").map((line, index) => {
                          const code = line.trim();
                          if (!code) return <div key={index} className="h-5" />;

                          const student = validatedStudents[code];
                          const hasBeenValidated = Object.prototype.hasOwnProperty.call(
                            validatedStudents,
                            code,
                          );
                          const isCodeValidating = isValidating && !hasBeenValidated;

                          return (
                            <div key={index} className="flex items-center h-5">
                              <span className="invisible">{code}</span>
                              {student && (
                                <span className="ml-2 text-green-600 dark:text-green-400 font-normal">
                                  → {student.name}
                                </span>
                              )}
                              {!student && !isCodeValidating && code && hasBeenValidated && (
                                <span className="ml-2 text-red-600 dark:text-red-400 font-normal">
                                  → Not found
                                </span>
                              )}
                              {isCodeValidating && (
                                <span className="ml-2 text-muted-foreground font-normal">
                                  → Checking...
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {bulkInput.split("\n").filter((line) => line.trim()).length} student codes
                    entered
                  </span>
                  {isValidating && (
                    <span className="text-blue-600 dark:text-blue-400">Validating...</span>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isLoading}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignStudentsDialog;
