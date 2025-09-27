import React, { memo, useState } from "react";
import { Handle, Position } from "reactflow";
import type { NodeProps } from "reactflow";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database, Key, Link, Type, Edit3, MoreVertical, Plus, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ERDNodeData } from "../utils/erdDataTransformer";
import type { ERDEntity } from "@/api/services/evaluation-service";

type ERDEntityNodeProps = NodeProps<ERDNodeData>;

const ERDEntityNode: React.FC<ERDEntityNodeProps> = memo(({ data, selected }) => {
  const { entity, onEdit, onDelete, onAddAttribute, isEditable = false } = data;
  const [isHovered, setIsHovered] = useState(false);

  const getAttributeIcon = (attribute: ERDEntity["attributes"][0]) => {
    if (attribute.primaryKey) {
      return <Key className="h-3 w-3 text-yellow-600" />;
    }
    if (attribute.foreignKey) {
      return <Link className="h-3 w-3 text-blue-600" />;
    }
    return <Type className="h-3 w-3 text-gray-500" />;
  };

  const getAttributeBadgeVariant = (attribute: ERDEntity["attributes"][0]) => {
    if (attribute.primaryKey) return "default";
    if (attribute.foreignKey) return "secondary";
    if (attribute.unique) return "outline";
    return "secondary";
  };

  const getConstraintBadges = (attribute: ERDEntity["attributes"][0]) => {
    const badges = [];
    if (attribute.primaryKey) badges.push("PK");
    if (attribute.foreignKey) badges.push("FK");
    if (attribute.unique && !attribute.primaryKey) badges.push("UQ");
    if (!attribute.nullable) badges.push("NN");
    return badges;
  };

  return (
    <div
      className={`relative ${selected ? "ring-2 ring-blue-500" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className={`w-3 h-3 !bg-blue-500 border-2 border-white transition-all duration-200 ${
          isHovered || selected ? "opacity-100 scale-110" : "opacity-60"
        }`}
      />
      <Handle
        type="source"
        position={Position.Right}
        className={`w-3 h-3 !bg-blue-500 border-2 border-white transition-all duration-200 ${
          isHovered || selected ? "opacity-100 scale-110" : "opacity-60"
        }`}
      />

      <Card
        className={`w-64 shadow-lg bg-white transition-all duration-200 ${
          selected
            ? "border-blue-500 shadow-blue-200"
            : isHovered
              ? "border-gray-300 shadow-xl"
              : "border-gray-200"
        }`}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-sm text-gray-900">{entity.name}</h3>
            </div>

            {isEditable && (isHovered || selected) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit?.(entity.name)}>
                    <Edit3 className="h-3 w-3 mr-2" />
                    Edit Entity
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAddAttribute?.(entity.name)}>
                    <Plus className="h-3 w-3 mr-2" />
                    Add Attribute
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete?.(entity.name)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-3 w-3 mr-2" />
                    Delete Entity
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <Badge variant="outline" className="text-xs w-fit">
            {entity.attributes.length} attributes
          </Badge>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {entity.attributes.map((attribute, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-1.5 rounded hover:bg-gray-50 text-xs"
              >
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  {getAttributeIcon(attribute)}
                  <span className="font-medium truncate">{attribute.name}</span>
                </div>

                <div className="flex items-center space-x-1">
                  <Badge
                    variant={getAttributeBadgeVariant(attribute)}
                    className="text-xs px-1 py-0"
                  >
                    {attribute.type}
                  </Badge>

                  {getConstraintBadges(attribute).map((badge, badgeIndex) => (
                    <Badge key={badgeIndex} variant="outline" className="text-xs px-1 py-0">
                      {badge}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {entity.attributes.length === 0 && (
            <div className="text-center py-4 text-gray-500 text-xs">No attributes defined</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

ERDEntityNode.displayName = "ERDEntityNode";

export default ERDEntityNode;
