import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  setClassFilters,
  clearClassFilters,
  openClassForm,
  setSelectedClassId,
  openClassDetail,
  openDeleteDialog,
  closeClassForm,
  closeClassDetail,
  closeDeleteDialog,
  openStudentAssignDialog,
  closeStudentAssignDialog,
} from "@/redux/features/classManagement/classManagementSlice";
import { useClasses, useDeleteClass } from "@/api/services/class-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search } from "lucide-react";
import ClassList from "./components/ClassList";
import ClassForm from "./components/ClassForm";
import ClassDetailDialog from "./components/ClassDetailDialog";
import DeleteConfirmDialog from "./components/DeleteConfirmDialog";
import AssignStudentsDialog from "./components/AssignStudentsDialog";

const ClassManagement = () => {
  const dispatch = useAppDispatch();
  const {
    classFilters,
    isClassFormOpen,
    isClassDetailOpen,
    classFormMode,
    selectedClassId,
    deleteDialog,
    isStudentAssignDialogOpen,
  } = useAppSelector((state) => state.classManagement);

  const [searchTerm, setSearchTerm] = useState("");
  const [page] = useState(1);
  const [limit] = useState(10);

  // Fetch classes with filters
  const { data, isLoading, error } = useClasses({
    page,
    limit,
    ...classFilters,
  });

  // Delete mutation
  const deleteClass = useDeleteClass();

  const handleSearch = () => {
    dispatch(
      setClassFilters({
        ...classFilters,
        name: searchTerm || undefined,
      }),
    );
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    dispatch(clearClassFilters());
  };

  const handleCreateClass = () => {
    dispatch(openClassForm("create"));
  };

  const handleEditClass = (id: string) => {
    dispatch(setSelectedClassId(id));
    dispatch(openClassForm("edit"));
  };

  const handleViewClass = (id: string) => {
    dispatch(openClassDetail(id));
  };

  const handleDeleteClass = (id: string, name: string) => {
    dispatch(openDeleteDialog({ type: "class", id, name }));
  };

  const handleManageStudents = (id: string) => {
    dispatch(setSelectedClassId(id));
    dispatch(openStudentAssignDialog());
  };

  const handleConfirmDelete = async () => {
    if (deleteDialog.id) {
      await deleteClass.mutateAsync(deleteDialog.id);
      dispatch(closeDeleteDialog());
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Class Management</CardTitle>
              <CardDescription>Manage classes and assign students</CardDescription>
            </div>
            <Button onClick={handleCreateClass}>
              <Plus className="h-4 w-4 mr-2" />
              New Class
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex gap-2 mb-4">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Search by class name or code..."
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
              Error loading classes: {error.message}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && data?.data.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No classes found</p>
              <Button onClick={handleCreateClass} variant="link" className="mt-2">
                Create your first class
              </Button>
            </div>
          )}

          {/* Class List */}
          {!isLoading && !error && data && data.data.length > 0 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Found {data.pagination.total} classes</p>
              <ClassList
                classes={data.data}
                onView={handleViewClass}
                onEdit={handleEditClass}
                onDelete={handleDeleteClass}
                onManageStudents={handleManageStudents}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ClassForm
        isOpen={isClassFormOpen}
        onClose={() => dispatch(closeClassForm())}
        mode={classFormMode}
        classId={selectedClassId}
      />

      <ClassDetailDialog
        isOpen={isClassDetailOpen}
        onClose={() => dispatch(closeClassDetail())}
        classId={selectedClassId}
      />

      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen && deleteDialog.type === "class"}
        onClose={() => dispatch(closeDeleteDialog())}
        onConfirm={handleConfirmDelete}
        title="Delete Class"
        description={`Are you sure you want to delete "${deleteDialog.name}"? This action cannot be undone.`}
        isDeleting={deleteClass.isPending}
      />

      <AssignStudentsDialog
        isOpen={isStudentAssignDialogOpen}
        onClose={() => dispatch(closeStudentAssignDialog())}
        classId={selectedClassId}
      />
    </div>
  );
};

export default ClassManagement;
