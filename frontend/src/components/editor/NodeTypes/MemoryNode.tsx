import { memo, useCallback, type ChangeEvent } from 'react';
import { Handle, Position, useReactFlow, type NodeProps } from '@xyflow/react';

type MemoryVariant = 'READ' | 'WRITE' | 'DELETE';

export type MemoryNodeData = {
  operation?: MemoryVariant;
};

const memoryOptions: MemoryVariant[] = ['READ', 'WRITE', 'DELETE'];

/**
 * Accesses Screeps memory to read or persist information between ticks.
 */
const MemoryNodeComponent = ({ id, data }: NodeProps) => {
  const { setNodes } = useReactFlow();
  const nodeData = (data as MemoryNodeData | undefined) ?? {};

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const value = event.target.value as MemoryVariant;
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === id
            ? {
                ...node,
                data: {
                  ...node.data,
                  operation: value
                }
              }
            : node
        )
      );
    },
    [id, setNodes]
  );

  const current = (nodeData.operation as MemoryVariant | undefined) ?? 'READ';

  return (
    <div className="node-card">
      <Handle type="target" position={Position.Top} className="node-handle" />
      <div className="node-header">Memory</div>
      <label className="node-label">
        Operation
        <select className="node-select" value={current} onChange={handleChange}>
          {memoryOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <div className="node-footer">Interact with Memory API</div>
      <Handle type="source" position={Position.Bottom} className="node-handle" />
    </div>
  );
};

export const MemoryNode = memo(MemoryNodeComponent);
MemoryNode.displayName = 'MemoryNode';
