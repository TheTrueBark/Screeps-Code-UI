import { useState } from 'react';
import { CanvasEditor } from '../editor/CanvasEditor';
import { CodeGeneratorButton } from '../editor/CodeGeneratorButton';
import { NodeLibrary } from '../editor/NodeLibrary';
import { FileTree } from './FileTree';
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
  const effectiveOutput = output ?? localOutput;

  const handleGenerated = (value: string) => {
    setLocalOutput(value);
    onOutputChange?.(value);
  };

  return (
    <div className="editor-shell">
      <aside className={cn('editor-sidebar', { collapsed: sidebarCollapsed })}>
        <div className="sidebar-header">
          <div>
            <h1 className="sidebar-title">Screeps Visual IDE</h1>
            <p className="sidebar-subtitle">Compose roles, utilities and automation.</p>
          </div>
          <button
            type="button"
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(true)}
            aria-label="Collapse file tree"
          >
            ⟨
          </button>
        </div>
        <FileTree />
      </aside>
      {sidebarCollapsed && (
        <button
          type="button"
          className="sidebar-expander"
          onClick={() => setSidebarCollapsed(false)}
          aria-label="Expand file tree"
        >
          Files
        </button>
      )}
      <div className="editor-main">
        <header className="editor-toolbar">
          <div className="toolbar-tabs">
            <TabsBar />
          </div>
          <CodeGeneratorButton onGenerated={handleGenerated} className="toolbar-generate" />
        </header>
        <div className="workspace">
          <div className="canvas-wrapper">
            <CanvasEditor />
          </div>
          <aside className="output-panel">
            <div className="output-heading">Mock Output</div>
            <pre className="output-pre">
              {effectiveOutput || '// Generate code to see the serialised graph for the current file'}
            </pre>
          </aside>
        </div>
        <NodeLibrary />
      </div>
    </div>
  );
};
