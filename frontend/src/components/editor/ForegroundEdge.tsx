import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from "@xyflow/react";
import { useMemo, useState } from "react";
import { useCanvasInteraction } from "./CanvasInteractionContext";
import { cn } from "../../utils/classNames";

const HIGHLIGHT_COLOR = "rgba(94, 234, 212, 0.95)";
const HOVER_COLOR = "rgba(148, 163, 184, 0.9)";
const DEFAULT_COLOR = "#5a6169";

export const ForegroundEdge = ({
  id,
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  markerEnd,
  style,
  data,
  selected,
  animated,
  interactionWidth = 24,
}: EdgeProps): JSX.Element => {
  const { requestEdgeDelete } = useCanvasInteraction();
  const [hovered, setHovered] = useState(false);

  const [edgePath, labelX, labelY] = useMemo(
    () =>
      getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
      }),
    [
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    ],
  );

  const highlighted = Boolean(data?.highlighted);
  const strokeColor = highlighted
    ? HIGHLIGHT_COLOR
    : hovered || selected
      ? HOVER_COLOR
      : style?.stroke ?? DEFAULT_COLOR;
  const strokeWidth = highlighted
    ? Math.max(2.2, Number(style?.strokeWidth ?? 1.5) + 0.8)
    : hovered || selected
      ? Math.max(2, Number(style?.strokeWidth ?? 1.5) + 0.4)
      : style?.strokeWidth ?? 1.5;

  const handleDelete = () => {
    requestEdgeDelete(id);
  };

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        className={cn("react-flow__edge-path edge-foreground-path", {
          highlighted,
          hovered,
          selected,
          animated,
        })}
        interactionWidth={interactionWidth}
        style={{
          ...(style ?? {}),
          stroke: strokeColor,
          strokeWidth,
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            pointerEvents: "all",
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            display: hovered || selected ? "flex" : "none",
            zIndex: 1,
          }}
        >
          <button
            type="button"
            className="edge-delete-button"
            onClick={(event) => {
              event.stopPropagation();
              handleDelete();
            }}
            onMouseEnter={() => setHovered(true)}
            aria-label="Remove connection"
          >
            ✕
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

