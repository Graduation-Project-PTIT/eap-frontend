import React, { useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit3, Key, Link, Type, Database, Plus, Trash2 } from "lucide-react";
import { type ERDEntity } from "@/api/services/evaluation-service";

interface EntityNodeData {
  entity: ERDEntity;
  isEditable: boolean;
  onEntityChange?: (entity: ERDEntity) => void;
  onEntityDelete?: () => void;
  availableEntities?: string[]; // List of available entities for foreign key relationships
}

const EntityNode: React.FC<NodeProps> = ({ data }) => {
  const {
    entity,
    isEditable,
    onEntityChange,
    onEntityDelete,
    availableEntities = [],
  } = data as unknown as EntityNodeData;
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedEntity, setEditedEntity] = useState<ERDEntity>(entity);

  const handleSaveChanges = () => {
    if (onEntityChange) {
      onEntityChange(editedEntity);
    }
    setIsEditDialogOpen(false);
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
          foreignKeyTable: "",
          foreignKeyAttribute: "",
          relationType: "many-to-one",
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

  const updateAttribute = (index: number, field: string, value: unknown) => {
    setEditedEntity({
      ...editedEntity,
      attributes: editedEntity.attributes.map((attr, i) =>
        i === index ? { ...attr, [field]: value } : attr,
      ),
    });
  };

  const getAttributeIcon = (attribute: ERDEntity["attributes"][0]) => {
    if (attribute.primaryKey) return <Key className="h-3 w-3 text-yellow-500" />;
    if (attribute.foreignKey) return <Link className="h-3 w-3 text-blue-500" />;
    return <Type className="h-3 w-3 text-gray-500" />;
  };

  const getAttributeBadgeVariant = (attribute: ERDEntity["attributes"][0]) => {
    if (attribute.primaryKey) return "default";
    if (attribute.foreignKey) return "secondary";
    return "outline";
  };

  return (
    <>
      <Handle type="target" position={Position.Top} />

      <Card className="w-[250px] shadow-lg border-2 border-blue-200 bg-white">
        <CardHeader className="pb-2 bg-blue-50">
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4 text-blue-600" />
              <span className="font-bold text-blue-800">{entity.name}</span>
            </div>
            {isEditable && (
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Edit3 className="h-3 w-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Entity: {entity.name}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Entity Name</label>
                      <Input
                        value={editedEntity.name}
                        onChange={(e) => setEditedEntity({ ...editedEntity, name: e.target.value })}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">Attributes</label>
                        <Button onClick={addAttribute} size="sm">
                          <Plus className="h-4 w-4 mr-1" />
                          Add Attribute
                        </Button>
                      </div>

                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>PK</TableHead>
                            <TableHead>FK</TableHead>
                            <TableHead>FK Table</TableHead>
                            <TableHead>FK Attribute</TableHead>
                            <TableHead>Relation Type</TableHead>
                            <TableHead>Unique</TableHead>
                            <TableHead>Nullable</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {editedEntity.attributes.map((attr, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Input
                                  value={attr.name}
                                  onChange={(e) => updateAttribute(index, "name", e.target.value)}
                                  className="h-8"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={attr.type}
                                  onChange={(e) => updateAttribute(index, "type", e.target.value)}
                                  className="h-8"
                                />
                              </TableCell>
                              <TableCell>
                                <input
                                  type="checkbox"
                                  checked={attr.primaryKey}
                                  onChange={(e) =>
                                    updateAttribute(index, "primaryKey", e.target.checked)
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <input
                                  type="checkbox"
                                  checked={attr.foreignKey}
                                  onChange={(e) =>
                                    updateAttribute(index, "foreignKey", e.target.checked)
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={attr.foreignKeyTable || ""}
                                  onValueChange={(value) =>
                                    updateAttribute(index, "foreignKeyTable", value)
                                  }
                                  disabled={!attr.foreignKey}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue placeholder="Select table" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableEntities
                                      .filter((entityName) => entityName !== entity.name)
                                      .map((entityName) => (
                                        <SelectItem key={entityName} value={entityName}>
                                          {entityName}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={attr.foreignKeyAttribute || ""}
                                  onChange={(e) =>
                                    updateAttribute(index, "foreignKeyAttribute", e.target.value)
                                  }
                                  className="h-8"
                                  disabled={!attr.foreignKey}
                                  placeholder="id"
                                />
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={attr.relationType || "many-to-one"}
                                  onValueChange={(value) =>
                                    updateAttribute(index, "relationType", value)
                                  }
                                  disabled={!attr.foreignKey}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="one-to-one">1:1</SelectItem>
                                    <SelectItem value="one-to-many">1:N</SelectItem>
                                    <SelectItem value="many-to-one">N:1</SelectItem>
                                    <SelectItem value="many-to-many">N:N</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <input
                                  type="checkbox"
                                  checked={attr.unique}
                                  onChange={(e) =>
                                    updateAttribute(index, "unique", e.target.checked)
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <input
                                  type="checkbox"
                                  checked={attr.nullable}
                                  onChange={(e) =>
                                    updateAttribute(index, "nullable", e.target.checked)
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeAttribute(index)}
                                  className="h-6 w-6 p-0 text-red-500"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="flex justify-between">
                      <Button
                        variant="destructive"
                        onClick={() => {
                          if (onEntityDelete) {
                            onEntityDelete();
                          }
                          setIsEditDialogOpen(false);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Entity
                      </Button>
                      <div className="flex space-x-2">
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSaveChanges}>Save Changes</Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-2">
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {entity.attributes.slice(0, 6).map((attribute, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-xs p-1 rounded hover:bg-gray-50"
              >
                <div className="flex items-center space-x-1 flex-1 min-w-0">
                  {getAttributeIcon(attribute)}
                  <span className="truncate font-medium">{attribute.name}</span>
                </div>
                <Badge variant={getAttributeBadgeVariant(attribute)} className="text-xs px-1 py-0">
                  {attribute.type}
                </Badge>
              </div>
            ))}
            {entity.attributes.length > 6 && (
              <div className="text-xs text-gray-500 text-center py-1">
                +{entity.attributes.length - 6} more attributes
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Handle type="source" position={Position.Bottom} />
    </>
  );
};

export default EntityNode;
