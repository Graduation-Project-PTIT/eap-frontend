import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Save, Key, Link, Type } from "lucide-react";
import type { ERDEntity } from "@/api";

interface TableEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entity: ERDEntity;
  onSave: (entity: ERDEntity) => void;
  availableEntities?: string[];
}

const TableEditDialog: React.FC<TableEditDialogProps> = ({
  open,
  onOpenChange,
  entity,
  onSave,
}) => {
  const [editedEntity, setEditedEntity] = useState<ERDEntity>(entity);

  useEffect(() => {
    setEditedEntity(entity);
  }, [entity]);

  // Helper to create unique key for each attribute (matches handle ID system)
  const getAttributeKey = (attr: ERDEntity["attributes"][0]) => {
    const sanitizedName = attr.name.replace(/[^a-zA-Z0-9]/g, "_");
    const sanitizedType = attr.type.replace(/[^a-zA-Z0-9]/g, "_");
    return `${sanitizedName}-${sanitizedType}`;
  };

  const handleSave = () => {
    onSave(editedEntity);
    onOpenChange(false);
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

  const removeAttribute = (attributeKey: string) => {
    setEditedEntity({
      ...editedEntity,
      attributes: editedEntity.attributes.filter((attr) => getAttributeKey(attr) !== attributeKey),
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateAttribute = (attributeKey: string, field: string, value: any) => {
    setEditedEntity({
      ...editedEntity,
      attributes: editedEntity.attributes.map((attr) =>
        getAttributeKey(attr) === attributeKey ? { ...attr, [field]: value } : attr,
      ),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[45vw] max-h-[70vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Table: {entity.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="table-name">Table Name</Label>
            <Input
              id="table-name"
              value={editedEntity.name}
              onChange={(e) => setEditedEntity({ ...editedEntity, name: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Attributes</Label>
              <Button onClick={addAttribute} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Attribute
              </Button>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">Type</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Data Type</TableHead>
                    <TableHead className="w-[80px]">PK</TableHead>
                    <TableHead className="w-[80px]">FK</TableHead>
                    <TableHead className="w-[80px]">Unique</TableHead>
                    <TableHead className="w-[80px]">Nullable</TableHead>
                    <TableHead className="w-[60px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {editedEntity.attributes.map((attr) => {
                    const attributeKey = getAttributeKey(attr);
                    return (
                      <TableRow key={attributeKey}>
                        <TableCell>
                          {attr.primaryKey ? (
                            <Key className="h-4 w-4 text-yellow-600" />
                          ) : attr.foreignKey ? (
                            <Link className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Type className="h-4 w-4 text-gray-500" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Input
                            value={attr.name}
                            onChange={(e) => updateAttribute(attributeKey, "name", e.target.value)}
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={attr.type}
                            onChange={(e) => updateAttribute(attributeKey, "type", e.target.value)}
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell>
                          <Checkbox
                            checked={attr.primaryKey}
                            onCheckedChange={(checked) =>
                              updateAttribute(attributeKey, "primaryKey", checked)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Checkbox
                            checked={attr.foreignKey}
                            onCheckedChange={(checked) =>
                              updateAttribute(attributeKey, "foreignKey", checked)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Checkbox
                            checked={attr.unique}
                            onCheckedChange={(checked) =>
                              updateAttribute(attributeKey, "unique", checked)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Checkbox
                            checked={attr.nullable}
                            onCheckedChange={(checked) =>
                              updateAttribute(attributeKey, "nullable", checked)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            onClick={() => removeAttribute(attributeKey)}
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TableEditDialog;
