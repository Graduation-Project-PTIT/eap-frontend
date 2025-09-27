import React from "react";
import { Panel, useReactFlow } from "reactflow";
import { Button } from "@/components/ui/button";
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  RotateCcw,
  Grid3x3,
  Plus,
  Download,
  Upload,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ERDDiagramControlsProps {
  onAutoLayout?: () => void;
  onAddEntity?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onReset?: () => void;
  isEditable?: boolean;
}

const ERDDiagramControls: React.FC<ERDDiagramControlsProps> = ({
  onAutoLayout,
  onAddEntity,
  onExport,
  onImport,
  onReset,
  isEditable = false,
}) => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  const handleZoomIn = () => {
    zoomIn({ duration: 300 });
  };

  const handleZoomOut = () => {
    zoomOut({ duration: 300 });
  };

  const handleFitView = () => {
    fitView({ duration: 300, padding: 0.1 });
  };

  return (
    <TooltipProvider>
      <Panel position="top-right" className="flex flex-col space-y-2">
        {/* Zoom Controls */}
        <div className="flex flex-col space-y-1 bg-white rounded-lg shadow-lg border p-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={handleZoomIn} className="h-8 w-8 p-0">
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Zoom In</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={handleZoomOut} className="h-8 w-8 p-0">
                <ZoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Zoom Out</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={handleFitView} className="h-8 w-8 p-0">
                <Maximize className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Fit to View</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Layout Controls */}
        <div className="flex flex-col space-y-1 bg-white rounded-lg shadow-lg border p-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onAutoLayout} className="h-8 w-8 p-0">
                <Grid3x3 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Auto Layout (Ctrl+L)</p>
            </TooltipContent>
          </Tooltip>

          {onReset && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={onReset} className="h-8 w-8 p-0">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Reset Layout</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Edit Controls (only show in editable mode) */}
        {isEditable && (
          <div className="flex flex-col space-y-1 bg-white rounded-lg shadow-lg border p-1">
            {onAddEntity && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={onAddEntity} className="h-8 w-8 p-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Add Entity (Ctrl+N)</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        )}

        {/* Import/Export Controls */}
        <div className="flex flex-col space-y-1 bg-white rounded-lg shadow-lg border p-1">
          {onExport && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={onExport} className="h-8 w-8 p-0">
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Export Diagram</p>
              </TooltipContent>
            </Tooltip>
          )}

          {onImport && isEditable && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={onImport} className="h-8 w-8 p-0">
                  <Upload className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Import Data</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </Panel>
    </TooltipProvider>
  );
};

export default ERDDiagramControls;
