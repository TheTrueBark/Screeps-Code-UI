import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { useReactFlow } from '@xyflow/react';
import clsx from 'classnames';
import type { CSSProperties, ReactNode } from 'react';
import type {
  ConfigField,
  DataInputDefinition,
  DataOutputDefinition,
  NodeDefinition,
  SlotDefinition
} from './types';

export interface ScreepsNodeData extends Record<string, unknown> {
  kind: string;
  label: string;
  family: 'flow' | 'query' | 'creep' | 'structure' | 'memory' | 'task';
  config: Record<string, unknown>;
  errors?: string[];
  warnings?: string[];
}

const familyPalette: Record<
  ScreepsNodeData['family'],
  { accent: string; port: string; tint: string; badge: string }
> = {
  flow: { accent: '#00c8ff', port: '#00c8ff', tint: '#00324a', badge: 'FLOW' },
  query: { accent: '#facc15', port: '#facc15', tint: '#3b3000', badge: 'LOGIC' },
  creep: { accent: '#a0a0a0', port: '#b0b0b0', tint: '#1d1d1d', badge: 'NEURAL' },
  structure: { accent: '#a0a0a0', port: '#b0b0b0', tint: '#1d1d1d', badge: 'STRUCT' },
  memory: { accent: '#bb86fc', port: '#bb86fc', tint: '#2f1e54', badge: 'MEMORY' },
  task: { accent: '#facc15', port: '#facc15', tint: '#3b3000', badge: 'LOGIC' }
};

const fieldWrapper = 'field';
const labelClass = 'field-label';
const inputClass = 'field-input';

const safeJsonValue = (value: unknown) => {
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return JSON.stringify(parsed, null, 2);
    } catch (error) {
      return value;
    }
  }

  return JSON.stringify(value ?? '', null, 2);
};

const renderField = (
  data: ScreepsNodeData,
  setConfig: (updater: (prev: Record<string, unknown>) => Record<string, unknown>) => void,
  field: ConfigField
) => {
  const value = data.config[field.name];

  const update = (next: unknown) => {
    setConfig((prev) => ({
      ...prev,
      [field.name]: next
    }));
  };

  switch (field.type) {
    case 'text':
      return (
        <label key={field.name} className={fieldWrapper}>
          <span className={labelClass}>{field.label}</span>
          <input
            type="text"
            className={inputClass}
            placeholder={field.placeholder}
            value={typeof value === 'string' ? value : ''}
            onChange={(event) => update(event.target.value)}
          />
          {field.helper ? <span className="field-helper">{field.helper}</span> : null}
        </label>
      );
    case 'number':
      return (
        <label key={field.name} className={fieldWrapper}>
          <span className={labelClass}>{field.label}</span>
          <input
            type="number"
            className={inputClass}
            value={typeof value === 'number' || typeof value === 'string' ? value : ''}
            min={field.min}
            max={field.max}
            step={field.step}
            onChange={(event) =>
              update(event.target.value === '' ? null : Number(event.target.value))
            }
          />
          {field.helper ? <span className="field-helper">{field.helper}</span> : null}
        </label>
      );
    case 'select':
      return (
        <label key={field.name} className={fieldWrapper}>
          <span className={labelClass}>{field.label}</span>
          <select
            className={inputClass}
            value={typeof value === 'string' ? value : ''}
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
          {field.helper ? <span className="field-helper">{field.helper}</span> : null}
        </label>
      );
    case 'checkbox':
      return (
        <label key={field.name} className="field-checkbox">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(event) => update(event.target.checked)}
          />
          <span>{field.label}</span>
        </label>
      );
    case 'json':
      return (
        <label key={field.name} className={fieldWrapper}>
          <span className={labelClass}>{field.label}</span>
          <textarea
            className={`${inputClass} font-mono`}
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
          {field.helper ? <span className="field-helper">{field.helper}</span> : null}
        </label>
      );
    default:
      return null;
  }
};

const slotHandleId = (slot: SlotDefinition) => `slot:${slot.name}`;

const PORT_BASE_OFFSET = 104;
const PORT_ROW_SPACING = 36;

type NodeShellProps = {
  definition: Omit<NodeDefinition, 'Component'>;
  nodeId: string;
  data: ScreepsNodeData;
  children?: ReactNode;
  slots?: SlotDefinition[];
  dataInputs?: DataInputDefinition[];
  dataOutputs?: DataOutputDefinition[];
  hasFlowInput?: boolean;
  hasFlowOutput?: boolean;
};

