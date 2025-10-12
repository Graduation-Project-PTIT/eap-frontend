import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Edit3,
  Key,
  Link,
  Type,
  Database,
  Plus,
  Trash2,
  Save,
  Grid3x3,
  TableIcon,
} from "lucide-react";
import { type ERDExtractionResult, type ERDEntity } from "@/api/services/evaluation-service";
import ERDDiagramCanvas from "./diagram/ERDDiagramCanvas";

// Define the attribute type based on the ERDEntity interface
type ERDAttribute = ERDEntity["attributes"][0];

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

type ViewMode = "table" | "diagram";

interface ERDTableTabsProps {
  data: ERDExtractionResult;
  onDataChange?: (data: ERDExtractionResult) => void;
  isEditable?: boolean;
  className?: string;
}

const ERDTableTabs: React.FC<ERDTableTabsProps> = ({
  data,
  onDataChange,
  isEditable = false,
  className,
}) => {
  const [activeTab, setActiveTab] = useState<string>(data.entities[0]?.name || "");
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  // Update active tab when data changes
  useEffect(() => {
    if (!activeTab && data.entities.length > 0) {
      setActiveTab(data.entities[0].name);
    }
  }, [data.entities, activeTab]);

  const handleEntityChange = (entityName: string, updatedEntity: ERDEntity) => {
    if (onDataChange) {
      const updatedEntities = data.entities.map((e) => (e.name === entityName ? updatedEntity : e));
      onDataChange({
        entities: updatedEntities,
        ddlScript: data.ddlScript,
        mermaidDiagram: data.mermaidDiagram,
      });
    }
  };

  const handleDeleteEntity = (entityName: string) => {
    if (onDataChange) {
      const updatedEntities = data.entities.filter((e) => e.name !== entityName);
      onDataChange({
        entities: updatedEntities,
        ddlScript: data.ddlScript,
        mermaidDiagram: data.mermaidDiagram,
      });

      // Switch to first available tab
      if (activeTab === entityName && updatedEntities.length > 0) {
        setActiveTab(updatedEntities[0].name);
      }
    }
  };

  if (data.entities.length === 0) {
    return (
      <div className={className || "w-full h-[55vh] border rounded-lg bg-background"}>
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Entities Found</h3>
          <p className="text-gray-500">
            No entities are available to display. Please complete the extraction step first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className || "w-full h-[55vh] border rounded-lg bg-background"}>
      <div className="h-full flex flex-col">
        {/* View Toggle Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold">ERD Structure</h3>
            <Badge variant="outline" className="text-xs">
              {data.entities.length} entities
            </Badge>
          </div>

          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="h-8 px-3"
            >
              <TableIcon className="h-4 w-4 mr-1" />
              Table
            </Button>
            <Button
              variant={viewMode === "diagram" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("diagram")}
              className="h-8 px-3"
            >
              <Grid3x3 className="h-4 w-4 mr-1" />
              Diagram
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {viewMode === "table" ? (
            <div className="h-full p-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                <TabsList className="flex w-full overflow-x-auto">
                  {data.entities.map((entity) => (
                    <TabsTrigger
                      key={entity.name}
                      value={entity.name}
                      className="flex items-center space-x-2"
                    >
                      <Database className="h-4 w-4" />
                      <span>{entity.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {entity.attributes.length}
                      </Badge>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {data.entities.map((entity) => (
                  <TabsContent key={entity.name} value={entity.name} className="mt-4 h-full">
                    <EntityTable
                      entity={entity}
                      isEditable={isEditable}
                      availableEntities={data.entities.map((e) => e.name)}
                      onEntityChange={(updatedEntity) =>
                        handleEntityChange(entity.name, updatedEntity)
                      }
                      onEntityDelete={() => handleDeleteEntity(entity.name)}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          ) : (
            <ERDDiagramCanvas
              data={data}
              onDataChange={onDataChange}
              isEditable={isEditable}
              className="w-full h-full"
              onEntityEdit={(entityName) => {
                setActiveTab(entityName);
                setViewMode("table");
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// EntityTable component for individual entity display
interface EntityTableProps {
  entity: ERDEntity;
  isEditable: boolean;
  availableEntities: string[];
  onEntityChange: (entity: ERDEntity) => void;
  onEntityDelete: () => void;
}

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

export default ERDTableTabs;
