import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Save, X } from "lucide-react";
import type { ERDEntity } from "@/api/services/evaluation-service";

interface ERDEntityEditDialogProps {
  entity: ERDEntity | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (entity: ERDEntity) => void;
  availableEntities: string[];
}

const ERDEntityEditDialog: React.FC<ERDEntityEditDialogProps> = ({
  entity,
  isOpen,
  onClose,
  onSave,
  availableEntities,
}) => {
  const [editedEntity, setEditedEntity] = useState<ERDEntity | null>(null);

  useEffect(() => {
    if (entity) {
      setEditedEntity({ ...entity });
    }
  }, [entity]);

  if (!editedEntity) return null;

  const handleSave = () => {
    onSave(editedEntity);
    onClose();
  };

  const addAttribute = () => {
    setEditedEntity({
      ...editedEntity,
      attributes: [
        ...editedEntity.attributes,
        {
          name: "new_attribute",
          type: "VARCHAR(255)",
          primaryKey: false,
          foreignKey: false,
          unique: false,
          nullable: true,
        },
      ],
    });
  };

  const removeAttribute = (index: number) => {
    setEditedEntity({
      ...editedEntity,
      attributes: editedEntity.attributes.filter((_, i) => i !== index),
    });
  };

  const updateAttribute = (index: number, field: string, value: string | boolean) => {
    const updatedAttributes = [...editedEntity.attributes];
    updatedAttributes[index] = {
      ...updatedAttributes[index],
      [field]: value,
    };
    setEditedEntity({
      ...editedEntity,
      attributes: updatedAttributes,
    });
  };

  const updateEntityName = (name: string) => {
    setEditedEntity({
      ...editedEntity,
      name,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Edit Entity: {entity?.name}</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Entity Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Entity Name</label>
            <Input
              value={editedEntity.name}
              onChange={(e) => updateEntityName(e.target.value)}
              placeholder="Enter entity name"
            />
          </div>

          {/* Attributes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Attributes</h3>
              <Button onClick={addAttribute} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Attribute
              </Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>PK</TableHead>
                    <TableHead>FK</TableHead>
                    <TableHead>Unique</TableHead>
                    <TableHead>Nullable</TableHead>
                    <TableHead>FK Table</TableHead>
                    <TableHead>FK Attribute</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {editedEntity.attributes.map((attribute, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input
                          value={attribute.name}
                          onChange={(e) => updateAttribute(index, "name", e.target.value)}
                          className="w-full"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={attribute.type}
                          onValueChange={(value) => updateAttribute(index, "type", value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="VARCHAR(255)">VARCHAR(255)</SelectItem>
                            <SelectItem value="INT">INT</SelectItem>
                            <SelectItem value="BIGINT">BIGINT</SelectItem>
                            <SelectItem value="TEXT">TEXT</SelectItem>
                            <SelectItem value="BOOLEAN">BOOLEAN</SelectItem>
                            <SelectItem value="DATE">DATE</SelectItem>
                            <SelectItem value="DATETIME">DATETIME</SelectItem>
                            <SelectItem value="DECIMAL(10,2)">DECIMAL(10,2)</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={attribute.primaryKey}
                          onCheckedChange={(checked) =>
                            updateAttribute(index, "primaryKey", checked)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={attribute.foreignKey}
                          onCheckedChange={(checked) =>
                            updateAttribute(index, "foreignKey", checked)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={attribute.unique}
                          onCheckedChange={(checked) => updateAttribute(index, "unique", checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={attribute.nullable}
                          onCheckedChange={(checked) => updateAttribute(index, "nullable", checked)}
                        />
                      </TableCell>
                      <TableCell>
                        {attribute.foreignKey && (
                          <Select
                            value={attribute.foreignKeyTable || ""}
                            onValueChange={(value) =>
                              updateAttribute(index, "foreignKeyTable", value)
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select table" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableEntities
                                .filter((name) => name !== editedEntity.name)
                                .map((entityName) => (
                                  <SelectItem key={entityName} value={entityName}>
                                    {entityName}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                      <TableCell>
                        {attribute.foreignKey && (
                          <Input
                            value={attribute.foreignKeyAttribute || ""}
                            onChange={(e) =>
                              updateAttribute(index, "foreignKeyAttribute", e.target.value)
                            }
                            placeholder="Attribute name"
                            className="w-full"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeAttribute(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ERDEntityEditDialog;
