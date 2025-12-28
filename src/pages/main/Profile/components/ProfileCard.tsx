import type { User } from "../types";
import { Badge } from "@/components/ui/badge";

interface ProfileCardProps {
  user: User;
}

export const ProfileCard = ({ user }: ProfileCardProps) => {
  const getInitials = () => {
    const first = user.firstName?.[0] || "";
    const last = user.lastName?.[0] || "";
    return (first + last).toUpperCase() || user.username[0].toUpperCase();
  };

  const InfoField = ({ label, value }: { label: string; value?: string | number }) => (
    <div className="space-y-2">
      <label className="text-sm font-normal text-foreground">{label}</label>
      <div
        className={`rounded px-3 py-2 text-sm ${value ? "bg-muted text-foreground" : "bg-muted text-muted-foreground italic"}`}
      >
        {value || "Not provided"}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header Section: Avatar and Name */}
      <div className="flex items-center gap-6 py-4">
        <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-3xl font-semibold flex-shrink-0">
          {getInitials()}
        </div>
        <div>
          <h2 className="text-3xl font-bold text-foreground">
            {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username}
          </h2>
          <p className="text-lg text-muted-foreground mt-1">
            {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username}
          </p>
          <div className="mt-3">
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
      </div>

      {/* Profile Information Card */}
      <div className="rounded-lg border bg-card">
        <div className="p-6 space-y-6">
          <h3 className="text-base font-semibold text-foreground">Profile Information</h3>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoField label="First name" value={user.firstName} />
            <InfoField label="Last name" value={user.lastName} />
            <InfoField label="Username" value={user.username} />
            <InfoField label="Email" value={user.email} />
            <InfoField label="Phone" value={user.phone} />
            <InfoField label="Age" value={user.age} />
            <InfoField label="Gender" value={user.gender} />
            <div className="sm:col-span-1 lg:col-span-2">
              <InfoField label="Address" value={user.address} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
