import { createContext, useContext } from "react";

export type CanvasHandleRef = {
  nodeId: string;
  handleId: string;
};

type CanvasInteractionContextValue = {
  highlightHandles: (handles: CanvasHandleRef[]) => void;
  clearHandles: (handles: CanvasHandleRef[]) => void;
  requestEdgeDelete: (edgeId: string) => void;
};

const noop = () => {
  // no-op default implementation
};

export const CanvasInteractionContext =
  createContext<CanvasInteractionContextValue>({
    highlightHandles: noop,
    clearHandles: noop,
    requestEdgeDelete: noop,
  });

export const useCanvasInteraction = () =>
  useContext(CanvasInteractionContext);

