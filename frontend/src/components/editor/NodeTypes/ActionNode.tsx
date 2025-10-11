import { memo, useCallback, type ChangeEvent } from 'react';
import { Handle, Position, useReactFlow, type NodeProps } from '@xyflow/react';

type ActionVariant = 'HARVEST' | 'TRANSFER' | 'BUILD';

export type ActionNodeData = {
  action?: ActionVariant;
};

const actionOptions: ActionVariant[] = ['HARVEST', 'TRANSFER', 'BUILD'];

/**
 * Performs an in-game action such as harvesting or transferring energy.
 */
const ActionNodeComponent = ({ id, data }: NodeProps) => {
  const { setNodes } = useReactFlow();
  const nodeData = (data as ActionNodeData | undefined) ?? {};

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const value = event.target.value as ActionVariant;
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === id
            ? {
                ...node,
                data: {
                  ...node.data,
                  action: value
                }
              }
            : node
        )
      );
    },
    [id, setNodes]
  );

  const current = (nodeData.action as ActionVariant | undefined) ?? 'HARVEST';

  return (
    <div className="node-card">
      <Handle type="target" position={Position.Top} className="node-handle" />
      <div className="node-header">Action</div>
      <label className="node-label">
        Task
        <select className="node-select" value={current} onChange={handleChange}>
          {actionOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <div className="node-footer">Execute unit behaviour</div>
      <Handle type="source" position={Position.Bottom} className="node-handle" />
    </div>
  );
};

export const ActionNode = memo(ActionNodeComponent);
ActionNode.displayName = 'ActionNode';
