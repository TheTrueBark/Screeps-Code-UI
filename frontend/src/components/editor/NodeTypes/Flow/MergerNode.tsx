import { createNodeComponent } from '../BaseNode';
import type { NodeDefinition } from '../types';

const baseDefinition: Omit<NodeDefinition, 'Component'> = {
  kind: 'flow.merge',
  type: 'flow.merge',
  title: 'Merger',
  subtitle: 'Fan-in',
  description: 'Join multiple upstream branches before continuing.',
  family: 'flow',
  category: 'Flow & Control',
  defaultConfig: {},
  configFields: []
};

export const MergerNode = createNodeComponent(baseDefinition);

export const mergerNodeDefinition: NodeDefinition = {
  ...baseDefinition,
  Component: MergerNode
};
