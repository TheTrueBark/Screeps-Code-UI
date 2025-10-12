import { cn } from '../../utils/classNames';

type OutputPanelProps = {
  open: boolean;
  onToggle: () => void;
  output: string;
};

export const OutputPanel = ({ open, onToggle, output }: OutputPanelProps) => (
  <aside className={cn('output-drawer', { open })}>
    <button type="button" className="output-drawer-toggle" onClick={onToggle} aria-expanded={open}>
      {open ? '⟩⟩' : '⟨⟨'}
    </button>
    <div className="output-drawer-surface">
      <header className="output-drawer-header">
        <span className="output-drawer-title">Output</span>
        <span className="output-drawer-subtitle">TypeScript preview</span>
      </header>
      <pre className="output-drawer-pre">{output}</pre>
    </div>
  </aside>
);
