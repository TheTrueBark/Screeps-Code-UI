import { useState } from 'react';
import { CanvasEditor } from '../editor/CanvasEditor';
import { CodeGeneratorButton } from '../editor/CodeGeneratorButton';
import { NodeLibrary } from '../editor/NodeLibrary';
import { FileTree } from './FileTree';
import { TabsBar } from './TabsBar';

type EditorLayoutProps = {
  onOutputChange?: (output: string) => void;
  output?: string;
};

/**
 * Composes the VSCode-like layout with sidebar, tabs and the canvas region.
 */
export const EditorLayout = ({ output, onOutputChange }: EditorLayoutProps) => {
  const [localOutput, setLocalOutput] = useState('');
  const effectiveOutput = output ?? localOutput;

  const handleGenerated = (value: string) => {
    setLocalOutput(value);
    onOutputChange?.(value);
  };

  return (
    <div className="editor-shell">
      <aside className="editor-sidebar">
        <div className="sidebar-header">
          <h1 className="text-lg font-semibold text-slate-100">Screeps Visual IDE</h1>
          <p className="text-xs text-slate-400">Manage roles, utilities and automation logic.</p>
        </div>
        <FileTree />
      </aside>
      <div className="editor-main">
        <TabsBar />
        <div className="workspace">
          <NodeLibrary />
          <div className="canvas-wrapper">
            <CanvasEditor />
          </div>
        </div>
        <div className="generator-panel">
          <CodeGeneratorButton onGenerated={handleGenerated} />
          <div className="output-view">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Mock Output
            </h3>
            <pre className="output-pre">
              {effectiveOutput || '// Generate code to see the serialised graph for the current file'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
