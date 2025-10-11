import { createNodeComponent } from '../BaseNode';
import type { NodeDefinition } from '../types';

const baseDefinition: Omit<NodeDefinition, 'Component'> = {
  kind: 'creep.attack',
  type: 'creep.attack',
  title: 'Attack',
  subtitle: 'Creep',
  description: 'Attack a hostile creep or structure with melee or ranged style.',
  family: 'creep',
  category: 'Creep Actions',
  defaultConfig: {
    style: 'melee'
  },
  configFields: [
    {
      type: 'select',
      name: 'style',
      label: 'Style',
      options: [
        { label: 'Melee', value: 'melee' },
        { label: 'Ranged', value: 'ranged' }
      ]
    }
  ],
  dataInputs: [
    { name: 'creepRef', label: 'Creep', handleId: 'input:creep', optional: true },
    { name: 'target', label: 'Target', handleId: 'input:target', optional: false }
  ]
};

export const AttackNode = createNodeComponent(baseDefinition);

export const attackNodeDefinition: NodeDefinition = {
  ...baseDefinition,
  Component: AttackNode
};
