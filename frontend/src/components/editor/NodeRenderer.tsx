import { Handle, Position, type Node } from "@xyflow/react";
import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { getIconComponent } from "../../data/icons";
import { getNodeMeta } from "../../data/nodeRegistry";
import type { NodeFamily, NodeMeta } from "../../data/nodeRegistry/schema";
import { cn } from "../../utils/classNames";
import type {
  DataInputDefinition,
  DataOutputDefinition,
  NodeDefinition,
  SlotDefinition,
} from "./NodeTypes/types";
import type { ScreepsNodeData } from "./NodeTypes/BaseNode";

export interface IOPortRow {
  key: string;
  label: string;
  icon?: string;
  inputPort?: string;
  outputPort?: string;
  preview?: string;
  placeholder?: string;
  visible?: boolean;
  control?: ReactNode;
}

const familyPalette: Record<
  NodeFamily,
  { accent: string; port: string; badge: string; tint: string }
> = {
  flowControl: {
    accent: "var(--cyan)",
    port: "var(--cyan)",
    badge: "FLOW",
    tint: "#101820",
  },
  queryTargeting: {
    accent: "var(--yellow)",
    port: "var(--yellow)",
    badge: "QUERY",
    tint: "#18140a",
  },
  creepActions: {
    accent: "#7dd3fc",
    port: "#7dd3fc",
    badge: "CREEP",
    tint: "#0f1820",
  },
  structureLogic: {
    accent: "#f97316",
    port: "#f97316",
    badge: "STRUCT",
    tint: "#1f1208",
  },
  economyMarket: {
    accent: "#22c55e",
    port: "#22c55e",
    badge: "ECON",
    tint: "#0f1a12",
  },
  power: {
    accent: "#f472b6",
    port: "#f472b6",
    badge: "POWER",
    tint: "#1a0f16",
  },
  memoryData: {
    accent: "var(--purple)",
    port: "var(--purple)",
    badge: "MEM",
    tint: "#140f1b",
  },
  mapNavigation: {
    accent: "#60a5fa",
    port: "#60a5fa",
    badge: "MAP",
    tint: "#0f1624",
  },
  globalGame: {
    accent: "#94a3b8",
    port: "#94a3b8",
    badge: "GLOBAL",
    tint: "#13171d",
  },
  taskMacro: {
    accent: "#facc15",
    port: "#facc15",
    badge: "TASK",
    tint: "#18140a",
  },
};

const PORT_SIZE = 6;

const portStyle: CSSProperties = {
  width: PORT_SIZE,
  height: PORT_SIZE,
  borderRadius: PORT_SIZE / 2,
  position: "static",
  left: "auto",
  right: "auto",
  top: "auto",
  bottom: "auto",
  transform: "none",
};

const clampRows = (rows: IOPortRow[]): IOPortRow[] =>
  rows.filter((row) => row && row.visible !== false);

const buildRowsFromMeta = (
  meta: NodeMeta,
  previews: Record<string, string> | undefined,
): IOPortRow[] => {
  const inputs = meta.ports.filter((port) => port.side === "input");
  const outputs = meta.ports.filter((port) => port.side === "output");
  const length = Math.max(inputs.length, outputs.length);

  if (length === 0) {
    return [];
  }

  const rows: IOPortRow[] = [];
  for (let index = 0; index < length; index += 1) {
    const input = inputs[index];
    const output = outputs[index];
    const key = input?.id ?? output?.id ?? `row-${index}`;
    const label = input?.label ?? output?.label ?? `Row ${index + 1}`;
    const previewId = input?.id ?? output?.id;
    const preview = previewId ? previews?.[previewId] : undefined;
    rows.push({
      key,
      label,
      icon: input?.icon ?? output?.icon,
      inputPort: input?.id,
      outputPort: output?.id,
      placeholder: label,
      preview,
    });
  }

  return rows;
};

