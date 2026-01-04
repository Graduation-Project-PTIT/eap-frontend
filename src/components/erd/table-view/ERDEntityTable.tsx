import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Database, Key, Link, Type } from "lucide-react";
import type { DBAttribute, DBEntity } from "@/api";
import type { ERDAttribute, ERDEntity } from "../erd-diagram-view/types";
import EditEntityDialog from "./EditEntityDialog";

// EntityTable component for individual entity display
interface EntityTableProps {
  entity: DBEntity | ERDEntity;
  isEditable: boolean;
  availableEntities: string[];
  onEntityChange: (entity: DBEntity | ERDEntity) => void;
  onEntityDelete: () => void;
}

// Helper functions
const getAttributeIcon = (attribute: DBAttribute | ERDAttribute) => {
  if (attribute.primaryKey) {
    return <Key className="h-3 w-3 text-yellow-600" />;
  }
  if (attribute.foreignKey) {
    return <Link className="h-3 w-3 text-blue-600" />;
  }
  return <Type className="h-3 w-3 text-gray-500" />;
};

const getAttributeBadgeVariant = (attribute: DBAttribute | ERDAttribute) => {
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
  const [editedEntity, setEditedEntity] = useState<DBEntity | ERDEntity>(entity);

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

  const getRelationshipInfo = (attribute: DBAttribute | ERDAttribute) => {
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
            <EditEntityDialog
              isOpen={isEditDialogOpen}
              onOpenChange={setIsEditDialogOpen}
              defaultEntity={entity}
              editedEntity={editedEntity}
              availableEntities={availableEntities}
              onEntityDelete={onEntityDelete}
              setEditedEntity={setEditedEntity}
              addAttribute={addAttribute}
              removeAttribute={removeAttribute}
              updateAttribute={updateAttribute}
              handleSave={handleSaveChanges}
            />
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
