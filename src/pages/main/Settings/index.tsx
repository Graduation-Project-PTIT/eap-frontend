import { ThemeSettings } from "@/components/theme-settings";
import { ToastDemo } from "@/components/toast-demo";

const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <div className="grid gap-6">
        {/* Profile Settings */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Profile</h2>
          <div className="space-y-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Full Name</label>
              <input
                type="text"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="John Doe"
                defaultValue="John Doe"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="john.doe@example.com"
                defaultValue="john.doe@example.com"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Bio</label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Tell us about yourself..."
                defaultValue="Database designer and developer with 5+ years of experience."
              />
            </div>
            <button className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90">
              Save Changes
            </button>
          </div>
        </div>

        {/* Preferences */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Preferences</h2>
          <div className="space-y-4">
            <ThemeSettings />
          </div>
        </div>

        {/* Security */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Security</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Change Password</label>
              <p className="text-sm text-muted-foreground mb-2">
                Update your password to keep your account secure
              </p>
              <button className="inline-flex items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                Change Password
              </button>
            </div>
            <div>
              <label className="text-sm font-medium">Two-Factor Authentication</label>
              <p className="text-sm text-muted-foreground mb-2">
                Add an extra layer of security to your account
              </p>
              <button className="inline-flex items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                Enable 2FA
              </button>
            </div>
          </div>
        </div>

        {/* Toast Demo */}
        <ToastDemo />

        {/* Danger Zone */}
        <div className="rounded-lg border border-destructive bg-card text-card-foreground shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 text-destructive">Danger Zone</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Delete Account</label>
              <p className="text-sm text-muted-foreground mb-2">
                Permanently delete your account and all associated data
              </p>
              <button className="inline-flex items-center rounded-md bg-destructive px-3 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 text-white">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
