import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  setStudentFilters,
  clearStudentFilters,
  openStudentForm,
  setSelectedStudentId,
  openStudentDetail,
  openDeleteDialog,
  closeStudentForm,
  closeStudentDetail,
  closeDeleteDialog,
  openStudentImportDialog,
  closeStudentImportDialog,
} from "@/redux/features/classManagement/classManagementSlice";
import { useStudents, useDeleteStudent } from "@/api/services/class-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Upload } from "lucide-react";
import StudentList from "./components/StudentList";
import StudentForm from "./components/StudentForm";
import StudentDetailDialog from "./components/StudentDetailDialog";
import DeleteConfirmDialog from "../ClassManagement/components/DeleteConfirmDialog";
import ImportStudentsDialog from "./components/ImportStudentsDialog";

const StudentManagement = () => {
  const dispatch = useAppDispatch();
  const {
    studentFilters,
    isStudentFormOpen,
    isStudentDetailOpen,
    studentFormMode,
    selectedStudentId,
    deleteDialog,
    isStudentImportDialogOpen,
  } = useAppSelector((state) => state.classManagement);

  const [searchTerm, setSearchTerm] = useState("");
  const [page] = useState(1);
  const [limit] = useState(10);

  // Fetch students with filters
  const { data, isLoading, error } = useStudents({
    page,
    limit,
    ...studentFilters,
  });

  // Delete mutation
  const deleteStudent = useDeleteStudent();

  const handleSearch = () => {
    dispatch(
      setStudentFilters({
        ...studentFilters,
        name: searchTerm || undefined,
      }),
    );
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    dispatch(clearStudentFilters());
  };

  const handleCreateStudent = () => {
    dispatch(openStudentForm("create"));
  };

  const handleEditStudent = (id: string) => {
    dispatch(setSelectedStudentId(id));
    dispatch(openStudentForm("edit"));
  };

  const handleViewStudent = (id: string) => {
    dispatch(openStudentDetail(id));
  };

  const handleDeleteStudent = (id: string, name: string) => {
    dispatch(openDeleteDialog({ type: "student", id, name }));
  };

  const handleConfirmDelete = async () => {
    if (deleteDialog.id) {
      await deleteStudent.mutateAsync(deleteDialog.id);
      dispatch(closeDeleteDialog());
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Student Management</CardTitle>
              <CardDescription>Manage students and their class assignments</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleCreateStudent}>
                <Plus className="h-4 w-4 mr-2" />
                New Student
              </Button>
              <Button variant="outline" onClick={() => dispatch(openStudentImportDialog())}>
                <Upload className="h-4 w-4 mr-2" />
                Import Students
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex gap-2 mb-4">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Search by student name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch} variant="secondary">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
            <Button onClick={handleClearFilters} variant="outline">
              Clear Filters
            </Button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-8 text-destructive">
              Error loading students: {error.message}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && data?.data.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No students found</p>
              <Button onClick={handleCreateStudent} variant="link" className="mt-2">
                Create your first student
              </Button>
            </div>
          )}

          {/* Student List */}
          {!isLoading && !error && data && data.data.length > 0 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Found {data.pagination.total} students
              </p>
              <StudentList
                students={data.data}
                onView={handleViewStudent}
                onEdit={handleEditStudent}
                onDelete={handleDeleteStudent}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <StudentForm
        isOpen={isStudentFormOpen}
        onClose={() => dispatch(closeStudentForm())}
        mode={studentFormMode}
        studentId={selectedStudentId}
      />

      <StudentDetailDialog
        isOpen={isStudentDetailOpen}
        onClose={() => dispatch(closeStudentDetail())}
        studentId={selectedStudentId}
      />

      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen && deleteDialog.type === "student"}
        onClose={() => dispatch(closeDeleteDialog())}
        onConfirm={handleConfirmDelete}
        title="Delete Student"
        description={`Are you sure you want to delete "${deleteDialog.name}"? This action cannot be undone.`}
        isDeleting={deleteStudent.isPending}
      />

      <ImportStudentsDialog
        isOpen={isStudentImportDialogOpen}
        onClose={() => dispatch(closeStudentImportDialog())}
      />
    </div>
  );
};

export default StudentManagement;
