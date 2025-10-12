import { cn } from "../../utils/classNames";

type OutputPanelProps = {
  open: boolean;
  onToggle: () => void;
  output: string;
};

export const OutputPanel = ({ open, onToggle, output }: OutputPanelProps) => (
  <aside className={cn("output-drawer", { open })} aria-hidden={!open}>
    <div className="output-drawer-surface">
      <header className="output-drawer-header">
        <div className="output-drawer-heading">
          <span className="output-drawer-title">Output</span>
          <span className="output-drawer-subtitle">TypeScript preview</span>
        </div>
        <button
          type="button"
          className="output-drawer-close"
          onClick={onToggle}
          aria-label="Close output"
        >
          ⟩⟩
        </button>
      </header>
      <pre className="output-drawer-pre">{output}</pre>
    </div>
  </aside>
);