const mergePortsIntoRows = (
  meta: NodeMeta | undefined,
  inputs: DataInputDefinition[] | undefined,
  outputs: DataOutputDefinition[] | undefined,
  slots: SlotDefinition[] | undefined,
  fallbackRows: IOPortRow[] | undefined,
  previews: Record<string, string> | undefined,
): IOPortRow[] => {
  if (fallbackRows && fallbackRows.length > 0) {
    return clampRows(
      fallbackRows.map((row) => ({
        ...row,
        preview:
          row.preview ??
          (row.inputPort ? previews?.[row.inputPort] : undefined) ??
          (row.outputPort ? previews?.[row.outputPort] : undefined),
      })),
    );
  }

  if (meta) {
    return buildRowsFromMeta(meta, previews);
  }

  const left = (inputs ?? []).map<IOPortRow>((input) => ({
    key: input.handleId,
    label: input.label,
    inputPort: input.handleId,
    placeholder: input.label,
  }));

  const slotRows = (slots ?? []).map<IOPortRow>((slot) => ({
    key: `slot-${slot.name}`,
    label: slot.label,
    outputPort: `slot:${slot.name}`,
    placeholder: slot.label,
  }));

  const right = (outputs ?? []).map<IOPortRow>((output) => ({
    key: output.handleId,
    label: output.label,
    outputPort: output.handleId,
    placeholder: output.label,
  }));

  const rightPorts = [...slotRows, ...right];
  const length = Math.max(left.length, rightPorts.length);
  if (length === 0) {
    return [];
  }

  const rows: IOPortRow[] = [];
  for (let index = 0; index < length; index += 1) {
    const input = left[index];
    const output = rightPorts[index];
    rows.push({
      key: `${input?.key ?? output?.key ?? index}`,
      label: input?.label ?? output?.label ?? `Row ${index + 1}`,
      inputPort: input?.inputPort,
      outputPort: output?.outputPort,
      placeholder: input?.placeholder ?? output?.placeholder,
      preview:
        (input?.inputPort && previews?.[input.inputPort]) ??
        (output?.outputPort && previews?.[output.outputPort]) ??
        output?.preview,
    });
  }

  return rows;
};

const Row = ({
  definition,
  data,
  row,
  meta,
}: {
  definition: Omit<NodeDefinition, "Component">;
  data: ScreepsNodeData;
  row: IOPortRow;
  meta?: NodeMeta;
}) => {
  const palette = familyPalette[meta?.family ?? data.family];
  const Icon = row.icon ? getIconComponent(row.icon) : undefined;

  const content = row.control ?? (
    <div className="node-grid-preview" title={row.preview ?? row.placeholder}>
      {row.preview ? (
        <code>{row.preview}</code>
      ) : (
        <span>{row.placeholder ?? ""}</span>
      )}
    </div>
  );

  return (
    <div className="node-grid-row" data-row-key={row.key}>
      <div className="node-grid-port node-grid-port-left">
        {row.inputPort ? (
          <Handle
            id={row.inputPort}
            type="target"
            position={Position.Left}
            className="node-port"
            style={portStyle}
          />
        ) : (
          <span className="node-port-placeholder" />
        )}
      </div>
      <div className="node-grid-label" title={row.label}>
        <span
          className="node-grid-label-icon"
          aria-hidden="true"
          style={{ color: palette.accent }}
        >
          {Icon ? (
            <Icon className="node-io-icon" />
          ) : (
            (definition.subtitle?.slice(0, 1) ?? "•")
          )}
        </span>
        <span className="node-grid-label-text">{row.label}</span>
      </div>
      <div className="node-grid-control">{content}</div>
      <div className="node-grid-port node-grid-port-right">
        {row.outputPort ? (
          <Handle
            id={row.outputPort}
            type="source"
            position={Position.Right}
            className="node-port"
            style={portStyle}
          />
        ) : (
          <span className="node-port-placeholder" />
        )}
      </div>
    </div>
  );
};

export interface NodeRendererProps {
  nodeId: string;
  definition: Omit<NodeDefinition, "Component">;
  node: Node<ScreepsNodeData>;
  dataInputs?: DataInputDefinition[];
  dataOutputs?: DataOutputDefinition[];
  slots?: SlotDefinition[];
  rows?: IOPortRow[];
  extraRows?: IOPortRow[];
  meta?: NodeMeta;
  children?: ReactNode;
}

