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
