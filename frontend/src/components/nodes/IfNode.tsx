import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';

interface IfNodeData extends Record<string, unknown> {
  label?: string;
  condition?: string;
}

export type IfNodeType = Node<IfNodeData, 'if'>;

export const IfNode = ({ data }: NodeProps<IfNodeType>) => {
  const nodeData = data ?? {};
  return (
    <div className="w-56 rounded-lg border border-sky-500 bg-slate-900/80 p-4 shadow-lg">
      <header className="mb-2 flex items-center justify-between text-xs uppercase tracking-wide text-sky-300">
        <span>Condition</span>
        <span>IF</span>
      </header>
      <p className="text-sm font-semibold text-slate-100">
        {nodeData.label ?? 'Unnamed Condition'}
      </p>
      <p className="mt-1 text-xs text-slate-400">
        {nodeData.condition ?? 'energy > 50'}
      </p>
      <Handle type="target" position={Position.Top} className="h-2 w-2 bg-sky-400" />
      <Handle
        type="source"
        id="true"
        position={Position.Right}
        className="h-2 w-2 bg-emerald-400"
      />
      <Handle
        type="source"
        id="false"
        position={Position.Bottom}
        className="h-2 w-2 bg-rose-400"
      />
    </div>
  );
};
