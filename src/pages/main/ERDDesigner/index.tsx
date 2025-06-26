const ERDDesigner = () => {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">ERD Designer</h1>
        <p className="text-muted-foreground">
          Design and create entity relationship diagrams with AI assistance.
        </p>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <div className="flex items-center justify-center h-96 border-2 border-dashed border-muted-foreground/25 rounded-lg">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-muted-foreground/50">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-semibold">ERD Canvas</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              The ERD designer canvas will be implemented here.
            </p>
            <div className="mt-6">
              <button className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90">
                Start New ERD
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
          <h3 className="font-semibold mb-2">Entities</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Drag and drop entities onto the canvas
          </p>
          <div className="space-y-2">
            <div className="p-2 border rounded cursor-pointer hover:bg-accent">
              <p className="text-sm font-medium">User</p>
            </div>
            <div className="p-2 border rounded cursor-pointer hover:bg-accent">
              <p className="text-sm font-medium">Product</p>
            </div>
            <div className="p-2 border rounded cursor-pointer hover:bg-accent">
              <p className="text-sm font-medium">Order</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
          <h3 className="font-semibold mb-2">Relationships</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Define relationships between entities
          </p>
          <div className="space-y-2">
            <div className="p-2 border rounded cursor-pointer hover:bg-accent">
              <p className="text-sm font-medium">One-to-One</p>
            </div>
            <div className="p-2 border rounded cursor-pointer hover:bg-accent">
              <p className="text-sm font-medium">One-to-Many</p>
            </div>
            <div className="p-2 border rounded cursor-pointer hover:bg-accent">
              <p className="text-sm font-medium">Many-to-Many</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
          <h3 className="font-semibold mb-2">AI Assistant</h3>
          <p className="text-sm text-muted-foreground mb-3">Get AI suggestions for your ERD</p>
          <div className="space-y-2">
            <button className="w-full p-2 border rounded text-left hover:bg-accent">
              <p className="text-sm font-medium">Suggest Entities</p>
            </button>
            <button className="w-full p-2 border rounded text-left hover:bg-accent">
              <p className="text-sm font-medium">Optimize Schema</p>
            </button>
            <button className="w-full p-2 border rounded text-left hover:bg-accent">
              <p className="text-sm font-medium">Generate SQL</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ERDDesigner;
