import type { NodeProps } from '@xyflow/react';
import { NodeShell, type ScreepsNodeData } from '../BaseNode';
import type { NodeDefinition, SlotDefinition } from '../types';

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const baseDefinition: Omit<NodeDefinition, 'Component'> = {
  kind: 'flow.split',
  type: 'flow.split',
  title: 'Splitter',
  subtitle: 'Fan-out',
  description: 'Duplicate the downstream flow into multiple sequential branches.',
  family: 'flow',
  category: 'Flow & Control',
  defaultConfig: {
    branches: 2
  },
  configFields: [
    { type: 'number', name: 'branches', label: 'Branches', min: 2, max: 8, step: 1 }
  ]
};

export const SplitterNode = (props: NodeProps) => {
  const { id, data } = props;
  const nodeData = (data as ScreepsNodeData) ?? { config: {}, kind: '', label: '', family: 'flow' };
  const branchCount = Math.max(2, Math.min(8, Number(nodeData.config.branches ?? 2)));
  const slots: SlotDefinition[] = Array.from({ length: branchCount }, (_, index) => ({
    name: `branch-${index}`,
    label: letters[index] ?? `Branch ${index + 1}`
  }));

  return <NodeShell definition={baseDefinition} nodeId={id} data={nodeData} slots={slots} />;
};

export const splitterNodeDefinition: NodeDefinition = {
  ...baseDefinition,
  Component: SplitterNode
};
