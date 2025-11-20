import type { User } from "../types";

interface ProfileViewProps {
  user: User;
}

export const ProfileView = ({ user }: ProfileViewProps) => {
  const InfoRow = ({ label, value }: { label: string; value?: string | number }) => (
    <div className="grid gap-1">
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      <p className="text-base">{value || "Not provided"}</p>
    </div>
  );

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-6">Profile Information</h2>

      <div className="grid gap-6 md:grid-cols-2">
        <InfoRow label="First Name" value={user.firstName} />
        <InfoRow label="Last Name" value={user.lastName} />
        <InfoRow label="Username" value={user.username} />
        <InfoRow label="Email" value={user.email} />
        <InfoRow label="Phone" value={user.phone} />
        <InfoRow label="Age" value={user.age} />
        <InfoRow label="Address" value={user.address} />
        <InfoRow label="Gender" value={user.gender} />
      </div>
    </div>
  );
};
