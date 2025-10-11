import type { GraphNode } from '@shared/types';

// Einfache Aktion, die später Screeps-spezifische Methoden abbilden wird.
export const generateActionNode = (node: GraphNode) => {
  const action = (node.data?.action as string) ?? 'console.log("noop")';
  return `${action};`;
};
