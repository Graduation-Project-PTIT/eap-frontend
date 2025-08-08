import { type FC } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Calendar, FileText, TrendingUp, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface HistorySidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const HistorySidebar: FC<HistorySidebarProps> = ({ isOpen, onToggle }) => {
  // Placeholder history data
  const evaluationHistory = [
    {
      id: 1,
      title: "E-commerce Database",
      date: "2024-01-15",
      score: 85,
      status: "completed",
      description: "Evaluation of e-commerce ERD with user management and product catalog",
    },
    {
      id: 2,
      title: "Library Management System",
      date: "2024-01-12",
      score: 92,
      status: "completed",
      description: "Library database design evaluation focusing on book lending system",
    },
    {
      id: 3,
      title: "Hospital Management ERD",
      date: "2024-01-10",
      score: 78,
      status: "completed",
      description: "Healthcare database evaluation with patient and appointment management",
    },
    {
      id: 4,
      title: "Social Media Platform",
      date: "2024-01-08",
      score: 88,
      status: "completed",
      description: "Social network ERD evaluation with user interactions and content management",
    },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800";
    if (score >= 75) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      {/* Sidebar */}
      <div
        className={cn(
          "fixed right-0 top-0 h-full w-80 bg-background border-l transition-transform duration-300 z-40",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex items-center space-x-2">
              <History className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Evaluation History</h2>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Previous ERD evaluations and results
            </p>
          </div>

          {/* Stats */}
          <div className="p-6 border-b">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{evaluationHistory.length}</div>
                <div className="text-xs text-muted-foreground">Total Evaluations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(
                    evaluationHistory.reduce((acc, item) => acc + item.score, 0) /
                      evaluationHistory.length,
                  )}
                </div>
                <div className="text-xs text-muted-foreground">Avg Score</div>
              </div>
            </div>
          </div>

          {/* History List */}
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-4">
              {evaluationHistory.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No evaluations yet</p>
                  <p className="text-sm text-muted-foreground">
                    Complete your first evaluation to see it here
                  </p>
                </div>
              ) : (
                evaluationHistory.map((item) => (
                  <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <h3 className="font-medium text-sm leading-tight">{item.title}</h3>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Score */}
                        <div className="flex items-center justify-between">
                          <Badge className={cn("text-xs", getScoreColor(item.score))}>
                            Score: {item.score}
                          </Badge>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(item.date)}
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {item.description}
                        </p>

                        {/* Actions */}
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" className="text-xs h-7">
                            View Details
                          </Button>
                          <Button variant="ghost" size="sm" className="text-xs h-7">
                            Rerun
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="p-6 border-t">
            <Button variant="outline" className="w-full" size="sm">
              <TrendingUp className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/20 z-30" onClick={onToggle} />}
    </>
  );
};

export default HistorySidebar;