export const NodeRenderer = ({
  nodeId,
  definition,
  node,
  dataInputs = definition.dataInputs,
  dataOutputs = definition.dataOutputs,
  slots = definition.slots,
  rows,
  extraRows,
  meta,
  children,
}: NodeRendererProps) => {
  const resolvedMeta = meta ?? getNodeMeta(node.data.kind);
  const paletteSource = resolvedMeta
    ? familyPalette[resolvedMeta.family]
    : familyPalette[node.data.family];
  const palette = paletteSource ?? familyPalette.flowControl;
  const headerRef = useRef<HTMLDivElement | null>(null);
  const rowsRef = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState<number | null>(null);

  const computedRows = useMemo(
    () =>
      mergePortsIntoRows(
        resolvedMeta,
        dataInputs,
        dataOutputs,
        slots,
        rows ?? node.data.rows,
        node.data.portPreviews as Record<string, string> | undefined,
      ),
    [
      resolvedMeta,
      dataInputs,
      dataOutputs,
      slots,
      rows,
      node.data.rows,
      node.data.portPreviews,
    ],
  );

  const visibleRows = useMemo(() => {
    const combined = [...computedRows, ...(extraRows ?? [])];
    return clampRows(combined);
  }, [computedRows, extraRows]);

  const updateHeight = useCallback(() => {
    const container = rowsRef.current;
    if (!container) {
      return;
    }

    const nextHeight = container.scrollHeight;
    setHeight(nextHeight);
  }, []);

  useLayoutEffect(() => {
    if (resolvedMeta?.autoExpand === false) {
      setHeight(null);
      return;
    }
    updateHeight();
  }, [resolvedMeta?.autoExpand, visibleRows, updateHeight]);

  const status = node.data.status;
  const badge =
    status === "error" ? "ERR" : status === "warning" ? "WARN" : palette.badge;

  const nodeClass = cn("oled-node", {
    disabled: node.data.disabled,
    [`family-${resolvedMeta?.family ?? definition.family}`]: true,
    editing: Boolean((node.data as ScreepsNodeData).editing),
  });

  const headerStyle = {
    borderColor: resolvedMeta?.color ?? palette.accent,
  } as CSSProperties;

  const headerIcon = useMemo(() => {
    if (resolvedMeta?.icon) {
      const Icon = getIconComponent(resolvedMeta.icon);
      if (Icon) {
        return <Icon className="oled-node-icon-glyph" />;
      }
    }
    return (
      <span className="oled-node-icon-fallback">
        {resolvedMeta?.acronym ?? definition.title.slice(0, 2).toUpperCase()}
      </span>
    );
  }, [definition.title, resolvedMeta?.acronym, resolvedMeta?.icon]);

  return (
    <div
      className={nodeClass}
      data-node-id={nodeId}
      style={
        {
          "--node-accent": resolvedMeta?.color ?? palette.accent,
          "--node-port": palette.port,
        } as CSSProperties
      }
    >
      <div className="oled-node-surface">
        <header
          ref={headerRef}
          className="oled-node-header"
          style={headerStyle}
        >
          <div className="oled-node-title">
            <span className="oled-node-icon" aria-hidden="true">
              {headerIcon}
            </span>
            <div className="oled-node-text">
              <span className="oled-node-name">
                {resolvedMeta?.title ?? definition.title}
              </span>
            </div>
          </div>
          <div className="oled-node-meta">
            {status ? (
              <span className={cn("oled-node-status", status)}>{status}</span>
            ) : null}
            <span className="oled-node-badge">{badge}</span>
          </div>
        </header>
        <div
          className="oled-node-rows"
          ref={rowsRef}
          style={{ height: height ?? "auto" }}
        >
          <div className="oled-node-rows-inner">
            {visibleRows.map((row) => (
              <Row
                key={row.key}
                definition={definition}
                data={node.data}
                row={row}
                meta={resolvedMeta}
              />
            ))}
            {visibleRows.length === 0 ? (
              <div className="node-empty">No inputs or outputs</div>
            ) : null}
            {children}
          </div>
        </div>
        {node.data.meta ? (
          <footer className="oled-node-footer">{node.data.meta}</footer>
        ) : null}
      </div>
    </div>
  );
};
