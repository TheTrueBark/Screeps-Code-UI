import { createNodeComponent } from '../BaseNode';
import type { NodeDefinition } from '../types';
import { MEMORY_SCOPES } from '../../../../shared/constants';

const baseDefinition: Omit<NodeDefinition, 'Component'> = {
  kind: 'memory.delete',
  type: 'memory.delete',
  title: 'Memory Delete',
  subtitle: 'Memory',
  description: 'Remove a value from memory at the provided path.',
  family: 'memory',
  category: 'Memory',
  defaultConfig: {
    scope: 'global',
    path: 'creeps.harvester.target'
  },
  configFields: [
    { type: 'select', name: 'scope', label: 'Scope', options: MEMORY_SCOPES },
    { type: 'text', name: 'path', label: 'Path', placeholder: 'dot.path' }
  ]
};

export const MemoryDeleteNode = createNodeComponent(baseDefinition);

export const memoryDeleteNodeDefinition: NodeDefinition = {
  ...baseDefinition,
  Component: MemoryDeleteNode
};
