import { useState } from "react";
import type {
  AdminUser,
  CreateAdminUserRequest,
  UpdateAdminUserRequest,
} from "@/api/services/admin-user-service";
import {
  useAdminUsers,
  useCreateAdminUser,
  useUpdateAdminUser,
  useDeleteAdminUser,
  useAssignUserRole,
} from "@/api/services/admin-user-service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { UserTable } from "./components/UserTable";
import { UserFormDialog } from "./components/UserFormDialog";
import { DeleteUserDialog } from "./components/DeleteUserDialog";
import { RoleAssignmentDialog } from "./components/RoleAssignmentDialog";
import { toast } from "@/lib/toast";

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Fetch users
  const { data, isLoading, error } = useAdminUsers({ search: searchTerm });

  // Mutations
  const createUser = useCreateAdminUser();
  const updateUser = useUpdateAdminUser();
  const deleteUser = useDeleteAdminUser();
  const assignRole = useAssignUserRole();

  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const handleEditUser = (user: AdminUser) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleDeleteUser = (user: AdminUser) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const handleChangeRole = (user: AdminUser) => {
    setSelectedUser(user);
    setIsRoleDialogOpen(true);
  };

  const handleFormSubmit = async (data: CreateAdminUserRequest | UpdateAdminUserRequest) => {
    try {
      if ("password" in data) {
        // Create mode
        await createUser.mutateAsync(data as CreateAdminUserRequest);
        toast.success("User created successfully");
      } else {
        // Edit mode
        await updateUser.mutateAsync(data as UpdateAdminUserRequest);
        toast.success("User updated successfully");
      }
      setIsFormOpen(false);
      setSelectedUser(null);
    } catch {
      toast.error("Failed to save user");
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser.mutateAsync(selectedUser.id);
      toast.success("User deleted successfully");
      setIsDeleteOpen(false);
      setSelectedUser(null);
    } catch {
      toast.error("Failed to delete user");
    }
  };

  const handleConfirmRole = async (role: string) => {
    if (!selectedUser) return;

    try {
      await assignRole.mutateAsync({ userId: selectedUser.id, role });
      toast.success("Role assigned successfully");
      setIsRoleDialogOpen(false);
      setSelectedUser(null);
    } catch {
      toast.error("Failed to assign role");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage system users and their permissions</CardDescription>
            </div>
            <Button onClick={handleCreateUser}>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex gap-2 mb-4">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Search users by name, email, or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button variant="secondary">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
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
              Error loading users. Please try again.
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && data && data.content.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No users found</p>
              <Button onClick={handleCreateUser} variant="link" className="mt-2">
                Create your first user
              </Button>
            </div>
          )}

          {/* User Table */}
          {!isLoading && !error && data && data.content.length > 0 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Total: {data.totalElements} users</p>
              <UserTable
                users={data.content}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
                onChangeRole={handleChangeRole}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <UserFormDialog
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedUser(null);
        }}
        onSubmit={handleFormSubmit}
        user={selectedUser || undefined}
        isLoading={createUser.isPending || updateUser.isPending}
      />

      <DeleteUserDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleConfirmDelete}
        user={selectedUser}
        isDeleting={deleteUser.isPending}
      />

      <RoleAssignmentDialog
        isOpen={isRoleDialogOpen}
        onClose={() => {
          setIsRoleDialogOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleConfirmRole}
        user={selectedUser}
        isLoading={assignRole.isPending}
      />
    </div>
  );
};

export default UserManagement;
