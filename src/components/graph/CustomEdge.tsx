import { memo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  Position,
} from "reactflow";

interface CustomEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: Position;
  targetPosition: Position;
  style?: React.CSSProperties;
  markerEnd?: string;
  data?: {
    label?: string;
    type?: "subscription" | "publishing" | "push";
  };
}

const defaultStyle: React.CSSProperties = {};

export const CustomEdge = memo(
  ({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = defaultStyle,
    markerEnd,
    data,
  }: CustomEdgeProps) => {
    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });

    const edgeStyle = {
      ...style,
      stroke:
        data?.type === "publishing"
          ? "#2196f3"
          : data?.type === "push"
          ? "#4caf50"
          : "#e91e63",
      strokeWidth:
        data?.type === "publishing" ? 3 : data?.type === "push" ? 2.5 : 2,
      strokeDasharray:
        data?.type === "publishing"
          ? "5,5"
          : data?.type === "push"
          ? "3,3"
          : "none",
    };

    return (
      <>
        <BaseEdge path={edgePath} markerEnd={markerEnd} style={edgeStyle} />
        {data?.label && (
          <EdgeLabelRenderer>
            <div
              style={{
                position: "absolute",
                transform: `translate(-50%, -50%) translate(${String(
                  labelX
                )}px,${String(labelY)}px)`,
                fontSize: 10,
                fontWeight: 500,
                pointerEvents: "all",
              }}
              className="nodrag nopan"
            >
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.9)",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  whiteSpace: "nowrap",
                }}
              >
                {data.label}
              </div>
            </div>
          </EdgeLabelRenderer>
        )}
      </>
    );
  }
);

CustomEdge.displayName = "CustomEdge";
