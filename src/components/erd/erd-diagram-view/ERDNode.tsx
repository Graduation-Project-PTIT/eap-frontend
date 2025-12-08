import type { Node, NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";
import { cn } from "@/lib/utils";
import type { ERDEntityNodeData, ERDAttributeNodeData, ERDRelationshipNodeData } from "./types";

// ============================================
// Entity Node - Rectangle shape
// ============================================
type EntityNodeProps = Node<ERDEntityNodeData, "erdEntityNode">;

export const ERDEntityNode = ({ data, selected }: NodeProps<EntityNodeProps>) => {
  const isWeakEntity = data.type === "weak-entity";

  return (
    <div
      className={cn(
        "relative px-6 py-4 bg-white border-2 border-gray-800 rounded-sm min-w-[120px] text-center shadow-md transition-shadow",
        isWeakEntity && "border-double border-4",
        selected && "shadow-lg ring-2 ring-blue-500",
      )}
    >
      {/* Connection handles - entities need both source and target handles */}
      {/* Source handles for connecting to attributes and relationships */}
      <Handle
        type="source"
        position={Position.Top}
        className="!w-2 !h-2 !bg-gray-600"
        id="top-source"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-gray-600"
        id="right-source"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-gray-600"
        id="bottom-source"
      />
      <Handle
        type="source"
        position={Position.Left}
        className="!w-2 !h-2 !bg-gray-600"
        id="left-source"
      />

      {/* Target handles for receiving connections from relationships */}
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-gray-600" id="top" />
      <Handle
        type="target"
        position={Position.Right}
        className="!w-2 !h-2 !bg-gray-600"
        id="right"
      />
      <Handle
        type="target"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-gray-600"
        id="bottom"
      />
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-gray-600" id="left" />

      <span className="font-semibold text-gray-800 text-sm">{data.label}</span>
    </div>
  );
};

// ============================================
// Attribute Node - Ellipse/Oval shape
// ============================================
type AttributeNodeProps = Node<ERDAttributeNodeData, "erdAttributeNode">;

export const ERDAttributeNode = ({ data, selected }: NodeProps<AttributeNodeProps>) => {
  const isKeyAttribute = data.type === "key-attribute";
  const isMultivalued = data.type === "multivalued-attribute";
  const isDerived = data.type === "derived-attribute";
  const isComposite = data.type === "composite-attribute";

  return (
    <div
      className={cn(
        "relative px-4 py-2 bg-white border-2 border-gray-800 min-w-[80px] text-center shadow-sm transition-shadow",
        // Ellipse shape using border-radius
        "rounded-[50%]",
        // Key attribute: normal border
        // Multivalued: double border
        isMultivalued && "border-double border-4",
        // Derived: dashed border
        isDerived && "border-dashed",
        // Composite: slightly larger to indicate it has sub-attributes
        isComposite && "min-w-[100px]",
        selected && "shadow-lg ring-2 ring-blue-500",
      )}
    >
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-gray-600" id="left" />
      <Handle
        type="target"
        position={Position.Right}
        className="!w-2 !h-2 !bg-gray-600"
        id="right"
      />
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-gray-600" id="top" />
      <Handle
        type="target"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-gray-600"
        id="bottom"
      />

      <span
        className={cn(
          "text-gray-700 text-xs",
          // Key attribute: underlined text
          isKeyAttribute && "underline decoration-2",
        )}
      >
        {data.label}
      </span>
    </div>
  );
};

// ============================================
// Relationship Node - Diamond shape
// ============================================
type RelationshipNodeProps = Node<ERDRelationshipNodeData, "erdRelationshipNode">;

export const ERDRelationshipNode = ({ data, selected }: NodeProps<RelationshipNodeProps>) => {
  return (
    <div className="relative w-[140px] h-[140px] flex items-center justify-center">
      {/* Connection handles positioned at diamond vertices (peaks) */}
      {/* Top vertex - at the top center of the container */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-gray-600"
        id="top"
        style={{ top: "0px", left: "50%", transform: "translate(-50%, -50%)" }}
      />
      {/* Right vertex - at the right center of the container */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-gray-600"
        id="right"
        style={{ right: "0px", top: "50%", transform: "translate(50%, -50%)" }}
      />
      {/* Bottom vertex - at the bottom center of the container */}
      <Handle
        type="target"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-gray-600"
        id="bottom"
        style={{ bottom: "0px", left: "50%", transform: "translate(-50%, 50%)" }}
      />
      {/* Left vertex - at the left center of the container */}
      <Handle
        type="source"
        position={Position.Left}
        className="!w-2 !h-2 !bg-gray-600"
        id="left"
        style={{ left: "0px", top: "50%", transform: "translate(-50%, -50%)" }}
      />

      {/* Diamond shape using rotated square */}
      <div
        className={cn(
          "w-[100px] h-[100px] bg-white border-2 border-gray-800 shadow-md transition-shadow",
          "flex items-center justify-center",
          "rotate-45",
          selected && "shadow-lg ring-2 ring-blue-500",
        )}
      >
        {/* Counter-rotate the text to keep it horizontal */}
        <span className="text-gray-700 text-xs font-medium px-2 -rotate-45 max-w-[80px] text-center break-words">
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
