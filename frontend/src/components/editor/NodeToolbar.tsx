import { memo, useMemo, type CSSProperties } from "react";
import { cn } from "../../utils/classNames";

export type ToolbarPlacement = "above" | "below";

type NodeToolbarProps = {
  anchor: DOMRect | null;
  placement: ToolbarPlacement;
  zoom: number;
  visible: boolean;
  editing: boolean;
  confirmVisible: boolean;
  hasCustomConfig: boolean;
  onEdit: () => void;
  onDuplicate: () => void;
  onHelp: () => void;
  onDelete: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
};

const BUTTONS = [
  { key: "edit", label: "Edit node (E)", icon: "✎" },
  { key: "duplicate", label: "Duplicate node (D)", icon: "⧉" },
  { key: "help", label: "Help (?)", icon: "?" },
  { key: "delete", label: "Delete node (Delete)", icon: "✕" },
] as const;

export const NodeToolbar = memo(
  ({
    anchor,
    placement,
    zoom,
    visible,
    editing,
    confirmVisible,
    hasCustomConfig,
    onEdit,
    onDuplicate,
    onHelp,
    onDelete,
    onConfirmDelete,
    onCancelDelete,
  }: NodeToolbarProps) => {
    const style = useMemo(() => {
      if (!anchor) {
        return undefined;
      }

      const offset = 12;
      const baseTop =
        placement === "below" ? anchor.bottom + offset : anchor.top - offset;
      const translateY = placement === "below" ? "0" : "-100%";
      const transformOrigin =
        placement === "below" ? "top center" : "bottom center";

      return {
        left: anchor.left + anchor.width / 2,
        top: baseTop,
        transform: `translate(-50%, ${translateY}) scale(${zoom})`,
        transformOrigin,
      } as CSSProperties;
    }, [anchor, placement, zoom]);

    if (!anchor) {
      return null;
    }

    return (
      <div
        className={cn("node-toolbar", { visible })}
        style={style}
        role="toolbar"
        aria-hidden={!visible}
      >
        <div className="node-toolbar-buttons">
          {BUTTONS.map((button) => {
            if (button.key === "edit") {
              return (
                <button
                  key={button.key}
                  type="button"
                  className={cn("node-toolbar-btn", { active: editing })}
                  onClick={onEdit}
                  aria-label={button.label}
                >
                  <span aria-hidden>{button.icon}</span>
                </button>
              );
            }

            if (button.key === "duplicate") {
              return (
                <button
                  key={button.key}
                  type="button"
                  className="node-toolbar-btn"
                  onClick={onDuplicate}
                  aria-label={button.label}
                >
                  <span aria-hidden>{button.icon}</span>
                </button>
              );
            }

            if (button.key === "help") {
              return (
                <button
                  key={button.key}
                  type="button"
                  className="node-toolbar-btn"
                  onClick={onHelp}
                  aria-label={button.label}
                >
                  <span aria-hidden>{button.icon}</span>
                </button>
              );
            }

            return (
              <button
                key={button.key}
                type="button"
                className={cn("node-toolbar-btn", { danger: hasCustomConfig })}
                onClick={onDelete}
                aria-label={button.label}
              >
                <span aria-hidden>{button.icon}</span>
              </button>
            );
          })}
        </div>
        {confirmVisible ? (
          <div className={cn("node-toolbar-confirm", placement)}>
            <button
              type="button"
              className="node-toolbar-confirm-btn primary"
              onClick={onConfirmDelete}
            >
              Confirm Delete
            </button>
            <button
              type="button"
              className="node-toolbar-confirm-btn"
              onClick={onCancelDelete}
            >
              Cancel
            </button>
          </div>
        ) : null}
      </div>
    );
  },
);

NodeToolbar.displayName = "NodeToolbar";
