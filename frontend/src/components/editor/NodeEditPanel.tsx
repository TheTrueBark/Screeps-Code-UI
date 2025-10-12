import { useCallback, useMemo } from "react";
import { nanoid } from "nanoid";
import { useReactFlow, type Edge, type Node } from "@xyflow/react";
import { getIconComponent } from "../../data/icons";
import type { NodeMeta } from "../../data/nodeRegistry/schema";
import { cn } from "../../utils/classNames";
import type { ScreepsNodeData, FilterConfig } from "./NodeTypes/BaseNode";
import {
  FILTER_OPERATORS,
  normalizeFilters,
  safeJsonValue,
} from "./NodeTypes/BaseNode";
import type { NodeDefinition } from "./NodeTypes/types";

const FALLBACK_DATA: ScreepsNodeData = {
  kind: "",
  label: "",
  family: "flow",
  config: {},
};

type NodeEditPanelProps = {
  node: Node<ScreepsNodeData> | null;
  definition: NodeDefinition | undefined;
  meta: NodeMeta | undefined;
  open: boolean;
  onClose: () => void;
  onConfigChange: () => void;
};

const buildFilterSummary = (filter: FilterConfig, index: number) => {
  const field = filter.field ?? "candidate";
  const op = filter.op ?? "===";
  const value = filter.value ?? "";
  return `Filter ${index + 1}: ${field} ${op} ${String(value)}`;
};

