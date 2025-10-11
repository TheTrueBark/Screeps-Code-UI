export type NodeKind = 'if' | 'action';

export interface GraphNode {
  id: string;
  type: NodeKind;
  position: {
    x: number;
    y: number;
  };
  data: Record<string, unknown>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface GraphDefinition {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface CompilerOptions {
  outFile: string;
}
