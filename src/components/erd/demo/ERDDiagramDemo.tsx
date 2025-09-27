import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ERDTableTabs from "../ERDTableTabs";
import { sampleERDData } from "./sampleERDData";
import type { ERDExtractionResult } from "@/api/services/evaluation-service";

const ERDDiagramDemo: React.FC = () => {
  const [erdData, setErdData] = useState<ERDExtractionResult>(sampleERDData);
  const [isEditable, setIsEditable] = useState(true);

  const handleDataChange = (newData: ERDExtractionResult) => {
    setErdData(newData);
    console.log("ERD Data updated:", newData);
  };

  const resetData = () => {
    setErdData(sampleERDData);
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>ERD Diagram Demo</span>
            <div className="flex space-x-2">
              <Button
                variant={isEditable ? "default" : "outline"}
                size="sm"
                onClick={() => setIsEditable(!isEditable)}
              >
                {isEditable ? "Editable" : "Read-only"}
              </Button>
              <Button variant="outline" size="sm" onClick={resetData}>
                Reset Data
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 mb-4">
            This demo shows the ERD diagram view with sample e-commerce data. You can toggle between
            table and diagram views, and switch between editable and read-only modes.
          </div>

          <ERDTableTabs
            data={erdData}
            onDataChange={handleDataChange}
            isEditable={isEditable}
            className="w-full h-[70vh]"
          />

          <div className="mt-4 text-xs text-gray-500">
            <strong>Features to try:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Click the "Diagram" toggle to switch to diagram view</li>
              <li>Double-click entities in diagram view to edit them</li>
              <li>Drag entities around to reposition them</li>
              <li>Use Ctrl+L for auto-layout, Ctrl+N to add entities</li>
              <li>Click the help button (?) for more instructions</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ERDDiagramDemo;
