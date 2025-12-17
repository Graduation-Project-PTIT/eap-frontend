import { useState, useMemo } from "react";
import type { DBEntity } from "@/api";
import type { Node, NodeProps } from "@xyflow/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database, Edit3 } from "lucide-react";
import TableEditDialog from "./TableEditDialog";
import { DBNodeField } from "./DBNodeField";

export type DBNodeData = {
  entity: DBEntity;
  isEditable: boolean;
  onEntityUpdate?: (entity: DBEntity) => void;
};

type DBNodeProps = Node<DBNodeData, "dbNode">;

const DBNode = ({ data, selected, id }: NodeProps<DBNodeProps>) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const { entity, isEditable, onEntityUpdate } = data;

  const focused = useMemo(() => selected || isHovering, [selected, isHovering]);

  const handleSave = (updatedEntity: DBEntity) => {
    if (onEntityUpdate) {
      onEntityUpdate(updatedEntity);
    }
  };

  return (
    <>
      <Card
        className="min-w-[280px] shadow-lg border-2 hover:shadow-xl transition-shadow py-2"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-600" />
              <span className="font-semibold">{entity.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {entity.attributes.length}
              </Badge>
              {isEditable && (
                <Button
                  onClick={() => setIsEditDialogOpen(true)}
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-0 px-0 mt-[-2rem]">
          <div>
            {entity.attributes
              .sort((a, b) => {
                if (a.primaryKey && !b.primaryKey) return -1;
                if (!a.primaryKey && b.primaryKey) return 1;
                return 0;
              })
              .sort((a, b) => {
                if (a.foreignKey && !b.foreignKey) return 1;
                if (!a.foreignKey && b.foreignKey) return -1;
                return 0;
              })
              .map((attribute, index) => (
                <DBNodeField
                  key={`${entity.name}-${attribute.name}-${attribute.type}-${index}`}
                  tableNodeId={id}
                  entityName={entity.name}
                  attribute={attribute}
                  focused={focused}
                  highlighted={false}
                  isConnectable={true}
                  readonly={!isEditable}
                />
              ))}
          </div>
        </CardContent>
      </Card>

      {isEditable && (
        <TableEditDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          entity={entity}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default DBNode;
