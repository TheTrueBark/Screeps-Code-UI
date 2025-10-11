import { createNodeComponent } from '../BaseNode';
import type { NodeDefinition } from '../types';

const baseDefinition: Omit<NodeDefinition, 'Component'> = {
  kind: 'structure.spawn',
  type: 'structure.spawn',
  title: 'Spawn Creep',
  subtitle: 'Structure',
  description: 'Spawn a new creep with configurable body strategy and memory template.',
  family: 'structure',
  category: 'Structure Logic',
  defaultConfig: {
    namePrefix: 'worker',
    roleFile: 'roles/harvester',
    bodyStrategy: 'Fixed',
    fixedBody: ['WORK', 'CARRY', 'MOVE'],
    weights: { WORK: 2, CARRY: 2, MOVE: 1 },
    energyCap: 300,
    memoryTemplate: { role: 'harvester' }
  },
  configFields: [
    { type: 'text', name: 'namePrefix', label: 'Name prefix' },
    { type: 'text', name: 'roleFile', label: 'Role file' },
    {
      type: 'select',
      name: 'bodyStrategy',
      label: 'Body strategy',
      options: [
        { label: 'Fixed', value: 'Fixed' },
        { label: 'Weighted', value: 'Weighted' },
        { label: 'Auto by RCL', value: 'AutoByRCL' }
      ]
    },
    { type: 'json', name: 'fixedBody', label: 'Fixed body', helper: 'Array of body part strings.' },
    {
      type: 'json',
      name: 'weights',
      label: 'Body weights',
      helper: 'Record of body part weights.'
    },
    { type: 'number', name: 'energyCap', label: 'Energy cap', min: 0, step: 50 },
    {
      type: 'json',
      name: 'memoryTemplate',
      label: 'Memory template',
      helper: 'Object merged into new creep memory.'
    }
  ],
  dataInputs: [
    { name: 'spawnRef', label: 'Spawn', handleId: 'input:spawn', optional: true }
  ]
};

export const SpawnCreepNode = createNodeComponent(baseDefinition);

export const spawnCreepNodeDefinition: NodeDefinition = {
  ...baseDefinition,
  Component: SpawnCreepNode
};
