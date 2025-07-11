import { type FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle, AlertTriangle, XCircle, Download, Save } from "lucide-react";

interface EvaluationStepProps {
  onBack: () => void;
}

const EvaluationStep: FC<EvaluationStepProps> = ({ onBack }) => {
  // Placeholder evaluation data
  const evaluationResults = {
    overallScore: 85,
    categories: [
      { name: "Normalization", score: 90, status: "excellent" },
      { name: "Relationship Design", score: 85, status: "good" },
      { name: "Naming Conventions", score: 75, status: "fair" },
      { name: "Data Types", score: 95, status: "excellent" },
    ],
    issues: [
      { type: "warning", message: "Consider adding indexes for frequently queried columns" },
      { type: "error", message: "Missing foreign key constraint in Order_Items table" },
      { type: "info", message: "Entity names follow good naming conventions" },
    ],
    recommendations: [
      "Add composite indexes for multi-column queries",
      "Consider partitioning large tables",
      "Implement proper cascade rules for foreign keys",
    ],
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusIcon = (type: string) => {
    switch (type) {
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "info":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle>Evaluation Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div
              className={`text-6xl font-bold mb-2 ${getScoreColor(evaluationResults.overallScore)}`}
            >
              {evaluationResults.overallScore}
            </div>
            <p className="text-lg text-muted-foreground">Overall ERD Quality Score</p>
            <Progress value={evaluationResults.overallScore} className="mt-4 max-w-md mx-auto" />
          </div>
        </CardContent>
      </Card>

      {/* Category Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {evaluationResults.categories.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{category.name}</h4>
                  <Progress value={category.score} className="mt-2" />
                </div>
                <div className={`text-2xl font-bold ml-4 ${getScoreColor(category.score)}`}>
                  {category.score}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Issues and Recommendations */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Issues */}
        <Card>
          <CardHeader>
            <CardTitle>Issues Found</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {evaluationResults.issues.map((issue, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                  {getStatusIcon(issue.type)}
                  <p className="text-sm flex-1">{issue.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {evaluationResults.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <p className="text-sm flex-1">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 justify-center">
            <Button variant="outline">
              <Save className="h-4 w-4 mr-2" />
              Save to History
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button>Start New Evaluation</Button>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Refine
        </Button>
        <div className="text-sm text-muted-foreground flex items-center">
          Evaluation completed successfully
        </div>
      </div>
    </div>
  );
};

export default EvaluationStep;
