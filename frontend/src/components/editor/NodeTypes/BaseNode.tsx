import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { useReactFlow } from '@xyflow/react';
import type { ReactNode } from 'react';
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

const familyAccent: Record<ScreepsNodeData['family'], string> = {
  flow: 'border-cyan-500/30 bg-cyan-500/15 text-cyan-100',
  query: 'border-amber-500/30 bg-amber-500/15 text-amber-100',
  creep: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-100',
  structure: 'border-violet-500/30 bg-violet-500/15 text-violet-100',
  memory: 'border-sky-500/30 bg-sky-500/15 text-sky-100',
  task: 'border-rose-500/30 bg-rose-500/15 text-rose-100'
};

const fieldContainer = 'flex flex-col gap-1';
const fieldLabel = 'text-xs font-medium text-slate-200';
const inputBase =
  'w-full rounded border border-slate-600 bg-slate-900/60 px-2 py-1 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none focus:ring-0';

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

  const handleChange = (next: unknown) => {
    setConfig((prev) => ({
      ...prev,
      [field.name]: next
    }));
  };

  switch (field.type) {
    case 'text':
      return (
        <label key={field.name} className={fieldContainer}>
          <span className={fieldLabel}>{field.label}</span>
          <input
            type="text"
            className={inputBase}
            placeholder={field.placeholder}
            value={typeof value === 'string' ? value : ''}
            onChange={(event) => handleChange(event.target.value)}
          />
          {field.helper ? <span className="text-[10px] text-slate-400">{field.helper}</span> : null}
        </label>
      );
    case 'number':
      return (
        <label key={field.name} className={fieldContainer}>
          <span className={fieldLabel}>{field.label}</span>
          <input
            type="number"
            className={inputBase}
            value={typeof value === 'number' || typeof value === 'string' ? value : ''}
            min={field.min}
            max={field.max}
            step={field.step}
            onChange={(event) => handleChange(event.target.value === '' ? null : Number(event.target.value))}
          />
          {field.helper ? <span className="text-[10px] text-slate-400">{field.helper}</span> : null}
        </label>
      );
    case 'select':
      return (
        <label key={field.name} className={fieldContainer}>
          <span className={fieldLabel}>{field.label}</span>
          <select
            className={inputBase}
            value={typeof value === 'string' ? value : ''}
            onChange={(event) => handleChange(event.target.value)}
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
          {field.helper ? <span className="text-[10px] text-slate-400">{field.helper}</span> : null}
        </label>
      );
    case 'checkbox':
      return (
        <label key={field.name} className="flex items-center gap-2 text-xs text-slate-200">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(event) => handleChange(event.target.checked)}
            className="h-3 w-3 rounded border-slate-600 bg-slate-900 text-cyan-500 focus:ring-cyan-400"
          />
          {field.label}
        </label>
      );
    case 'json':
      return (
        <label key={field.name} className={fieldContainer}>
          <span className={fieldLabel}>{field.label}</span>
          <textarea
            className={`${inputBase} font-mono`}
            rows={field.rows ?? 3}
            value={safeJsonValue(value)}
            onChange={(event) => {
              const raw = event.target.value;
              try {
                const parsed = JSON.parse(raw);
                handleChange(parsed);
              } catch (error) {
                handleChange(raw);
              }
            }}
          />
          {field.helper ? <span className="text-[10px] text-slate-400">{field.helper}</span> : null}
        </label>
      );
    default:
      return null;
  }
};

const slotHandleId = (slot: SlotDefinition) => `slot:${slot.name}`;

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

  const accent = familyAccent[data.family] ?? 'border-slate-600 bg-slate-800/80 text-slate-100';

  return (
    <div className="relative min-w-[230px] max-w-[280px] rounded-xl border border-slate-700 bg-slate-900/95 p-3 shadow-xl">
      {hasFlowInput ? (
        <Handle id="flow:in" type="target" position={Position.Top} className="h-2 w-2" />
      ) : null}
      {hasFlowOutput ? (
        <Handle id="flow:out" type="source" position={Position.Bottom} className="h-2 w-2" />
      ) : null}
      {slots?.map((slot, index) => (
        <div key={slot.name} className="absolute right-[-52px] flex items-center gap-1 text-[11px] text-slate-300" style={{ top: 72 + index * 28 }}>
          <span>{slot.label}</span>
          <Handle id={slotHandleId(slot)} type="source" position={Position.Right} className="h-2 w-2" />
        </div>
      ))}
      {dataInputs?.map((input, index) => (
        <div key={input.handleId} className="absolute left-[-58px] flex items-center gap-1 text-[11px] text-slate-400" style={{ top: 72 + index * 26 }}>
          <Handle id={input.handleId} type="target" position={Position.Left} className="h-2 w-2" />
          <span>{input.label}</span>
        </div>
      ))}
      {dataOutputs?.map((output, index) => (
        <div key={output.handleId} className="absolute right-[-58px] flex items-center gap-1 text-[11px] text-slate-400" style={{ top: 72 + (slots?.length ?? 0) * 28 + index * 26 }}>
          <span>{output.label}</span>
          <Handle id={output.handleId} type="source" position={Position.Right} className="h-2 w-2" />
        </div>
      ))}
      <div className={`rounded-lg border px-3 py-2 ${accent}`}>
        <div className="text-xs uppercase tracking-wide text-slate-300">{definition.subtitle}</div>
        <div className="text-base font-semibold">{definition.title}</div>
      </div>
      <div className="mt-3 flex flex-col gap-3 text-xs text-slate-200">
        {definition.description ? <p className="text-[11px] text-slate-400">{definition.description}</p> : null}
        {definition.configFields.map((field) => renderField(data, setConfig, field))}
        {children}
      </div>
      {data.errors && data.errors.length > 0 ? (
        <div className="mt-3 rounded-md border border-rose-500 bg-rose-900/40 p-2 text-[11px] text-rose-200">
          {data.errors.map((error) => (
            <div key={error}>{error}</div>
          ))}
        </div>
      ) : null}
      {data.warnings && data.warnings.length > 0 ? (
        <div className="mt-3 rounded-md border border-amber-500 bg-amber-900/40 p-2 text-[11px] text-amber-200">
          {data.warnings.map((warning) => (
            <div key={warning}>{warning}</div>
          ))}
        </div>
      ) : null}
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
