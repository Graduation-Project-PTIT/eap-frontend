import { useState } from "react";
import type { User, UpdateUserRequest } from "../types";
import {
  validatePhone,
  validateAge,
  validateUsername,
  validateFirstName,
  validateLastName,
} from "../utils/validation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProfileEditFormProps {
  user: User;
  onSave: (data: UpdateUserRequest) => void;
  onCancel: () => void;
  isSaving: boolean;
}

export const ProfileEditForm = ({ user, onSave, onCancel, isSaving }: ProfileEditFormProps) => {
  const [formData, setFormData] = useState({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    username: user.username,
    phone: user.phone || "",
    age: user.age?.toString() || "",
    address: user.address || "",
    gender: user.gender || "Male",
  });

  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string | null> = {
      firstName: validateFirstName(formData.firstName),
      lastName: validateLastName(formData.lastName),
      username: validateUsername(formData.username),
      phone: validatePhone(formData.phone),
      age: validateAge(formData.age),
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const updateData: UpdateUserRequest = {
      id: user.id,
      firstName: formData.firstName || undefined,
      lastName: formData.lastName || undefined,
      username: formData.username,
      phone: formData.phone || undefined,
      age: formData.age ? parseInt(formData.age, 10) : undefined,
      address: formData.address || undefined,
      gender: formData.gender as "Male" | "Female" | "Other",
    };

    onSave(updateData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border bg-card text-card-foreground shadow-sm p-6"
    >
      <h2 className="text-xl font-semibold mb-6">Edit Profile</h2>

      <div className="grid gap-6 md:grid-cols-2">
        {/* First Name */}
        <div className="grid gap-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            placeholder="Enter first name"
            maxLength={100}
          />
          {errors.firstName && <p className="text-sm text-destructive">{errors.firstName}</p>}
        </div>

        {/* Last Name */}
        <div className="grid gap-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            placeholder="Enter last name"
            maxLength={100}
          />
          {errors.lastName && <p className="text-sm text-destructive">{errors.lastName}</p>}
        </div>

        {/* Username */}
        <div className="grid gap-2">
          <Label htmlFor="username">Username *</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => handleChange("username", e.target.value)}
            placeholder="Enter username"
            required
            minLength={3}
            maxLength={50}
          />
          {errors.username && <p className="text-sm text-destructive">{errors.username}</p>}
        </div>

        {/* Email (Read-only) */}
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={user.email} disabled className="bg-muted" />
          <p className="text-xs text-muted-foreground">Email cannot be changed</p>
        </div>

        {/* Phone */}
        <div className="grid gap-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            placeholder="+1234567890"
          />
          {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
        </div>

        {/* Age */}
        <div className="grid gap-2">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            value={formData.age}
            onChange={(e) => handleChange("age", e.target.value)}
            placeholder="Enter age"
            min={1}
            max={150}
          />
          {errors.age && <p className="text-sm text-destructive">{errors.age}</p>}
        </div>

        {/* Gender */}
        <div className="grid gap-2">
          <Label htmlFor="gender">Gender</Label>
          <Select value={formData.gender} onValueChange={(value) => handleChange("gender", value)}>
            <SelectTrigger id="gender">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Address - Full Width */}
        <div className="grid gap-2 md:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => handleChange("address", e.target.value)}
            placeholder="Enter address"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="inline-flex items-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
