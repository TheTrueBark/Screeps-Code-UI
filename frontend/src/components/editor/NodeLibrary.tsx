import { useMemo, type DragEvent } from 'react';
import { useFileStore } from '../../state/fileStore';
import { cn } from '../../utils/classNames';
import { NODE_DEFINITIONS } from './nodeRegistry';

const familyAccent: Record<string, string> = {
  flow: 'from-cyan-500/40 to-blue-500/30 text-cyan-100',
  query: 'from-amber-500/40 to-orange-500/30 text-amber-100',
  creep: 'from-emerald-500/40 to-lime-500/30 text-emerald-100',
  structure: 'from-violet-500/40 to-purple-500/30 text-violet-100',
  memory: 'from-sky-500/40 to-blue-400/30 text-sky-100',
  task: 'from-rose-500/40 to-pink-500/30 text-rose-100'
};

const groupNodesByCategory = () => {
  const groups = new Map<string, typeof NODE_DEFINITIONS>();
  NODE_DEFINITIONS.forEach((definition) => {
    if (!groups.has(definition.category)) {
      groups.set(definition.category, []);
    }
    groups.get(definition.category)?.push(definition);
  });

  return Array.from(groups.entries()).map(([category, nodes]) => ({
    category,
    nodes
  }));
};

export const NodeLibrary = () => {
  const activeFileId = useFileStore((state) => state.activeFileId);

  const groups = useMemo(groupNodesByCategory, []);

  const handleDragStart = (event: DragEvent<HTMLButtonElement>, kind: string) => {
    if (!activeFileId) {
      event.preventDefault();
      return;
    }

    event.dataTransfer.setData('application/screeps-node-kind', kind);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="node-library bg-slate-950/80 text-slate-200">
      <header className="border-b border-slate-800 px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Node Library</h2>
        <p className="text-xs text-slate-500">Drag components onto the canvas to build your automation.</p>
      </header>
      <div className="node-library-content">
        {groups.map(({ category, nodes }) => (
          <section key={category} className="px-4 py-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">{category}</h3>
            <div className="mt-2 grid grid-cols-1 gap-2">
              {nodes.map((definition) => (
                <button
                  key={definition.kind}
                  type="button"
                  draggable={Boolean(activeFileId)}
                  onDragStart={(event) => handleDragStart(event, definition.kind)}
                  className={cn(
                    'group rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-left text-sm transition hover:border-slate-600 hover:bg-slate-900/95',
                    !activeFileId && 'cursor-not-allowed opacity-50'
                  )}
                >
                  <div
                    className={cn(
                      'mb-2 inline-flex rounded-full bg-gradient-to-r px-2 py-1 text-[11px] font-medium',
                      familyAccent[definition.family]
                    )}
                  >
                    {definition.title}
                  </div>
                  <div className="text-[11px] text-slate-400">{definition.description}</div>
                </button>
              ))}
            </div>
          </section>
        ))}
        {!activeFileId && (
          <div className="px-4 pb-4 text-xs text-slate-500">Select a file tab to enable the library.</div>
        )}
      </div>
    </aside>
  );
};
