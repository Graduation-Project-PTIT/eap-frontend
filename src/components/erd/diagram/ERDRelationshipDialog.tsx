import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Save, X } from "lucide-react";
import type { ERDEntity } from "@/api/services/evaluation-service";

interface RelationshipData {
  sourceEntity: string;
  targetEntity: string;
  sourceAttribute: string;
  targetAttribute: string;
  relationType: "one-to-one" | "one-to-many" | "many-to-one" | "many-to-many";
}

interface ERDRelationshipDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (relationship: RelationshipData) => void;
  entities: ERDEntity[];
  sourceEntityId?: string;
  targetEntityId?: string;
}

const ERDRelationshipDialog: React.FC<ERDRelationshipDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  entities,
  sourceEntityId,
  targetEntityId,
}) => {
  const [relationship, setRelationship] = useState<RelationshipData>({
    sourceEntity: sourceEntityId || "",
    targetEntity: targetEntityId || "",
    sourceAttribute: "",
    targetAttribute: "",
    relationType: "many-to-one",
  });

  useEffect(() => {
    if (sourceEntityId) {
      setRelationship((prev) => ({ ...prev, sourceEntity: sourceEntityId }));
    }
    if (targetEntityId) {
      setRelationship((prev) => ({ ...prev, targetEntity: targetEntityId }));
    }
  }, [sourceEntityId, targetEntityId]);

  const sourceEntity = entities.find((e) => e.name === relationship.sourceEntity);
  const targetEntity = entities.find((e) => e.name === relationship.targetEntity);

  const handleSave = () => {
    if (
      relationship.sourceEntity &&
      relationship.targetEntity &&
      relationship.sourceAttribute &&
      relationship.targetAttribute
    ) {
      onSave(relationship);
      onClose();
    }
  };

  const handleClose = () => {
    setRelationship({
      sourceEntity: "",
      targetEntity: "",
      sourceAttribute: "",
      targetAttribute: "",
      relationType: "many-to-one",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Create Relationship</span>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Source Entity */}
          <div className="space-y-2">
            <Label>Source Entity</Label>
            <Select
              value={relationship.sourceEntity}
              onValueChange={(value) =>
                setRelationship((prev) => ({ ...prev, sourceEntity: value, sourceAttribute: "" }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select source entity" />
              </SelectTrigger>
              <SelectContent>
                {entities.map((entity) => (
                  <SelectItem key={entity.name} value={entity.name}>
                    {entity.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Source Attribute */}
          <div className="space-y-2">
            <Label>Source Attribute</Label>
            <Select
              value={relationship.sourceAttribute}
              onValueChange={(value) =>
                setRelationship((prev) => ({ ...prev, sourceAttribute: value }))
              }
              disabled={!sourceEntity}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select source attribute" />
              </SelectTrigger>
              <SelectContent>
                {sourceEntity?.attributes.map((attr) => (
                  <SelectItem key={attr.name} value={attr.name}>
                    {attr.name} ({attr.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Relationship Type */}
          <div className="space-y-2">
            <Label>Relationship Type</Label>
            <Select
              value={relationship.relationType}
              onValueChange={(
                value: "one-to-one" | "one-to-many" | "many-to-one" | "many-to-many",
              ) => setRelationship((prev) => ({ ...prev, relationType: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="one-to-one">One to One (1:1)</SelectItem>
                <SelectItem value="one-to-many">One to Many (1:N)</SelectItem>
                <SelectItem value="many-to-one">Many to One (N:1)</SelectItem>
                <SelectItem value="many-to-many">Many to Many (N:N)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Target Entity */}
          <div className="space-y-2">
            <Label>Target Entity</Label>
            <Select
              value={relationship.targetEntity}
              onValueChange={(value) =>
                setRelationship((prev) => ({ ...prev, targetEntity: value, targetAttribute: "" }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select target entity" />
              </SelectTrigger>
              <SelectContent>
                {entities
                  .filter((entity) => entity.name !== relationship.sourceEntity)
                  .map((entity) => (
                    <SelectItem key={entity.name} value={entity.name}>
                      {entity.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Target Attribute */}
          <div className="space-y-2">
            <Label>Target Attribute</Label>
            <Select
              value={relationship.targetAttribute}
              onValueChange={(value) =>
                setRelationship((prev) => ({ ...prev, targetAttribute: value }))
              }
              disabled={!targetEntity}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select target attribute" />
              </SelectTrigger>
              <SelectContent>
                {targetEntity?.attributes.map((attr) => (
                  <SelectItem key={attr.name} value={attr.name}>
                    {attr.name} ({attr.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                !relationship.sourceEntity ||
                !relationship.targetEntity ||
                !relationship.sourceAttribute ||
                !relationship.targetAttribute
              }
            >
              <Save className="h-4 w-4 mr-2" />
              Create Relationship
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ERDRelationshipDialog;
