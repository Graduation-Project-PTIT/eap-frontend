import { type DBExtractionResult } from "@/api/services/evaluation-service";

export interface EvaluationReport {
  id: string;
  timestamp: string;
  questionDescription: string;
  originalData: DBExtractionResult;
  refinedData: DBExtractionResult;
  evaluationReport: string; // AI-generated evaluation report
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
    "Field,Value",
    // Basic info
    `"Report ID","${report.id}"`,
    `"Timestamp","${report.timestamp}"`,
    `"Question Description","${report.questionDescription}"`,
    "",
    // ERD Data Summary
    "ERD Data Summary",
    `"Original Entities Count","${report.originalData.entities.length}"`,
    `"Refined Entities Count","${report.refinedData.entities.length}"`,
    "",
    // Evaluation Report
    "AI Evaluation Report",
    `"${report.evaluationReport.replace(/"/g, '""')}"`, // Escape quotes in CSV
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
    `Report ID: ${report.id}`,
    ``,
    `Question: ${report.questionDescription}`,
    ``,
    `AI Evaluation Report:`,
    `${report.evaluationReport}`,
    ``,
    `ERD Structure Summary:`,
    `Original Entities: ${report.originalData.entities.length}`,
    `Refined Entities: ${report.refinedData.entities.length}`,
    ``,
    `Refined Entities Details:`,
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
  return `erd-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};
