import { type ERDExtractionResult } from "@/api/services/evaluation-service";

export interface EvaluationReport {
  id: string;
  timestamp: string;
  questionDescription: string;
  originalData: ERDExtractionResult;
  refinedData: ERDExtractionResult;
  evaluationResults: {
    overallScore: number;
    categories: Array<{
      name: string;
      score: number;
      status: string;
    }>;
    issues: Array<{
      type: string;
      message: string;
    }>;
    recommendations: string[];
  };
}

// Export evaluation report as JSON
export const exportAsJSON = (report: EvaluationReport): void => {
  const dataStr = JSON.stringify(report, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });

  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `erd-evaluation-${report.id}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Export evaluation report as CSV
export const exportAsCSV = (report: EvaluationReport): void => {
  const csvContent = [
    // Header
    "Category,Score,Status",
    // Data rows
    ...report.evaluationResults.categories.map(
      (cat) => `"${cat.name}",${cat.score},"${cat.status}"`,
    ),
    "",
    "Issues",
    ...report.evaluationResults.issues.map((issue) => `"${issue.type}","${issue.message}"`),
    "",
    "Recommendations",
    ...report.evaluationResults.recommendations.map((rec) => `"${rec}"`),
  ].join("\n");

  const dataBlob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `erd-evaluation-${report.id}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Export evaluation report as PDF (simplified text version)
export const exportAsPDF = (report: EvaluationReport): void => {
  const content = [
    `ERD Evaluation Report`,
    `Generated: ${new Date(report.timestamp).toLocaleString()}`,
    ``,
    `Question: ${report.questionDescription}`,
    ``,
    `Overall Score: ${report.evaluationResults.overallScore}/100`,
    ``,
    `Category Scores:`,
    ...report.evaluationResults.categories.map(
      (cat) => `- ${cat.name}: ${cat.score}/100 (${cat.status})`,
    ),
    ``,
    `Issues Found:`,
    ...report.evaluationResults.issues.map(
      (issue) => `- [${issue.type.toUpperCase()}] ${issue.message}`,
    ),
    ``,
    `Recommendations:`,
    ...report.evaluationResults.recommendations.map((rec) => `- ${rec}`),
    ``,
    `Entities (${report.refinedData.entities.length}):`,
    ...report.refinedData.entities.map((entity) => {
      const attrs = entity.attributes.map((attr) => {
        const flags = [];
        if (attr.primaryKey) flags.push("PK");
        if (attr.foreignKey) flags.push("FK");
        if (attr.unique) flags.push("UNIQUE");
        if (!attr.nullable) flags.push("NOT NULL");
        return `  - ${attr.name}: ${attr.type}${flags.length ? ` (${flags.join(", ")})` : ""}`;
      });
      return [`${entity.name}:`, ...attrs].join("\n");
    }),
  ].join("\n");

  const dataBlob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `erd-evaluation-${report.id}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Save to localStorage (for history functionality)
export const saveToHistory = (report: EvaluationReport): void => {
  try {
    const existingHistory = localStorage.getItem("erd-evaluation-history");
    const history: EvaluationReport[] = existingHistory ? JSON.parse(existingHistory) : [];

    // Add new report to the beginning of the array
    history.unshift(report);

    // Keep only the last 50 reports
    const trimmedHistory = history.slice(0, 50);

    localStorage.setItem("erd-evaluation-history", JSON.stringify(trimmedHistory));
  } catch (error) {
    console.error("Failed to save to history:", error);
    throw new Error("Failed to save evaluation to history");
  }
};

// Get history from localStorage
export const getHistory = (): EvaluationReport[] => {
  try {
    const existingHistory = localStorage.getItem("erd-evaluation-history");
    return existingHistory ? JSON.parse(existingHistory) : [];
  } catch (error) {
    console.error("Failed to load history:", error);
    return [];
  }
};

// Clear history
export const clearHistory = (): void => {
  localStorage.removeItem("erd-evaluation-history");
};

// Generate unique ID for reports
export const generateReportId = (): string => {
  return `erd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
