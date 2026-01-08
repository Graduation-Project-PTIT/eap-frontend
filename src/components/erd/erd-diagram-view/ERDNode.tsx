import type { Node, NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";
import { cn } from "@/lib/utils";
import type { ERDEntityNodeData, ERDAttributeNodeData, ERDRelationshipNodeData } from "./types";

// ============================================
// Entity Node - Rectangle shape
// Colors: Blue for regular entity, Light blue for weak entity
// ============================================
type EntityNodeProps = Node<ERDEntityNodeData, "erdEntityNode">;

export const ERDEntityNode = ({ data, selected }: NodeProps<EntityNodeProps>) => {
  const isWeakEntity = data.type === "weak-entity";

  return (
    <div
      className={cn(
        "relative px-6 py-4 border-2 rounded-sm min-w-[120px] text-center shadow-md transition-shadow",
        // Color based on entity type
        isWeakEntity
          ? "bg-blue-100 border-blue-600 border-double border-4"
          : "bg-blue-200 border-blue-700",
        selected && "shadow-lg ring-2 ring-blue-500",
      )}
    >
      {/* Connection handles - entities need both source and target handles */}
      {/* Source handles for connecting to attributes and relationships */}
      <Handle
        type="source"
        position={Position.Top}
        className="!w-2 !h-2 !bg-blue-600"
        id="top-source"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-blue-600"
        id="right-source"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-blue-600"
        id="bottom-source"
      />
      <Handle
        type="source"
        position={Position.Left}
        className="!w-2 !h-2 !bg-blue-600"
        id="left-source"
      />

      {/* Target handles for receiving connections from relationships */}
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-blue-600" id="top" />
      <Handle
        type="target"
        position={Position.Right}
        className="!w-2 !h-2 !bg-blue-600"
        id="right"
      />
      <Handle
        type="target"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-blue-600"
        id="bottom"
      />
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-blue-600" id="left" />

      <span className="font-semibold text-blue-900 text-sm">{data.label}</span>
    </div>
  );
};

// ============================================
// Attribute Node - Ellipse/Oval shape
// Colors:
// - Key Attribute: Yellow/gold
// - Regular Attribute: Light gray
// - Multivalued Attribute: Light purple
// - Derived Attribute: Light orange
// - Composite Attribute: Light green
// ============================================
type AttributeNodeProps = Node<ERDAttributeNodeData, "erdAttributeNode">;

export const ERDAttributeNode = ({ data, selected }: NodeProps<AttributeNodeProps>) => {
  const isKeyAttribute = data.type === "key-attribute";
  const isMultivalued = data.type === "multivalued-attribute";
  const isDerived = data.type === "derived-attribute";
  const isComposite = data.type === "composite-attribute";
  const isPartialKey = data.isPartialKey;

  // Determine colors based on attribute type
  const getAttributeColors = () => {
    if (isKeyAttribute) {
      return {
        bg: "bg-amber-100",
        border: "border-amber-600",
        text: "text-amber-900",
        handle: "!bg-amber-600",
      };
    }
    if (isMultivalued) {
      return {
        bg: "bg-purple-100",
        border: "border-purple-600",
        text: "text-purple-900",
        handle: "!bg-purple-600",
      };
    }
    if (isDerived) {
      return {
        bg: "bg-orange-100",
        border: "border-orange-600",
        text: "text-orange-900",
        handle: "!bg-orange-600",
      };
    }
    if (isComposite) {
      return {
        bg: "bg-emerald-100",
        border: "border-emerald-600",
        text: "text-emerald-900",
        handle: "!bg-emerald-600",
      };
    }
    if (isPartialKey) {
      return {
        bg: "bg-amber-100",
        border: "border-amber-600",
        text: "text-amber-900",
        handle: "!bg-amber-600",
      };
    }
    // Regular attribute
    return {
      bg: "bg-slate-100",
      border: "border-slate-500",
      text: "text-slate-800",
      handle: "!bg-slate-500",
    };
  };

  const colors = getAttributeColors();

  return (
    <div
      className={cn(
        "relative px-4 py-2 border-2 min-w-[80px] text-center shadow-sm transition-shadow",
        // Ellipse shape using border-radius
        "rounded-[50%]",
        // Background and border colors
        colors.bg,
        colors.border,
        // Multivalued: double border
        isMultivalued && "border-double border-4",
        // Derived: dashed border
        isDerived && "border-dashed",
        // Composite: slightly larger to indicate it has sub-attributes
        isComposite && "min-w-[100px]",
        selected && "shadow-lg ring-2 ring-blue-500",
      )}
    >
      {/* Target handles for receiving connections from entities or parent attributes */}
      <Handle
        type="target"
        position={Position.Left}
        className={cn("!w-2 !h-2", colors.handle)}
        id="left"
      />
      <Handle
        type="target"
        position={Position.Right}
        className={cn("!w-2 !h-2", colors.handle)}
        id="right"
      />
      <Handle
        type="target"
        position={Position.Top}
        className={cn("!w-2 !h-2", colors.handle)}
        id="top"
      />
      <Handle
        type="target"
        position={Position.Bottom}
        className={cn("!w-2 !h-2", colors.handle)}
        id="bottom"
      />

      {/* Source handles for connecting to sub-attributes (composite attributes) */}
      <Handle
        type="source"
        position={Position.Left}
        className={cn("!w-2 !h-2", colors.handle)}
        id="left-source"
      />
      <Handle
        type="source"
        position={Position.Right}
        className={cn("!w-2 !h-2", colors.handle)}
        id="right-source"
      />
      <Handle
        type="source"
        position={Position.Top}
        className={cn("!w-2 !h-2", colors.handle)}
        id="top-source"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className={cn("!w-2 !h-2", colors.handle)}
        id="bottom-source"
      />

      <span
        className={cn(
          "text-xs",
          colors.text,
          // Key attribute: underlined text
          isKeyAttribute && "underline decoration-2",
          isPartialKey && "underline decoration-2 decoration-dashed",
        )}
      >
        {data.label}
      </span>
    </div>
  );
};

// ============================================
// Relationship Node - Diamond shape
// Color: Rose/pink for relationships
// ============================================
type RelationshipNodeProps = Node<ERDRelationshipNodeData, "erdRelationshipNode">;

export const ERDRelationshipNode = ({ data, selected }: NodeProps<RelationshipNodeProps>) => {
  const isIdentifying = data.isIdentifying;

  if (isIdentifying) {
    console.log(data.sourceEntity, "is a weak entity and depends on", data.targetEntity);
  }

  const additionalClasses = isIdentifying ? "ring-2 ring-offset-1 ring-rose-600" : "";

  return (
    <div className="relative w-[140px] h-[140px] flex items-center justify-center">
      {/* Connection handles positioned at diamond vertices (peaks) */}
      {/* Each vertex has both a target handle (for incoming edges) and source handle (for outgoing edges) */}

      {/* Top vertex */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-rose-600"
        id="top"
        style={{ top: "0px", left: "50%", transform: "translate(-50%, -50%)" }}
      />
      <Handle
        type="source"
        position={Position.Top}
        className="!w-2 !h-2 !bg-rose-600"
        id="top-source"
        style={{ top: "0px", left: "50%", transform: "translate(-50%, -50%)" }}
      />

      {/* Right vertex */}
      <Handle
        type="target"
        position={Position.Right}
        className="!w-2 !h-2 !bg-rose-600"
        id="right"
        style={{ right: "0px", top: "50%", transform: "translate(50%, -50%)" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-rose-600"
        id="right-source"
        style={{ right: "0px", top: "50%", transform: "translate(50%, -50%)" }}
      />

      {/* Bottom vertex */}
      <Handle
        type="target"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-rose-600"
        id="bottom"
        style={{ bottom: "0px", left: "50%", transform: "translate(-50%, 50%)" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-rose-600"
        id="bottom-source"
        style={{ bottom: "0px", left: "50%", transform: "translate(-50%, 50%)" }}
      />

      {/* Left vertex */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-rose-600"
        id="left"
        style={{ left: "0px", top: "50%", transform: "translate(-50%, -50%)" }}
      />
      <Handle
        type="source"
        position={Position.Left}
        className="!w-2 !h-2 !bg-rose-600"
        id="left-source"
        style={{ left: "0px", top: "50%", transform: "translate(-50%, -50%)" }}
      />

      {/* Diamond shape using rotated square */}
      <div
        className={cn(
          "w-[100px] h-[100px] bg-rose-100 border-2 border-rose-600 shadow-md transition-shadow",
          "flex items-center justify-center",
          "rotate-45",
          additionalClasses,
          selected && "shadow-lg ring-2 ring-blue-500",
        )}
      >
        {/* Counter-rotate the text to keep it horizontal */}
        <span className="text-rose-900 text-xs font-medium px-2 -rotate-45 max-w-[80px] text-center break-words">
          {data.label}
        </span>
      </div>
    </div>
  );
};

// Export node types mapping for React Flow
export const erdNodeTypes = {
  erdEntityNode: ERDEntityNode,
  erdAttributeNode: ERDAttributeNode,
  erdRelationshipNode: ERDRelationshipNode,
};
