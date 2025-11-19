import { useState, useEffect, useRef } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useBulkCreateStudents } from "@/api/services/class-service";
import { FileText, Upload, Download, AlertCircle } from "lucide-react";
import type { CreateStudentDto } from "@/api/services/class-service";

interface ImportStudentsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const ImportStudentsDialog = ({ isOpen, onClose }: ImportStudentsDialogProps) => {
  const [mode, setMode] = useState<"bulk" | "csv">("bulk");
  const [bulkInput, setBulkInput] = useState("");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bulkCreateStudents = useBulkCreateStudents();

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setBulkInput("");
      setCsvFile(null);
      setParseErrors([]);
      setMode("bulk");
    }
  }, [isOpen]);

  const parseBulkInput = (input: string): CreateStudentDto[] => {
    const errors: string[] = [];
    const students: CreateStudentDto[] = [];

    const lines = input.split("\n").filter((line) => line.trim());

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      const parts = trimmedLine.split("-").map((p) => p.trim());

      if (parts.length !== 2) {
        errors.push(`Line ${index + 1}: Invalid format. Expected "code - name"`);
        return;
      }

      const [code, name] = parts;

      if (!code || !name) {
        errors.push(`Line ${index + 1}: Code and name cannot be empty`);
        return;
      }

      students.push({ code, name });
    });

    setParseErrors(errors);
    return students;
  };

  const parseCsvFile = async (file: File): Promise<CreateStudentDto[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const text = e.target?.result as string;
        const errors: string[] = [];
        const students: CreateStudentDto[] = [];

        const lines = text.split("\n").filter((line) => line.trim());

        // Skip header row
        lines.slice(1).forEach((line, index) => {
          const parts = line.split(",").map((p) => p.trim());

          if (parts.length < 2) {
            errors.push(`Line ${index + 2}: Invalid CSV format`);
            return;
          }

          const [code, name] = parts;

          if (!code || !name) {
            errors.push(`Line ${index + 2}: Code and name cannot be empty`);
            return;
          }

          students.push({ code, name });
        });

        setParseErrors(errors);
        resolve(students);
      };

      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };

      reader.readAsText(file);
    });
  };

  const handleDownloadTemplate = () => {
    const csvContent = "code,name\nS001,John Doe\nS002,Jane Smith\nS003,Bob Johnson";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "student_import_template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFile(file);
      setParseErrors([]);
    }
  };

  const handleImport = async () => {
    let students: CreateStudentDto[] = [];

    if (mode === "bulk") {
      students = parseBulkInput(bulkInput);
    } else if (mode === "csv" && csvFile) {
      try {
        students = await parseCsvFile(csvFile);
      } catch {
        setParseErrors(["Failed to parse CSV file"]);
        return;
      }
    }

    if (parseErrors.length > 0 || students.length === 0) {
      return;
    }

    try {
      await bulkCreateStudents.mutateAsync(students);
      onClose();
    } catch (error) {
      console.error("Error importing students:", error);
    }
  };

  const isImporting = bulkCreateStudents.isPending;
  const canImport = mode === "bulk" ? bulkInput.trim().length > 0 : csvFile !== null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Import Students</DialogTitle>
          <DialogDescription>
            Import multiple students at once using bulk input or CSV file
          </DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as "bulk" | "csv")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bulk">
              <FileText className="h-4 w-4 mr-2" />
              Bulk Input
            </TabsTrigger>
            <TabsTrigger value="csv">
              <Upload className="h-4 w-4 mr-2" />
              CSV File
            </TabsTrigger>
          </TabsList>

          {/* Bulk Input Mode */}
          <TabsContent value="bulk" className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Enter student information in the format:{" "}
                <code className="bg-muted px-1 py-0.5 rounded">code - name</code>
              </p>
              <p className="text-xs text-muted-foreground">
                Example: <code className="bg-muted px-1 py-0.5 rounded">S001 - John Doe</code>
              </p>
              <Textarea
                placeholder="S001 - John Doe&#10;S002 - Jane Smith&#10;S003 - Bob Johnson"
                value={bulkInput}
                onChange={(e) => {
                  setBulkInput(e.target.value);
                  setParseErrors([]);
                }}
                className="min-h-[300px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                {bulkInput.split("\n").filter((line) => line.trim()).length} lines entered
              </p>
            </div>
          </TabsContent>

          {/* CSV File Mode */}
          <TabsContent value="csv" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Download CSV Template</p>
                  <p className="text-xs text-muted-foreground">
                    Get a sample CSV file with the correct format
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={handleDownloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Upload a CSV file with columns:{" "}
                  <code className="bg-muted px-1 py-0.5 rounded">code, name</code>
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  {csvFile && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCsvFile(null);
                        setParseErrors([]);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                    >
                      Clear
                    </Button>
                  )}
                </div>
                {csvFile && (
                  <p className="text-sm text-muted-foreground">Selected: {csvFile.name}</p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {parseErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium mb-1">Found {parseErrors.length} error(s):</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                {parseErrors.slice(0, 5).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
                {parseErrors.length > 5 && <li>... and {parseErrors.length - 5} more errors</li>}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isImporting}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={isImporting || !canImport}>
            {isImporting ? "Importing..." : "Import Students"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportStudentsDialog;
