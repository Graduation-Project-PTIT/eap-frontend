import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileJson, Database as DatabaseIcon, Network, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ERDTableTabs from "./ERDTableTabs";
import { MermaidRenderer } from "../MermaidRenderer";
import Editor from "@monaco-editor/react";
import type { ERDExtractionResult } from "@/api/services/evaluation-service";
import type { PreferredFormat } from "@/pages/main/ERDEvaluation/context/WorkflowContext";

interface ERDFormatTabsProps {
  data: ERDExtractionResult;
  onDataChange?: (data: ERDExtractionResult) => void;
  isEditable?: boolean;
  className?: string;
  preferredFormat?: PreferredFormat;
}

const ERDFormatTabs: React.FC<ERDFormatTabsProps> = ({
  data,
  onDataChange,
  isEditable = false,
  className,
  preferredFormat = "json",
}) => {
  const [activeTab, setActiveTab] = useState<string>(preferredFormat);

  return (
    <div className={className}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <TooltipProvider>
            <TabsList>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="json" className="gap-2">
                    <FileJson className="h-4 w-4" />
                    JSON
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Editable format - You can modify entities using the table below</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="ddl" className="gap-2">
                    <DatabaseIcon className="h-4 w-4" />
                    DDL
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Read-only - Shows the original extracted DDL script</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="mermaid" className="gap-2">
                    <Network className="h-4 w-4" />
                    Mermaid
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Read-only - Shows the original extracted Mermaid diagram</p>
                </TooltipContent>
              </Tooltip>
            </TabsList>
          </TooltipProvider>

          <Badge variant="outline" className="text-xs">
            All formats extracted ✓
          </Badge>
        </div>

        {/* JSON Tab */}
        <TabsContent value="json" className="flex-1 mt-0">
          {data.entities && data.entities.length > 0 ? (
            <ERDTableTabs
              data={data}
              onDataChange={onDataChange}
              isEditable={isEditable}
              className="w-full h-full"
            />
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <FileJson className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No JSON Data</h3>
              <p className="text-gray-500">No entities found in the extracted data.</p>
            </div>
          )}
        </TabsContent>

        {/* DDL Tab */}
        <TabsContent value="ddl" className="mt-0">
          {isEditable && (
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                DDL format is read-only. To make changes, edit the JSON format in the JSON tab.
              </AlertDescription>
            </Alert>
          )}
          {data.ddlScript ? (
            <div className="border rounded-lg overflow-hidden" style={{ height: "500px" }}>
              <Editor
                height="500px"
                defaultLanguage="sql"
                value={data.ddlScript}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontSize: 14,
                  lineNumbers: "on",
                  renderLineHighlight: "all",
                  scrollbar: {
                    vertical: "visible",
                    horizontal: "visible",
                  },
                }}
                theme="vs-light"
              />
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <DatabaseIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No DDL Script</h3>
              <p className="text-gray-500">DDL script was not generated during extraction.</p>
            </div>
          )}
        </TabsContent>

        {/* Mermaid Tab */}
        <TabsContent value="mermaid" className="mt-0">
          {isEditable && (
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Mermaid format is read-only. To make changes, edit the JSON format in the JSON tab.
              </AlertDescription>
            </Alert>
          )}
          {data.mermaidDiagram ? (
            <div className="grid grid-cols-2 gap-4" style={{ height: "500px" }}>
              {/* Mermaid Code */}
              <div className="border rounded-lg overflow-hidden flex flex-col">
                <div className="bg-muted px-4 py-2 border-b">
                  <h4 className="text-sm font-medium">Mermaid Code</h4>
                </div>
                <div className="flex-1">
                  <Editor
                    height="460px"
                    defaultLanguage="markdown"
                    value={data.mermaidDiagram}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      fontSize: 14,
                      lineNumbers: "on",
                      wordWrap: "on",
                    }}
                    theme="vs-light"
                  />
                </div>
              </div>

              {/* Mermaid Preview */}
              <div className="border rounded-lg overflow-hidden flex flex-col">
                <div className="bg-muted px-4 py-2 border-b">
                  <h4 className="text-sm font-medium">Diagram Preview</h4>
                </div>
                <div className="flex-1 overflow-auto p-4">
                  <MermaidRenderer diagram={data.mermaidDiagram} />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <Network className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Mermaid Diagram</h3>
              <p className="text-gray-500">Mermaid diagram was not generated during extraction.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ERDFormatTabs;
