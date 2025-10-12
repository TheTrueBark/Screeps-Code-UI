import { memo, useMemo } from 'react';
import { listAllMeta, listByFamily } from '../../data/nodeRegistry';
import type { NodeFamily } from '../../data/nodeRegistry/schema';
import { cn } from '../../utils/classNames';
import { NodeCatalogPanel } from './NodeCatalogPanel';

type CategoryKey =
  | 'flow'
  | 'query'
  | 'creep'
  | 'structure'
  | 'memory'
  | 'tasks'
  | 'search';

type CategoryDefinition = {
  key: CategoryKey;
  label: string;
  family?: NodeFamily;
};

const CATEGORIES: CategoryDefinition[] = [
  { key: 'flow', label: 'FLOW', family: 'flow' },
  { key: 'query', label: 'QUERY', family: 'query' },
  { key: 'creep', label: 'CREEP', family: 'creep' },
  { key: 'structure', label: 'STRUCTURE', family: 'structure' },
  { key: 'memory', label: 'MEMORY', family: 'memory' },
  { key: 'tasks', label: 'TASKS', family: 'task' },
  { key: 'search', label: 'SEARCH' }
];

type BottomMenuProps = {
  activeCategory: string | null;
  onToggle: (category: string) => void;
  onSpawn: (kind: string) => void;
  disabled: boolean;
};

const buildSearchNodes = () => {
  const all = listAllMeta();
  return all.filter((meta) => {
    const summary = `${meta.title} ${meta.category ?? ''} ${meta.docs.summary ?? ''}`.toLowerCase();
    if (meta.shortcuts?.search) {
      return true;
    }
    return summary.includes('find') || summary.includes('search');
  });
};

export const BottomMenu = memo(
  ({ activeCategory, onToggle, onSpawn, disabled }: BottomMenuProps) => {
    const groups = useMemo(() => {
      const searchNodes = buildSearchNodes();
      return CATEGORIES.map((category) => ({
        ...category,
        nodes: category.family ? listByFamily(category.family) : searchNodes
      }));
    }, []);

    const active = useMemo(
      () => groups.find((group) => group.key === activeCategory) ?? null,
      [groups, activeCategory]
    );

    return (
      <div className="bottom-menu">
        {active ? (
          <NodeCatalogPanel
            key={active.key}
            label={active.label}
            nodes={active.nodes}
            disabled={disabled}
            onSpawn={onSpawn}
          />
        ) : null}
        <div className="bottom-menu-bar">
          {groups.map((category) => (
            <button
              key={category.key}
              type="button"
              className={cn('bottom-menu-tab', { active: active?.key === category.key })}
              onClick={() => onToggle(category.key)}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>
    );
  }
);

BottomMenu.displayName = 'BottomMenu';
