import { memo, useCallback, type ChangeEvent } from 'react';
import { Handle, Position, useReactFlow, type NodeProps } from '@xyflow/react';

type LoopVariant = 'FOR' | 'WHILE' | 'FOREACH';

export type LoopNodeData = {
  loop?: LoopVariant;
};

const loopOptions: LoopVariant[] = ['FOR', 'WHILE', 'FOREACH'];

/**
 * Iterates through Screeps objects to orchestrate repeated behaviour.
 */
const LoopNodeComponent = ({ id, data }: NodeProps) => {
  const { setNodes } = useReactFlow();
  const nodeData = (data as LoopNodeData | undefined) ?? {};

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const value = event.target.value as LoopVariant;
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === id
            ? {
                ...node,
                data: {
                  ...node.data,
                  loop: value
                }
              }
            : node
        )
      );
    },
    [id, setNodes]
  );

  const current = (nodeData.loop as LoopVariant | undefined) ?? 'FOR';

  return (
    <div className="node-card">
      <Handle type="target" position={Position.Top} className="node-handle" />
      <div className="node-header">Loop</div>
      <label className="node-label">
        Type
        <select className="node-select" value={current} onChange={handleChange}>
          {loopOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <div className="node-footer">Repeat behaviour</div>
      <Handle type="source" position={Position.Bottom} className="node-handle" />
    </div>
  );
};

export const LoopNode = memo(LoopNodeComponent);
LoopNode.displayName = 'LoopNode';
