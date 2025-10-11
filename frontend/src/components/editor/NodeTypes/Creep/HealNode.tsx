import { createNodeComponent } from '../BaseNode';
import type { NodeDefinition } from '../types';

const baseDefinition: Omit<NodeDefinition, 'Component'> = {
  kind: 'creep.heal',
  type: 'creep.heal',
  title: 'Heal',
  subtitle: 'Creep',
  description: 'Heal a friendly creep using melee or ranged heals.',
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

export const HealNode = createNodeComponent(baseDefinition);

export const healNodeDefinition: NodeDefinition = {
  ...baseDefinition,
  Component: HealNode
};
