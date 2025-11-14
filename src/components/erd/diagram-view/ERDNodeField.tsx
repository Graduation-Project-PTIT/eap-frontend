import React, { useMemo, useEffect, useRef } from "react";
import { Handle, Position, useConnection, useUpdateNodeInternals, useStore } from "@xyflow/react";
import { Badge } from "@/components/ui/badge";
import { Key, Link, Type } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ERDEntity } from "@/api";
import {
  createLeftHandleId,
  createRightHandleId,
  createTargetHandleId,
  LEFT_HANDLE_ID_PREFIX,
  RIGHT_HANDLE_ID_PREFIX,
} from "./handle-constants";

export interface ERDNodeFieldProps {
  tableNodeId: string;
  entityName: string;
  attribute: ERDEntity["attributes"][0];
  focused: boolean;
  highlighted: boolean;
  isConnectable: boolean;
  readonly?: boolean;
}

export const ERDNodeField: React.FC<ERDNodeFieldProps> = React.memo(
  ({
    tableNodeId,
    entityName,
    attribute,
    focused,
    highlighted,
    isConnectable,
    readonly = false,
  }) => {
    const connection = useConnection();
    const updateNodeInternals = useUpdateNodeInternals();
    const edges = useStore((store) => store.edges);

    // Check if this field is a potential target during connection
    const isTarget = useMemo(() => {
      return (
        connection.inProgress &&
        connection.fromNode.id !== tableNodeId &&
        (connection.fromHandle.id?.startsWith(RIGHT_HANDLE_ID_PREFIX) ||
          connection.fromHandle.id?.startsWith(LEFT_HANDLE_ID_PREFIX))
      );
    }, [connection, tableNodeId]);

    // Count how many edges are connected to this field as a target
    const numberOfEdgesToField = useMemo(() => {
      let count = 0;
      const targetHandlePrefix =
        createTargetHandleId(entityName, attribute.name, attribute.type, 0).split("_")[0] +
        "_" +
        createTargetHandleId(entityName, attribute.name, attribute.type, 0).split("_")[1] +
        "_";

      for (const edge of edges) {
        if (edge.target === tableNodeId && edge.targetHandle?.startsWith(targetHandlePrefix)) {
          count++;
        }
      }
      return count;
    }, [edges, tableNodeId, entityName, attribute.name, attribute.type]);

    const previousNumberOfEdgesToFieldRef = useRef(numberOfEdgesToField);

    // Update node internals when the number of edges changes
    useEffect(() => {
      if (previousNumberOfEdgesToFieldRef.current !== numberOfEdgesToField) {
        const timer = setTimeout(() => {
          updateNodeInternals(tableNodeId);
          previousNumberOfEdgesToFieldRef.current = numberOfEdgesToField;
        }, 100);
        return () => clearTimeout(timer);
      }
    }, [tableNodeId, updateNodeInternals, numberOfEdgesToField]);

    // Get icon based on attribute type
    const getAttributeIcon = () => {
      if (attribute.primaryKey) {
        return <Key className="h-3 w-3 text-yellow-600" />;
      }
      if (attribute.foreignKey) {
        return <Link className="h-3 w-3 text-blue-600" />;
      }
      return <Type className="h-3 w-3 text-gray-500" />;
    };

    return (
      <div
        className={cn(
          "group relative flex h-8 items-center gap-2 text-sm py-1.5 px-2 rounded hover:bg-muted/50 transition-colors justify-between border-t first:border-t-0",
          {
            "bg-pink-100 dark:bg-pink-900": highlighted,
          },
        )}
      >
        {/* LEFT SOURCE HANDLE - Always render for all attributes */}
        {isConnectable && (
          <Handle
            id={createLeftHandleId(entityName, attribute.name, attribute.type)}
            className={cn(
              "!h-3 !w-3 !border-2 !bg-blue-400",
              !focused || readonly ? "!invisible" : "",
            )}
            position={Position.Left}
            type="source"
          />
        )}

        {/* RIGHT SOURCE HANDLE - Always render for all attributes */}
        {isConnectable && (
          <Handle
            id={createRightHandleId(entityName, attribute.name, attribute.type)}
            className={cn(
              "!h-3 !w-3 !border-2 !bg-blue-400",
              !focused || readonly ? "!invisible" : "",
            )}
            position={Position.Right}
            type="source"
          />
        )}

        {/* MULTIPLE TARGET HANDLES - For existing connections */}
        {(!connection.inProgress || isTarget) && isConnectable && (
          <>
            {Array.from({ length: numberOfEdgesToField }, (_, index) => index).map((index) => (
              <Handle
                key={`${createTargetHandleId(entityName, attribute.name, attribute.type, index)}`}
                id={createTargetHandleId(entityName, attribute.name, attribute.type, index)}
                className="!invisible"
                position={Position.Left}
                type="target"
              />
            ))}
            {/* Additional target handle for new connections */}
            <Handle
              id={createTargetHandleId(
                entityName,
                attribute.name,
                attribute.type,
                numberOfEdgesToField,
              )}
              className={
                isTarget
                  ? "!absolute !left-0 !top-0 !h-full !w-full !transform-none !rounded-none !border-none !opacity-0"
                  : "!invisible"
              }
              position={Position.Left}
              type="target"
            />
          </>
        )}

        {/* Attribute Content */}
        <div className="flex items-center gap-2 min-w-0">
          {getAttributeIcon()}
          <span className="font-mono text-xs flex-1 truncate">{attribute.name}</span>
          <span className="text-xs text-muted-foreground">{attribute.type}</span>
        </div>

        {/* Badges */}
        <div className="flex gap-1 shrink-0">
          {attribute.primaryKey && (
            <Badge variant="default" className="text-[10px] px-1 py-0">
              PK
            </Badge>
          )}
          {attribute.foreignKey && (
            <Badge variant="secondary" className="text-[10px] px-1 py-0">
              FK
            </Badge>
          )}
          {attribute.unique && (
            <Badge variant="outline" className="text-[10px] px-1 py-0">
              U
            </Badge>
          )}
          {!attribute.nullable && (
            <Badge variant="outline" className="text-[10px] px-1 py-0">
              NN
            </Badge>
          )}
        </div>
      </div>
    );
  },
);

ERDNodeField.displayName = "ERDNodeField";
