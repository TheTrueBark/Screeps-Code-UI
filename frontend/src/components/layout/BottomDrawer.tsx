import { useEffect, useMemo, useState, type DragEvent } from "react";
import { listAllMeta } from "../../data/nodeRegistry";
import type { NodeMeta } from "../../data/nodeRegistry/schema";
import { useFileStore } from "../../state/fileStore";
import { cn } from "../../utils/classNames";

type Group = {
  category: string;
  nodes: NodeMeta[];
};

const groupDefinitions = (): Group[] => {
  const groups = new Map<string, NodeMeta[]>();
  listAllMeta().forEach((definition) => {
    const bucket = groups.get(definition.category ?? definition.family);
    if (bucket) {
      bucket.push(definition);
    } else {
      groups.set(definition.category ?? definition.family, [definition]);
    }
  });

  return Array.from(groups.entries()).map(([category, nodes]) => ({
    category,
    nodes,
  }));
};

export const BottomDrawer = () => {
  const activeFileId = useFileStore((state) => state.activeFileId);
  const groups = useMemo(groupDefinitions, []);
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(() =>
    groups.length > 0 ? groups[0]!.category : null,
  );

  const open = pinned || hovered;

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.code !== "Space") {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      event.preventDefault();
      setPinned((prev) => {
        const next = !prev;
        setHovered(next);
        return next;
      });
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

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

  useEffect(() => {
    if (groups.length === 0) {
      setActiveCategory(null);
      return;
    }

    setActiveCategory((prev) => {
      if (prev && groups.some((group) => group.category === prev)) {
        return prev;
      }
      return groups[0]!.category;
    });
  }, [groups]);

  const handleCategorySelect = (category: string) => {
    setActiveCategory(category);
  };

  const activeGroup = activeCategory
    ? groups.find((group) => group.category === activeCategory)
    : undefined;

  return (
    <div
      className={cn("node-drawer", { open, pinned })}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        if (!pinned) {
          setHovered(false);
        }
      }}
    >
      <div className="node-drawer-rail">
        <div className="node-drawer-header">
          <span className="node-drawer-label">Node Library</span>
          <span className="node-drawer-hint">
            {pinned
              ? "Pinned • Press SPACE to release"
              : "Hover or press SPACE to lock"}
          </span>
        </div>
        <div
          className="node-drawer-tabs"
          role="tablist"
          aria-label="Node categories"
        >
          {groups.map(({ category }) => {
            const selected = activeCategory === category;
            return (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={selected}
                className={cn("node-drawer-tab", { selected })}
                onClick={() => handleCategorySelect(category)}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>
      <div className="node-drawer-panel" role="tabpanel">
        {activeGroup && (
          <div className="node-drawer-items">
            {activeGroup.nodes.map((definition) => (
              <button
                key={definition.kind}
                type="button"
                draggable={Boolean(activeFileId)}
                onDragStart={(event) => handleDragStart(event, definition.kind)}
                className={cn("node-drawer-tile", { disabled: !activeFileId })}
                title={definition.docs.summary}
              >
                <div className="node-drawer-tile-header">
                  <span className="node-drawer-tile-icon">
                    {definition.acronym ?? definition.title.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="node-drawer-tile-name">
                    {definition.title}
                  </span>
                </div>
                <span className="node-drawer-tile-family">
                  {definition.family}
                </span>
              </button>
            ))}
          </div>
        )}
        {!activeFileId && (
          <div className="node-drawer-empty">
            Select a file to enable node placement.
          </div>
        )}
      </div>
    </div>
  );
};
