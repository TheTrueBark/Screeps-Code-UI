import { useReactFlow, type NodeProps, type Node } from "@xyflow/react";
import { nanoid } from "nanoid";
import { useCallback, useEffect, useMemo, type ReactNode } from "react";
import { getNodeMeta } from "../../../data/nodeRegistry";
import { NodeRenderer, type IOPortRow } from "../NodeRenderer";
import type {
  ConfigField,
  DataInputDefinition,
  DataOutputDefinition,
  NodeDefinition,
  SlotDefinition,
} from "./types";

export interface ScreepsNodeData extends Record<string, unknown> {
  kind: string;
  label: string;
  family: "flow" | "query" | "creep" | "structure" | "memory" | "task";
  config: Record<string, unknown>;
  errors?: string[];
  warnings?: string[];
  rows?: IOPortRow[];
  meta?: string;
  status?: "idle" | "warning" | "error";
  disabled?: boolean;
  portPreviews?: Record<string, string>;
  editing?: boolean;
}

const safeJsonValue = (value: unknown) => {
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return JSON.stringify(parsed, null, 2);
    } catch (error) {
      return value;
    }
  }

  return JSON.stringify(value ?? "", null, 2);
};

type FilterConfig = {
  id: string;
  field?: string;
  op?: string;
  value?: unknown;
};

const FILTER_OPERATORS: Array<{ label: string; value: string }> = [
  { label: "===", value: "===" },
  { label: "!==", value: "!==" },
  { label: ">", value: ">" },
  { label: "<", value: "<" },
  { label: ">=", value: ">=" },
  { label: "<=", value: "<=" },
  { label: "includes", value: "includes" }
];

const normalizeFilters = (filters: unknown): FilterConfig[] => {
  if (!Array.isArray(filters)) {
    return [];
  }

  return filters.map((entry) => {
    if (!entry || typeof entry !== "object") {
      return { id: nanoid(6), field: "", op: "===", value: "" };
    }

    const value = entry as Record<string, unknown>;
    return {
      id: typeof value.id === "string" ? value.id : nanoid(6),
      field: typeof value.field === "string" ? value.field : "",
      op: typeof value.op === "string" ? value.op : "===",
      value: value.value
    };
  });
};

type NodeShellProps = {
  definition: Omit<NodeDefinition, "Component">;
  nodeId: string;
  data: ScreepsNodeData;
  children?: ReactNode;
  slots?: SlotDefinition[];
  dataInputs?: DataInputDefinition[];
  dataOutputs?: DataOutputDefinition[];
  rows?: IOPortRow[];
};

