import { useState } from "react";
import { useMyProfile, useUpdateProfile } from "@/api/services/user-service";
import { ProfileCard } from "./components/ProfileCard";
import { ProfileEditForm } from "./components/ProfileEditForm";
import type { UpdateUserRequest } from "./types";
import { toast } from "@/lib/toast";
import { Loader2 } from "lucide-react";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);

  // Fetch user profile
  const { data: user, isLoading, error } = useMyProfile();

  // Update profile mutation
  const updateProfileMutation = useUpdateProfile();

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = async (data: UpdateUserRequest) => {
    try {
      await updateProfileMutation.mutateAsync(data);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile. Please try again.");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
  if (error || !user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">Manage your profile information</p>
        </div>
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6">
          <p className="text-destructive">
            Failed to load profile. Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">Manage your profile information</p>
        </div>

        {/* Edit Button - Top Right */}
        {!isEditing && (
          <button
            onClick={handleEditToggle}
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Profile Content */}
      {isEditing ? (
        <ProfileEditForm
          user={user}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={updateProfileMutation.isPending}
        />
      ) : (
        <ProfileCard user={user} />
      )}
    </div>
  );
};

export default Profile;