export const NodeShell = ({
  definition,
  nodeId,
  data,
  children,
  slots = definition.slots,
  dataInputs = definition.dataInputs,
  dataOutputs = definition.dataOutputs,
  hasFlowInput = definition.hasFlowInput ?? true,
  hasFlowOutput = definition.hasFlowOutput ?? true
}: NodeShellProps) => {
  const { setNodes } = useReactFlow<Node<ScreepsNodeData>>();
  const palette = familyPalette[data.family] ?? familyPalette.creep;
  const hasDataInputs = Boolean(dataInputs?.length);
  const hasDataOutputs = Boolean(dataOutputs?.length);
  const hasSlotOutputs = Boolean(slots?.length);

  const setConfig = (updater: (prev: Record<string, unknown>) => Record<string, unknown>) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id !== nodeId) {
          return node;
        }

        const currentData = (node.data as ScreepsNodeData) ?? {
          kind: '',
          label: '',
          family: 'flow',
          config: {}
        };

        return {
          ...node,
          data: {
            ...currentData,
            config: updater(currentData.config ?? {})
          }
        };
      })
    );
  };

  const style = {
    '--node-accent': palette.accent,
    '--node-tint': palette.tint,
    '--node-port': palette.port
  } as CSSProperties;

  const iconLabel = (definition.subtitle ?? data.kind).slice(0, 2).toUpperCase();

  return (
    <div className="screeps-node" style={style}>
      {hasFlowInput ? (
        <Handle id="flow:in" type="target" position={Position.Top} className="port-dot flow" />
      ) : null}
      {hasFlowOutput ? (
        <Handle id="flow:out" type="source" position={Position.Bottom} className="port-dot flow" />
      ) : null}
      {hasDataInputs ? (
        <div className="node-port-heading left" style={{ top: PORT_BASE_OFFSET - PORT_ROW_SPACING }}>
          Inputs
        </div>
      ) : null}
      <div className="node-ports node-ports-left">
        {dataInputs?.map((input, index) => {
          const top = PORT_BASE_OFFSET + index * PORT_ROW_SPACING;
          return (
            <div key={input.handleId} className="node-port left" style={{ top }}>
              <Handle
                id={input.handleId}
                type="target"
                position={Position.Left}
                className="port-dot"
              />
              <span
                className={clsx('node-port-label', 'input', input.optional && 'optional')}
                title={input.optional ? `${input.label} (optional)` : input.label}
              >
                <span
                  className={clsx('node-port-icon', 'input', input.optional && 'optional')}
                  aria-hidden="true"
                />
                <span className="node-port-text">{input.label}</span>
              </span>
            </div>
          );
        })}
      </div>
      {hasSlotOutputs || hasDataOutputs ? (
        <div className="node-port-heading right" style={{ top: PORT_BASE_OFFSET - PORT_ROW_SPACING }}>
          Outputs
        </div>
      ) : null}
      <div className="node-ports node-ports-right">
        {slots?.map((slot, index) => {
          const top = PORT_BASE_OFFSET + index * PORT_ROW_SPACING;
          return (
            <div key={slot.name} className="node-port right" style={{ top }}>
              <span className="node-port-label output slot" title={slot.label}>
                <span className="node-port-text">{slot.label}</span>
                <span className="node-port-icon output slot" aria-hidden="true" />
              </span>
              <Handle
                id={slotHandleId(slot)}
                type="source"
                position={Position.Right}
                className="port-dot"
              />
            </div>
          );
        })}
        {dataOutputs?.map((output, index) => {
          const slotCount = slots?.length ?? 0;
          const top = PORT_BASE_OFFSET + (slotCount + index) * PORT_ROW_SPACING;
          return (
            <div key={output.handleId} className="node-port right" style={{ top }}>
              <span className="node-port-label output data" title={output.label}>
                <span className="node-port-text">{output.label}</span>
                <span className="node-port-icon output data" aria-hidden="true" />
              </span>
              <Handle
                id={output.handleId}
                type="source"
                position={Position.Right}
                className="port-dot"
              />
            </div>
          );
        })}
      </div>
      <div className="node-surface">
        <header className="node-header">
          <div className="node-header-icon">{iconLabel}</div>
          <div className="node-header-text">
            <span className="node-header-title">{definition.title}</span>
            <span className="node-header-subtitle">{definition.subtitle ?? data.kind}</span>
          </div>
          <span className="node-header-badge">{palette.badge}</span>
        </header>
        <div className="node-body">
          {definition.description ? (
            <p className="node-description">{definition.description}</p>
          ) : null}
          {definition.configFields.map((field) => renderField(data, setConfig, field))}
          {children}
        </div>
        {data.errors && data.errors.length > 0 ? (
          <div className="node-alert error">
            {data.errors.map((error) => (
              <div key={error}>{error}</div>
            ))}
          </div>
        ) : null}
        {data.warnings && data.warnings.length > 0 ? (
          <div className="node-alert warning">
            {data.warnings.map((warning) => (
              <div key={warning}>{warning}</div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export const createNodeComponent = (definition: Omit<NodeDefinition, 'Component'>) => {
  const Component = (props: NodeProps) => {
    const { id, data } = props;
    return <NodeShell definition={definition} nodeId={id} data={data as ScreepsNodeData} />;
  };

  return Component;
};
