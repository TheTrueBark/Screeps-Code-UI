import { createNodeComponent } from '../BaseNode';
import type { NodeDefinition } from '../types';

const baseDefinition: Omit<NodeDefinition, 'Component'> = {
  kind: 'flow.start',
  type: 'flow.start',
  title: 'Start',
  subtitle: 'Entry',
  description: 'Entry point executed once per tick for the active file.',
  family: 'flow',
  category: 'Flow & Control',
  defaultConfig: {
    label: 'Tick entry'
  },
  configFields: [
    {
      type: 'text',
      name: 'label',
      label: 'Label',
      placeholder: 'Optional description'
    }
  ],
  hasFlowInput: false,
  hasFlowOutput: true
};

export const StartNode = createNodeComponent(baseDefinition);

export const startNodeDefinition: NodeDefinition = {
  ...baseDefinition,
  Component: StartNode
};
