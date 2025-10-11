import { createNodeComponent } from '../BaseNode';
import type { NodeDefinition } from '../types';

const baseDefinition: Omit<NodeDefinition, 'Component'> = {
  kind: 'structure.linkSend',
  type: 'structure.linkSend',
  title: 'Link Transfer',
  subtitle: 'Structure',
  description: 'Send energy between link structures.',
  family: 'structure',
  category: 'Structure Logic',
  defaultConfig: {
    amount: null
  },
  configFields: [
    { type: 'number', name: 'amount', label: 'Amount', min: 0, step: 50 }
  ],
  dataInputs: [
    { name: 'from', label: 'From link', handleId: 'input:from', optional: false },
    { name: 'to', label: 'To link', handleId: 'input:to', optional: false }
  ]
};

export const LinkSendNode = createNodeComponent(baseDefinition);

export const linkSendNodeDefinition: NodeDefinition = {
  ...baseDefinition,
  Component: LinkSendNode
};
