import React, { useState } from "react";
import { Panel } from "reactflow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, X, Mouse, Keyboard, Edit3, ZoomIn } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ERDDiagramHelpProps {
  isEditable?: boolean;
}

const ERDDiagramHelp: React.FC<ERDDiagramHelpProps> = ({ isEditable = false }) => {
  const [isOpen, setIsOpen] = useState(false);

  const helpItems = [
    {
      icon: <Mouse className="h-4 w-4" />,
      title: "Navigation",
      items: [
        "Drag to pan around the diagram",
        "Scroll to zoom in/out",
        "Click entities to select them",
      ],
    },
    {
      icon: <Edit3 className="h-4 w-4" />,
      title: "Editing",
      items: isEditable
        ? [
            "Double-click entities to edit",
            "Drag entities to reposition",
            "Use context menu for more options",
          ]
        : ["Diagram is in read-only mode", "Switch to table view to edit"],
    },
    {
      icon: <Keyboard className="h-4 w-4" />,
      title: "Keyboard Shortcuts",
      items: isEditable
        ? ["Ctrl+N: Add new entity", "Ctrl+L: Auto layout", "Delete: Remove selected items"]
        : ["Ctrl+L: Auto layout", "Use mouse wheel to zoom"],
    },
    {
      icon: <ZoomIn className="h-4 w-4" />,
      title: "Controls",
      items: [
        "Use zoom controls on the right",
        "Fit to view button centers diagram",
        "Mini-map shows overview",
      ],
    },
  ];

  if (!isOpen) {
    return (
      <Panel position="bottom-left">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(true)}
                className="bg-white shadow-lg"
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Show Help</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </Panel>
    );
  }

  return (
    <Panel position="bottom-left">
      <Card className="w-80 shadow-lg bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <HelpCircle className="h-4 w-4" />
              <span>Diagram Help</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          {helpItems.map((section, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center space-x-2 font-medium text-gray-700">
                {section.icon}
                <span>{section.title}</span>
              </div>
              <ul className="space-y-1 ml-6 text-gray-600">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start">
                    <span className="text-gray-400 mr-2">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="pt-2 border-t text-center">
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="text-xs">
              Got it!
            </Button>
          </div>
        </CardContent>
      </Card>
    </Panel>
  );
};

export default ERDDiagramHelp;
