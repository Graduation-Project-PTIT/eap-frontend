import { useState, useEffect } from "react";
import type {
  AdminUser,
  CreateAdminUserRequest,
  UpdateAdminUserRequest,
} from "@/api/services/admin-user-service";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAdminUserRequest | UpdateAdminUserRequest) => void;
  user?: AdminUser;
  isLoading: boolean;
}

export const UserFormDialog = ({
  isOpen,
  onClose,
  onSubmit,
  user,
  isLoading,
}: UserFormDialogProps) => {
  const isEditMode = !!user;

  const [formData, setFormData] = useState({
    email: user?.email || "",
    username: user?.username || "",
    password: "",
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
    age: user?.age?.toString() || "",
    address: user?.address || "",
    gender: (user?.gender || "Male") as "Male" | "Female" | "Other",
    role: (user?.role || "User") as "User" | "Admin" | "Teacher",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        username: user.username,
        password: "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        age: user.age?.toString() || "",
        address: user.address || "",
        gender: user.gender || "Male",
        role: user.role,
      });
    } else {
      setFormData({
        email: "",
        username: "",
        password: "",
        firstName: "",
        lastName: "",
        phone: "",
        age: "",
        address: "",
        gender: "Male",
        role: "User",
      });
    }
  }, [user, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditMode) {
      onSubmit({
        id: user.id,
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
        username: formData.username,
        phone: formData.phone || undefined,
        age: formData.age ? parseInt(formData.age, 10) : undefined,
        address: formData.address || undefined,
        gender: formData.gender,
      } as UpdateAdminUserRequest);
    } else {
      onSubmit({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
        phone: formData.phone || undefined,
        age: formData.age ? parseInt(formData.age, 10) : undefined,
        address: formData.address || undefined,
        gender: formData.gender,
        role: formData.role,
      } as CreateAdminUserRequest);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit User" : "Create New User"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update user information" : "Add a new user to the system"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isEditMode}
                className={isEditMode ? "bg-muted" : ""}
              />
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                minLength={3}
                maxLength={50}
              />
            </div>

            {/* Password (create only) */}
            {!isEditMode && (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={8}
                />
                <p className="text-xs text-muted-foreground">
                  Min 8 characters, 1 uppercase, 1 lowercase, 1 digit, 1 special character
                </p>
              </div>
            )}

            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                maxLength={100}
              />
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                maxLength={100}
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1234567890"
              />
            </div>

            {/* Age */}
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                min={1}
                max={150}
              />
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) =>
                  setFormData({ ...formData, gender: value as "Male" | "Female" | "Other" })
                }
              >
                <SelectTrigger id="gender">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Role (create only) */}
            {!isEditMode && (
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value as "User" | "Admin" | "Teacher" })
                  }
                >
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
            )}

            {/* Address */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : isEditMode ? "Save Changes" : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
