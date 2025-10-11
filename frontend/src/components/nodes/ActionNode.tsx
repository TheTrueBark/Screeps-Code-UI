import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';

interface ActionNodeData extends Record<string, unknown> {
  label?: string;
  action?: string;
}

export type ActionNodeType = Node<ActionNodeData, 'action'>;

export const ActionNode = ({ data }: NodeProps<ActionNodeType>) => {
  const nodeData = data ?? {};
  return (
    <div className="w-48 rounded-lg border border-emerald-500 bg-slate-900/80 p-4 shadow-lg">
      <header className="mb-2 text-xs uppercase tracking-wide text-emerald-300">
        Action
      </header>
      <p className="text-sm font-semibold text-slate-100">
        {nodeData.label ?? 'Unnamed Action'}
      </p>
      <p className="mt-1 text-xs text-slate-400">
        {nodeData.action ?? 'harvest(source)'}
      </p>
      <Handle type="target" position={Position.Left} className="h-2 w-2 bg-emerald-400" />
      <Handle type="source" position={Position.Right} className="h-2 w-2 bg-emerald-400" />
    </div>
  );
};
