import { useEffect, useMemo, useState, type DragEvent } from "react";
import { listByFamily } from "../../data/nodeRegistry";
import type { NodeFamily, NodeMeta } from "../../data/nodeRegistry/schema";
import { useFileStore } from "../../state/fileStore";
import { cn } from "../../utils/classNames";

type FloatingCatalogProps = {
  open: boolean;
  pinned: boolean;
  onOpenChange: (open: boolean) => void;
  onPinChange: (pinned: boolean) => void;
  onSpawn: (kind: string) => void;
  selectedMeta?: NodeMeta;
  onSelectedHelp?: () => void;
};

const FAMILY_TABS: Array<{ key: NodeFamily; label: string }> = [
  { key: "flowControl", label: "Flow" },
  { key: "queryTargeting", label: "Query" },
  { key: "creepActions", label: "Creep" },
  { key: "structureLogic", label: "Structure" },
  { key: "economyMarket", label: "Economy" },
  { key: "power", label: "Power" },
  { key: "memoryData", label: "Memory" },
  { key: "mapNavigation", label: "Map" },
  { key: "globalGame", label: "Global" },
  { key: "taskMacro", label: "Tasks" },
];

const groupByFamily = () =>
  FAMILY_TABS.map(({ key, label }) => ({
    key,
    label,
    nodes: listByFamily(key),
  }));

export const FloatingCatalog = ({
  open,
  pinned,
  onOpenChange,
  onPinChange,
  onSpawn,
  selectedMeta,
  onSelectedHelp,
}: FloatingCatalogProps) => {
  const activeFileId = useFileStore((state) => state.activeFileId);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<NodeFamily>("flowControl");
  const groups = useMemo(groupByFamily, []);

  useEffect(() => {
    if (!pinned && !open) {
      setQuery("");
    }
  }, [open, pinned]);

  const handleDragStart = (
    event: DragEvent<HTMLButtonElement>,
    kind: string,
  ) => {
    if (!activeFileId) {
      event.preventDefault();
      return;
    }

    event.dataTransfer.setData("application/screeps-node-kind", kind);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleTileClick = (kind: string) => {
    if (!activeFileId) {
      return;
    }

    onSpawn(kind);
    if (!pinned) {
      onOpenChange(false);
    }
  };

  const filtered = useMemo(() => {
    const group = groups.find((entry) => entry.key === activeTab);
    if (!group) {
      return [];
    }

    if (!query.trim()) {
      return group.nodes;
    }

    const term = query.trim().toLowerCase();
    return group.nodes.filter((node) =>
      [node.title, node.docs.summary, node.category]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [groups, activeTab, query]);

  const disabled = !activeFileId;

  return (
    <div className={cn("floating-catalog", { open, pinned })}>
      <button
        type="button"
        className="floating-catalog-trigger"
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
      >
        +
      </button>
      <div
        className="floating-catalog-panel"
        role="dialog"
        aria-hidden={!open}
        onMouseLeave={() => {
          if (!pinned) {
            onOpenChange(false);
          }
        }}
      >
        <header className="floating-catalog-header">
          <div className="floating-catalog-tabs" role="tablist">
            {FAMILY_TABS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                role="tab"
                className={cn("floating-catalog-tab", {
                  active: activeTab === key,
                })}
                onClick={() => setActiveTab(key)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="floating-catalog-controls">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search nodes"
              className="floating-catalog-search"
            />
            <button
              type="button"
              className={cn("floating-catalog-pin", { active: pinned })}
              onClick={() => onPinChange(!pinned)}
              aria-pressed={pinned}
            >
              📌
            </button>
          </div>
        </header>
        {selectedMeta ? (
          <div className="floating-catalog-context">
            <div className="context-copy">
              <span className="context-label">Selected</span>
              <span className="context-title">{selectedMeta.title}</span>
            </div>
            <button
              type="button"
              className="context-help"
              onClick={onSelectedHelp}
              aria-label="Open selected node help"
            >
              ?
            </button>
          </div>
        ) : null}
        <div className="floating-catalog-grid">
          {filtered.map((definition) => {
            const tileDisabled =
              !activeFileId || definition.availability !== "available";
            return (
              <button
                key={definition.kind}
                type="button"
                draggable={Boolean(activeFileId) && !tileDisabled}
                className={cn("floating-catalog-tile", {
                  disabled: tileDisabled,
                })}
                onDragStart={(event) => handleDragStart(event, definition.kind)}
                onClick={() =>
                  tileDisabled ? undefined : handleTileClick(definition.kind)
                }
                title={definition.docs.summary}
              >
                <span className="tile-acronym">
                  {definition.acronym ??
                    definition.title.slice(0, 2).toUpperCase()}
                </span>
                <span className="tile-label">{definition.title}</span>
                {definition.availability &&
                definition.availability !== "available" ? (
                  <span className="tile-status">
                    {definition.availability === "planned"
                      ? "Planned"
                      : "Preview"}
                  </span>
                ) : null}
              </button>
            );
          })}
          {filtered.length === 0 ? (
            <div className="floating-catalog-empty">No nodes</div>
          ) : null}
        </div>
        {disabled ? (
          <div className="floating-catalog-hint">
            Select a file to enable nodes.
          </div>
        ) : null}
      </div>
    </div>
  );
};
