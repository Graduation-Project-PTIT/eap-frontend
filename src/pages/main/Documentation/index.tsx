import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Search,
  BookOpen,
  Database,
  Link as LinkIcon,
  FileText,
  Lightbulb,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

const Documentation = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const documentationSections = [
    {
      id: "basics",
      title: "ERD Basics",
      description: "Learn the fundamentals of Entity Relationship Diagrams",
      icon: BookOpen,
      articles: [
        {
          id: "what-is-erd",
          title: "What is an ERD?",
          description: "Introduction to Entity Relationship Diagrams and their purpose",
          readTime: "5 min read",
          difficulty: "Beginner",
        },
        {
          id: "erd-components",
          title: "ERD Components",
          description: "Understanding entities, attributes, and relationships",
          readTime: "8 min read",
          difficulty: "Beginner",
        },
        {
          id: "erd-notation",
          title: "ERD Notation Systems",
          description: "Chen, Crow's Foot, and UML notation explained",
          readTime: "10 min read",
          difficulty: "Intermediate",
        },
      ],
    },
    {
      id: "entities",
      title: "Entities & Attributes",
      description: "Deep dive into entities, attributes, and their types",
      icon: Database,
      articles: [
        {
          title: "Entity Types",
          description: "Strong entities, weak entities, and associative entities",
          readTime: "7 min read",
          difficulty: "Intermediate",
        },
        {
          title: "Attribute Categories",
          description: "Simple, composite, derived, and multivalued attributes",
          readTime: "6 min read",
          difficulty: "Beginner",
        },
        {
          title: "Primary Keys",
          description: "Understanding and choosing effective primary keys",
          readTime: "5 min read",
          difficulty: "Beginner",
        },
      ],
    },
    {
      id: "relationships",
      title: "Relationships",
      description: "Master the art of defining relationships between entities",
      icon: LinkIcon,
      articles: [
        {
          title: "Relationship Types",
          description: "One-to-one, one-to-many, and many-to-many relationships",
          readTime: "9 min read",
          difficulty: "Intermediate",
        },
        {
          title: "Cardinality & Participation",
          description: "Understanding minimum and maximum cardinality constraints",
          readTime: "8 min read",
          difficulty: "Intermediate",
        },
        {
          title: "Recursive Relationships",
          description: "When entities relate to themselves",
          readTime: "6 min read",
          difficulty: "Advanced",
        },
      ],
    },
    {
      id: "best-practices",
      title: "Best Practices",
      description: "Guidelines for creating effective and maintainable ERDs",
      icon: Lightbulb,
      articles: [
        {
          title: "Naming Conventions",
          description: "Best practices for naming entities, attributes, and relationships",
          readTime: "4 min read",
          difficulty: "Beginner",
        },
        {
          title: "Normalization in ERDs",
          description: "Applying normalization principles to your ERD design",
          readTime: "12 min read",
          difficulty: "Advanced",
        },
        {
          title: "Common ERD Mistakes",
          description: "Avoid these common pitfalls when designing ERDs",
          readTime: "7 min read",
          difficulty: "Intermediate",
        },
      ],
    },
  ];

  const quickStartGuides = [
    {
      title: "Create Your First ERD",
      description: "Step-by-step guide to creating your first Entity Relationship Diagram",
      steps: 5,
      time: "15 minutes",
    },
    {
      title: "Import Database Schema",
      description: "Learn how to import existing database schemas into the ERD designer",
      steps: 3,
      time: "10 minutes",
    },
    {
      title: "Collaborate with Team",
      description: "Share and collaborate on ERD projects with your team members",
      steps: 4,
      time: "8 minutes",
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800 border-green-200";
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Advanced":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filteredSections = documentationSections
    .map((section) => ({
      ...section,
      articles: section.articles.filter(
        (article) =>
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.description.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((section) => section.articles.length > 0 || searchQuery === "");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Documentation</h1>
        <p className="text-muted-foreground">
          Comprehensive guides and references for Entity Relationship Diagrams
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search documentation..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="guides" className="space-y-6">
        <TabsList>
          <TabsTrigger value="guides">Guides</TabsTrigger>
          <TabsTrigger value="quick-start">Quick Start</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="guides" className="space-y-6">
          {filteredSections.map((section) => (
            <Card key={section.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <section.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {section.articles.map((article, index) => (
                    <div
                      key={index}
                      className="group cursor-pointer rounded-lg border p-4 transition-colors hover:bg-accent"
                    >
                      <div className="space-y-2">
                        <h4 className="font-semibold group-hover:text-primary">{article.title}</h4>
                        <p className="text-sm text-muted-foreground">{article.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={getDifficultyColor(article.difficulty)}
                            >
                              {article.difficulty}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {article.readTime}
                            </span>
                          </div>
                          <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="quick-start" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {quickStartGuides.map((guide, index) => (
              <Card key={index} className="group cursor-pointer transition-colors hover:bg-accent">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg group-hover:text-primary">
                        {guide.title}
                      </CardTitle>
                      <CardDescription>{guide.description}</CardDescription>
                    </div>
                    <ArrowRight className="h-5 w-5 opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      <span>{guide.steps} steps</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>{guide.time}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="examples" className="space-y-6">
          <div className="text-center py-12">
            <Database className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">ERD Examples Coming Soon</h3>
            <p className="mt-2 text-muted-foreground">
              We're working on comprehensive ERD examples for different industries and use cases.
            </p>
            <Button className="mt-4" variant="outline">
              Request an Example
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Documentation;
