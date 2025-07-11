import type { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ArrowRight, Database, Loader2 } from "lucide-react";

interface ExtractDiagramStepProps {
  onNext: () => void;
  onBack: () => void;
}

const ExtractDiagramStep: FC<ExtractDiagramStepProps> = ({ onNext, onBack }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Extract Diagram Data</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Placeholder Content */}
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-muted rounded-full">
                <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Processing ERD Image</h3>
            <p className="text-muted-foreground mb-6">
              This step will extract entities, relationships, and attributes from your uploaded ERD
              image.
            </p>

            {/* Placeholder Progress */}
            <div className="max-w-md mx-auto space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Analyzing image structure...</span>
                  <span>75%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full w-3/4 transition-all duration-300" />
                </div>
              </div>

              {/* Placeholder extracted data preview */}
              <div className="mt-8 space-y-4">
                <h4 className="font-medium text-left">Extracted Elements Preview:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4">
                    <h5 className="font-medium mb-2">Entities</h5>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h5 className="font-medium mb-2">Relationships</h5>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h5 className="font-medium mb-2">Attributes</h5>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-18" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Setup
            </Button>
            <Button onClick={onNext}>
              Continue to Refine
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExtractDiagramStep;
