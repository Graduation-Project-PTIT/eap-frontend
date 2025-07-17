import { type FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle, AlertTriangle, XCircle, Download, Save } from "lucide-react";
import { useWorkflow } from "../context/WorkflowContext";
import ERDFlowVisualization from "./ERDFlowVisualization";
import {
  exportAsJSON,
  exportAsCSV,
  exportAsPDF,
  saveToHistory,
  generateReportId,
  type EvaluationReport,
} from "../utils/exportUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { toast } from "@/lib/toast";
import type { ERDExtractionResult } from "@/api/services/evaluation-service";

interface EvaluationStepProps {
  onBack: () => void;
}

// Helper function to generate evaluation results based on ERD data
const generateEvaluationResults = (data: ERDExtractionResult | null) => {
  if (!data || !data.entities.length) {
    return {
      overallScore: 0,
      categories: [],
      issues: [{ type: "error", message: "No data available for evaluation" }],
      recommendations: ["Please complete the extraction and refinement steps first"],
    };
  }

  const entities = data.entities;
  const totalAttributes = entities.reduce((acc, e) => acc + e.attributes.length, 0);
  const primaryKeys = entities.reduce(
    (acc, e) => acc + e.attributes.filter((a) => a.primaryKey).length,
    0,
  );
  const foreignKeys = entities.reduce(
    (acc, e) => acc + e.attributes.filter((a) => a.foreignKey).length,
    0,
  );

  // Calculate scores based on ERD quality metrics
  const normalizationScore = Math.min(
    100,
    (entities.length / Math.max(1, totalAttributes / 5)) * 100,
  );
  const relationshipScore = Math.min(100, (foreignKeys / Math.max(1, entities.length)) * 100);
  const namingScore = entities.every((e) => /^[A-Z][a-zA-Z_]*$/.test(e.name)) ? 90 : 60;
  const dataTypeScore = entities.every((e) =>
    e.attributes.every((a) => a.type && a.type.length > 0),
  )
    ? 95
    : 70;

  const overallScore = Math.round(
    (normalizationScore + relationshipScore + namingScore + dataTypeScore) / 4,
  );

  const issues = [];
  const recommendations = [];

  if (primaryKeys === 0) {
    issues.push({ type: "error", message: "No primary keys found in any entity" });
    recommendations.push("Add primary keys to all entities");
  }

  if (foreignKeys === 0) {
    issues.push({ type: "warning", message: "No foreign key relationships found" });
    recommendations.push("Consider adding relationships between entities");
  }

  if (entities.some((e) => e.attributes.length > 10)) {
    issues.push({
      type: "warning",
      message: "Some entities have many attributes - consider normalization",
    });
    recommendations.push("Break down large entities into smaller, more focused ones");
  }

  return {
    overallScore,
    categories: [
      {
        name: "Normalization",
        score: Math.round(normalizationScore),
        status: getScoreStatus(normalizationScore),
      },
      {
        name: "Relationship Design",
        score: Math.round(relationshipScore),
        status: getScoreStatus(relationshipScore),
      },
      {
        name: "Naming Conventions",
        score: Math.round(namingScore),
        status: getScoreStatus(namingScore),
      },
      {
        name: "Data Types",
        score: Math.round(dataTypeScore),
        status: getScoreStatus(dataTypeScore),
      },
    ],
    issues,
    recommendations,
  };
};

const getScoreStatus = (score: number) => {
  if (score >= 90) return "excellent";
  if (score >= 75) return "good";
  if (score >= 60) return "fair";
  return "poor";
};

const EvaluationStep: FC<EvaluationStepProps> = ({ onBack }) => {
  const { state, resetWorkflow } = useWorkflow();

  // Use refined data or fallback to extracted data
  const finalData = state.refinedData || state.extractedData;

  // Generate evaluation results based on the ERD data
  const evaluationResults = generateEvaluationResults(finalData);

  const handleStartNewEvaluation = () => {
    resetWorkflow();
  };

  const createReport = (): EvaluationReport => {
    return {
      id: generateReportId(),
      timestamp: new Date().toISOString(),
      questionDescription: state.questionDescription,
      originalData: state.extractedData || { entities: [] },
      refinedData: finalData || { entities: [] },
      evaluationResults,
    };
  };

  const handleSaveToHistory = () => {
    try {
      const report = createReport();
      saveToHistory(report);
      toast.success("Evaluation saved to history successfully!");
    } catch (error) {
      console.error("Failed to save to history:", error);
      toast.error("Failed to save to history. Please try again.");
    }
  };

  const handleExportJSON = () => {
    try {
      const report = createReport();
      exportAsJSON(report);
      toast.success("Report exported as JSON successfully!");
    } catch (error) {
      console.error("Failed to export JSON:", error);
      toast.error("Failed to export report. Please try again.");
    }
  };

  const handleExportCSV = () => {
    try {
      const report = createReport();
      exportAsCSV(report);
      toast.success("Report exported as CSV successfully!");
    } catch (error) {
      console.error("Failed to export CSV:", error);
      toast.error("Failed to export report. Please try again.");
    }
  };

  const handleExportPDF = () => {
    try {
      const report = createReport();
      exportAsPDF(report);
      toast.success("Report exported as text file successfully!");
    } catch (error) {
      console.error("Failed to export PDF:", error);
      toast.error("Failed to export report. Please try again.");
    }
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

      {/* Final ERD Visualization */}
      {finalData && finalData.entities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Final ERD Structure</CardTitle>
          </CardHeader>
          <CardContent>
            <ERDFlowVisualization data={finalData} isEditable={false} />
          </CardContent>
        </Card>
      )}

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
            <Button variant="outline" onClick={handleSaveToHistory}>
              <Save className="h-4 w-4 mr-2" />
              Save to History
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleExportJSON}>Export as JSON</DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportCSV}>Export as CSV</DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPDF}>Export as Text</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={handleStartNewEvaluation}>Start New Evaluation</Button>
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
