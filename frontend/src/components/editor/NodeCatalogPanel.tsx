import { memo, useMemo, useState, type DragEvent } from 'react';
import type { NodeMeta } from '../../data/nodeRegistry/schema';
import { cn } from '../../utils/classNames';

type NodeCatalogPanelProps = {
  label: string;
  nodes: NodeMeta[];
  disabled: boolean;
  onSpawn: (kind: string) => void;
};

type TileMeta = NodeMeta & { summary: string };

const buildTiles = (nodes: NodeMeta[]): TileMeta[] =>
  nodes
    .map((node) => ({
      ...node,
      summary: node.docs.summary || node.docs.usage || ''
    }))
    .sort((a, b) => a.title.localeCompare(b.title));

export const NodeCatalogPanel = memo(({ label, nodes, disabled, onSpawn }: NodeCatalogPanelProps) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const tiles = useMemo(() => buildTiles(nodes), [nodes]);

  const handleDragStart = (event: DragEvent<HTMLButtonElement>, kind: string) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.setData('application/screeps-node-kind', kind);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleSpawn = (kind: string) => {
    if (disabled) {
      return;
    }
    onSpawn(kind);
  };

  return (
    <div className="bottom-menu-panel">
      <header className="bottom-menu-panel-header">
        <span className="bottom-menu-panel-title">{label}</span>
        {hovered ? <span className="bottom-menu-panel-hint">{hovered}</span> : null}
      </header>
      <div className="bottom-menu-panel-grid">
        {tiles.map((meta) => (
          <button
            key={meta.kind}
            type="button"
            className={cn('bottom-menu-tile', { disabled })}
            draggable={!disabled}
            onDragStart={(event) => handleDragStart(event, meta.kind)}
            onClick={() => handleSpawn(meta.kind)}
            onMouseEnter={() => setHovered(meta.summary)}
            onMouseLeave={() => setHovered(null)}
          >
            <span className="bottom-menu-tile-acronym">{meta.acronym ?? meta.title.slice(0, 2).toUpperCase()}</span>
            <span className="bottom-menu-tile-label">{meta.title}</span>
          </button>
        ))}
        {tiles.length === 0 ? (
          <div className="bottom-menu-empty">No nodes</div>
        ) : null}
      </div>
    </div>
  );
});

NodeCatalogPanel.displayName = 'NodeCatalogPanel';
