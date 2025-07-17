import type { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Edit3, Save, RotateCcw } from "lucide-react";
import { useWorkflow } from "../context/WorkflowContext";
import ERDFlowVisualization from "./ERDFlowVisualization";
import type { ERDExtractionResult } from "@/api/services/evaluation-service";

interface ManualRefineStepProps {
  onNext: () => void;
  onBack: () => void;
}

const ManualRefineStep: FC<ManualRefineStepProps> = ({ onNext, onBack }) => {
  const { state, setRefinedData } = useWorkflow();

  // Use extracted data from workflow state, or fallback to empty structure
  const extractedData = state.extractedData || { entities: [] };
  const refinedData = state.refinedData || extractedData;

  const handleDataChange = (updatedData: ERDExtractionResult) => {
    setRefinedData(updatedData);
  };

  const handleResetToOriginal = () => {
    if (state.extractedData) {
      setRefinedData(state.extractedData);
    }
  };

  const handleSaveRefinements = () => {
    // Data is already saved in workflow state through handleDataChange
    onNext();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Edit3 className="h-5 w-5" />
            <span>Manually Refine Extracted Data</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Instructions */}
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              Review and refine the extracted entities, attributes, and relationships. Click on
              entities to edit them. Use the controls below to save your changes or reset to the
              original extracted data.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleResetToOriginal}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Original
              </Button>
            </div>
            <div className="flex space-x-2">
              <Badge variant="secondary" className="text-xs">
                {refinedData.entities.length} entities
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {refinedData.entities.reduce((acc, e) => acc + e.attributes.length, 0)} attributes
              </Badge>
            </div>
          </div>

          {/* ERD Flow Visualization */}
          {refinedData.entities.length > 0 ? (
            <ERDFlowVisualization
              data={refinedData}
              onDataChange={handleDataChange}
              isEditable={true}
            />
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <Edit3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Data to Refine</h3>
              <p className="text-gray-500">
                Please complete the extraction step first to get data for refinement.
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Extract
            </Button>
            <Button onClick={handleSaveRefinements}>
              <Save className="h-4 w-4 mr-2" />
              Save & Continue to Evaluation
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManualRefineStep;
