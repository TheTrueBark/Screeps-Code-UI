import { createNodeComponent } from '../BaseNode';
import type { NodeDefinition } from '../types';

const baseDefinition: Omit<NodeDefinition, 'Component'> = {
  kind: 'query.resolveById',
  type: 'query.resolveById',
  title: 'Resolve ID',
  subtitle: 'Query',
  description: 'Resolve an object by its Game.getObjectById identifier.',
  family: 'query',
  category: 'Query & Targeting',
  defaultConfig: {
    id: ''
  },
  configFields: [
    { type: 'text', name: 'id', label: 'Object ID', placeholder: 'abc123...' }
  ],
  dataInputs: [
    {
      name: 'id',
      label: 'ID',
      handleId: 'input:id',
      optional: true,
      configKey: 'id'
    }
  ],
  dataOutputs: [
    { name: 'result', label: 'Object', handleId: 'data:result' }
  ]
};

export const ResolveByIdNode = createNodeComponent(baseDefinition);

export const resolveByIdNodeDefinition: NodeDefinition = {
  ...baseDefinition,
  Component: ResolveByIdNode
};
