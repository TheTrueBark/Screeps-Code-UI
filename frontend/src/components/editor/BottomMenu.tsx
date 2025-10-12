import { memo, useMemo } from "react";
import { listAllMeta, listByFamily } from "../../data/nodeRegistry";
import type { NodeFamily } from "../../data/nodeRegistry/schema";
import { cn } from "../../utils/classNames";
import { NodeCatalogPanel } from "./NodeCatalogPanel";

type CategoryKey =
  | "flow"
  | "query"
  | "creep"
  | "structure"
  | "memory"
  | "tasks"
  | "search";

type CategoryDefinition = {
  key: CategoryKey;
  label: string;
  family?: NodeFamily;
  glyph: string;
};

const CATEGORIES: CategoryDefinition[] = [
  { key: "flow", label: "Flow", family: "flow", glyph: "FL" },
  { key: "query", label: "Query", family: "query", glyph: "QR" },
  { key: "creep", label: "Creep", family: "creep", glyph: "CP" },
  { key: "structure", label: "Structure", family: "structure", glyph: "ST" },
  { key: "memory", label: "Memory", family: "memory", glyph: "ME" },
  { key: "tasks", label: "Tasks", family: "task", glyph: "TS" },
  { key: "search", label: "Search", glyph: "SR" },
];

type BottomMenuProps = {
  activeCategory: string | null;
  onToggle: (category: string) => void;
  onSpawn: (kind: string) => void;
  disabled: boolean;
  zoomDisplay: string;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onZoomFit: () => void;
};

const buildSearchNodes = () => {
  const all = listAllMeta();
  return all.filter((meta) => {
    const summary =
      `${meta.title} ${meta.category ?? ""} ${meta.docs.summary ?? ""}`.toLowerCase();
    if (meta.shortcuts?.search) {
      return true;
    }
    return summary.includes("find") || summary.includes("search");
  });
};

export const BottomMenu = memo(
  ({
    activeCategory,
    onToggle,
    onSpawn,
    disabled,
    zoomDisplay,
    onZoomIn,
    onZoomOut,
    onZoomReset,
    onZoomFit,
  }: BottomMenuProps) => {
    const groups = useMemo(() => {
      const searchNodes = buildSearchNodes();
      return CATEGORIES.map((category) => ({
        ...category,
        nodes: category.family ? listByFamily(category.family) : searchNodes,
      }));
    }, []);

    const active = useMemo(
      () => groups.find((group) => group.key === activeCategory) ?? null,
      [groups, activeCategory],
    );

    return (
      <div
        className="bottom-menu"
        role="region"
        aria-label="Node catalog controls"
      >
        {active ? (
          <NodeCatalogPanel
            key={active.key}
            label={active.label}
            nodes={active.nodes}
            disabled={disabled}
            onSpawn={onSpawn}
          />
        ) : null}
        <div
          className="bottom-menu-bar"
          role="toolbar"
          aria-label="Node catalog controls"
        >
          {groups.map((category) => {
            const isActive = active?.key === category.key;
            return (
              <button
                key={category.key}
                type="button"
                className={cn("bottom-menu-button", { active: isActive })}
                onClick={() => onToggle(category.key)}
                aria-pressed={isActive}
                title={category.label}
                disabled={disabled && !isActive}
              >
                <span aria-hidden className="bottom-menu-icon">
                  {category.glyph}
                </span>
                <span className="sr-only">{category.label}</span>
              </button>
            );
          })}
          <span className="bottom-menu-divider" aria-hidden />
          <button
            type="button"
            className="bottom-menu-button control"
            onClick={onZoomOut}
            aria-label="Zoom out"
          >
            −
          </button>
          <span className="bottom-menu-zoom" aria-live="polite">
            {zoomDisplay}
          </span>
          <button
            type="button"
            className="bottom-menu-button control"
            onClick={onZoomIn}
            aria-label="Zoom in"
          >
            ＋
          </button>
          <button
            type="button"
            className="bottom-menu-button control"
            onClick={onZoomReset}
            aria-label="Reset zoom"
          >
            1×
          </button>
          <button
            type="button"
            className="bottom-menu-button control"
            onClick={onZoomFit}
            aria-label="Fit view"
          >
            ⤢
          </button>
        </div>
      </div>
    );
  },
);

BottomMenu.displayName = "BottomMenu";
