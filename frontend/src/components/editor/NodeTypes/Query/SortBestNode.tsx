import { createNodeComponent } from '../BaseNode';
import type { NodeDefinition } from '../types';

const baseDefinition: Omit<NodeDefinition, 'Component'> = {
  kind: 'query.sortBest',
  type: 'query.sortBest',
  title: 'Sort / Best',
  subtitle: 'Query',
  description: 'Select the best item from a list using distance or scoring strategies.',
  family: 'query',
  category: 'Query & Targeting',
  defaultConfig: {
    strategy: 'closestByPath',
    key: ''
  },
  configFields: [
    {
      type: 'select',
      name: 'strategy',
      label: 'Strategy',
      options: [
        { label: 'Closest by Path', value: 'closestByPath' },
        { label: 'Closest by Range', value: 'closestByRange' },
        { label: 'Max Value', value: 'max' },
        { label: 'Min Value', value: 'min' }
      ]
    },
    { type: 'text', name: 'key', label: 'Key / Accessor', placeholder: 'Optional property path' }
  ],
  dataInputs: [
    { name: 'list', label: 'List', handleId: 'input:list', optional: false }
  ],
  dataOutputs: [
    { name: 'result', label: 'Best', handleId: 'data:result' }
  ]
};

export const SortBestNode = createNodeComponent(baseDefinition);

export const sortBestNodeDefinition: NodeDefinition = {
  ...baseDefinition,
  Component: SortBestNode
};
