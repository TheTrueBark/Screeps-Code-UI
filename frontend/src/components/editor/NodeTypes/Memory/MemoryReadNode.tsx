import { createNodeComponent } from '../BaseNode';
import type { NodeDefinition } from '../types';
import { MEMORY_SCOPES } from '../../../../shared/constants';

const baseDefinition: Omit<NodeDefinition, 'Component'> = {
  kind: 'memory.read',
  type: 'memory.read',
  title: 'Memory Read',
  subtitle: 'Memory',
  description: 'Read a value from Memory, RoomMemory or CreepMemory.',
  family: 'memory',
  category: 'Memory',
  defaultConfig: {
    scope: 'global',
    path: 'creeps.harvester.target',
    defaultValue: null
  },
  configFields: [
    { type: 'select', name: 'scope', label: 'Scope', options: MEMORY_SCOPES },
    { type: 'text', name: 'path', label: 'Path', placeholder: 'dot.path' },
    { type: 'text', name: 'defaultValue', label: 'Default (JSON string)' }
  ],
  dataOutputs: [
    { name: 'value', label: 'Value', handleId: 'data:value' }
  ]
};

export const MemoryReadNode = createNodeComponent(baseDefinition);

export const memoryReadNodeDefinition: NodeDefinition = {
  ...baseDefinition,
  Component: MemoryReadNode
};
