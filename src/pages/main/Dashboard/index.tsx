import { toast } from "@/lib/toast";

const Dashboard = () => {
  const handleCreateERD = () => {
    toast.info("ERD Designer", {
      description: "Redirecting to ERD Designer...",
    });
  };

  const handleImportSchema = () => {
    toast.loading("Preparing import wizard...");
    // Simulate loading
    setTimeout(() => {
      toast.dismiss();
      toast.success("Import wizard ready!");
    }, 1500);
  };

  const handleViewTemplates = () => {
    toast.success("Templates loaded", {
      description: "Browse through our collection of ERD templates.",
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your EAP dashboard. Here you can see an overview of your projects and recent
          activity. (Testing)
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-lg font-semibold">Total Projects</h3>
          <p className="text-3xl font-bold mt-2">12</p>
          <p className="text-sm text-muted-foreground mt-1">+2 from last month</p>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-lg font-semibold">Active ERDs</h3>
          <p className="text-3xl font-bold mt-2">8</p>
          <p className="text-sm text-muted-foreground mt-1">Currently being worked on</p>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-lg font-semibold">Team Members</h3>
          <p className="text-3xl font-bold mt-2">5</p>
          <p className="text-sm text-muted-foreground mt-1">Collaborating on projects</p>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-lg font-semibold">Completed This Month</h3>
          <p className="text-3xl font-bold mt-2">3</p>
          <p className="text-sm text-muted-foreground mt-1">ERDs finalized</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Projects</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">E-commerce Database</p>
                <p className="text-sm text-muted-foreground">Updated 2 hours ago</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">User Management System</p>
                <p className="text-sm text-muted-foreground">Updated 1 day ago</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-600/20">
                In Review
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Inventory Tracker</p>
                <p className="text-sm text-muted-foreground">Updated 3 days ago</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                Completed
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={handleCreateERD}
              className="w-full text-left p-3 rounded-lg border hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <p className="font-medium">Create New ERD</p>
              <p className="text-sm text-muted-foreground">
                Start designing a new entity relationship diagram
              </p>
            </button>
            <button
              onClick={handleImportSchema}
              className="w-full text-left p-3 rounded-lg border hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <p className="font-medium">Import Database Schema</p>
              <p className="text-sm text-muted-foreground">Import existing database structure</p>
            </button>
            <button
              onClick={handleViewTemplates}
              className="w-full text-left p-3 rounded-lg border hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <p className="font-medium">View Templates</p>
              <p className="text-sm text-muted-foreground">Browse pre-built ERD templates</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
