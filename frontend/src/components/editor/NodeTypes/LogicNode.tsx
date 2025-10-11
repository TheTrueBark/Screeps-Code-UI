import { memo, useCallback, type ChangeEvent } from 'react';
import { Handle, Position, useReactFlow, type NodeProps } from '@xyflow/react';

type LogicVariant = 'IF' | 'ELSE' | 'SWITCH';

export type LogicNodeData = {
  variant?: LogicVariant;
  description?: string;
};

const variantOptions: LogicVariant[] = ['IF', 'ELSE', 'SWITCH'];

/**
 * Visual representation for conditional logic used inside Screeps roles.
 * The dropdown lets the user switch between common control structures.
 */
const LogicNodeComponent = ({ id, data }: NodeProps) => {
  const { setNodes } = useReactFlow();
  const nodeData = (data as LogicNodeData | undefined) ?? {};

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const value = event.target.value as LogicVariant;
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === id
            ? {
                ...node,
                data: {
                  ...node.data,
                  variant: value
                }
              }
            : node
        )
      );
    },
    [id, setNodes]
  );

  const current = (nodeData.variant as LogicVariant | undefined) ?? 'IF';

  return (
    <div className="node-card">
      <Handle type="target" position={Position.Top} className="node-handle" />
      <div className="node-header">Logic</div>
      <label className="node-label">
        Mode
        <select className="node-select" value={current} onChange={handleChange}>
          {variantOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <div className="node-footer">Conditional control flow</div>
      <Handle
        type="source"
        id="true"
        position={Position.Bottom}
        className="node-handle"
        style={{ left: '25%' }}
      />
      <Handle
        type="source"
        id="false"
        position={Position.Bottom}
        className="node-handle"
        style={{ left: '75%' }}
      />
    </div>
  );
};

export const LogicNode = memo(LogicNodeComponent);
LogicNode.displayName = 'LogicNode';
