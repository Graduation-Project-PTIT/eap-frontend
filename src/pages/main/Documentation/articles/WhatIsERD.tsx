import ArticleContent from "../components/ArticleContent";

const WhatIsERD = () => {
  const content = (
    <div className="space-y-6">
      <section>
        <h2 className="text-xl font-semibold mb-3">Introduction</h2>
        <p className="text-muted-foreground leading-relaxed">
          An Entity Relationship Diagram (ERD) is a visual representation of the relationships
          between entities in a database. It serves as a blueprint for database design, helping
          developers and stakeholders understand the structure and relationships within a system.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Why Use ERDs?</h2>
        <div className="space-y-3">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-900 mb-2">📊 Visual Communication</h3>
            <p className="text-blue-800 text-sm">
              ERDs provide a clear, visual way to communicate database structure to both technical
              and non-technical stakeholders.
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="font-medium text-green-900 mb-2">🏗️ Design Planning</h3>
            <p className="text-green-800 text-sm">
              They help plan and design databases before implementation, reducing costly changes
              later.
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h3 className="font-medium text-purple-900 mb-2">🔍 Problem Identification</h3>
            <p className="text-purple-800 text-sm">
              ERDs help identify potential issues like redundancy, missing relationships, or
              normalization problems.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Key Components</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">🏢 Entities</h3>
            <p className="text-sm text-muted-foreground">
              Objects or concepts that can have data stored about them (e.g., Customer, Product,
              Order).
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">🏷️ Attributes</h3>
            <p className="text-sm text-muted-foreground">
              Properties or characteristics of entities (e.g., Customer Name, Product Price).
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">🔗 Relationships</h3>
            <p className="text-sm text-muted-foreground">
              Connections between entities that describe how they interact with each other.
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">🔑 Keys</h3>
            <p className="text-sm text-muted-foreground">
              Special attributes that uniquely identify entity instances (Primary Keys, Foreign
              Keys).
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">When to Use ERDs</h2>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-1">✓</span>
            <span>Planning a new database system</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-1">✓</span>
            <span>Documenting existing database structures</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-1">✓</span>
            <span>Communicating requirements with stakeholders</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-1">✓</span>
            <span>Analyzing and optimizing database performance</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-1">✓</span>
            <span>Training new team members on system architecture</span>
          </li>
        </ul>
      </section>

      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Next Steps</h2>
        <p className="text-muted-foreground mb-4">
          Now that you understand what ERDs are, you're ready to dive deeper into their components
          and learn how to create effective diagrams.
        </p>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90">
            Learn About ERD Components
          </button>
          <button className="px-4 py-2 border rounded-md text-sm hover:bg-accent">
            Create Your First ERD
          </button>
        </div>
      </section>
    </div>
  );

  return (
    <ArticleContent
      title="What is an ERD?"
      difficulty="Beginner"
      readTime="5 min read"
      content={content}
    />
  );
};

export default WhatIsERD;
