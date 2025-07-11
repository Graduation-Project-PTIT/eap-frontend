import type { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Edit3, Plus, Trash2 } from "lucide-react";

interface ManualRefineStepProps {
  onNext: () => void;
  onBack: () => void;
}

const ManualRefineStep: FC<ManualRefineStepProps> = ({ onNext, onBack }) => {
  // Placeholder data for demonstration
  const placeholderEntities = [
    { id: 1, name: "User", attributes: ["user_id", "username", "email", "created_at"] },
    { id: 2, name: "Product", attributes: ["product_id", "name", "price", "description"] },
    { id: 3, name: "Order", attributes: ["order_id", "user_id", "total_amount", "order_date"] },
  ];

  const placeholderRelationships = [
    { id: 1, from: "User", to: "Order", type: "One-to-Many", description: "User places Orders" },
    {
      id: 2,
      from: "Order",
      to: "Product",
      type: "Many-to-Many",
      description: "Order contains Products",
    },
  ];

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
              Review and refine the extracted entities, attributes, and relationships. You can add,
              edit, or remove elements to ensure accuracy before evaluation.
            </p>
          </div>

          {/* Entities Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Entities</h3>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Entity
              </Button>
            </div>

            <div className="grid gap-4">
              {placeholderEntities.map((entity) => (
                <Card key={entity.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium mb-2">{entity.name}</h4>
                        <div className="flex flex-wrap gap-2">
                          {entity.attributes.map((attr, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {attr}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Relationships Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Relationships</h3>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Relationship
              </Button>
            </div>

            <div className="grid gap-4">
              {placeholderRelationships.map((relationship) => (
                <Card key={relationship.id} className="border-l-4 border-l-green-500">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium">{relationship.from}</span>
                          <Badge variant="outline">{relationship.type}</Badge>
                          <span className="font-medium">{relationship.to}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{relationship.description}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Extract
            </Button>
            <Button onClick={onNext}>
              Proceed to Evaluation
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManualRefineStep;
