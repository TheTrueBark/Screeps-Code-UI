import { useReactFlow, type NodeProps, type Node } from "@xyflow/react";
import { useCallback, useMemo, type ReactNode } from "react";
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

const renderField = (
  data: ScreepsNodeData,
  setConfig: (updater: (prev: Record<string, unknown>) => Record<string, unknown>) => void,
  field: ConfigField,
): ReactNode => {
  const value = data.config[field.name];

  const update = (next: unknown) => {
    setConfig((prev) => ({
      ...prev,
      [field.name]: next,
    }));
  };

  switch (field.type) {
    case "text":
      return (
        <label key={field.name} className="oled-field">
          <span className="oled-field-label">{field.label}</span>
          <input
            type="text"
            className="oled-field-input"
            placeholder={field.placeholder}
            value={typeof value === "string" ? value : ""}
            onChange={(event) => update(event.target.value)}
          />
          {field.helper ? <span className="oled-field-helper">{field.helper}</span> : null}
        </label>
      );
    case "number":
      return (
        <label key={field.name} className="oled-field">
          <span className="oled-field-label">{field.label}</span>
          <input
            type="number"
            className="oled-field-input"
            value={typeof value === "number" || typeof value === "string" ? value : ""}
            min={field.min}
            max={field.max}
            step={field.step}
            onChange={(event) => update(event.target.value === "" ? null : Number(event.target.value))}
          />
          {field.helper ? <span className="oled-field-helper">{field.helper}</span> : null}
        </label>
      );
    case "select":
      return (
        <label key={field.name} className="oled-field">
          <span className="oled-field-label">{field.label}</span>
          <select
            className="oled-field-input"
            value={typeof value === "string" ? value : ""}
            onChange={(event) => update(event.target.value)}
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
          {field.helper ? <span className="oled-field-helper">{field.helper}</span> : null}
        </label>
      );
    case "checkbox":
      return (
        <label key={field.name} className="oled-field-checkbox">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(event) => update(event.target.checked)}
          />
          <span>{field.label}</span>
        </label>
      );
    case "json":
      return (
        <label key={field.name} className="oled-field">
          <span className="oled-field-label">{field.label}</span>
          <textarea
            className="oled-field-input font-mono"
            rows={field.rows ?? 3}
            value={safeJsonValue(value)}
            onChange={(event) => {
              const raw = event.target.value;
              try {
                const parsed = JSON.parse(raw);
                update(parsed);
              } catch (error) {
                update(raw);
              }
            }}
          />
          {field.helper ? <span className="oled-field-helper">{field.helper}</span> : null}
        </label>
      );
    default:
      return null;
  }
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

  const configContent = useMemo(() => {
    if (!definition.configFields.length) {
      return null;
    }

    return (
      <div className="oled-node-config">
        {definition.configFields.map((field) => renderField(data, setConfig, field))}
      </div>
    );
  }, [data, definition.configFields, setConfig]);

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
      meta={meta}
    >
      {configContent}
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
