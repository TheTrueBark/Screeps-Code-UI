import { createNodeComponent } from '../BaseNode';
import type { NodeDefinition } from '../types';

const baseDefinition: Omit<NodeDefinition, 'Component'> = {
  kind: 'task.call',
  type: 'task.call',
  title: 'Call Task',
  subtitle: 'Tasks',
  description: 'Invoke a previously defined task with arguments.',
  family: 'task',
  category: 'Tasks',
  defaultConfig: {
    taskName: 'refill',
    args: { min: 50 }
  },
  configFields: [
    { type: 'text', name: 'taskName', label: 'Task name', placeholder: 'refill' },
    { type: 'json', name: 'args', label: 'Arguments', helper: 'Object map of argument values.' }
  ],
  dataInputs: [
    { name: 'args', label: 'Args override', handleId: 'input:args', optional: true }
  ]
};

export const CallTaskNode = createNodeComponent(baseDefinition);

export const callTaskNodeDefinition: NodeDefinition = {
  ...baseDefinition,
  Component: CallTaskNode
};
