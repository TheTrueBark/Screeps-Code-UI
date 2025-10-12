import { useEffect, useMemo, useState, type DragEvent } from 'react';
import { useFileStore } from '../../state/fileStore';
import { cn } from '../../utils/classNames';
import { NODE_DEFINITIONS } from '../editor/nodeRegistry';
import type { NodeDefinition } from '../editor/NodeTypes/types';

type Group = {
  category: string;
  nodes: NodeDefinition[];
};

const groupDefinitions = (): Group[] => {
  const groups = new Map<string, NodeDefinition[]>();
  NODE_DEFINITIONS.forEach((definition) => {
    const bucket = groups.get(definition.category);
    if (bucket) {
      bucket.push(definition);
    } else {
      groups.set(definition.category, [definition]);
    }
  });

  return Array.from(groups.entries()).map(([category, nodes]) => ({ category, nodes }));
};

export const BottomDrawer = () => {
  const activeFileId = useFileStore((state) => state.activeFileId);
  const groups = useMemo(groupDefinitions, []);
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => ({}));

  const open = pinned || hovered;

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.code !== 'Space') {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      event.preventDefault();
      setPinned((prev) => {
        const next = !prev;
        setHovered(next);
        return next;
      });
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleDragStart = (event: DragEvent<HTMLButtonElement>, kind: string) => {
    if (!activeFileId) {
      event.preventDefault();
      return;
    }

    event.dataTransfer.setData('application/screeps-node-kind', kind);
    event.dataTransfer.effectAllowed = 'move';
  };

  const toggleSection = (category: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [category]: !(prev?.[category] ?? true)
    }));
  };

  return (
    <div
      className={cn('node-drawer', { open })}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        if (!pinned) {
          setHovered(false);
        }
      }}
    >
      <div className="node-drawer-header">
        <span className="node-drawer-label">Node Library</span>
        <span className="node-drawer-hint">Hover or press SPACE to lock</span>
      </div>
      <div className="node-drawer-content">
        {groups.map(({ category, nodes }) => {
          const collapsed = openSections[category] === false;
          return (
            <section key={category} className={cn('node-drawer-section', { collapsed })}>
              <button
                type="button"
                className="node-drawer-section-toggle"
                onClick={() => toggleSection(category)}
                aria-expanded={!collapsed}
              >
                <span>{category}</span>
                <span aria-hidden>{collapsed ? '▸' : '▾'}</span>
              </button>
              <div className="node-drawer-tiles">
                {nodes.map((definition) => (
                  <button
                    key={definition.kind}
                    type="button"
                    draggable={Boolean(activeFileId)}
                    onDragStart={(event) => handleDragStart(event, definition.kind)}
                    className={cn('node-drawer-tile', { disabled: !activeFileId })}
                    title={definition.description}
                  >
                    <div className="node-drawer-tile-header">
                      <span className="node-drawer-tile-icon">{definition.title.slice(0, 2).toUpperCase()}</span>
                      <span className="node-drawer-tile-name">{definition.title}</span>
                    </div>
                    <span className="node-drawer-tile-family">{definition.family}</span>
                  </button>
                ))}
              </div>
            </section>
          );
        })}
        {!activeFileId && <div className="node-drawer-empty">Select a file to enable node placement.</div>}
      </div>
    </div>
  );
};
