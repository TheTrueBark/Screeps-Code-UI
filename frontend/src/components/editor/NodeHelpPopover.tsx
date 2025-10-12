import { cn } from "../../utils/classNames";

const renderMarkdown = (markdown: string) => {
  const paragraphs = markdown
    .trim()
    .split(/\n\s*\n/)
    .map((paragraph) =>
      paragraph
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>"),
    );

  return paragraphs.map((paragraph, index) => (
    <p key={index} dangerouslySetInnerHTML={{ __html: paragraph }} />
  ));
};

type NodeHelpPopoverProps = {
  open: boolean;
  anchor: { x: number; y: number } | null;
  title: string;
  markdown: string;
  onClose?: () => void;
};

export const NodeHelpPopover = ({
  open,
  anchor,
  title,
  markdown,
  onClose,
}: NodeHelpPopoverProps) => {
  if (!open || !anchor) {
    return null;
  }

  return (
    <div
      className={cn("node-help-popover", { open })}
      style={{ left: anchor.x, top: anchor.y }}
      role="dialog"
    >
      <header className="node-help-header">
        <span className="node-help-title">{title}</span>
        <button
          type="button"
          className="node-help-close"
          onClick={onClose}
          aria-label="Close help"
        >
          ×
        </button>
      </header>
      <div className="node-help-body">{renderMarkdown(markdown)}</div>
    </div>
  );
};
