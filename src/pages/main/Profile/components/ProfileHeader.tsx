import type { User } from "../types";
import { Badge } from "@/components/ui/badge";

interface ProfileHeaderProps {
  user: User;
  isEditing: boolean;
  onEditToggle: () => void;
}

export const ProfileHeader = ({ user, isEditing, onEditToggle }: ProfileHeaderProps) => {
  const getInitials = () => {
    const first = user.firstName?.[0] || "";
    const last = user.lastName?.[0] || "";
    return (first + last).toUpperCase() || user.username[0].toUpperCase();
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "Admin":
        return "destructive";
      case "Teacher":
        return "default";
      default:
        return "secondary";
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
          {getInitials()}
        </div>

        {/* User Info */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username}
          </h1>
          <p className="text-muted-foreground">{user.email}</p>
          <div className="mt-2">
            <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
          </div>
        </div>
      </div>

      {/* Edit Button */}
      <button
        onClick={onEditToggle}
        className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
      >
        {isEditing ? "Cancel" : "Edit Profile"}
      </button>
    </div>
  );
};
