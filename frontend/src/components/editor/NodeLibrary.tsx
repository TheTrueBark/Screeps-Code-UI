import { useCallback, type DragEvent } from 'react';
import { useFileStore } from '../../state/fileStore';
import { cn } from '../../utils/classNames';

const NODE_ITEMS = [
  {
    type: 'logic',
    title: 'Logic Node',
    description: 'IF / ELSE / SWITCH constructs'
  },
  {
    type: 'loop',
    title: 'Loop Node',
    description: 'FOR / WHILE / FOREACH iterations'
  },
  {
    type: 'memory',
    title: 'Memory Node',
    description: 'Read or write persistent memory'
  },
  {
    type: 'action',
    title: 'Action Node',
    description: 'Harvest, transfer or build'
  }
] as const;

/**
 * Palette that exposes all available node types. Nodes can be dragged onto the
 * ReactFlow canvas to create new instances for the active file.
 */
export const NodeLibrary = () => {
  const activeFileId = useFileStore((state) => state.activeFileId);

  const handleDragStart = useCallback((event: DragEvent<HTMLButtonElement>, type: string) => {
    event.dataTransfer.setData('application/reactflow', type);
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  return (
    <aside className="node-library">
      <div className="node-library-header">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
          Node Library
        </h2>
        <p className="text-xs text-slate-400">
          Drag a block into the canvas to create logic for the selected file.
        </p>
      </div>
      <div className="mt-4 space-y-3">
        {NODE_ITEMS.map((item) => (
          <button
            key={item.type}
            type="button"
            draggable={Boolean(activeFileId)}
            onDragStart={(event) => handleDragStart(event, item.type)}
            className={cn('node-library-item', {
              'opacity-50 cursor-not-allowed': !activeFileId
            })}
          >
            <div className="text-left">
              <div className="text-sm font-semibold text-slate-100">{item.title}</div>
              <div className="text-xs text-slate-400">{item.description}</div>
            </div>
          </button>
        ))}
      </div>
      {!activeFileId && (
        <div className="mt-6 rounded-md border border-slate-700/60 bg-slate-900/60 p-3 text-xs text-slate-400">
          Select or create a file before placing nodes.
        </div>
      )}
    </aside>
  );
};
