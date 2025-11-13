import React, { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Edit3, Database, Plus, Trash2, Save, Key, Link, Type } from "lucide-react";
import type { ERDEntity } from "@/api";
import type { ERDAttribute } from "../ERDTableTabs";

// EntityTable component for individual entity display
interface EntityTableProps {
  entity: ERDEntity;
  isEditable: boolean;
  availableEntities: string[];
  onEntityChange: (entity: ERDEntity) => void;
  onEntityDelete: () => void;
}

// Helper functions
const getAttributeIcon = (attribute: ERDAttribute) => {
  if (attribute.primaryKey) {
    return <Key className="h-3 w-3 text-yellow-600" />;
  }
  if (attribute.foreignKey) {
    return <Link className="h-3 w-3 text-blue-600" />;
  }
  return <Type className="h-3 w-3 text-gray-500" />;
};

const getAttributeBadgeVariant = (attribute: ERDAttribute) => {
  if (attribute.primaryKey) return "default";
  if (attribute.foreignKey) return "secondary";
  if (attribute.unique) return "outline";
  return "secondary";
};

const EntityTable: React.FC<EntityTableProps> = ({
  entity,
  isEditable,
  availableEntities,
  onEntityChange,
  onEntityDelete,
}) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedEntity, setEditedEntity] = useState<ERDEntity>(entity);

  // Update edited entity when prop changes
  useEffect(() => {
    setEditedEntity(entity);
  }, [entity]);

  const handleSaveChanges = () => {
    onEntityChange(editedEntity);
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

  const getRelationshipInfo = (attribute: ERDAttribute) => {
    if (!attribute.foreignKey || !attribute.foreignKeyTable) return null;

    return {
      table: attribute.foreignKeyTable,
      column: attribute.foreignKeyAttribute || "id",
      type: attribute.relationType || "many-to-one",
    };
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>{entity.name}</span>
            <Badge variant="outline" className="text-xs">
              {entity.attributes.length} attributes
            </Badge>
          </div>
          {isEditable && (
            <div className="flex items-center space-x-2">
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Entity
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Entity: {entity.name}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Entity Name</label>
                      <Input
                        value={editedEntity.name}
                        onChange={(e) => setEditedEntity({ ...editedEntity, name: e.target.value })}
                        placeholder="Entity name"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">Attributes</label>
                        <Button variant="outline" size="sm" onClick={addAttribute}>
                          <Plus className="h-4 w-4 mr-2" />
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
                            <TableHead>Unique</TableHead>
                            <TableHead>Nullable</TableHead>
                            <TableHead>FK Table</TableHead>
                            <TableHead>FK Column</TableHead>
                            <TableHead>Relation</TableHead>
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
                                  className="w-full"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={attr.type}
                                  onChange={(e) => updateAttribute(index, "type", e.target.value)}
                                  className="w-full"
                                />
                              </TableCell>
                              <TableCell>
                                <Checkbox
                                  checked={attr.primaryKey}
                                  onCheckedChange={(checked) =>
                                    updateAttribute(index, "primaryKey", checked)
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <Checkbox
                                  checked={attr.foreignKey}
                                  onCheckedChange={(checked) =>
                                    updateAttribute(index, "foreignKey", checked)
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <Checkbox
                                  checked={attr.unique}
                                  onCheckedChange={(checked) =>
                                    updateAttribute(index, "unique", checked)
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <Checkbox
                                  checked={attr.nullable}
                                  onCheckedChange={(checked) =>
                                    updateAttribute(index, "nullable", checked)
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                {attr.foreignKey && (
                                  <Select
                                    value={attr.foreignKeyTable || ""}
                                    onValueChange={(value) =>
                                      updateAttribute(index, "foreignKeyTable", value)
                                    }
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Select table" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {availableEntities
                                        .filter((name) => name !== entity.name)
                                        .map((name) => (
                                          <SelectItem key={name} value={name}>
                                            {name}
                                          </SelectItem>
                                        ))}
                                    </SelectContent>
                                  </Select>
                                )}
                              </TableCell>
                              <TableCell>
                                {attr.foreignKey && (
                                  <Input
                                    value={attr.foreignKeyAttribute || ""}
                                    onChange={(e) =>
                                      updateAttribute(index, "foreignKeyAttribute", e.target.value)
                                    }
                                    placeholder="id"
                                    className="w-full"
                                  />
                                )}
                              </TableCell>
                              <TableCell>
                                {attr.foreignKey && (
                                  <Select
                                    value={attr.relationType || "many-to-one"}
                                    onValueChange={(value) =>
                                      updateAttribute(index, "relationType", value)
                                    }
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="one-to-one">One-to-One</SelectItem>
                                      <SelectItem value="one-to-many">One-to-Many</SelectItem>
                                      <SelectItem value="many-to-one">Many-to-One</SelectItem>
                                      <SelectItem value="many-to-many">Many-to-Many</SelectItem>
                                    </SelectContent>
                                  </Select>
                                )}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeAttribute(index)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button variant="destructive" onClick={onEntityDelete}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Entity
                      </Button>
                      <div className="flex space-x-2">
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSaveChanges}>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>Attribute</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Constraints</TableHead>
              <TableHead>Relationships</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entity.attributes.map((attribute, index) => {
              const relationshipInfo = getRelationshipInfo(attribute);
              return (
                <TableRow key={index}>
                  <TableCell>{getAttributeIcon(attribute)}</TableCell>
                  <TableCell className="font-medium">{attribute.name}</TableCell>
                  <TableCell>
                    <Badge variant={getAttributeBadgeVariant(attribute)} className="text-xs">
                      {attribute.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {attribute.primaryKey && (
                        <Badge variant="default" className="text-xs">
                          PK
                        </Badge>
                      )}
                      {attribute.unique && (
                        <Badge variant="outline" className="text-xs">
                          UNIQUE
                        </Badge>
                      )}
                      {!attribute.nullable && (
                        <Badge variant="secondary" className="text-xs">
                          NOT NULL
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {relationshipInfo && (
                      <div className="flex flex-col space-y-1">
                        <Badge variant="secondary" className="text-xs w-fit">
                          FK → {relationshipInfo.table}.{relationshipInfo.column}
                        </Badge>
                        <Badge variant="outline" className="text-xs w-fit">
                          {relationshipInfo.type.toUpperCase()}
                        </Badge>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default EntityTable;
