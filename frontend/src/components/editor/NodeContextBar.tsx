import { memo } from "react";
import { cn } from "../../utils/classNames";

type NodeContextBarProps = {
  position: { x: number; y: number } | null;
  visible: boolean;
  paused?: boolean;
  pinned?: boolean;
  onPause?: () => void;
  onPinToggle?: () => void;
  onHelp?: () => void;
  onDelete?: () => void;
  onClose?: () => void;
};

const Button = ({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: string;
  onClick?: () => void;
}) => (
  <button
    type="button"
    className="node-toolbar-btn"
    onClick={onClick}
    aria-label={label}
  >
    <span aria-hidden="true">{icon}</span>
  </button>
);

export const NodeContextBar = memo(
  ({
    position,
    visible,
    paused,
    pinned,
    onPause,
    onPinToggle,
    onHelp,
    onDelete,
    onClose,
  }: NodeContextBarProps) => {
    if (!position) {
      return null;
    }

    return (
      <div
        className={cn("node-context-bar", { visible })}
        style={{ left: position.x, top: position.y }}
        role="toolbar"
        aria-hidden={!visible}
      >
        <Button
          label={paused ? "Resume node" : "Pause node"}
          icon={paused ? "▶" : "⏸"}
          onClick={onPause}
        />
        <Button
          label={pinned ? "Unpin catalog" : "Pin catalog"}
          icon={pinned ? "📌" : "＋"}
          onClick={onPinToggle}
        />
        <Button label="Help" icon="?" onClick={onHelp} />
        <Button label="Delete node" icon="✕" onClick={onDelete} />
        <Button label="Close selection" icon="⧖" onClick={onClose} />
      </div>
    );
  },
);

NodeContextBar.displayName = "NodeContextBar";