export const NodeShell = ({
  definition,
  nodeId,
  data,
  children,
  slots,
  dataInputs,
  dataOutputs,
  rows,
}: NodeShellProps) => {
  const { setNodes, getNode } = useReactFlow<Node<ScreepsNodeData>>();
  const meta = useMemo(() => getNodeMeta(data.kind), [data.kind]);

  const node = useMemo(() => {
    const resolved = getNode(nodeId);
    if (resolved) {
      return resolved;
    }

    return {
      id: nodeId,
      type: definition.type,
      position: { x: 0, y: 0 },
      data,
      selected: false,
      dragging: false,
    } as Node<ScreepsNodeData>;
  }, [data, definition.type, getNode, nodeId]);

  const setConfig = useCallback(
    (updater: (prev: Record<string, unknown>) => Record<string, unknown>) => {
      setNodes((nodes) =>
        nodes.map((entry) => {
          if (entry.id !== nodeId) {
            return entry;
          }

          const currentData = (entry.data as ScreepsNodeData) ?? data;
          return {
            ...entry,
            data: {
              ...currentData,
              config: updater(currentData.config ?? {}),
            },
          };
        }),
      );
    },
    [data, nodeId, setNodes],
  );

  useEffect(() => {
    const raw = data.config.filters;
    if (!Array.isArray(raw)) {
      return;
    }

    const missingId = raw.some(
      (entry) => !entry || typeof entry !== "object" || typeof (entry as Record<string, unknown>).id !== "string",
    );

    if (!missingId) {
      return;
    }

    setConfig((prev) => ({
      ...prev,
      filters: normalizeFilters((prev as Record<string, unknown>).filters),
    }));
  }, [data.config.filters, setConfig]);

  const filters = useMemo(() => normalizeFilters(data.config.filters), [data.config.filters]);
  const isEditing = Boolean(data.editing);

  const mutateFilters = useCallback(
    (updater: (current: FilterConfig[]) => FilterConfig[]) => {
      setConfig((prev) => ({
        ...prev,
        filters: updater(normalizeFilters((prev as Record<string, unknown>).filters)),
      }));
    },
    [setConfig],
  );

  const handleFilterChange = useCallback(
    (id: string, key: "field" | "op" | "value", value: string) => {
      mutateFilters((current) =>
        current.map((filter) =>
          filter.id === id
            ? {
                ...filter,
                [key]: value,
              }
            : filter,
        ),
      );
    },
    [mutateFilters],
  );

  const handleAddFilter = useCallback(() => {
    mutateFilters((current) => [...current, { id: nanoid(6), field: "", op: "===", value: "" }]);
  }, [mutateFilters]);

  const handleRemoveFilter = useCallback(
    (id: string) => {
      mutateFilters((current) => current.filter((filter) => filter.id !== id));
    },
    [mutateFilters],
  );

  const configRows = useMemo(() => {
    const rowsList: IOPortRow[] = [];

    definition.configFields.forEach((field) => {
      if (field.type === "json" && field.name === "filters") {
        if (filters.length === 0) {
          rowsList.push({
            key: "filters:empty",
            label: "Filters",
            control: isEditing ? (
              <button type="button" className="node-grid-add" onClick={handleAddFilter}>
                + Add Filter
              </button>
            ) : (
              <div className="node-grid-preview muted">No filters</div>
            ),
          });
        } else {
          filters.forEach((filter, index) => {
            const summary = `${filter.field ?? "candidate"} ${filter.op ?? "==="} ${String(
              filter.value ?? "",
            )}`.trim();
            rowsList.push({
              key: `filters:${filter.id}`,
              label: `Filter ${index + 1}`,
              control: isEditing ? (
                <div className="node-filter-control">
                  <input
                    type="text"
                    className="node-grid-input sm"
                    placeholder="candidate.prop"
                    value={typeof filter.field === "string" ? filter.field : ""}
                    onChange={(event) => handleFilterChange(filter.id, "field", event.target.value)}
                  />
                  <select
                    className="node-grid-select sm"
                    value={typeof filter.op === "string" ? filter.op : "==="}
                    onChange={(event) => handleFilterChange(filter.id, "op", event.target.value)}
                  >
                    {FILTER_OPERATORS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                    {filter.op && !FILTER_OPERATORS.some((option) => option.value === filter.op) ? (
                      <option value={String(filter.op)}>{filter.op}</option>
                    ) : null}
                  </select>
                  <input
                    type="text"
                    className="node-grid-input sm"
                    placeholder="Value"
                    value={typeof filter.value === "string" ? filter.value : String(filter.value ?? "")}
                    onChange={(event) => handleFilterChange(filter.id, "value", event.target.value)}
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
              ) : (
                <div className="node-grid-preview" title={summary}>
                  {summary}
                </div>
              ),
            });
          });

          if (isEditing) {
            rowsList.push({
              key: "filters:add",
              label: "Filters",
              control: (
                <button type="button" className="node-grid-add" onClick={handleAddFilter}>
                  + Add Filter
                </button>
              ),
            });
          }
        }

        return;
      }

      const value = data.config[field.name];
      const updateField = (next: unknown) => {
        setConfig((prev) => ({
          ...prev,
          [field.name]: next,
        }));
      };

      if (field.type === "text") {
        rowsList.push({
          key: `config:${field.name}`,
          label: field.label,
          control: (
            <input
              type="text"
              className="node-grid-input"
              placeholder={field.placeholder}
              value={typeof value === "string" ? value : ""}
              onChange={(event) => updateField(event.target.value)}
            />
          ),
        });
        return;
      }

      if (field.type === "number") {
        rowsList.push({
          key: `config:${field.name}`,
          label: field.label,
          control: (
            <input
              type="number"
              className="node-grid-input"
              value={typeof value === "number" || typeof value === "string" ? value : ""}
              min={field.min}
              max={field.max}
              step={field.step}
              onChange={(event) =>
                updateField(event.target.value === "" ? null : Number(event.target.value))
              }
            />
          ),
        });
        return;
      }

      if (field.type === "select") {
        rowsList.push({
          key: `config:${field.name}`,
          label: field.label,
          control: (
            <select
              className="node-grid-select"
              value={typeof value === "string" ? value : ""}
              onChange={(event) => updateField(event.target.value)}
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
          ),
        });
        return;
      }

      if (field.type === "checkbox") {
        rowsList.push({
          key: `config:${field.name}`,
          label: field.label,
          control: (
            <input
              type="checkbox"
              className="node-grid-checkbox"
              checked={Boolean(value)}
              onChange={(event) => updateField(event.target.checked)}
            />
          ),
        });
        return;
      }

      if (field.type === "json") {
        rowsList.push({
          key: `config:${field.name}`,
          label: field.label,
          control: (
            <input
              type="text"
              className="node-grid-input font-mono"
              value={safeJsonValue(value)}
              onChange={(event) => {
                const raw = event.target.value;
                try {
                  const parsed = JSON.parse(raw);
                  updateField(parsed);
                } catch (error) {
                  updateField(raw);
                }
              }}
            />
          ),
        });
      }
    });

    return rowsList;
  }, [data.config, definition.configFields, filters, handleAddFilter, handleFilterChange, handleRemoveFilter, isEditing, setConfig]);

  const alerts = useMemo(() => {
    const items: ReactNode[] = [];
    if (data.errors?.length) {
      items.push(
        <div key="errors" className="oled-node-alert error">
          {data.errors.map((error) => (
            <div key={error}>{error}</div>
          ))}
        </div>,
      );
    }

    if (data.warnings?.length) {
      items.push(
        <div key="warnings" className="oled-node-alert warning">
          {data.warnings.map((warning) => (
            <div key={warning}>{warning}</div>
          ))}
        </div>,
      );
    }

    return items;
  }, [data.errors, data.warnings]);

  return (
    <NodeRenderer
      nodeId={nodeId}
      definition={definition}
      node={node}
      dataInputs={dataInputs}
      dataOutputs={dataOutputs}
      slots={slots}
      rows={rows}
      extraRows={configRows}
      meta={meta}
    >
      {children}
      {alerts.length > 0 ? <div className="oled-node-alerts">{alerts}</div> : null}
    </NodeRenderer>
  );
};

export const createNodeComponent = (definition: Omit<NodeDefinition, "Component">) => {
  const Component = (props: NodeProps) => {
    const { id, data } = props;
    return (
      <NodeShell
        definition={definition}
        nodeId={id}
        data={(data as ScreepsNodeData) ?? { config: {}, kind: "", label: "", family: "flow" }}
      />
    );
  };

  return Component;
};
