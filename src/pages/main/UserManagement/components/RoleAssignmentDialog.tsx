import { useState } from "react";
import type { AdminUser } from "@/api/services/admin-user-service";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface RoleAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (role: string) => void;
  user: AdminUser | null;
  isLoading: boolean;
}

export const RoleAssignmentDialog = ({
  isOpen,
  onClose,
  onConfirm,
  user,
  isLoading,
}: RoleAssignmentDialogProps) => {
  const [selectedRole, setSelectedRole] = useState<string>(user?.role || "User");

  if (!user) return null;

  const displayName =
    user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username;

  const handleSubmit = () => {
    onConfirm(selectedRole);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change User Role</DialogTitle>
          <DialogDescription>Assign a new role to this user</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="font-medium">{displayName}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>

          <div className="space-y-2">
            <Label>Current Role</Label>
            <div>
              <Badge
                variant={
                  user.role === "Admin"
                    ? "destructive"
                    : user.role === "Teacher"
                      ? "default"
                      : "secondary"
                }
              >
                {user.role}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">New Role</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="User">User</SelectItem>
                <SelectItem value="Teacher">Teacher</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || selectedRole === user.role}>
            {isLoading ? "Assigning..." : "Assign Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