export const NodeEditPanel = ({
  node,
  definition,
  meta,
  open,
  onClose,
  onConfigChange,
}: NodeEditPanelProps) => {
  const { setNodes } = useReactFlow<Node<ScreepsNodeData>, Edge>();
  const nodeId = node?.id;
  const data = (node?.data as ScreepsNodeData | undefined) ?? undefined;

  const setConfig = useCallback(
    (updater: (prev: Record<string, unknown>) => Record<string, unknown>) => {
      if (!nodeId) {
        return;
      }

      setNodes((current) =>
        current.map((entry) => {
          if (entry.id !== nodeId) {
            return entry;
          }

          const currentData =
            (entry.data as ScreepsNodeData) ?? data ?? FALLBACK_DATA;

          return {
            ...entry,
            data: {
              ...currentData,
              config: updater(currentData.config ?? {}),
            },
          };
        }),
      );

      onConfigChange();
    },
    [data, nodeId, onConfigChange, setNodes],
  );

  const filters = useMemo(
    () => normalizeFilters(data?.config?.filters),
    [data?.config?.filters],
  );

  const handleFilterChange = useCallback(
    (id: string, key: "field" | "op" | "value", value: string) => {
      setConfig((prev) => {
        const current = normalizeFilters(
          (prev as Record<string, unknown>).filters,
        );
        return {
          ...prev,
          filters: current.map((filter) =>
            filter.id === id
              ? {
                  ...filter,
                  [key]: value,
                }
              : filter,
          ),
        };
      });
    },
    [setConfig],
  );

  const handleAddFilter = useCallback(() => {
    setConfig((prev) => {
      const current = normalizeFilters(
        (prev as Record<string, unknown>).filters,
      );
      return {
        ...prev,
        filters: [
          ...current,
          { id: nanoid(6), field: "", op: "===", value: "" },
        ],
      };
    });
  }, [setConfig]);

  const handleRemoveFilter = useCallback(
    (id: string) => {
      setConfig((prev) => {
        const current = normalizeFilters(
          (prev as Record<string, unknown>).filters,
        );
        return {
          ...prev,
          filters: current.filter((filter) => filter.id !== id),
        };
      });
    },
    [setConfig],
  );

  const handleFieldChange = useCallback(
    (name: string, value: unknown) => {
      setConfig((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    [setConfig],
  );

  const headerIcon = useMemo(() => {
    if (meta?.icon) {
      const Icon = getIconComponent(meta.icon);
      if (Icon) {
        return <Icon className="node-edit-panel-icon-glyph" />;
      }
    }

    if (meta?.acronym) {
      return (
        <span className="node-edit-panel-icon-fallback">{meta.acronym}</span>
      );
    }

    if (definition?.title) {
      return (
        <span className="node-edit-panel-icon-fallback">
          {definition.title.slice(0, 2).toUpperCase()}
        </span>
      );
    }

    return <span className="node-edit-panel-icon-fallback">ND</span>;
  }, [definition?.title, meta?.acronym, meta?.icon]);

  const panelClass = cn("node-edit-panel", { open });
  const hasDefinition = Boolean(node && definition && data);
  const configFields = definition?.configFields ?? [];

  return (
    <aside className={panelClass} aria-hidden={!open}>
      <div className="node-edit-panel-header">
        <div className="node-edit-panel-header-main">
          <span className="node-edit-panel-icon" aria-hidden="true">
            {headerIcon}
          </span>
          <div className="node-edit-panel-titles">
            <div className="node-edit-panel-title">
              {meta?.title ?? data?.label ?? "Node"}
            </div>
            <div className="node-edit-panel-subtitle">
              {definition?.description ?? ""}
            </div>
          </div>
        </div>
        <button
          type="button"
          className="node-edit-panel-close"
          onClick={onClose}
          aria-label="Close editor"
        >
          ✕
        </button>
      </div>
      <div className="node-edit-panel-content">
        {!hasDefinition ? (
          <div className="node-edit-panel-empty">
            Select a node and choose Edit to configure it.
          </div>
        ) : configFields.length === 0 ? (
          <div className="node-edit-panel-empty">
            This node has no editable settings.
          </div>
        ) : (
          configFields.map((field) => {
            const value = data?.config?.[field.name];

            if (field.type === "json" && field.name === "filters") {
              return (
                <div
                  key={`config:${field.name}`}
                  className="node-edit-panel-section"
                >
                  <div className="node-edit-panel-label">{field.label}</div>
                  {field.helper ? (
                    <div className="node-edit-panel-helper">{field.helper}</div>
                  ) : null}
                  <div className="node-edit-panel-filters">
                    {filters.length === 0 ? (
                      <div className="node-edit-panel-empty muted">
                        No filters defined.
                      </div>
                    ) : (
                      filters.map((filter, index) => (
                        <div key={filter.id} className="node-edit-panel-filter">
                          <div className="node-edit-panel-filter-heading">
                            {buildFilterSummary(filter, index)}
                          </div>
                          <div className="node-filter-control">
                            <input
                              type="text"
                              className="node-grid-input sm"
                              placeholder="candidate.prop"
                              value={
                                typeof filter.field === "string"
                                  ? filter.field
                                  : ""
                              }
                              onChange={(event) =>
                                handleFilterChange(
                                  filter.id,
                                  "field",
                                  event.target.value,
                                )
                              }
                            />
                            <select
                              className="node-grid-select sm"
                              value={
                                typeof filter.op === "string"
                                  ? filter.op
                                  : "==="
                              }
                              onChange={(event) =>
                                handleFilterChange(
                                  filter.id,
                                  "op",
                                  event.target.value,
                                )
                              }
                            >
                              {FILTER_OPERATORS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                              {filter.op &&
                              !FILTER_OPERATORS.some(
                                (option) => option.value === filter.op,
                              ) ? (
                                <option value={String(filter.op)}>
                                  {filter.op}
                                </option>
                              ) : null}
                            </select>
                            <input
                              type="text"
                              className="node-grid-input sm"
                              placeholder="Value"
                              value={
                                typeof filter.value === "string"
                                  ? filter.value
                                  : String(filter.value ?? "")
                              }
                              onChange={(event) =>
                                handleFilterChange(
                                  filter.id,
                                  "value",
                                  event.target.value,
                                )
                              }
                            />
                            <button
                              type="button"
                              className="node-grid-remove"
                              onClick={() => handleRemoveFilter(filter.id)}
                              aria-label="Remove filter"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                    <button
                      type="button"
                      className="node-grid-add"
                      onClick={handleAddFilter}
                    >
                      + Add Filter
                    </button>
                  </div>
                </div>
              );
            }

            if (field.type === "text") {
              return (
                <div
                  key={`config:${field.name}`}
                  className="node-edit-panel-section"
                >
                  <div className="node-edit-panel-label">{field.label}</div>
                  {field.helper ? (
                    <div className="node-edit-panel-helper">{field.helper}</div>
                  ) : null}
                  <input
                    type="text"
                    className="node-grid-input"
                    placeholder={field.placeholder}
                    value={typeof value === "string" ? value : ""}
                    onChange={(event) =>
                      handleFieldChange(field.name, event.target.value)
                    }
                  />
                </div>
              );
            }

            if (field.type === "number") {
              return (
                <div
                  key={`config:${field.name}`}
                  className="node-edit-panel-section"
                >
                  <div className="node-edit-panel-label">{field.label}</div>
                  {field.helper ? (
                    <div className="node-edit-panel-helper">{field.helper}</div>
                  ) : null}
                  <input
                    type="number"
                    className="node-grid-input"
                    value={
                      typeof value === "number" || typeof value === "string"
                        ? value
                        : ""
                    }
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    onChange={(event) =>
                      handleFieldChange(
                        field.name,
                        event.target.value === ""
                          ? null
                          : Number(event.target.value),
                      )
                    }
                  />
                </div>
              );
            }

            if (field.type === "select") {
              return (
                <div
                  key={`config:${field.name}`}
                  className="node-edit-panel-section"
                >
                  <div className="node-edit-panel-label">{field.label}</div>
                  {field.helper ? (
                    <div className="node-edit-panel-helper">{field.helper}</div>
                  ) : null}
                  <select
                    className="node-grid-select"
                    value={typeof value === "string" ? value : ""}
                    onChange={(event) =>
                      handleFieldChange(field.name, event.target.value)
                    }
                  >
                    <option value="" disabled>
                      Select…
                    </option>
                    {field.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              );
            }

            if (field.type === "checkbox") {
              return (
                <div
                  key={`config:${field.name}`}
                  className="node-edit-panel-section"
                >
                  <label className="node-edit-panel-checkbox">
                    <input
                      type="checkbox"
                      className="node-grid-checkbox"
                      checked={Boolean(value)}
                      onChange={(event) =>
                        handleFieldChange(field.name, event.target.checked)
                      }
                    />
                    <span>{field.label}</span>
                  </label>
                  {field.helper ? (
                    <div className="node-edit-panel-helper">{field.helper}</div>
                  ) : null}
                </div>
              );
            }

            return (
              <div
                key={`config:${field.name}`}
                className="node-edit-panel-section"
              >
                <div className="node-edit-panel-label">{field.label}</div>
                {field.helper ? (
                  <div className="node-edit-panel-helper">{field.helper}</div>
                ) : null}
                <textarea
                  className="node-grid-input font-mono node-edit-panel-textarea"
                  rows={field.rows ?? 4}
                  value={safeJsonValue(value)}
                  onChange={(event) => {
                    const raw = event.target.value;
                    try {
                      const parsed = JSON.parse(raw);
                      handleFieldChange(field.name, parsed);
                    } catch (error) {
                      handleFieldChange(field.name, raw);
                    }
                  }}
                />
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};

NodeEditPanel.displayName = "NodeEditPanel";
