import { useEffect, useState } from 'react';
import { CanvasEditor } from '../editor/CanvasEditor';
import { CodeGeneratorButton } from '../editor/CodeGeneratorButton';
import { BottomDrawer } from './BottomDrawer';
import { FileTree } from './FileTree';
import { OutputPanel } from './OutputPanel';
import { TabsBar } from './TabsBar';
import { cn } from '../../utils/classNames';

type EditorLayoutProps = {
  onOutputChange?: (output: string) => void;
  output?: string;
};

/**
 * Composes the VSCode-like layout with sidebar, tabs and the canvas region.
 */
export const EditorLayout = ({ output, onOutputChange }: EditorLayoutProps) => {
  const [localOutput, setLocalOutput] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [outputOpen, setOutputOpen] = useState(false);
  const effectiveOutput = output ?? localOutput;

  const handleGenerated = (value: string) => {
    setLocalOutput(value);
    onOutputChange?.(value);
  };

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && (event.key === 'b' || event.key === 'B')) {
        event.preventDefault();
        setSidebarCollapsed((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
    };
  }, []);

  return (
    <div className="editor-shell">
      <aside className={cn('editor-sidebar', { collapsed: sidebarCollapsed })}>
        <FileTree onCollapse={() => setSidebarCollapsed(true)} />
      </aside>
      <button
        type="button"
        className={cn('sidebar-expander', { visible: sidebarCollapsed })}
        onClick={() => setSidebarCollapsed((prev) => !prev)}
        aria-label={sidebarCollapsed ? 'Expand file tree' : 'Collapse file tree'}
      >
        {sidebarCollapsed ? '▸ Files' : '◂ Files'}
      </button>
      <div className="editor-main">
        <header className="editor-toolbar">
          <div className="toolbar-tabs">
            <TabsBar />
          </div>
          <div className="toolbar-actions">
            <button
              type="button"
              className="output-toggle"
              onClick={() => setOutputOpen((prev) => !prev)}
              aria-expanded={outputOpen}
            >
              {outputOpen ? '⟩⟩' : '⟨⟨'}
            </button>
            <CodeGeneratorButton onGenerated={handleGenerated} className="toolbar-generate" />
          </div>
        </header>
        <div className="workspace">
          <div className="canvas-wrapper">
            <CanvasEditor />
          </div>
        </div>
        <OutputPanel
          open={outputOpen}
          onToggle={() => setOutputOpen((prev) => !prev)}
          output={
            effectiveOutput || '// Generate code to see the serialised graph for the current file'
          }
        />
        <BottomDrawer />
      </div>
    </div>
  );
};
