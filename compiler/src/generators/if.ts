import type { GraphNode } from '@shared/types';

// Erstes Skelett für spätere Code-Templates. Hier werden die Daten des If-Nodes
// in eine TypeScript-String-Repräsentation verwandelt.
export const generateIfNode = (node: GraphNode) => {
  const condition = (node.data?.condition as string) ?? 'true';
  return `if (${condition}) {\n  // TODO: connect child actions\n}`;
};
